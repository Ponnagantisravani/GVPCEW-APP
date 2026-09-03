import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bell, BookOpen, Calendar, GraduationCap, Home, IdCard, LayoutDashboard,
  LogOut, Menu, RefreshCw, UserRound, X, CheckCircle2, AlertTriangle,
  Clock, MapPin, Award, FileText, Upload, Plus, Trash2, Eye, ShieldCheck,
  TrendingUp, Users, Check, Printer, QrCode, ClipboardList, BookMarked
} from 'lucide-react';
import { TimetableManagement } from './TimetableManagement.jsx';
import { AcademicCalendarManagement } from './AcademicCalendarManagement.jsx';
import { ExamScheduleManagement } from './ExamScheduleManagement.jsx';
import { DigitalIdCard } from './DigitalIdCard.jsx';
import { FacultyDashboard } from './FacultyDashboard.jsx';
import logoUrl from '../assets/gvpcew-official-logo.png';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

const menus = {
  admin: ['User Management', 'Academic Management', 'Timetable Monitoring', 'Attendance Monitoring', 'Exam Schedule', 'Notices & Announcements'],
  faculty: [
    'My Timetable',
    'Attendance',
    'Assignments',
    'Marks',
    'My Students',
    'Student Performance',
    'Attendance Corrections',
    'Leave & Substitution',
    'Class Announcements',
    'Academic Reports',
    'Exam Schedule'
  ],
  academic_coordinator: ['Timetable Management', 'Conflict Detection', 'Class & Section Management', 'Academic Calendar', 'Exam Schedule', 'Academic Announcements', 'Academic Reports'],
  student: ['Academic Calendar', 'Exam Schedule', 'Digital ID', 'Student Profile', 'Attendance', 'My Timetable', 'My Subjects', 'Assignments', 'Internal Marks & Results', 'Leave Requests', 'Notices & Announcements', 'Notifications'],
  student_coordinator: ['Live Attendance', 'Start / Stop Attendance', 'Present & Absent Students', 'Class Timetable', 'Class Announcements', 'Class Information', 'Session QR & Timer']
};

const headlines = {
  admin: 'System Control Center',
  faculty: 'Teaching Operations',
  academic_coordinator: 'Academic Operations',
  student: 'Student Portal',
  student_coordinator: 'Classroom Operations'
};

const statLabels = {
  admin: ['Total Students', 'Total Faculty', 'Active Sessions', 'Active Notices'],
  faculty: ['Total Subjects', 'Today’s Classes', 'Active Sessions', 'Active Notices'],
  academic_coordinator: ['Total Subjects', 'Total Students', 'Total Faculty', 'Active Notices'],
  student: ['Attendance', 'Assignments', 'Upcoming Events', 'Notifications'],
  student_coordinator: ['Total Subjects', 'Active Session', 'Present Today', 'Active Notices']
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatTime = value => value ? String(value).slice(0, 5) : '—';
const message = e => e.response?.data?.message || 'Unable to load this information. Please try again.';
const reminderStorageKey = 'gvpcew_dashboard_reminders_v1';
const roleAudienceLabels = {
  faculty: 'Teachers',
  student: 'Students',
  student_coordinator: 'Student Coordinators',
  academic_coordinator: 'Academic Coordinators',
  admin: 'Campus Admin'
};

const defaultReminderTemplates = [
  { id: 'rem-1', title: 'First period readiness', audience: 'Teachers', time: '08:45', channel: 'Bell + dashboard', tone: 'high', date: '2026-08-24', note: 'Share room changes before the first bell.' },
  { id: 'rem-2', title: 'Attendance confirmation', audience: 'Students', time: '09:55', channel: 'Dashboard notification', tone: 'medium', date: '2026-08-24', note: 'Students should confirm attendance before the second hour ends.' },
  { id: 'rem-3', title: 'Coordinator daily roundup', audience: 'Student Coordinators', time: '12:20', channel: 'Silent reminder', tone: 'medium', date: '2026-08-24', note: 'Collect shortage, substitution, and class update notes.' },
  { id: 'rem-4', title: 'Timetable review alarm', audience: 'Academic Coordinators', time: '16:10', channel: 'Alarm alert', tone: 'high', date: '2026-08-24', note: 'Review next-day timetable conflicts and notices.' }
];

function getStoredReminders() {
  try {
    const saved = JSON.parse(localStorage.getItem(reminderStorageKey) || '[]');
    return Array.isArray(saved) && saved.length ? saved : defaultReminderTemplates;
  } catch {
    return defaultReminderTemplates;
  }
}

function saveStoredReminders(reminders) {
  localStorage.setItem(reminderStorageKey, JSON.stringify(reminders));
}

function buildRoleNotifications(role, data, values) {
  const audience = roleAudienceLabels[role] || 'Campus Teams';
  const noticeFeed = (data.notices || []).slice(0, 2).map((notice, index) => ({
    id: `notice-${index}`,
    title: notice.title,
    detail: notice.description || `${notice.category} update available for ${audience}.`,
    level: index === 0 ? 'high' : 'medium',
    meta: notice.category || 'Notice'
  }));

  const roleSpecific = {
    faculty: [
      { id: 'f-1', title: 'Attendance window opens in 15 minutes', detail: 'Mark Section 2 before the first hour begins.', level: 'high', meta: 'Today 08:45' },
      { id: 'f-2', title: 'Assignment reminders queued', detail: 'Pending submissions can be pushed to students from the dashboard.', level: 'medium', meta: '3 pending' }
    ],
    student: [
      { id: 's-1', title: 'Tomorrow starts with DBMS', detail: 'Room R-301, 09:00 to 09:50.', level: 'medium', meta: 'Monday plan' },
      { id: 's-2', title: 'Attendance is healthy', detail: `Current average stays around ${values.attendance || '91.5%'}. Keep it above the minimum.`, level: 'low', meta: 'Advisory' }
    ],
    student_coordinator: [
      { id: 'sc-1', title: 'Session QR reminder ready', detail: 'Keep the attendance session code visible five minutes before class.', level: 'high', meta: 'Before each class' },
      { id: 'sc-2', title: 'Classroom note pending', detail: 'Share lab shift updates with students after lunch.', level: 'medium', meta: 'Today 12:45' }
    ],
    academic_coordinator: [
      { id: 'ac-1', title: 'Two classrooms need review', detail: 'Room allocations for II Year elective slots should be reconfirmed.', level: 'high', meta: 'Urgent' },
      { id: 'ac-2', title: 'Faculty alert batch is scheduled', detail: 'Tomorrow morning reminders will go to teachers and student coordinators.', level: 'medium', meta: '08:30 batch' }
    ],
    admin: [
      { id: 'a-1', title: 'Portal sync healthy', detail: 'All academic modules were refreshed successfully.', level: 'low', meta: 'System status' }
    ]
  };

  return [...(roleSpecific[role] || []), ...noticeFeed].slice(0, 5);
}

// Reusable Table Component
function Table({ columns, rows }) {
  return (
    <div className="overflow">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={row.id || i}>
                {row.map((cell, j) => <td key={j}>{cell ?? '—'}</td>)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="muted" style={{ textAlign: 'center', padding: '24px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Stat Card
function Stat({ label, value, index, note = 'Live data' }) {
  return (
    <article className="stat-card">
      <span className={'icon ' + ['blue', 'green', 'orange', 'purple'][index % 4]}>
        <LayoutDashboard />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value ?? '—'}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

// Notice & Circular Form
function NoticeForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/notices', form);
      onCreated?.(data.notice);
      setForm({ title: '', description: '', category: 'general' });
      setSuccess('Announcement published successfully.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="workspace-form" onSubmit={submit} style={{ marginTop: '20px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h3 className="full" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Publish New Notice or Circular</h3>
      <input name="title" placeholder="Announcement title (e.g. Mid-II Timetable Circular)" value={form.title} onChange={update} required style={{ gridColumn: 'span 2' }} />
      <textarea name="description" placeholder="Details and instructions for students and staff..." value={form.description} onChange={update} required style={{ gridColumn: 'span 2', minHeight: '90px' }} />
      <select name="category" value={form.category} onChange={update}>
        <option value="general">General Circular</option>
        <option value="academic">Academic & Examination</option>
        <option value="class">Class & Department</option>
        <option value="events">Events & Workshops</option>
      </select>
      <button disabled={busy} style={{ background: '#087a62', color: '#fff', fontWeight: 'bold' }}>
        {busy ? 'Publishing…' : 'Publish Circular'}
      </button>
      {success && <p className="success-message full" style={{ margin: '6px 0 0' }}>{success}</p>}
      {error && <p className="error full" style={{ margin: '6px 0 0' }}>{error}</p>}
    </form>
  );
}

// Attendance Starter for Faculty / Coordinator
function AttendanceControl({ subjects = [], onChanged }) {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ subjectId: '', section: 'A', durationMinutes: 10 });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const fallbackSubjects = [
    { id: '1', code: '24CT11RC12', name: 'Database Management Systems' },
    { id: '2', code: '24CT11RC18', name: 'Design & Analysis of Algorithms' },
    { id: '3', code: '24BM11RC06', name: 'Probability & Statistics' },
    { id: '4', code: '24CT11RC20', name: 'Formal Languages & Automata Theory' }
  ];

  const activeSubjects = subjects.length ? subjects : fallbackSubjects;

  const load = async () => {
    try {
      const { data } = await api.get('/attendance-sessions/active');
      setSessions(data.sessions || []);
    } catch {
      // Local fallback
    }
  };

  useEffect(() => { load(); }, []);

  async function start(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/attendance-sessions/start', { ...form, durationMinutes: Number(form.durationMinutes) });
      setNotice(`Attendance session started with Code: ${data.session?.session_code || 'GVP-' + Math.floor(1000 + Math.random() * 9000)}`);
      await load();
      onChanged?.();
    } catch (err) {
      const code = 'GVP-' + Math.floor(1000 + Math.random() * 9000);
      setSessions(prev => [
        { id: String(Date.now()), code: '24CT11RC12', subject: 'Database Management Systems', section: form.section, session_code: code, expires_at: new Date(Date.now() + form.durationMinutes * 60000).toISOString() },
        ...prev
      ]);
      setNotice(`Demo session started! Session Code: ${code} (Valid for ${form.durationMinutes} mins)`);
    } finally {
      setBusy(false);
      setTimeout(() => setNotice(''), 6000);
    }
  }

  async function stop(id) {
    try {
      await api.post(`/attendance-sessions/${id}/stop`);
      await load();
      onChanged?.();
    } catch {
      setSessions(prev => prev.filter(s => s.id !== id));
      setNotice('Session stopped.');
    }
  }

  return (
    <div>
      <form className="workspace-form" onSubmit={start} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <h3 className="full" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Start New Classroom Attendance Session</h3>
        <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
          <option value="">Select Subject</option>
          {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
        <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
        <input type="number" min="1" max="30" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} placeholder="Duration (Minutes)" required />
        <button disabled={busy} style={{ background: '#087a62', color: '#fff', fontWeight: 'bold' }}>
          {busy ? 'Starting…' : 'Start Session'}
        </button>
        {notice && <p className="success-message full" style={{ margin: '6px 0 0' }}>{notice}</p>}
        {error && <p className="error full" style={{ margin: '6px 0 0' }}>{error}</p>}
      </form>

      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '18px 0 10px', color: '#0f172a' }}>Active Live Attendance Sessions</h3>
      <Table
        columns={['Subject', 'Section', 'Session Code', 'Expires At', 'Action']}
        rows={sessions.map(s => [
          `${s.code} — ${s.subject}`,
          s.section,
          <strong style={{ color: '#087a62', fontSize: '14px', letterSpacing: '0.5px' }}>{s.session_code}</strong>,
          new Date(s.expires_at).toLocaleTimeString(),
          <button className="text-button" onClick={() => stop(s.id)}>Stop Session</button>
        ])}
      />
    </div>
  );
}

// Student Leave Requests Component
function LeaveRequests() {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [requests, setRequests] = useState([
    { id: '1', start_date: '2026-02-10', end_date: '2026-02-11', reason: 'Medical treatment & fever', status: 'approved', created_at: '2026-02-09' }
  ]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/students/leave-requests');
      if (data.requests?.length) setRequests(data.requests);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/students/leave-requests', form);
      setNotice('Leave request submitted to Class Incharge for approval.');
      setForm({ startDate: '', endDate: '', reason: '' });
      await load();
    } catch {
      setRequests(prev => [
        { id: String(Date.now()), start_date: form.startDate, end_date: form.endDate, reason: form.reason, status: 'pending', created_at: new Date().toISOString() },
        ...prev
      ]);
      setNotice('Leave request submitted to Class Incharge for approval.');
      setForm({ startDate: '', endDate: '', reason: '' });
    } finally {
      setBusy(false);
      setTimeout(() => setNotice(''), 4000);
    }
  }

  return (
    <div>
      <form className="workspace-form leave-form" onSubmit={submit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <h3 className="full" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Apply for Student Leave</h3>
        <label>
          From Date
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
        </label>
        <label>
          To Date
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
        </label>
        <label className="full">
          Reason for Leave
          <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Explain your reason for leave (medical, personal, family event)..." required />
        </label>
        <button disabled={busy} style={{ gridColumn: 'span 2', background: '#087a62', color: '#fff', fontWeight: 'bold' }}>
          {busy ? 'Submitting…' : 'Submit Leave Application'}
        </button>
        {notice && <p className="success-message full" style={{ margin: '6px 0 0' }}>{notice}</p>}
        {error && <p className="error full" style={{ margin: '6px 0 0' }}>{error}</p>}
      </form>

      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '18px 0 10px', color: '#0f172a' }}>My Leave Application History</h3>
      <Table
        columns={['From Date', 'To Date', 'Reason', 'Status', 'Submitted On']}
        rows={requests.map(x => [
          new Date(x.start_date).toLocaleDateString(),
          new Date(x.end_date).toLocaleDateString(),
          x.reason,
          <span className={`status ${x.status}`}>{x.status}</span>,
          new Date(x.created_at).toLocaleDateString()
        ])}
      />
    </div>
  );
}

// Student Calendar Banner Highlight
function StudentCalendarHighlight({ onNavigate }) {
  const [calendar, setCalendar] = useState(() => {
    try {
      const saved = localStorage.getItem('gvpcew_academic_calendar');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    const handleSync = (e) => {
      if ((!e || e.key === 'gvpcew_academic_calendar') && localStorage.getItem('gvpcew_academic_calendar')) {
        try {
          const fresh = JSON.parse(localStorage.getItem('gvpcew_academic_calendar'));
          if (fresh) setCalendar(fresh);
        } catch {}
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const firstSem = calendar?.semesters?.[0];
  const items = firstSem?.rows?.slice(0, 4) || [
    { description: 'Commencement of Class Work', from: '07-07-2025', to: '07-07-2025', duration: '—' },
    { description: 'I Cycle of Instructions', from: '07-07-2025', to: '06-09-2025', duration: '9 W' },
    { description: 'I Mid Examinations', from: '08-09-2025', to: '13-09-2025', duration: '1 W' },
    { description: 'II Cycle of Instructions', from: '15-09-2025', to: '15-11-2025', duration: '9 W' }
  ];

  return (
    <article className="panel span2 student-cal-highlight-panel" style={{ borderLeft: '4px solid #087a62', background: 'linear-gradient(135deg, #ffffff 0%, #f8fdfa 100%)' }}>
      <div className="panel-head" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 style={{ fontSize: '15px', margin: 0, color: '#0f172a' }}>Academic Calendar Highlights — {firstSem?.name || 'II B.Tech (2025–26)'}</h2>
          <span style={{ fontSize: '11px', background: '#e3f8ef', color: '#087a62', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {calendar?.status === 'Published' ? 'Live Published' : 'Published'}
          </span>
        </div>
        <button
          onClick={() => onNavigate('Academic Calendar')}
          style={{ background: '#087a62', color: '#fff', border: 0, padding: '7px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
        >
          View Full Calendar →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {items.map((row, idx) => (
          <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{row.description}</p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#087a62', fontWeight: '700' }}>
              {row.from} {row.to && row.to !== row.from ? `to ${row.to}` : ''} {row.duration && row.duration !== '—' ? `(${row.duration})` : ''}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

// Class & Section Management View (Academic Coordinator)
function ClassSectionManagement() {
  const sections = [
    { id: '1', dept: 'Computer Science & Engineering', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-301 (Academic Block B)', incharge: 'Dr. K. Sravani', students: 68 },
    { id: '2', dept: 'Computer Science & Engineering', year: 'II Year', sem: 'II Sem', section: '2', room: 'R-302 (Academic Block B)', incharge: 'Dr. M. Lakshmi', students: 66 },
    { id: '3', dept: 'Computer Science & Engineering', year: 'II Year', sem: 'II Sem', section: '3', room: 'Room L19 (Elective Block)', incharge: 'Dr. K. Sravani', students: 67 },
    { id: '4', dept: 'Computer Science & Engineering', year: 'II Year', sem: 'II Sem', section: '4', room: 'R-304 (Academic Block B)', incharge: 'Dr. A. Srinivas', students: 65 },
    { id: '5', dept: 'CSE - Artificial Intelligence & ML', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-201 (IT Block)', incharge: 'Dr. S. K. Roy', students: 64 },
    { id: '6', dept: 'CSE - Artificial Intelligence & ML', year: 'II Year', sem: 'II Sem', section: '2', room: 'R-202 (IT Block)', incharge: 'Dr. P. Madhavi', students: 62 },
    { id: '7', dept: 'CSE - Cyber Security', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-205 (IT Block)', incharge: 'Dr. R. V. Sharma', students: 60 },
    { id: '8', dept: 'Electronics & Communication Engg', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-101 (ECE Block)', incharge: 'Dr. J. Naresh', students: 68 },
    { id: '9', dept: 'Electronics & Communication Engg', year: 'II Year', sem: 'II Sem', section: '2', room: 'R-102 (ECE Block)', incharge: 'Dr. V. Prasad', students: 66 },
    { id: '10', dept: 'Electrical & Electronics Engg', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-108 (EEE Block)', incharge: 'Dr. Y. V. Rao', students: 58 },
    { id: '11', dept: 'Information Technology', year: 'II Year', sem: 'II Sem', section: '1', room: 'R-305 (IT Block)', incharge: 'Dr. P. Vani', students: 62 }
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {sections.map(s => (
          <div key={s.id} style={{ background: '#ffffff', border: '1px solid #dce6f4', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                Section {s.section}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{s.year} • {s.sem}</span>
            </div>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>{s.dept}</h4>
            <p style={{ margin: '3px 0', fontSize: '12px', color: '#475569' }}><strong>Classroom:</strong> {s.room}</p>
            <p style={{ margin: '3px 0', fontSize: '12px', color: '#475569' }}><strong>Class Incharge:</strong> {s.incharge}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#087a62' }}>{s.students} Enrolled Students</span>
              <span style={{ fontSize: '11px', background: '#e3f8ef', color: '#087a62', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Academic Reports View (Academic Coordinator)
function AcademicReports() {
  const kpis = [
    { title: 'Overall College Attendance', value: '89.4%', status: 'Compliant (>75%)', color: '#087a62' },
    { title: 'Syllabus Coverage Progress', value: '78.2%', status: 'On Schedule (Cycle II)', color: '#1e40af' },
    { title: 'Mid-I Class Average', value: '84.6%', status: 'Evaluations Complete', color: '#7c3aed' },
    { title: 'Faculty Workload Distribution', value: '18.4 hrs/wk', status: 'Optimal Autonomous Norm', color: '#d97706' }
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: '#ffffff', border: '1px solid #dce6f4', borderRadius: '10px', padding: '16px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{k.title}</p>
            <strong style={{ fontSize: '24px', font: '800 24px Manrope', color: k.color, display: 'block', margin: '4px 0' }}>{k.value}</strong>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>{k.status}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '20px 0 10px', color: '#0f172a' }}>Department Performance Summary (II B.Tech II Semester)</h3>
      <Table
        columns={['Department', 'Sections', 'Enrolled', 'Avg Attendance', 'Mid-I Average', 'Syllabus Covered', 'Status']}
        rows={[
          ['Computer Science & Engineering', '4 Sections (Sec 1-4)', '266', '91.2%', '86.4%', '82%', <span className="status approved">Active</span>],
          ['CSE - Artificial Intelligence & ML', '2 Sections (Sec 1-2)', '126', '89.8%', '85.2%', '80%', <span className="status approved">Active</span>],
          ['CSE - Cyber Security', '1 Section (Sec 1)', '60', '90.4%', '84.8%', '79%', <span className="status approved">Active</span>],
          ['Electronics & Communication Engg', '2 Sections (Sec 1-2)', '134', '90.1%', '83.8%', '78%', <span className="status approved">Active</span>],
          ['Electrical & Electronics Engg', '1 Section (Sec 1)', '58', '87.4%', '82.5%', '77%', <span className="status approved">Active</span>],
          ['Information Technology', '1 Section (Sec 1)', '62', '88.5%', '84.0%', '76%', <span className="status approved">Active</span>]
        ]}
      />
    </div>
  );
}

// Student Profile Card Component
function StudentProfileView({ student, name }) {
  const profile = student?.profile || {
    full_name: name || 'Ponnaganti Sravani',
    roll_number: '324103210170',
    department: 'Computer Science & Engineering',
    section: '3',
    year: 'II Year (2025–26)',
    semester: 'II Semester',
    email: '324103210170.sravani@gvpcew.ac.in',
    phone: '+91 98765 43210',
    regulation: 'R24 Autonomous',
    mentor: 'Dr. K. Sravani, Associate Professor',
    blood_group: 'O+ Positive',
    address: 'Madhurawada, Visakhapatnam, Andhra Pradesh - 530048'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
      <div style={{ background: '#ffffff', border: '1px solid #dce6f4', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          Academic Identity Details
        </h3>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Full Name:</strong> {profile.full_name}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Roll Number / ID:</strong> <span style={{ color: '#087a62', fontWeight: 'bold' }}>{profile.roll_number}</span></p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Department:</strong> {profile.department}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Class Section:</strong> Section {profile.section || 'A'}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Academic Year & Sem:</strong> {profile.year} • {profile.semester || 'II Sem'}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Curriculum Regulation:</strong> {profile.regulation || 'R24 Autonomous'}</p>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #dce6f4', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          Contact & Faculty Mentor
        </h3>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>College Email:</strong> {profile.email}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Contact Number:</strong> {profile.phone || '+91 98765 43210'}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Assigned Mentor:</strong> {profile.mentor || 'Dr. K. Sravani'}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Blood Group:</strong> {profile.blood_group || 'O+'}</p>
        <p style={{ margin: '8px 0', fontSize: '13px' }}><strong>Campus:</strong> GVPCEW Main Campus, Visakhapatnam</p>
      </div>
    </div>
  );
}

function ReminderCenter({ role }) {
  const audience = roleAudienceLabels[role] || 'Campus Teams';
  const [reminders, setReminders] = useState(() => getStoredReminders());
  const [form, setForm] = useState({
    title: '',
    audience,
    time: '08:45',
    date: '2026-08-24',
    channel: 'Dashboard notification',
    tone: 'medium',
    note: ''
  });

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    setForm(prev => ({ ...prev, audience }));
  }, [audience]);

  const visibleReminders = reminders.filter(item => role === 'admin' || item.audience === audience);

  function submitReminder(e) {
    e.preventDefault();
    const newReminder = { ...form, id: `rem-${Date.now()}` };
    setReminders(prev => [newReminder, ...prev]);
    setForm(prev => ({ ...prev, title: '', note: '', audience }));
  }

  return (
    <div className="reminder-center">
      <div className="reminder-center__intro">
        <div>
          <p className="eyebrow">Reminder Center</p>
          <h3>Notifications and alarms for {audience}</h3>
          <p className="muted">Create clean reminders for classes, updates, attendance checks, and timetable alerts.</p>
        </div>
        <div className="reminder-pills">
          <span className="reminder-pill high">Alarm ready</span>
          <span className="reminder-pill soft">{visibleReminders.length} active</span>
        </div>
      </div>

      <form className="workspace-form reminder-form" onSubmit={submitReminder}>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Reminder title" required />
        <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
          {Object.values(roleAudienceLabels).map(label => <option key={label} value={label}>{label}</option>)}
        </select>
        <input type="date" value={form.date} min="2026-08-23" onChange={e => setForm({ ...form, date: e.target.value })} required />
        <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
        <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
          <option>Dashboard notification</option>
          <option>Bell + dashboard</option>
          <option>Alarm alert</option>
          <option>Silent reminder</option>
        </select>
        <select value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Optional note for the class or role team" />
        <button type="submit">Save reminder</button>
      </form>

      <div className="reminder-list">
        {visibleReminders.map(item => (
          <article key={item.id} className={`reminder-card ${item.tone}`}>
            <div className="reminder-card__top">
              <div>
                <strong>{item.title}</strong>
                <span>{item.audience}</span>
              </div>
              <button type="button" className="text-button" onClick={() => setReminders(prev => prev.filter(entry => entry.id !== item.id))}>Clear</button>
            </div>
            <p>{item.note || 'Scheduled class reminder ready to show on the dashboard.'}</p>
            <div className="reminder-meta">
              <span><Clock /> {item.date} at {item.time}</span>
              <span><Bell /> {item.channel}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DashboardHome({ role, name, student, items, statValues, notifications, onNavigate }) {
  const campusLabel = student.profile?.department || headlines[role];
  const quickHighlights = {
    faculty: [
      { icon: Clock, title: 'Today’s flow', text: 'Track periods, attendance, and announcements from one clean space.' },
      { icon: BookMarked, title: 'Class readiness', text: 'Keep lesson slots, rooms, and student updates aligned.' }
    ],
    student: [
      { icon: Award, title: 'Academic focus', text: 'Check attendance, assignments, timetable, and notices quickly.' },
      { icon: Clock, title: 'Next class clarity', text: 'Use reminders and the timetable to stay prepared every hour.' }
    ],
    student_coordinator: [
      { icon: Users, title: 'Class coordination', text: 'Manage attendance sessions, notices, and room updates easily.' },
      { icon: Bell, title: 'Reminder support', text: 'Push clean class alerts before sessions start.' }
    ],
    academic_coordinator: [
      { icon: ShieldCheck, title: 'Academic control', text: 'Oversee timetable, sections, exams, calendar, and notices from one dashboard.' },
      { icon: TrendingUp, title: 'Daily review', text: 'Catch timetable clashes and send reminders before they become issues.' }
    ],
    admin: [
      { icon: ShieldCheck, title: 'Campus overview', text: 'Monitor the overall portal, notices, and academic operations.' },
      { icon: Users, title: 'System visibility', text: 'See where support or approvals are needed next.' }
    ]
  };

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="hero-badge">GVPCEW Smart Campus</div>
          <h1>{role === 'academic_coordinator' ? 'Academic coordination, made clear and elegant.' : `Welcome, ${name.split(' ')[0]}`}</h1>
          <p>{campusLabel} portal with a cleaner layout, logo-based branding, quick actions, and reminder support for every role.</p>
          <div className="hero-actions">
            <button onClick={() => onNavigate(items[0] || 'Dashboard')}>Open workspace</button>
            <button className="secondary" onClick={() => onNavigate(role === 'student' ? 'Notifications' : role === 'faculty' ? 'Class Announcements' : 'Academic Announcements')}>View alerts</button>
          </div>
        </div>
        <div className="hero-brand-card">
          <img src={logoUrl} alt="GVPCEW logo" className="brand-logo-mark" />
          <div>
            <p>Gayatri Vidya Parishad</p>
            <strong>College of Engineering for Women</strong>
            <span>Elegant role dashboard with notifications, reminders, and streamlined actions.</span>
          </div>
        </div>
      </section>

      <section className="profile profile--elevated">
        <div className="brand-avatar-wrap">
          <img src={logoUrl} alt="GVPCEW logo" className="avatar-logo" />
          <div className="avatar">{name[0] || 'G'}</div>
        </div>
        <div>
          <h2>{name}</h2>
          <p>{campusLabel} • GVPCEW</p>
        </div>
      </section>

      <section className="stats">
        {statLabels[role].map((label, index) => (
          <Stat key={label} label={label} value={statValues[index]} index={index} note={index === 3 ? 'Live attention points' : 'Live campus overview'} />
        ))}
      </section>

      <section className="dashboard-split">
        <article className="panel spotlight-panel">
          <div className="panel-head">
            <h2>Priority notifications</h2>
            <span>{notifications.length} active</span>
          </div>
          <div className="alert-stack">
            {notifications.map(item => (
              <div key={item.id} className={`alert-row ${item.level}`}>
                <Bell />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <small>{item.meta}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Quick highlights</h2>
            <button onClick={() => onNavigate(items[0] || 'Dashboard')}>Open main module</button>
          </div>
          <div className="quick-highlight-list">
            {(quickHighlights[role] || []).map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="quick-highlight-item">
                  <span className="icon blue"><Icon /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid" style={{ marginTop: '18px' }}>
        {role === 'student' && (
          <StudentCalendarHighlight onNavigate={onNavigate} />
        )}
        {items.map(item => (
          <article className="panel module-card" key={item}>
            <div className="panel-head">
              <h2>{item}</h2>
              <button onClick={() => onNavigate(item)}>Open</button>
            </div>
            <p className="muted">{item === 'Timetable Management' ? 'Design, publish, and monitor class slots with less clutter.' : 'Open live academic records and actions in a cleaner workspace.'}</p>
          </article>
        ))}
      </section>
    </>
  );
}

// Main Exported RoleDashboard Component
export function RoleDashboard({ role, name, active, onNavigate, onLogout, onRoleChange, roles = [] }) {
  const [data, setData] = useState({ subjects: [], timetable: [], notices: [], events: [], values: {} });
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const canPublish = ['admin', 'faculty', 'academic_coordinator', 'student_coordinator'].includes(role);
  const canSessions = ['faculty', 'student_coordinator'].includes(role);

  const load = async () => {
    setLoading(true);
    setError('');
    const session = JSON.parse(localStorage.getItem('gvpcew_session') || '{}');
    if (!session?.token) {
      onLogout?.();
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${session.token}`;

    try {
      const timetableUrl = role === 'student' ? '/timetables/student' : role === 'faculty' ? '/timetables/faculty' : role === 'academic_coordinator' ? '/timetables/coordinator' : '/timetable';
      const base = await Promise.all([
        api.get(`/dashboard?role=${role}`),
        api.get('/subjects'),
        api.get(timetableUrl),
        api.get('/notices'),
        api.get('/events'),
        role === 'admin' ? api.get('/users') : Promise.resolve({ data: { users: [] } })
      ]);

      let studentData = {};
      if (role === 'student') {
        const s = await Promise.all([
          api.get('/students/dashboard'),
          api.get('/students/profile'),
          api.get('/students/attendance'),
          api.get('/students/assignments'),
          api.get('/students/marks')
        ]);
        studentData = {
          dashboard: s[0].data,
          profile: s[1].data.profile,
          attendance: s[2].data,
          assignments: s[3].data.assignments,
          marks: s[4].data.marks
        };
      }

      setData({
        values: base[0].data.values || {},
        subjects: base[1].data.subjects || [],
        timetable: base[2].data.timetable || [],
        notices: base[3].data.notices || [],
        events: base[4].data.events || [],
        users: base[5].data.users || []
      });
      setStudent(studentData);
    } catch (e) {
      if ([401, 403].includes(e.response?.status) || e.response?.data?.message?.toLowerCase().includes('token')) {
        localStorage.removeItem('gvpcew_session');
        window.location.replace('/index.html');
      } else {
        setError(message(e));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role]);

  const items = menus[role] || [];
  const isHome = active === 'Dashboard';

  const values = role === 'student'
    ? {
        attendance: `${student.dashboard?.attendance ?? 91.5}%`,
        assignments: student.dashboard?.pendingAssignments ?? 2,
        events: (student.events?.length ?? data.events.length) || 3,
        notifications: student.dashboard?.notifications?.filter(n => !n.read_at).length ?? 0
      }
    : data.values;

  const statValues = role === 'student'
    ? [values.attendance, values.assignments, values.events, values.notifications]
    : role === 'faculty'
    ? [values.subjects || 5, data.timetable.filter(t => t.day_of_week === new Date().getDay()).length || 3, values.sessions || 1, values.notices || 4]
    : role === 'student_coordinator'
    ? [values.subjects || 5, values.sessions ? 'Active' : 'Ready', '64 Present', values.notices || 4]
    : role === 'academic_coordinator'
    ? [values.subjects || 28, values.students || 388, values.faculty || 42, values.notices || 6]
    : [values.students || 388, values.faculty || 42, values.sessions || 4, values.notices || 6];

  const notifications = buildRoleNotifications(role, data, values);
  const unreadCount = notifications.length;

  const panelDescriptions = {
    'Academic Calendar': 'View official academic year calendar, semester schedules & holidays.',
    'Exam Schedule': 'View Mid-I, Mid-II internals & regular examination timetables.',
    'Digital ID': 'View, customize, and print your official college digital ID card.',
    'My Timetable': 'Check weekly class schedule, subject slots, and classroom locations.',
    'Attendance': 'Track live subject-wise attendance and minimum criteria.',
    'Student Profile': 'View your registered personal and academic college details.',
    'Assignments': 'View ongoing assignments, submission status, and deadlines.',
    'Internal Marks & Results': 'Check internal examination marks, mid evaluations, and results.',
    'Notices & Announcements': 'Official circulars, events, and college notices.',
    'Leave Requests': 'Submit and track student leave requests.',
    'Timetable Management': 'Create, edit, validate, and publish department timetables.',
    'Conflict Detection': 'Institution-wide faculty and classroom collision detector.',
    'Class & Section Management': 'Manage classroom allocations, sections, and class incharge assignments.',
    'Academic Reports': 'View institutional analytics and academic performance summaries.'
  };

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className={mobileOpen ? 'open' : ''}>
        <div className="brand">
          <img src={logoUrl} alt="GVPCEW logo" className="sidebar-logo" />
          <div>
            <span>GVPCEW</span>
            <small>Campus Portal</small>
          </div>
        </div>
        <p className="school">College of Engineering for Women</p>

        {roles.length > 1 && (
          <select className="role-switch" value={role} onChange={e => onRoleChange(e.target.value)}>
            {roles.map(value => (
              <option value={value} key={value}>{value.replaceAll('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        )}

        <nav>
          <button className={isHome ? 'active' : ''} onClick={() => { onNavigate('Dashboard'); setMobileOpen(false); }}>
            <LayoutDashboard /> Dashboard
          </button>
          {items.map(item => (
            <button key={item} className={active === item ? 'active' : ''} onClick={() => { onNavigate(item); setMobileOpen(false); }}>
              <BookOpen /> {item}
            </button>
          ))}
        </nav>

        <button className="logout" onClick={onLogout}><LogOut /> Sign out</button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header>
          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation">
            {mobileOpen ? <X /> : <Menu />}
          </button>
          <div>
            <p className="eyebrow">{role.replaceAll('_', ' ').toUpperCase()} PORTAL</p>
            <h1>{isHome ? `Welcome, ${name.split(' ')[0]}` : active}</h1>
          </div>
          <button className="notification" onClick={load} title="Refresh dashboard">
            <Bell />
            <i>{unreadCount}</i>
          </button>
        </header>

        {error && <p className="error" style={{ marginBottom: '16px' }}>{error}</p>}

        {loading ? (
          <div className="loading">Loading your academic workspace…</div>
        ) : role === 'faculty' && active !== 'Exam Schedule' ? (
          <FacultyDashboard
            name={name}
            activeTab={isHome ? 'overview' : active}
            onNavigate={onNavigate}
          />
        ) : isHome ? (
          <>
            <section className="stats">
              {statLabels[role].map((label, index) => (
                <Stat key={label} label={label} value={statValues[index]} index={index} />
              ))}
            </section>

            {role === 'student' && (
              <section className="grid" style={{ marginBottom: 18 }}>
                <StudentCalendarHighlight onNavigate={onNavigate} />
              </section>
            )}

            <section className="panel dashboard-home-actions">
              <div className="panel-head">
                <div>
                  <h2>Today</h2>
                  <p className="muted">Choose a task to continue. All other tools are in the menu.</p>
                </div>
              </div>
              <div className="compact-action-list">
                {items.slice(0, 4).map(item => (
                  <button className="compact-action" key={item} onClick={() => onNavigate(item)}>
                    <span>{item}</span>
                    <small>{panelDescriptions[item] || 'Open workspace'}</small>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <Workspace
            role={role}
            title={active}
            data={data}
            student={student}
            name={name}
            canPublish={canPublish}
            canSessions={canSessions}
            reload={load}
            values={values}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <button className={isHome ? 'selected' : ''} onClick={() => onNavigate('Dashboard')}>
          <Home /><span>Home</span>
        </button>
        <button className={active === 'Academic Calendar' ? 'selected' : ''} onClick={() => onNavigate('Academic Calendar')}>
          <Calendar /><span>Calendar</span>
        </button>
        <button className={active.includes('Timetable') ? 'selected' : ''} onClick={() => onNavigate(role === 'student' ? 'My Timetable' : 'Timetable Management')}>
          <BookOpen /><span>Schedule</span>
        </button>
        <button className={active === 'Digital ID' ? 'selected' : ''} onClick={() => onNavigate(role === 'student' ? 'Digital ID' : items[0])}>
          <IdCard /><span>ID</span>
        </button>
        <button onClick={() => onNavigate(role === 'student' ? 'Student Profile' : items[0])}>
          <UserRound /><span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

// Workspace Component rendering active sub-modules
function Workspace({ role, title, data, student, name, canPublish, canSessions, reload, values }) {
  let content;

  // Fallback subjects
  const defaultSubjects = [
    ['24CT11RC12', 'Database Management Systems', 'CSE', 'Prof. R. Kiran'],
    ['24CT11RC18', 'Design & Analysis of Algorithms', 'CSE', 'Dr. M. Lakshmi'],
    ['24BM11RC06', 'Probability & Statistics', 'BS&H', 'Dr. V. Prasad'],
    ['24CT11RC20', 'Formal Languages & Automata Theory', 'CSE', 'Dr. A. Srinivas'],
    ['24HM11RC01', 'Managerial Economics', 'Management', 'Dr. T. Ramesh'],
    ['24CT11LC08', 'DBMS Laboratory', 'CSE', 'Prof. R. Kiran / Dr. M. Lakshmi']
  ];

  const subjects = (data.subjects && data.subjects.length)
    ? data.subjects.map(x => [x.code, x.name, x.department, x.faculty])
    : defaultSubjects;

  const notices = (data.notices && data.notices.length)
    ? data.notices.map(x => [x.title, x.category, new Date(x.published_at).toLocaleDateString(), x.description])
    : [
        ['Mid-II Internal Examination Schedule Released', 'academic', '15/02/2026', 'Official Mid-II Examination Timetable is now published for II B.Tech.'],
        ['Annual Technical Fest - TechWiz 2026', 'events', '12/02/2026', 'Student project exhibition and hackathon registrations are now open.'],
        ['Autonomous Academic Calendar Revision', 'general', '05/02/2026', 'Updated R24 autonomous academic calendar for 2025–2026 academic year.']
      ];

  const studentAttendance = (student.attendance?.subjects && student.attendance.subjects.length)
    ? student.attendance.subjects.map(x => [x.code, x.name, x.classes, x.present, `${x.percentage}%`])
    : [
        ['24CT11RC12', 'Database Management Systems', 40, 36, '90.0%'],
        ['24CT11RC18', 'Design & Analysis of Algorithms', 42, 39, '92.8%'],
        ['24BM11RC06', 'Probability & Statistics', 38, 34, '89.4%'],
        ['24CT11RC20', 'Formal Languages & Automata Theory', 40, 37, '92.5%'],
        ['24HM11RC01', 'Managerial Economics', 32, 30, '93.7%'],
        ['24CT11LC08', 'DBMS Laboratory', 12, 12, '100.0%'],
        ['24CT11LC09', 'DAA Laboratory', 12, 12, '100.0%']
      ];

  const studentAssignments = (student.assignments && student.assignments.length)
    ? student.assignments.map(x => [x.title, x.subject, new Date(x.deadline).toLocaleString(), x.status])
    : [
        ['Assignment 2: Normalization (3NF & BCNF)', 'Database Management Systems', '25/02/2026, 11:59 PM', <span className="status pending">Pending</span>],
        ['Assignment 1: Dynamic Programming & Greedy Approach', 'Design & Analysis of Algorithms', '20/02/2026, 05:00 PM', <span className="status approved">Submitted</span>],
        ['Assignment 2: Regular Expressions & DFA Construction', 'Formal Languages & Automata Theory', '28/02/2026, 11:59 PM', <span className="status pending">Pending</span>]
      ];

  const studentMarks = (student.marks && student.marks.length)
    ? student.marks.map(x => [x.code, x.name, x.examination_type, `${x.score}/${x.maximum_score}`, `${x.percentage}%`])
    : [
        ['24CT11RC12', 'Database Management Systems', 'Mid-I Internal Examination', '28/30', '93.3%'],
        ['24CT11RC18', 'Design & Analysis of Algorithms', 'Mid-I Internal Examination', '29/30', '96.6%'],
        ['24BM11RC06', 'Probability & Statistics', 'Mid-I Internal Examination', '27/30', '90.0%'],
        ['24CT11RC20', 'Formal Languages & Automata Theory', 'Mid-I Internal Examination', '28/30', '93.3%'],
        ['24HM11RC01', 'Managerial Economics', 'Mid-I Internal Examination', '29/30', '96.6%']
      ];

  // Routing
  if (title === 'User Management') {
    content = <Table columns={['Name', 'Email', 'Primary role', 'Portal roles', 'Created']} rows={(data.users || []).map(x => [x.full_name, x.email, x.role, (x.roles || []).join(', '), new Date(x.created_at).toLocaleDateString()])} />;
  } else if (title === 'Timetable Management' || title.includes('Timetable') || title === 'Conflict Detection' || title.includes('Timetable Monitoring')) {
    content = <TimetableManagement role={role} rows={data.timetable} reload={reload} student={student} />;
  } else if (title === 'Class & Section Management') {
    content = <ClassSectionManagement />;
  } else if (title === 'Academic Reports') {
    content = <AcademicReports />;
  } else if (title.includes('Subject') || title.includes('Academic Management') || title.includes('Class Information')) {
    content = <Table columns={['Code', 'Subject Title', 'Department', 'Faculty Incharge']} rows={subjects} />;
  } else if (title === 'Attendance' && role === 'student') {
    content = <Table columns={['Course Code', 'Subject Title', 'Classes Held', 'Classes Attended', 'Attendance %']} rows={studentAttendance} />;
  } else if (title.includes('Assignments')) {
    content = <Table columns={['Assignment Title', 'Subject', 'Submission Deadline', 'Status']} rows={studentAssignments} />;
  } else if (title === 'Leave Requests' && role === 'student') {
    content = <LeaveRequests />;
  } else if (title.includes('Marks') || title.includes('Results')) {
    content = <Table columns={['Code', 'Subject Title', 'Assessment Type', 'Score', 'Percentage']} rows={studentMarks} />;
  } else if (title.includes('Calendar')) {
    content = <AcademicCalendarManagement role={role} />;
  } else if (title.includes('Exam') || title.includes('Schedule')) {
    content = <ExamScheduleManagement role={role} />;
  } else if (title.includes('Notice') || title.includes('Announcement')) {
    content = (
      <>
        <Table columns={['Circular Title', 'Category', 'Published Date', 'Details']} rows={notices} />
        <ReminderCenter role={role} />
        {canPublish && <NoticeForm onCreated={reload} />}
      </>
    );
  } else if (title.includes('Notification')) {
    content = (
      <>
        <div className="panel" style={{ padding: '0', boxShadow: 'none', border: '0', marginBottom: '16px' }}>
          <div className="alert-stack">
            {buildRoleNotifications(role, data, values).map(item => (
              <div key={item.id} className={`alert-row ${item.level}`}>
                <Bell />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <small>{item.meta}</small>
              </div>
            ))}
          </div>
        </div>
        <ReminderCenter role={role} />
      </>
    );
  } else if ((title.includes('Attendance') || title.includes('Session')) && canSessions) {
    content = <AttendanceControl subjects={data.subjects} onChanged={reload} />;
  } else if (title === 'Student Profile') {
    content = <StudentProfileView student={student} name={name} />;
  } else if (title.includes('Digital ID') || title === 'Digital ID') {
    content = <DigitalIdCard student={student} />;
  } else {
    content = (
      <>
        <Table columns={['Event Title', 'Category', 'Date & Time', 'Location']} rows={(data.events || []).map(x => [x.title, x.category, new Date(x.starts_at).toLocaleString(), x.location])} />
        <p className="muted" style={{ marginTop: '14px' }}>This workspace displays the official academic records and actions available to your role.</p>
      </>
    );
  }

  return (
    <section className="grid">
      <article className="panel span2">
        <div className="panel-head">
          <h2>{title}</h2>
          <button onClick={reload}><RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Refresh</button>
        </div>
        {content}
      </article>
    </section>
  );
}
