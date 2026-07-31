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
6. The embedding is uploaded to the backend.
7. The UI shows `Enrollment Successful`.
