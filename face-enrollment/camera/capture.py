import threading
import time

import cv2


class CameraCapture:
    def __init__(self, device_index=0):
        self.device_index = device_index
        self.camera = None
        self.preview_running = False
        self.current_frame = None
        self._thread = None
        self.last_error = ""

    def start(self):
        if self.preview_running:
            return True

        candidates = [self.device_index]
        if self.device_index != 0:
            candidates.append(0)
        candidates.extend([1, 2])

        for index in candidates:
            camera = cv2.VideoCapture(index, cv2.CAP_DSHOW)
            if camera.isOpened():
                camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                camera.set(cv2.CAP_PROP_FPS, 30)
                self.camera = camera
                self.device_index = index
                self.preview_running = True
                self.last_error = ""
                self._thread = threading.Thread(target=self._loop, daemon=True)
                self._thread.start()
                return True
            camera.release()

        self.camera = None
        self.preview_running = False
        self.last_error = "No camera device could be opened. Check permissions and camera availability."
        return False

    def _loop(self):
        while self.preview_running and self.camera is not None:
            ok, frame = self.camera.read()
            if ok:
                self.current_frame = frame
            else:
                time.sleep(0.05)
            time.sleep(0.03)

    def stop(self):
        self.preview_running = False
        if self.camera is not None:
            self.camera.release()
            self.camera = None
