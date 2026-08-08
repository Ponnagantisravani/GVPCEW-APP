# GVPCEW Automatic Attendance System

The first working phase is the face enrollment desktop application.

## Current structure

- `face-enrollment/` contains the Windows enrollment app
- `backend/` receives enrollment data
- `database/` stores schema definitions
- `frontend/` will later hold dashboards

## Enrollment flow

1. Student logs in with roll number.
2. Backend returns basic student details.
3. Desktop app starts the webcam.
4. High-quality face samples are collected.
5. An embedding is generated from the samples.
6. The embedding and captured face images are uploaded to the backend.
7. The UI shows `Enrollment Successful`.

## Uploaded datasets

Classmates' local `.exe` captures are still saved on their own computers, but the app also uploads copies to the backend.

- Server folder: `backend/src/uploads/datasets/<roll_number>/`
- Public URL path while the backend is running: `/uploads/datasets/<roll_number>/<image_name>`
- Upload metadata is stored in PostgreSQL table `face_embeddings` under `embedding.metadata.uploaded_images`

## Private persistent dataset pipeline

Images are now intended to be stored in a **private S3-compatible bucket** (Cloudflare R2 is a good Render-compatible choice), not on Render's temporary disk. Set the values in `backend/.env.example` as Render environment variables, then run `cd backend && npm install && npm run db:migrate`. Use `npm start` as the Render start command; do not use `npm run db:init` in production because it recreates the database.

Build the desktop app with `ENROLLMENT_API_KEY` available in its environment. The upload route is `POST /api/enrollment/upload` with an `X-Enrollment-Key` header. Keep this key scoped to enrollment, rotate it if an installer is lost, and use a stronger per-device/login credential scheme before a large rollout.

From your laptop, set `DATASET_ADMIN_API_KEY` and run:

```powershell
python -m pip install -r tools/requirements.txt
python tools/sync_dataset.py --api-url https://your-render-service.onrender.com --output dataset
```

This saves new files as `dataset/<roll_number>/<image_name>` and records checksums in `dataset/.sync-state.json`; repeated runs skip files already downloaded. Protected admin routes are `GET /api/dataset/stats`, `GET /api/dataset/manifest`, and `GET /api/dataset/images/:id`, all requiring `X-Dataset-Admin-Key`.
