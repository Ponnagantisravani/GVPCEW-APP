insert into departments (id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'Computer Science Engineering'),
  ('22222222-2222-2222-2222-222222222222', 'Electronics and Communication Engineering')
on conflict (name) do nothing;

insert into users (id, full_name, email, password_hash, role)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'GVPCEW Student',
    'student1@gvpcew.ac.in',
    '$2a$10$B0/920v7pgdG4LbvjuSnHOAlUaBPLFqmL6ufjZq8xnJ97M4.eSbAS',
    'student'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'GVPCEW Faculty',
    'faculty1@gvpcew.ac.in',
    '$2a$10$B0/920v7pgdG4LbvjuSnHOAlUaBPLFqmL6ufjZq8xnJ97M4.eSbAS',
    'faculty'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'GVPCEW Admin',
    'admin@gvpcew.ac.in',
    '$2a$10$B0/920v7pgdG4LbvjuSnHOAlUaBPLFqmL6ufjZq8xnJ97M4.eSbAS',
    'admin'
  )
on conflict (email) do nothing;

insert into students (id, user_id, department_id, roll_number, admission_number)
values
  (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '324103210170',
    'GVPCEW-2026-001'
  )
on conflict (roll_number) do nothing;

insert into faculty (id, user_id, department_id, employee_code)
values
  (
    '77777777-7777-7777-7777-777777777777',
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    'FAC-001'
  )
on conflict (employee_code) do nothing;

insert into classrooms (id, room_code, building_name, room_name, active)
values
  (
    '88888888-8888-8888-8888-888888888888',
    'CSE-101',
    'Main Block',
    'Room 101',
    true
  )
on conflict (room_code) do nothing;

insert into subjects (id, department_id, code, name, faculty_id)
values
  (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    'CSE101',
    'Programming Fundamentals',
    '77777777-7777-7777-7777-777777777777'
  )
on conflict (code) do nothing;

insert into timetable (subject_id, classroom_id, faculty_id, day_of_week, start_time, end_time, academic_year)
values
  (
    '99999999-9999-9999-9999-999999999999',
    '88888888-8888-8888-8888-888888888888',
    '77777777-7777-7777-7777-777777777777',
    1,
    '09:00',
    '10:00',
    '2026-2027'
  )
on conflict do nothing;