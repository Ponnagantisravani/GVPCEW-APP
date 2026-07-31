import cv2
import numpy as np

try:
    import face_recognition
except Exception:  # pragma: no cover
    face_recognition = None


class FaceRecognitionEngine:
    def detect_faces(self, frame):
        if face_recognition is not None:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            return face_recognition.face_locations(rgb, model="hog")
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        return cascade.detectMultiScale(gray, 1.1, 4)

    def blur_score(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def extract_embedding(self, frame):
        if face_recognition is None:
            return None
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        encodings = face_recognition.face_encodings(rgb)
        if not encodings:
            return None
        return encodings[0].tolist()

    def average_embedding(self, embeddings):
        if not embeddings:
            return None
        return np.mean(np.array(embeddings, dtype=np.float32), axis=0).tolist()
