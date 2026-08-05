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
