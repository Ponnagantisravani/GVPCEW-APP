"""Download only unseen private dataset images from the Render API."""
import argparse
import hashlib
import json
import os
from pathlib import Path

import requests


def safe_part(value):
    return "".join(c if c.isalnum() or c in "_-" else "_" for c in value)[:80] or "unknown"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", default=os.getenv("BACKEND_URL", "https://gvpcew-app.onrender.com"))
    parser.add_argument("--output", default="dataset")
    parser.add_argument("--key", default=os.getenv("DATASET_ADMIN_API_KEY"))
    args = parser.parse_args()
    if not args.key:
        raise SystemExit("Set DATASET_ADMIN_API_KEY; never put it in source code.")

    api = args.api_url.rstrip("/")
    if not api.endswith("/api"):
        api += "/api"
    headers = {"X-Dataset-Admin-Key": args.key}
    root = Path(args.output)
    root.mkdir(parents=True, exist_ok=True)
    state_path = root / ".sync-state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {"checksums": []}
    known = set(state.get("checksums", []))
    offset = 0
    downloaded = 0

    while True:
        response = requests.get(f"{api}/dataset/manifest", params={"limit": 500, "offset": offset}, headers=headers, timeout=30)
        response.raise_for_status()
        page = response.json()
        for image in page["images"]:
            checksum = image["checksum"]
            target = root / safe_part(image["roll_number"]) / safe_part(image["original_name"])
            if checksum in known and target.exists():
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            data = requests.get(f"{api}/dataset/images/{image['id']}", headers=headers, timeout=60).content
            if hashlib.sha256(data).hexdigest() != checksum:
                raise RuntimeError(f"Checksum failed for {image['id']}")
            target.write_bytes(data)
            known.add(checksum)
            downloaded += 1
        if page["nextOffset"] is None:
            break
        offset = page["nextOffset"]

    state_path.write_text(json.dumps({"checksums": sorted(known)}, indent=2))
    print(f"Downloaded {downloaded} new image(s) into {root}")


if __name__ == "__main__":
    main()
