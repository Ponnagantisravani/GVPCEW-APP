import base64
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import cv2
import numpy as np

from recognition.engine import FaceRecognitionEngine


class RecognitionApi:
    def __init__(self):
        self.engine = FaceRecognitionEngine()

    def analyze(self, image_bytes):
        array = np.frombuffer(image_bytes, dtype=np.uint8)
        frame = cv2.imdecode(array, cv2.IMREAD_COLOR)
        if frame is None:
            return {"message": "Invalid image payload"}, 400

        face_locations = self.engine.detect_faces(frame)
        blur_score = self.engine.blur_score(frame)
        brightness = float(frame.mean())
        embedding = self.engine.extract_embedding(frame)

        return {
            "faceCount": len(face_locations),
            "blurScore": float(blur_score),
            "brightness": brightness,
            "embedding": embedding,
            "hasEmbedding": embedding is not None
        }, 200


def _read_json_body(request_handler):
    content_length = int(request_handler.headers.get("Content-Length", "0"))
    raw = request_handler.rfile.read(content_length)
    return json.loads(raw.decode("utf-8")) if raw else {}


class RequestHandler(BaseHTTPRequestHandler):
    api = RecognitionApi()

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json({}, 200)

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"ok": True})
            return
        self._send_json({"message": "Not found"}, 404)

    def do_POST(self):
        if self.path != "/analyze":
            self._send_json({"message": "Not found"}, 404)
            return

        try:
            payload = _read_json_body(self)
            image_data = payload.get("image")
            if not image_data:
                self._send_json({"message": "image is required"}, 400)
                return
            if "," in image_data:
                image_data = image_data.split(",", 1)[1]
            image_bytes = base64.b64decode(image_data)
            response, status = self.api.analyze(image_bytes)
            self._send_json(response, status)
        except Exception as error:
            self._send_json({"message": str(error)}, 500)


def run(host="127.0.0.1", port=5001):
    server = ThreadingHTTPServer((host, port), RequestHandler)
    print(f"Recognition API running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
