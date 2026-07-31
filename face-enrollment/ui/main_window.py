import json
import time

import customtkinter as ctk
import cv2
from PIL import Image, ImageTk

from utils.profile import StudentProfile


class MainWindow(ctk.CTk):
    def __init__(self, backend, camera, recognition):
        super().__init__()
        self.backend = backend
        self.camera = camera
        self.recognition = recognition
        self.profile = StudentProfile()
        self.roll_number = ctk.StringVar()
        self.full_name = ctk.StringVar()
        self.department_name = ctk.StringVar()
        self.section = ctk.StringVar()
        self.backend_url = ctk.StringVar(value=self.backend.base_url)
        self.status_var = ctk.StringVar(value="Ready")
        self.capture_limit = 25
        self.capture_running = False
        self.enrollment_complete = False
        self.captured_embeddings = []
        self.capture_samples = []
        self.embedding = None
        self.last_capture_time = 0.0
        self.capture_interval_seconds = 0.85

        self.title("GVPCEW Face Enrollment")
        self.geometry("1280x780")
        self.minsize(1100, 720)

        header = ctk.CTkFrame(self)
        header.pack(fill="x", padx=20, pady=(20, 10))
        ctk.CTkLabel(header, text="Face Enrollment Console", font=("Segoe UI", 28, "bold")).pack(anchor="w", padx=16, pady=(14, 2))
        ctk.CTkLabel(header, text="Automatic enrollment for students: validate, capture, encode, and upload in one guided flow.").pack(anchor="w", padx=16, pady=(0, 14))

        main = ctk.CTkFrame(self)
        main.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        left = ctk.CTkFrame(main, width=360)
        left.pack(side="left", fill="y", padx=(16, 10), pady=16)
        left.pack_propagate(False)

        right = ctk.CTkFrame(main)
        right.pack(side="right", fill="both", expand=True, padx=(10, 16), pady=16)

        ctk.CTkLabel(left, text="Student Details", font=("Segoe UI", 18, "bold")).pack(anchor="w", padx=16, pady=(16, 8))
        ctk.CTkLabel(left, text="Name").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.full_name, placeholder_text="Enter name").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Roll Number").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.roll_number, placeholder_text="Enter roll number").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Department").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.department_name, placeholder_text="Enter department").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Section").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.section, placeholder_text="Enter section").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkLabel(left, text="Backend URL").pack(anchor="w", padx=16, pady=(6, 2))
        ctk.CTkEntry(left, textvariable=self.backend_url, placeholder_text="Backend URL").pack(fill="x", padx=16, pady=(0, 6))
        ctk.CTkButton(left, text="Start Enrollment", command=self.start_enrollment).pack(fill="x", padx=16, pady=(8, 6))
        ctk.CTkButton(left, text="Reset Session", command=self.reset_session).pack(fill="x", padx=16, pady=6)

        self.status = ctk.CTkLabel(left, textvariable=self.status_var, wraplength=300, justify="left")
        self.status.pack(fill="x", padx=16, pady=(18, 8))
        self.student_card = ctk.CTkTextbox(left, height=220)
        self.student_card.pack(fill="both", expand=True, padx=16, pady=(8, 16))
        self.student_card.insert("end", "Student profile will appear here.\n")

        self.preview_label = ctk.CTkLabel(right, text="Camera preview", width=800, height=480)
        self.preview_label.pack(fill="both", expand=True, padx=16, pady=(16, 10))

        self.metrics = ctk.CTkLabel(right, text="0 of 25 images captured | Quality: waiting | Enrollment: idle")
        self.metrics.pack(anchor="w", padx=16, pady=(0, 8))

        self.progress = ctk.CTkProgressBar(right, orientation="horizontal")
        self.progress.pack(fill="x", padx=16, pady=(0, 12))
        self.progress.set(0)

        self.log = ctk.CTkTextbox(right, height=180)
        self.log.pack(fill="x", padx=16, pady=(0, 16))
        self.log.insert("end", "Enrollment app ready.\n")

        self.after(40, self.render_preview)
        self.after(120, self.process_capture)

    def log_line(self, message):
        self.log.insert("end", f"{time.strftime('%H:%M:%S')} {message}\n")
        self.log.see("end")

    def set_status(self, message):
        self.status_var.set(message)
        self.log_line(message)

    def load_student(self):
        self.start_enrollment()

    def start_enrollment(self):
        full_name = self.full_name.get().strip()
        roll_number = self.roll_number.get().strip()
        department_name = self.department_name.get().strip()
        section = self.section.get().strip()

        if not full_name or not roll_number or not department_name or not section:
            self.set_status("Fill in name, roll number, department, and section first.")
            return

        self.profile = StudentProfile(
            roll_number=roll_number,
            full_name=full_name,
            department_name=department_name,
            section=section
        )
        self.student_card.delete("1.0", "end")
        self.student_card.insert(
            "end",
            f"Roll Number: {self.profile.roll_number}\n"
            f"Name: {self.profile.full_name}\n"
            f"Department: {self.profile.department_name}\n"
            f"Section: {self.profile.section}\n"
        )

        if not self.camera.preview_running and not self.camera.start():
            self.set_status(f"Camera unavailable: {self.camera.last_error}")
            return

        self.capture_samples = []
        self.captured_embeddings = []
        self.embedding = None
        self.enrollment_complete = False
        self.capture_running = True
        self.last_capture_time = 0.0
        self.progress.set(0)
        self.set_status("Enrollment started. Keep your face centered and still.")

    def render_preview(self):
        frame = self.camera.current_frame
        if frame is not None:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(rgb)
            image.thumbnail((860, 560))
            photo = ImageTk.PhotoImage(image=image)
            self.preview_label.configure(image=photo, text="")
            self.preview_label.image = photo
        self.after(40, self.render_preview)

    def begin_capture(self):
        self.start_enrollment()

    def process_capture(self):
        if self.capture_running and self.camera.current_frame is not None:
            self.evaluate_frame(self.camera.current_frame)
        self.after(120, self.process_capture)

    def evaluate_frame(self, frame):
        face_locations = self.recognition.detect_faces(frame)
        face_count = len(face_locations)
        blur_score = self.recognition.blur_score(frame)
        brightness = frame.mean()
        acceptable = face_count == 1 and blur_score >= 120 and 60 <= brightness <= 210
        captured = len(self.capture_samples)

        if acceptable:
            self.status_var.set("Face quality looks good. Capturing automatically...")
            now = time.time()
            if now - self.last_capture_time >= self.capture_interval_seconds and captured < self.capture_limit:
                encoding = self.recognition.extract_embedding(frame)
                if encoding is not None:
                    self.capture_samples.append(frame.copy())
                    self.captured_embeddings.append(encoding)
                    self.last_capture_time = now
                    captured += 1
                    self.progress.set(captured / self.capture_limit)
                    self.log_line(f"Captured {captured} of {self.capture_limit} images.")
        elif face_count == 0:
            self.status_var.set("No face detected. Center your face in the camera.")
        elif face_count > 1:
            self.status_var.set("Multiple faces detected. Only one student should be in frame.")
        elif blur_score < 120:
            self.status_var.set("Frame too blurry. Hold still.")
        elif brightness < 60:
            self.status_var.set("Lighting too dark. Move to a brighter area.")
        elif brightness > 210:
            self.status_var.set("Lighting too bright. Reduce glare.")

        self.metrics.configure(
            text=f"{captured} of {self.capture_limit} images captured | "
                 f"Quality: {'good' if acceptable else 'checking'} | "
                 f"Enrollment: {'running' if self.capture_running else 'idle'}"
        )

        if captured >= self.capture_limit and not self.enrollment_complete:
            self.capture_running = False
            self.generate_embedding()
            self.upload_embedding()

    def generate_embedding(self):
        self.embedding = self.recognition.average_embedding(self.captured_embeddings)
        if self.embedding is None:
            self.set_status("No captured embeddings available.")
            return
        self.set_status("Embedding generated successfully.")

    def upload_embedding(self):
        if self.embedding is None:
            self.set_status("Generate the embedding before uploading.")
            return
        payload = {
            "rollNumber": self.profile.roll_number,
            "studentId": self.profile.student_id,
            "fullName": self.profile.full_name,
            "departmentName": self.profile.department_name,
            "section": self.profile.section,
            "embedding": self.embedding,
            "sampleCount": len(self.captured_embeddings),
            "metadata": {
                "sample_images": len(self.capture_samples),
                "capture_limit": self.capture_limit,
                "source": "face-enrollment-desktop"
            }
        }
        try:
            self.backend.upload_embedding(payload)
        except RuntimeError as exc:
            self.set_status(str(exc))
            return
        except Exception as exc:
            self.set_status(f"Network error: {exc}")
            return
        self.enrollment_complete = True
        self.progress.set(1.0)
        self.set_status("Enrollment Successful")

    def reset_session(self):
        self.capture_running = False
        self.enrollment_complete = False
        self.captured_embeddings = []
        self.capture_samples = []
        self.embedding = None
        self.profile = StudentProfile()
        self.full_name.set("")
        self.roll_number.set("")
        self.department_name.set("")
        self.section.set("")
        self.progress.set(0)
        self.metrics.configure(text=f"0 of {self.capture_limit} images captured | Quality: waiting | Enrollment: idle")
        self.set_status("Session reset.")

    def on_close(self):
        self.camera.stop()
        self.destroy()
