# Syllabus publishing

The academic coordinator and student dashboards include a Syllabus menu and dashboard shortcut.

Coordinators can load an editable CSE first-year template based on the supplied college PDF, an eight-semester framework, or a custom semester template. They can edit course codes, categories, lecture/practical hours, marks, credits, objectives, unit contents, outcomes and references; preview and save drafts; reopen drafts; and publish them. Published portal documents can be copied into revised drafts without changing the existing published version. The CSE template contains course tables; detailed unit contents must be entered before publishing a complete subject syllabus.

Alternatively, coordinators can upload the official PDF (up to 15 MB), save a draft, review it and publish it. Students see only published documents, can search by title/department/batch, download uploaded PDFs, and print or save portal-created documents as PDF. Publication and student notifications are committed together.

## Existing database setup

Run `npm --prefix backend run db:migrate:syllabus` and restart the backend. New database initialization includes the syllabus schema automatically. To import a reference PDF as an unpublished draft, append `-- "absolute/path/to/document.pdf"` to the migration command. That optional import uses the supplied CSE document’s title and batch metadata.

## Verification

Run `npm run build` and `npm --prefix backend run test:syllabus`. Integration checks require the configured database and at least one user. All test documents and notifications are rolled back. Checks cover validation, editing, publication, draft access, PDF access, student permissions and rollback when notification delivery fails.
