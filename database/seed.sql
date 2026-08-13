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
    '$2a$10$FW3u1vPb4vfOBhc1G85iBuaXcgrjTJdK46HIUuX9DDu9ZcWcCqNc6',
    'student'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'GVPCEW Faculty',
    'faculty1@gvpcew.ac.in',
    '$2a$10$FW3u1vPb4vfOBhc1G85iBuaXcgrjTJdK46HIUuX9DDu9ZcWcCqNc6',
    'faculty'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'GVPCEW Admin',
    'admin@gvpcew.ac.in',
    '$2a$10$FW3u1vPb4vfOBhc1G85iBuaXcgrjTJdK46HIUuX9DDu9ZcWcCqNc6',
    'admin'
  )
on conflict (email) do nothing;

-- Multi-role local development account. One identity can switch between all
-- operational portals; production role assignment should remain Admin-only.
insert into users (id, full_name, email, password_hash, role)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Sravani GVPCEW',
  '324103210170.sravani@gvpcew.ac.in',
  '$2a$12$.AaxfkSTI6PO8ZC8GJgI6uXPFx7J0fzMmm6AlZpvR8UWWMuP3anvu',
  'admin'
)
on conflict (email) do update set full_name=excluded.full_name, password_hash=excluded.password_hash, role='admin';

insert into user_roles (user_id, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','admin'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','faculty'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','academic_coordinator'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','student'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','student_coordinator')
on conflict do nothing;

insert into students (id, user_id, department_id, roll_number, admission_number, face_enrollment_status, face_enrolled_at)
values
  (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    '324103210170',
    'GVPCEW-2026-001',
    'completed',
    now()
  )
on conflict (roll_number) do update set face_enrollment_status = 'completed', face_enrolled_at = coalesce(students.face_enrolled_at, now());

insert into students (id, user_id, department_id, roll_number, section, admission_number, face_enrollment_status, face_enrolled_at)
values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','324103210170-S','A','GVPCEW-2026-SRAVANI','completed',now())
on conflict (user_id) do update set face_enrollment_status='completed', face_enrolled_at=coalesce(students.face_enrolled_at,now());

insert into faculty (id, user_id, department_id, employee_code)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','FAC-SRAVANI')
on conflict (user_id) do nothing;

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

insert into notices (title, description, category, author_id)
select 'Internal assessment schedule', 'The first internal assessment timetable is now available in the portal.', 'academic', id from users where role = 'admin'
and not exists (select 1 from notices where title = 'Internal assessment schedule');

insert into events (title, description, category, starts_at, location, capacity)
select 'Women in Technology Summit', 'A full-day industry and alumni event.', 'seminar', now() + interval '14 days', 'Auditorium', 250
where not exists (select 1 from events where title = 'Women in Technology Summit');
