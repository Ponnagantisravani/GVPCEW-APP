from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import time
import re

import cv2
import numpy as np

try:
    import face_recognition
except Exception:  # pragma: no cover
    face_recognition = None


@dataclass
class FaceDetection:
    top: int
    right: int
    bottom: int
    left: int
    confidence: float = 1.0

    @property
    def width(self) -> int:
        return max(0, self.right - self.left)

    @property
    def height(self) -> int:
        return max(0, self.bottom - self.top)

    @property
    def area(self) -> int:
        return self.width * self.height

    @property
    def center(self) -> tuple[float, float]:
        return ((self.left + self.right) / 2.0, (self.top + self.bottom) / 2.0)


@dataclass
class CaptureDecision:
    preview_frame: np.ndarray
    status_message: str
    status_color: str
    face_count: int
    blur_score: float
    saved_images: int
    stable_seconds: float
    capture_ready: bool
    capture_saved: bool


class FaceRecognitionEngine:
    def __init__(self):
        self._cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    def detect_faces(self, frame: np.ndarray) -> list[FaceDetection]:
        if face_recognition is not None:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            locations = face_recognition.face_locations(rgb, model="hog")
            return [
                FaceDetection(top=top, right=right, bottom=bottom, left=left, confidence=1.0)
                for top, right, bottom, left in locations
            ]

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        detections = self._cascade.detectMultiScale3(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            outputRejectLevels=True
        )
        boxes, _reject_levels, weights = detections
        faces: list[FaceDetection] = []
        for (x, y, w, h), weight in zip(boxes, weights):
            faces.append(
                FaceDetection(
                    top=int(y),
                    right=int(x + w),
                    bottom=int(y + h),
                    left=int(x),
                    confidence=float(weight)
                )
            )
        return faces

    def blur_score(self, frame: np.ndarray) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())

    def crop_face(self, frame: np.ndarray, face: FaceDetection, margin_ratio: float = 0.1) -> np.ndarray | None:
        height, width = frame.shape[:2]
        margin_x = int(face.width * margin_ratio)
        margin_y = int(face.height * margin_ratio)
        left = max(0, face.left - margin_x)
        top = max(0, face.top - margin_y)
        right = min(width, face.right + margin_x)
        bottom = min(height, face.bottom + margin_y)
        if right <= left or bottom <= top:
            return None
        cropped = frame[top:bottom, left:right]
        if cropped.size == 0:
            return None
        return cropped

    def resize_face(self, face_image: np.ndarray, target_size: tuple[int, int]) -> np.ndarray:
        width, height = target_size
        return cv2.resize(face_image, (width, height), interpolation=cv2.INTER_AREA)

    def normalize_face(self, face_image: np.ndarray) -> np.ndarray:
        normalized = face_image.astype(np.float32) / 255.0
        return np.clip(normalized, 0.0, 1.0)

    def is_front_facing(self, frame: np.ndarray, face: FaceDetection) -> bool:
        if face_recognition is None:
            return True

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locations = [(face.top, face.right, face.bottom, face.left)]
        landmarks = face_recognition.face_landmarks(rgb, face_locations=locations)
        if not landmarks:
            return False

        points = landmarks[0]
        left_eye = np.mean(points.get("left_eye", []), axis=0) if points.get("left_eye") else None
        right_eye = np.mean(points.get("right_eye", []), axis=0) if points.get("right_eye") else None
        nose_tip = np.mean(points.get("nose_tip", []), axis=0) if points.get("nose_tip") else None
        chin_points = points.get("chin", [])
        if left_eye is None or right_eye is None or nose_tip is None or not chin_points:
            return False

        chin_bottom_y = max(point[1] for point in chin_points)
        eye_center_x = (left_eye[0] + right_eye[0]) / 2.0
        eye_center_y = (left_eye[1] + right_eye[1]) / 2.0
        eye_distance = max(1.0, abs(right_eye[0] - left_eye[0]))
        nose_offset_ratio = abs(nose_tip[0] - eye_center_x) / eye_distance
        face_height = max(1.0, chin_bottom_y - eye_center_y)
        vertical_ratio = (nose_tip[1] - eye_center_y) / face_height
        return nose_offset_ratio <= 0.22 and 0.18 <= vertical_ratio <= 0.55

    def extract_embedding(self, frame: np.ndarray) -> list[float] | None:
        if face_recognition is None:
            return None
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb)
        if not encodings:
            return None
        return encodings[0].tolist()

    def extract_embedding_from_file(self, image_path: Path) -> list[float] | None:
        if face_recognition is None:
            return None
        image = face_recognition.load_image_file(str(image_path))
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return None
        return encodings[0].tolist()

    def average_embedding(self, embeddings: list[list[float]]) -> list[float] | None:
        if not embeddings:
            return None
        return np.mean(np.array(embeddings, dtype=np.float32), axis=0).tolist()


class DatasetCaptureSession:
    def __init__(
        self,
        detector: FaceRecognitionEngine,
        dataset_root: Path,
        training_size: tuple[int, int] = (224, 224),
        capture_limit: int = 25,
        stable_duration_seconds: float = 1.2,
        capture_interval_seconds: float = 0.45,
        blur_threshold: float = 120.0,
        min_face_size: int = 120,
    ):
        self.detector = detector
        self.dataset_root = Path(dataset_root)
        self.training_size = training_size
        self.capture_limit = capture_limit
        self.stable_duration_seconds = stable_duration_seconds
        self.capture_interval_seconds = capture_interval_seconds
        self.blur_threshold = blur_threshold
        self.min_face_size = min_face_size
        self.active = False
        self.subject_id = ""
        self.subject_dir = self.dataset_root
        self.saved_images = 0
        self.last_capture_time = 0.0
        self.stable_since: float | None = None
        self.reference_face: FaceDetection | None = None

    def start(self, subject_id: str):
        self.subject_id = self._sanitize_subject_id(subject_id)
        self.subject_dir = self.dataset_root / self.subject_id
        self.subject_dir.mkdir(parents=True, exist_ok=True)
        self.saved_images = 0
        self.last_capture_time = 0.0
        self.stable_since = None
        self.reference_face = None
        self.active = True

    def stop(self):
        self.active = False
        self.stable_since = None
        self.reference_face = None

    def process_frame(self, frame: np.ndarray) -> CaptureDecision:
        detections = self.detector.detect_faces(frame)
        preview = frame.copy()
        blur_score = self.detector.blur_score(frame)
        now = time.time()
        stable_seconds = 0.0
        capture_ready = False
        capture_saved = False
        status_message = "Live preview ready."
        status_color = "white"

        if len(detections) == 0:
            self._reset_stability()
            status_message = "No face detected. Please look at the camera."
            status_color = "orange"
        elif len(detections) > 1:
            self._reset_stability()
            status_message = "Multiple faces detected. Please ensure only one person is visible."
            status_color = "red"
        else:
            face = detections[0]
            face_crop = self.detector.crop_face(frame, face)
            face_blur = self.detector.blur_score(face_crop) if face_crop is not None else 0.0
            large_enough = min(face.width, face.height) >= self.min_face_size
            front_facing = self.detector.is_front_facing(frame, face)
            clear_face = face_blur >= self.blur_threshold
            confidence_ok = face.confidence >= 0.0

            if not large_enough:
                self._reset_stability()
                status_message = "Move closer so the face fills more of the frame."
                status_color = "orange"
            elif not clear_face:
                self._reset_stability()
                status_message = "Face looks blurry. Hold still and wait for a sharper frame."
                status_color = "orange"
            elif not front_facing:
                self._reset_stability()
                status_message = "Please face the camera directly."
                status_color = "orange"
            elif not confidence_ok:
                self._reset_stability()
                status_message = "Low-confidence face detection. Adjust lighting and try again."
                status_color = "orange"
            else:
                if self._is_stable(face):
                    if self.stable_since is None:
                        self.stable_since = now
                    stable_seconds = max(0.0, now - self.stable_since)
                else:
                    self.stable_since = now
                    stable_seconds = 0.0

                self.reference_face = face
                capture_ready = stable_seconds >= self.stable_duration_seconds
                if capture_ready:
                    status_message = "Stable face detected. Capturing cropped face images."
                    status_color = "green"
                    if (
                        self.active
                        and self.saved_images < self.capture_limit
                        and now - self.last_capture_time >= self.capture_interval_seconds
                        and face_crop is not None
                    ):
                        resized = self.detector.resize_face(face_crop, self.training_size)
                        self._save_face(resized)
                        self.last_capture_time = now
                        self.saved_images += 1
                        capture_saved = True
                        status_message = (
                            f"Saved cropped face image {self.saved_images} of {self.capture_limit}."
                        )
                else:
                    remaining = max(0.0, self.stable_duration_seconds - stable_seconds)
                    status_message = f"Hold still for {remaining:.1f}s to capture a clear face image."
                    status_color = "green"

        self._draw_detections(preview, detections)
        if len(detections) == 1:
            self._draw_detections(preview, detections, color=(0, 180, 0), thickness=3)
        elif len(detections) > 1:
            self._draw_detections(preview, detections, color=(0, 0, 255), thickness=3)

        self._draw_banner(preview, status_message, status_color)

        return CaptureDecision(
            preview_frame=preview,
            status_message=status_message,
            status_color=status_color,
            face_count=len(detections),
            blur_score=blur_score,
            saved_images=self.saved_images,
            stable_seconds=stable_seconds,
            capture_ready=capture_ready,
            capture_saved=capture_saved,
        )

    def is_complete(self) -> bool:
        return self.saved_images >= self.capture_limit

    def _draw_detections(
        self,
        frame: np.ndarray,
        detections: list[FaceDetection],
        color: tuple[int, int, int] = (255, 255, 0),
        thickness: int = 2,
    ):
        for face in detections:
            cv2.rectangle(frame, (face.left, face.top), (face.right, face.bottom), color, thickness)

    def _draw_banner(self, frame: np.ndarray, message: str, status_color: str):
        color_map = {
            "green": (0, 160, 0),
            "red": (0, 0, 220),
            "orange": (0, 140, 255),
            "white": (255, 255, 255),
        }
        cv2.rectangle(frame, (0, 0), (frame.shape[1], 42), (20, 20, 20), -1)
        cv2.putText(
            frame,
            message,
            (12, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            color_map.get(status_color, (255, 255, 255)),
            2,
            cv2.LINE_AA,
        )

    def _is_stable(self, current_face: FaceDetection) -> bool:
        if self.reference_face is None:
            return True
        ref_center_x, ref_center_y = self.reference_face.center
        cur_center_x, cur_center_y = current_face.center
        center_shift = np.hypot(cur_center_x - ref_center_x, cur_center_y - ref_center_y)
        width_shift = abs(current_face.width - self.reference_face.width)
        height_shift = abs(current_face.height - self.reference_face.height)
        tolerance = max(18.0, self.reference_face.width * 0.12)
        return center_shift <= tolerance and width_shift <= tolerance and height_shift <= tolerance

    def _reset_stability(self):
        self.stable_since = None
        self.reference_face = None

    def _save_face(self, face_image: np.ndarray):
        filename = f"{self.subject_id}_{self.saved_images + 1:03d}.jpg"
        path = self.subject_dir / filename
        cv2.imwrite(str(path), face_image)

    def _sanitize_subject_id(self, value: str) -> str:
        cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", value.strip())
        return cleaned or "unknown_subject"
