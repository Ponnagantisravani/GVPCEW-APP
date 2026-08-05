import customtkinter as ctk
from pathlib import Path
import sys

from api.client import BackendClient
from camera.capture import CameraCapture
from recognition.engine import DatasetCaptureSession, FaceRecognitionEngine
from ui.main_window import MainWindow


def get_project_dataset_root() -> Path:
    if getattr(sys, "frozen", False):
        project_root = Path(sys.executable).resolve().parent.parent
    else:
        project_root = Path(__file__).resolve().parent

    dataset_root = project_root / "datasets"
    dataset_root.mkdir(parents=True, exist_ok=True)
    return dataset_root


class EnrollmentApp(MainWindow):
    def __init__(self):
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.backend = BackendClient()
        self.camera = CameraCapture()
        self.recognition = FaceRecognitionEngine()
        dataset_root = get_project_dataset_root()
        self.capture_session = DatasetCaptureSession(
            detector=self.recognition,
            dataset_root=dataset_root,
            training_size=(224, 224),
            capture_limit=25,
            stable_duration_seconds=1.2,
        )
        super().__init__(self.backend, self.camera, self.recognition, self.capture_session)
