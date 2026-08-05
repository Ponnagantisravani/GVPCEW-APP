from __future__ import annotations

import base64
from datetime import datetime, timezone
from pathlib import Path
import threading
import time

import customtkinter as ctk
import cv2
from PIL import Image, ImageTk

from utils.profile import StudentProfile


def image_to_data_url(image_path: Path) -> str | None:
    try:
        encoded = base64.b64encode(image_path.read_bytes()).decode("ascii")
    except OSError:
        return None

    return f"data:image/jpeg;base64,{encoded}"


class MainWindow(ctk.CTk):
    def __init__(self, backend, camera, recognition, capture_session):
        super().__init__()
        self.backend = backend
        self.camera = camera
        self.recognition = recognition
        self.capture_session = capture_session
        self.profile = StudentProfile()
        self.roll_number = ctk.StringVar()
        self.full_name = ctk.StringVar()
        self.department_name = ctk.StringVar()
        self.section = ctk.StringVar()
        self.backend_url = ctk.StringVar(value=self.backend.base_url)
        self.status_var = ctk.StringVar(value="Ready to collect cropped face images.")
        self.last_preview_frame = None
        self.capture_complete = False
        self.processing_dataset = False
        self.success_banner_var = ctk.StringVar(value="")
        self.success_details_var = ctk.StringVar(value="")

        self.title("GVPCEW Face Dataset Collector")
        self.geometry("1280x780")
        self.minsize(1100, 720)

        header = ctk.CTkFrame(self)
        header.pack(fill="x", padx=20, pady=(20, 10))
        ctk.CTkLabel(header, text="Face Dataset Collection Console", font=("Segoe UI", 28, "bold")).pack(anchor="w", padx=16, pady=(14, 2))
        ctk.CTkLabel(
            header,
            text="Collect front-facing training crops only. The live preview shows detections, while saved files contain only the cropped face region.",
        ).pack(anchor="w", padx=16, pady=(0, 14))

        main = ctk.CTkFrame(self)
        main.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        left = ctk.CTkFrame(main, width=360)
        left.pack(side="left", fill="y", padx=(16, 10), pady=16)
        left.pack_propagate(False)

        right = ctk.CTkFrame(main)
        right.pack(side="right", fill="both", expand=True, padx=(10, 16), pady=16)

        ctk.CTkLabel(left, text="Person Details", font=("Segoe UI", 18, "bold")).pack(anchor="w", padx=16, pady=(16, 8))
        ctk.CTkLabel(left, text="Name").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.full_name, placeholder_text="Enter name").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Unique ID / Roll Number").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.roll_number, placeholder_text="Enter unique ID").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Department").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.department_name, placeholder_text="Enter department").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Section").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.section, placeholder_text="Enter section").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkButton(left, text="Start Dataset Capture", command=self.start_capture).pack(fill="x", padx=16, pady=(8, 6))
        ctk.CTkButton(left, text="Reset Session", command=self.reset_session).pack(fill="x", padx=16, pady=6)

        self.status = ctk.CTkLabel(left, textvariable=self.status_var, wraplength=300, justify="left")
        self.status.pack(fill="x", padx=16, pady=(18, 8))
        self.student_card = ctk.CTkTextbox(left, height=220)
        self.student_card.pack(fill="both", expand=True, padx=16, pady=(8, 16))
        self.student_card.insert("end", "Dataset folder details will appear here.\n")

        self.preview_label = ctk.CTkLabel(right, text="Camera preview", width=800, height=480)
        self.preview_label.pack(fill="both", expand=True, padx=16, pady=(16, 10))

        self.processing_overlay = ctk.CTkFrame(right, fg_color="#0f172a")
        self.processing_label = ctk.CTkLabel(
            self.processing_overlay,
            text="Processing face dataset...",
            font=("Segoe UI", 26, "bold")
        )
        self.processing_label.pack(expand=True, padx=24, pady=24)

        self.metrics = ctk.CTkLabel(
            right,
            text=f"0 of {self.capture_session.capture_limit} images saved | Stability: waiting | Detector: idle"
        )
        self.metrics.pack(anchor="w", padx=16, pady=(0, 8))

        self.progress = ctk.CTkProgressBar(right, orientation="horizontal")
        self.progress.pack(fill="x", padx=16, pady=(0, 12))
        self.progress.set(0)

        self.log = ctk.CTkTextbox(right, height=180)
        self.log.pack(fill="x", padx=16, pady=(0, 16))
        self.log.insert("end", "Dataset capture app ready.\n")

        self.success_indicator = ctk.CTkFrame(right, fg_color="#14532d")
        self.success_label = ctk.CTkLabel(
            self.success_indicator,
            textvariable=self.success_banner_var,
            font=("Segoe UI", 20, "bold"),
            text_color="#dcfce7"
        )
        self.success_label.pack(anchor="w", padx=16, pady=(14, 4))
        self.success_details = ctk.CTkLabel(
            self.success_indicator,
            textvariable=self.success_details_var,
            justify="left",
            text_color="#dcfce7"
        )
        self.success_details.pack(anchor="w", padx=16, pady=(0, 14))

        self.after(40, self.render_preview)
        self.after(120, self.process_capture)

    def log_line(self, message: str):
        self.log.insert("end", f"{time.strftime('%H:%M:%S')} {message}\n")
        self.log.see("end")

    def set_status(self, message: str, write_log: bool = True):
        self.status_var.set(message)
        if write_log:
            self.log_line(message)

    def start_capture(self):
        full_name = self.full_name.get().strip()
        roll_number = self.roll_number.get().strip()
        department_name = self.department_name.get().strip()
        section = self.section.get().strip()

        if not full_name or not roll_number:
            self.set_status("Fill in at least the name and unique ID before starting capture.")
            return

        self.profile = StudentProfile(
            roll_number=roll_number,
            full_name=full_name,
            department_name=department_name,
            section=section,
            student_id="",
        )
        self.student_card.delete("1.0", "end")
        dataset_dir = self.capture_session.dataset_root / self.capture_session._sanitize_subject_id(roll_number)
        self.student_card.insert(
            "end",
            f"Unique ID: {self.profile.roll_number}\n"
            f"Name: {self.profile.full_name}\n"
            f"Department: {self.profile.department_name or '-'}\n"
            f"Section: {self.profile.section or '-'}\n"
            f"Dataset Directory: {dataset_dir}\n"
            f"Target Face Size: {self.capture_session.training_size[0]}x{self.capture_session.training_size[1]}\n"
        )

        if not self.camera.preview_running and not self.camera.start():
            self.set_status(f"Camera unavailable: {self.camera.last_error}")
            return

        self.capture_complete = False
        self.processing_dataset = False
        self.capture_session.start(roll_number)
        self.hide_processing_overlay()
        self.hide_success_indicator()
        self.progress.set(0)
        self.set_status("Dataset capture started. Hold one clear, front-facing face in frame.")

    def render_preview(self):
        frame = self.last_preview_frame if self.last_preview_frame is not None else self.camera.current_frame
        if frame is not None:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(rgb)
            image.thumbnail((860, 560))
            photo = ImageTk.PhotoImage(image=image)
            self.preview_label.configure(image=photo, text="")
            self.preview_label.image = photo
        self.after(40, self.render_preview)

    def process_capture(self):
        if self.camera.current_frame is not None:
            decision = self.capture_session.process_frame(self.camera.current_frame)
            self.last_preview_frame = decision.preview_frame
            self.progress.set(decision.saved_images / self.capture_session.capture_limit)
            self.metrics.configure(
                text=(
                    f"{decision.saved_images} of {self.capture_session.capture_limit} images saved | "
                    f"Stability: {decision.stable_seconds:.1f}s / {self.capture_session.stable_duration_seconds:.1f}s | "
                    f"Faces: {decision.face_count} | "
                    f"Blur: {decision.blur_score:.0f}"
                )
            )
            self.status_var.set(decision.status_message)
            if decision.capture_saved:
                self.log_line(decision.status_message)

            if self.capture_session.is_complete() and not self.capture_complete:
                self.capture_complete = True
                self.capture_session.stop()
                self.camera.stop()
                self.progress.set(1.0)
                self.set_status("Processing Dataset...")
                self.processing_dataset = True
                self.show_processing_overlay()
                threading.Thread(target=self.process_dataset_and_upload, daemon=True).start()

        self.after(120, self.process_capture)

    def process_dataset_and_upload(self):
        saved_dir = self.capture_session.subject_dir
        image_paths = sorted(saved_dir.glob("*.jpg"))
        embeddings = []
        processed_image_count = 0

        self.log_line(f"Dataset collection complete. Saved {len(image_paths)} cropped face images to {saved_dir}.")
        self.log_line("Preprocessing images and generating embeddings.")

        for image_path in image_paths:
            frame = cv2.imread(str(image_path))
            if frame is None:
                continue

            detections = self.recognition.detect_faces(frame)
            if len(detections) != 1:
                continue

            cropped = self.recognition.crop_face(frame, detections[0], margin_ratio=0.0)
            if cropped is None:
                continue

            if self.recognition.blur_score(cropped) < self.capture_session.blur_threshold:
                continue

            resized = self.recognition.resize_face(cropped, self.capture_session.training_size)
            normalized = self.recognition.normalize_face(resized)
            normalized_uint8 = (normalized * 255).astype("uint8")
            cv2.imwrite(str(image_path), normalized_uint8)

            embedding = self.recognition.extract_embedding(normalized_uint8)
            if embedding is not None:
                embeddings.append(embedding)
                processed_image_count += 1

        if not embeddings:
            self.processing_dataset = False
            self.after(0, self.hide_processing_overlay)
            self.after(0, lambda: self.set_status("No valid face embeddings could be generated from the saved images."))
            return

        averaged_embedding = self.recognition.average_embedding(embeddings)
        if averaged_embedding is None:
            self.processing_dataset = False
            self.after(0, self.hide_processing_overlay)
            self.after(0, lambda: self.set_status("Failed to average the generated embeddings."))
            return

        payload = {
            "rollNumber": self.profile.roll_number,
            "fullName": self.profile.full_name,
            "departmentName": self.profile.department_name,
            "section": self.profile.section,
            "embedding": averaged_embedding,
            "sampleCount": self.capture_session.saved_images,
            "processedImageCount": processed_image_count,
            "datasetDirectory": str(saved_dir),
            "enrolledAt": datetime.now(timezone.utc).isoformat(),
            "referenceImages": [path.name for path in image_paths],
            "capturedImages": [
                {"fileName": path.name, "dataUrl": data_url}
                for path in image_paths
                if (data_url := image_to_data_url(path)) is not None
            ],
            "metadata": {
                "source": "face-enrollment-desktop",
                "datasetDirectory": str(saved_dir),
                "trainingSize": {
                    "width": self.capture_session.training_size[0],
                    "height": self.capture_session.training_size[1],
                },
                "savedImages": self.capture_session.saved_images,
                "processedImages": processed_image_count,
                "embeddedImages": len(embeddings),
            },
        }
        if self.profile.student_id:
            payload["studentId"] = self.profile.student_id

        try:
            self.log_line("Uploading embeddings and student details to PostgreSQL through the backend API.")
            response = self.backend.upload_embedding(payload)
        except RuntimeError as exc:
            self.processing_dataset = False
            self.after(0, self.hide_processing_overlay)
            self.after(0, lambda: self.set_status(str(exc)))
            return
        except Exception as exc:
            self.processing_dataset = False
            self.after(0, self.hide_processing_overlay)
            self.after(0, lambda: self.set_status(f"Upload failed: {exc}"))
            return

        self.processing_dataset = False
        self.after(0, self.hide_processing_overlay)
        self.after(0, lambda: self._mark_enrollment_successful(response, processed_image_count))

    def _mark_enrollment_successful(self, response, processed_image_count: int):
        self.set_status("Enrollment Successful")
        self.log_line("Embeddings stored successfully in PostgreSQL.")
        student = response.get("student", {})
        self.show_success_indicator(
            "Enrollment Successful",
            "\n".join([
                f"Name: {student.get('fullName') or self.profile.full_name}",
                f"Roll Number: {student.get('rollNumber') or self.profile.roll_number}",
                f"Department: {student.get('departmentName') or self.profile.department_name or '-'}",
                f"Section: {student.get('section') or self.profile.section or '-'}",
                f"Dataset Directory: {student.get('datasetDirectory') or str(self.capture_session.subject_dir)}",
                f"Processed Images: {processed_image_count}",
            ])
        )
        self.metrics.configure(
            text=(
                f"{self.capture_session.saved_images} of {self.capture_session.capture_limit} images saved | "
                f"Processed: {processed_image_count} | Detector: complete"
            )
        )
        self.after(4000, self.reset_session)

    def show_processing_overlay(self):
        self.processing_overlay.place(relx=0.5, rely=0.38, relwidth=0.82, relheight=0.5, anchor="center")

    def hide_processing_overlay(self):
        self.processing_overlay.place_forget()

    def show_success_indicator(self, title: str, details: str):
        self.success_banner_var.set(title)
        self.success_details_var.set(details)
        self.success_indicator.pack(fill="x", padx=16, pady=(0, 16))

    def hide_success_indicator(self):
        self.success_banner_var.set("")
        self.success_details_var.set("")
        self.success_indicator.pack_forget()

    def reset_session(self):
        if self.processing_dataset:
            self.set_status("Please wait for dataset processing to finish before resetting.")
            return
        self.capture_session.stop()
        self.capture_complete = False
        self.processing_dataset = False
        self.last_preview_frame = None
        self.profile = StudentProfile()
        self.full_name.set("")
        self.roll_number.set("")
        self.department_name.set("")
        self.section.set("")
        self.progress.set(0)
        self.metrics.configure(
            text=f"0 of {self.capture_session.capture_limit} images saved | Stability: waiting | Detector: idle"
        )
        self.student_card.delete("1.0", "end")
        self.student_card.insert("end", "Dataset folder details will appear here.\n")
        self.hide_processing_overlay()
        self.hide_success_indicator()
        self.set_status("Session reset. Ready for the next person.")

    def on_close(self):
        self.capture_session.stop()
        self.camera.stop()
        self.destroy()
