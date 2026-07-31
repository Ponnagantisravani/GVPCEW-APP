import customtkinter as ctk

from api.client import BackendClient
from camera.capture import CameraCapture
from recognition.engine import FaceRecognitionEngine
from ui.main_window import MainWindow


class EnrollmentApp(MainWindow):
    def __init__(self):
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.backend = BackendClient()
        self.camera = CameraCapture()
        self.recognition = FaceRecognitionEngine()
        super().__init__(self.backend, self.camera, self.recognition)
