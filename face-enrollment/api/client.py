import os

import requests


class BackendClient:
    def __init__(self, base_url=None, timeout=20):
        self.base_url = (base_url or os.getenv("BACKEND_URL", "http://localhost:4000/api")).rstrip("/")
        self.timeout = timeout

    def lookup_student(self, roll_number):
        response = requests.post(
            f"{self.base_url}/enrollment/lookup",
            json={"rollNumber": roll_number},
            timeout=10
        )
        return self._parse_response(response)["student"]

    def upload_embedding(self, payload):
        response = requests.post(
            f"{self.base_url}/enrollment/upload",
            json=payload,
            timeout=self.timeout
        )
        return self._parse_response(response)

    def _parse_response(self, response):
        try:
            response.raise_for_status()
            return response.json()
        except requests.HTTPError as exc:
            try:
                message = response.json().get("message", "Request failed")
            except Exception:
                message = "Request failed"
            raise RuntimeError(message) from exc
