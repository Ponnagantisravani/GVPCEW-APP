# Database Setup

Create the PostgreSQL database first:

```sql
CREATE DATABASE gvpcew_attendance;
```

Then run:

```powershell
psql -U postgres -d gvpcew_attendance -f database/schema.sql
psql -U postgres -d gvpcew_attendance -f database/seed.sql
```

Update `backend/.env` before starting the backend:

```env
PORT=4000
JWT_SECRET=change_me
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gvpcew_attendance
```
