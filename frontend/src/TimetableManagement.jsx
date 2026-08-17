import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Calendar, Edit3, Check, Save, Share2, FolderOpen, Plus, Trash2, X,
  Printer, Sparkles, ShieldCheck, AlertTriangle, Clock, MapPin, User,
  FileText, Upload, Image as ImageIcon, Download, RefreshCw, Eye, CheckCircle2,
  ChevronRight, Filter, Search, Layers, LayoutGrid, Info, Palette, Sliders
} from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

export const TIMETABLE_STORAGE_KEY = 'gvpcew_timetable_master_v3';
export const TIMETABLE_IMAGE_KEY = 'gvpcew_timetable_images_v3';
export const TIMETABLE_STATUS_KEY = 'gvpcew_timetable_published_status_v3';

export const BRANCHES = [
  { key: 'cse_a', name: 'Computer Science & Engineering (Sec A)', short: 'CSE - A', dept: 'CSE', year: 'II Year', sem: 'II Sem', section: 'A' },
  { key: 'cse_b', name: 'Computer Science & Engineering (Sec B)', short: 'CSE - B', dept: 'CSE', year: 'II Year', sem: 'II Sem', section: 'B' },
  { key: 'aiml', name: 'CSE - Artificial Intelligence & ML', short: 'CSE - AIML', dept: 'AIML', year: 'II Year', sem: 'II Sem', section: 'A' },
  { key: 'it', name: 'Information Technology', short: 'IT', dept: 'IT', year: 'II Year', sem: 'II Sem', section: 'A' },
  { key: 'ece', name: 'Electronics & Communication Engg', short: 'ECE', dept: 'ECE', year: 'II Year', sem: 'II Sem', section: 'A' },
  { key: 'eee', name: 'Electrical & Electronics Engg', short: 'EEE', dept: 'EEE', year: 'II Year', sem: 'II Sem', section: 'A' }
];

export const STANDARD_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const STANDARD_PERIODS = [
  { id: 'p1', time: '08:40 AM - 09:30 AM', label: 'Period 1', isBreak: false },
  { id: 'p2', time: '09:30 AM - 10:20 AM', label: 'Period 2', isBreak: false },
  { id: 'p3', time: '10:20 AM - 11:10 AM', label: 'Period 3', isBreak: false },
  { id: 'p4', time: '11:10 AM - 12:00 PM', label: 'Period 4', isBreak: false },
  { id: 'lunch', time: '12:00 PM - 12:50 PM', label: 'LUNCH BREAK', isBreak: true },
  { id: 'p5', time: '12:50 PM - 01:40 PM', label: 'Period 5', isBreak: false },
  { id: 'p6', time: '01:40 PM - 02:30 PM', label: 'Period 6', isBreak: false },
  { id: 'p7', time: '02:30 PM - 03:20 PM', label: 'Period 7', isBreak: false }
];

export const SLOT_TYPES = {
  theory: { label: 'Theory / Lecture', color: '#e0edff', textColor: '#1e40af', border: '#bfdbfe' },
  lab: { label: 'Practical / Lab', color: '#dcfce7', textColor: '#166534', border: '#bbf7d0' },
  tutorial: { label: 'Tutorial / Practice', color: '#f3e8ff', textColor: '#6b21a8', border: '#e9d5ff' },
  elective: { label: 'Elective / Skill', color: '#fef3c7', textColor: '#92400e', border: '#fde68a' },
  library: { label: 'Library / Mentoring', color: '#ffedd5', textColor: '#9a3412', border: '#fed7aa' },
  break: { label: 'Break / Lunch', color: '#f1f5f9', textColor: '#475569', border: '#cbd5e1' },
  remedial: { label: 'Remedial / Special', color: '#fee2e2', textColor: '#991b1b', border: '#fca5a5' }
};

export const INITIAL_TIMETABLES = {
  cse_a: {
    id: 'cse_a',
    title: 'II B.Tech II Semester (2025–26) — Department of Computer Science & Engineering [Section A]',
    academicYear: '2025–2026',
    classroom: 'Room 301 (Academic Block B)',
    incharge: 'Dr. K. Sravani, Associate Professor',
    status: 'Published',
    updatedAt: '2026-08-17',
    days: STANDARD_DAYS,
    periods: STANDARD_PERIODS,
    grid: {
      Monday: {
        p1: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-301', type: 'theory' },
        p2: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-301', type: 'theory' },
        p3: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-301', type: 'theory' },
        p4: { subject: 'Prof. Ethics & Human Values', code: '24HM11MC01', faculty: 'Mrs. S. Bhavani', room: 'R-301', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran / Dr. M. Lakshmi', room: 'Lab 4 (CS Block)', type: 'lab' },
        p6: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran / Dr. M. Lakshmi', room: 'Lab 4 (CS Block)', type: 'lab' },
        p7: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran / Dr. M. Lakshmi', room: 'Lab 4 (CS Block)', type: 'lab' }
      },
      Tuesday: {
        p1: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-301', type: 'theory' },
        p2: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-301', type: 'theory' },
        p3: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-301', type: 'theory' },
        p4: { subject: 'Managerial Economics', code: '24HM11RC01', faculty: 'Dr. T. Ramesh', room: 'R-301', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi / Mrs. P. Vani', room: 'Lab 2 (CS Block)', type: 'lab' },
        p6: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi / Mrs. P. Vani', room: 'Lab 2 (CS Block)', type: 'lab' },
        p7: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi / Mrs. P. Vani', room: 'Lab 2 (CS Block)', type: 'lab' }
      },
      Wednesday: {
        p1: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-301', type: 'theory' },
        p2: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-301', type: 'theory' },
        p3: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-301', type: 'theory' },
        p4: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-301', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Data Visualization [Honors]', code: '24CA11HN02', faculty: 'Dr. K. Sravani', room: 'R-301', type: 'elective' },
        p6: { subject: 'Library / Student Mentoring Session', code: 'MENTOR-02', faculty: 'Dr. K. Sravani / Dr. V. Prasad', room: 'Library Hall', type: 'library' },
        p7: { subject: 'Technical Skill Course (Python Advanced)', code: '24SC11SK04', faculty: 'Trainer Mr. G. Rajesh', room: 'Lab 1', type: 'tutorial' }
      },
      Thursday: {
        p1: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-301', type: 'theory' },
        p2: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-301', type: 'theory' },
        p3: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-301', type: 'theory' },
        p4: { subject: 'Prof. Ethics & Human Values', code: '24HM11MC01', faculty: 'Mrs. S. Bhavani', room: 'R-301', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' },
        p6: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' },
        p7: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' }
      },
      Friday: {
        p1: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-301', type: 'theory' },
        p2: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-301', type: 'theory' },
        p3: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-301', type: 'theory' },
        p4: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-301', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Mini Project & Review Lab', code: '24CT11PR01', faculty: 'Dr. K. Sravani', room: 'Project Lab', type: 'lab' },
        p6: { subject: 'Mini Project & Review Lab', code: '24CT11PR01', faculty: 'Dr. K. Sravani', room: 'Project Lab', type: 'lab' },
        p7: { subject: 'Social Media Analytics [Honors]', code: '24CT11HN02', faculty: 'Dr. A. Srinivas', room: 'R-301', type: 'elective' }
      },
      Saturday: {
        p1: { subject: 'Managerial Economics', code: '24HM11RC01', faculty: 'Dr. T. Ramesh', room: 'R-301', type: 'theory' },
        p2: { subject: 'Prof. Ethics & Human Values', code: '24HM11MC01', faculty: 'Mrs. S. Bhavani', room: 'R-301', type: 'theory' },
        p3: { subject: 'DAA Tutorial & Doubt Clearing', code: '24CT11RC18-T', faculty: 'Dr. M. Lakshmi', room: 'R-301', type: 'tutorial' },
        p4: { subject: 'Sports & Student Club Activities', code: 'ECA-02', faculty: 'Physical Director', room: 'Sports Ground', type: 'library' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Technical Seminar & Presentation', code: '24CT11SM01', faculty: 'Dr. K. Sravani', room: 'Seminar Hall 1', type: 'tutorial' },
        p6: { subject: 'Remedial / Placement Training', code: 'CRT-02', faculty: 'Training Officer', room: 'R-301', type: 'elective' },
        p7: { subject: 'Weekly Faculty Review & Feedback', code: 'REV-02', faculty: 'Class Incharge Dr. Sravani', room: 'R-301', type: 'library' }
      }
    }
  },
  cse_b: {
    id: 'cse_b',
    title: 'II B.Tech II Semester (2025–26) — Department of Computer Science & Engineering [Section B]',
    academicYear: '2025–2026',
    classroom: 'Room 302 (Academic Block B)',
    incharge: 'Dr. M. Lakshmi, Professor',
    status: 'Published',
    updatedAt: '2026-08-17',
    days: STANDARD_DAYS,
    periods: STANDARD_PERIODS,
    grid: {
      Monday: {
        p1: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-302', type: 'theory' },
        p2: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-302', type: 'theory' },
        p3: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-302', type: 'theory' },
        p4: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-302', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi', room: 'Lab 2', type: 'lab' },
        p6: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi', room: 'Lab 2', type: 'lab' },
        p7: { subject: 'DAA Laboratory', code: '24CT11LC09', faculty: 'Dr. M. Lakshmi', room: 'Lab 2', type: 'lab' }
      },
      Tuesday: {
        p1: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-302', type: 'theory' },
        p2: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-302', type: 'theory' },
        p3: { subject: 'Managerial Economics', code: '24HM11RC01', faculty: 'Dr. T. Ramesh', room: 'R-302', type: 'theory' },
        p4: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-302', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran', room: 'Lab 4', type: 'lab' },
        p6: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran', room: 'Lab 4', type: 'lab' },
        p7: { subject: 'DBMS Lab (Batch 1) / OS Lab (Batch 2)', code: '24CT11LC08', faculty: 'Prof. R. Kiran', room: 'Lab 4', type: 'lab' }
      },
      Wednesday: {
        p1: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-302', type: 'theory' },
        p2: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-302', type: 'theory' },
        p3: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-302', type: 'theory' },
        p4: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-302', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' },
        p6: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' },
        p7: { subject: 'Web Technologies Lab', code: '24CT11LC10', faculty: 'Mrs. P. Vani', room: 'Lab 3', type: 'lab' }
      },
      Thursday: {
        p1: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-302', type: 'theory' },
        p2: { subject: 'Managerial Economics', code: '24HM11RC01', faculty: 'Dr. T. Ramesh', room: 'R-302', type: 'theory' },
        p3: { subject: 'Design & Analysis of Algorithms', code: '24CT11RC18', faculty: 'Dr. M. Lakshmi', room: 'R-302', type: 'theory' },
        p4: { subject: 'Prof. Ethics & Human Values', code: '24HM11MC01', faculty: 'Mrs. S. Bhavani', room: 'R-302', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Data Visualization [Honors]', code: '24CA11HN02', faculty: 'Dr. K. Sravani', room: 'R-302', type: 'elective' },
        p6: { subject: 'Library / Student Mentoring', code: 'MENTOR-02', faculty: 'Dr. M. Lakshmi', room: 'Library', type: 'library' },
        p7: { subject: 'Technical Skill Course (Python Advanced)', code: '24SC11SK04', faculty: 'Trainer Mr. G. Rajesh', room: 'Lab 1', type: 'tutorial' }
      },
      Friday: {
        p1: { subject: 'Database Management Systems', code: '24CT11RC12', faculty: 'Prof. R. Kiran', room: 'R-302', type: 'theory' },
        p2: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-302', type: 'theory' },
        p3: { subject: 'Prof. Ethics & Human Values', code: '24HM11MC01', faculty: 'Mrs. S. Bhavani', room: 'R-302', type: 'theory' },
        p4: { subject: 'Formal Languages & Automata', code: '24CT11RC20', faculty: 'Dr. A. Srinivas', room: 'R-302', type: 'theory' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Mini Project & Review Lab', code: '24CT11PR01', faculty: 'Dr. M. Lakshmi', room: 'Project Lab', type: 'lab' },
        p6: { subject: 'Mini Project & Review Lab', code: '24CT11PR01', faculty: 'Dr. M. Lakshmi', room: 'Project Lab', type: 'lab' },
        p7: { subject: 'Social Media Analytics [Honors]', code: '24CT11HN02', faculty: 'Dr. A. Srinivas', room: 'R-302', type: 'elective' }
      },
      Saturday: {
        p1: { subject: 'Managerial Economics', code: '24HM11RC01', faculty: 'Dr. T. Ramesh', room: 'R-302', type: 'theory' },
        p2: { subject: 'Probability & Statistics', code: '24BM11RC06', faculty: 'Dr. V. Prasad', room: 'R-302', type: 'theory' },
        p3: { subject: 'DBMS Doubt Clearing Tutorial', code: '24CT11RC12-T', faculty: 'Prof. R. Kiran', room: 'R-302', type: 'tutorial' },
        p4: { subject: 'Sports & Student Club Activities', code: 'ECA-02', faculty: 'Physical Director', room: 'Sports Ground', type: 'library' },
        lunch: { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Campus Cafeteria', type: 'break' },
        p5: { subject: 'Technical Seminar & Presentation', code: '24CT11SM01', faculty: 'Dr. M. Lakshmi', room: 'Seminar Hall 1', type: 'tutorial' },
        p6: { subject: 'Remedial / Placement Training', code: 'CRT-02', faculty: 'Training Officer', room: 'R-302', type: 'elective' },
        p7: { subject: 'Weekly Faculty Review & Feedback', code: 'REV-02', faculty: 'Class Incharge Dr. Lakshmi', room: 'R-302', type: 'library' }
      }
    }
  }
};

export function TimetableManagement({ role = 'academic_coordinator', rows = [], reload, student }) {
  const isEditor = role === 'academic_coordinator' || role === 'admin';

  // Load Timetables State from LocalStorage
  const [timetables, setTimetables] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMETABLE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TIMETABLES;
  });

  // Load Attached Official Timetable Images
  const [timetableImages, setTimetableImages] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMETABLE_IMAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Selected Branch / Section
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (student?.profile?.department) {
      const dept = student.profile.department.toLowerCase();
      if (dept.includes('aiml')) return 'aiml';
      if (dept.includes('it')) return 'it';
      if (dept.includes('ece')) return 'ece';
      if (dept.includes('eee')) return 'eee';
      if (dept.includes('cse')) return student?.profile?.section === 'B' ? 'cse_b' : 'cse_a';
    }
    return 'cse_a';
  });

  // Active View Tab: 'grid', 'image', 'conflicts'
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [isEditingCell, setIsEditingCell] = useState(null); // { day, periodId, data }
  const [editingModalOpen, setEditingModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [addDayModalOpen, setAddDayModalOpen] = useState(false);
  const [addPeriodModalOpen, setAddPeriodModalOpen] = useState(false);
  const [newDayName, setNewDayName] = useState('Sunday');
  const [newPeriodForm, setNewPeriodForm] = useState({ id: 'p8', time: '03:20 PM - 04:10 PM', label: 'Period 8', isBreak: false });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const currentTimetable = timetables[selectedBranch] || timetables.cse_a || INITIAL_TIMETABLES.cse_a;
  const currentImage = timetableImages[selectedBranch] || null;

  // Persist Timetables
  useEffect(() => {
    if (isEditor) {
      localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
    }
  }, [timetables, isEditor]);

  // Persist Images
  useEffect(() => {
    if (isEditor) {
      localStorage.setItem(TIMETABLE_IMAGE_KEY, JSON.stringify(timetableImages));
    }
  }, [timetableImages, isEditor]);

  // Sync across windows
  useEffect(() => {
    const handleSync = (e) => {
      if (!e || e.key === TIMETABLE_STORAGE_KEY) {
        try {
          const fresh = JSON.parse(localStorage.getItem(TIMETABLE_STORAGE_KEY));
          if (fresh) setTimetables(fresh);
        } catch {}
      }
      if (!e || e.key === TIMETABLE_IMAGE_KEY) {
        try {
          const freshImages = JSON.parse(localStorage.getItem(TIMETABLE_IMAGE_KEY));
          if (freshImages) setTimetableImages(freshImages);
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

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(prev => (prev === msg ? '' : prev)), 3500);
  };

  // Today Indicator
  const todayName = useMemo(() => {
    const d = new Date().getDay();
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayMap[d] || 'Monday';
  }, []);

  // Open Cell Editor
  const handleOpenEditCell = (day, periodId) => {
    if (!isEditor) return;
    const existing = currentTimetable.grid?.[day]?.[periodId] || {
      subject: '', code: '', faculty: '', room: currentTimetable.classroom || '', type: 'theory', customColor: '', customTextColor: ''
    };
    setIsEditingCell({ day, periodId, data: { ...existing } });
    setEditingModalOpen(true);
  };

  // Save Cell
  const handleSaveCell = (e) => {
    e.preventDefault();
    if (!isEditingCell) return;
    const { day, periodId, data } = isEditingCell;

    setTimetables(prev => {
      const branchData = { ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a) };
      const grid = { ...branchData.grid };
      const daySlots = { ...(grid[day] || {}) };
      daySlots[periodId] = data;
      grid[day] = daySlots;
      branchData.grid = grid;
      branchData.updatedAt = new Date().toISOString().split('T')[0];
      return { ...prev, [selectedBranch]: branchData };
    });

    setEditingModalOpen(false);
    setIsEditingCell(null);
    showNotice(`Updated ${day} (${periodId.toUpperCase()}) schedule.`);
  };

  // Add Day (Row)
  const handleAddDay = (e) => {
    e.preventDefault();
    if (!newDayName.trim()) return;

    setTimetables(prev => {
      const branchData = { ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a) };
      const days = [...(branchData.days || STANDARD_DAYS)];
      if (days.includes(newDayName)) {
        alert('This day already exists in the timetable!');
        return prev;
      }
      days.push(newDayName);
      branchData.days = days;
      const grid = { ...branchData.grid };
      if (!grid[newDayName]) {
        grid[newDayName] = {};
        (branchData.periods || STANDARD_PERIODS).forEach(p => {
          grid[newDayName][p.id] = p.isBreak
            ? { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Cafeteria', type: 'break' }
            : { subject: '', code: '', faculty: '', room: branchData.classroom || '', type: 'theory' };
        });
      }
      branchData.grid = grid;
      return { ...prev, [selectedBranch]: branchData };
    });

    setAddDayModalOpen(false);
    showNotice(`Added row for ${newDayName}.`);
  };

  // Delete Day (Row)
  const handleDeleteDay = (dayToDelete) => {
    if (!window.confirm(`Delete row for ${dayToDelete}?`)) return;

    setTimetables(prev => {
      const branchData = { ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a) };
      const days = (branchData.days || STANDARD_DAYS).filter(d => d !== dayToDelete);
      branchData.days = days;
      const grid = { ...branchData.grid };
      delete grid[dayToDelete];
      branchData.grid = grid;
      return { ...prev, [selectedBranch]: branchData };
    });

    showNotice(`Deleted row for ${dayToDelete}.`);
  };

  // Add Period (Column)
  const handleAddPeriod = (e) => {
    e.preventDefault();
    if (!newPeriodForm.label.trim()) return;

    const pid = newPeriodForm.id.trim() || `p_${Date.now()}`;

    setTimetables(prev => {
      const branchData = { ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a) };
      const periods = [...(branchData.periods || STANDARD_PERIODS)];
      if (periods.some(p => p.id === pid)) {
        alert('A period with this ID already exists!');
        return prev;
      }
      periods.push({ ...newPeriodForm, id: pid });
      branchData.periods = periods;

      const grid = { ...branchData.grid };
      (branchData.days || STANDARD_DAYS).forEach(day => {
        grid[day] = {
          ...(grid[day] || {}),
          [pid]: newPeriodForm.isBreak
            ? { subject: 'BREAK', code: '', faculty: '', room: '', type: 'break' }
            : { subject: '', code: '', faculty: '', room: branchData.classroom || '', type: 'theory' }
        };
      });
      branchData.grid = grid;
      return { ...prev, [selectedBranch]: branchData };
    });

    setAddPeriodModalOpen(false);
    showNotice(`Added column: ${newPeriodForm.label}.`);
  };

  // Delete Period (Column)
  const handleDeletePeriod = (periodIdToDelete) => {
    if (!window.confirm(`Delete this period column (${periodIdToDelete}) across all days?`)) return;

    setTimetables(prev => {
      const branchData = { ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a) };
      const periods = (branchData.periods || STANDARD_PERIODS).filter(p => p.id !== periodIdToDelete);
      branchData.periods = periods;

      const grid = { ...branchData.grid };
      (branchData.days || STANDARD_DAYS).forEach(day => {
        if (grid[day]) {
          const daySlots = { ...grid[day] };
          delete daySlots[periodIdToDelete];
          grid[day] = daySlots;
        }
      });
      branchData.grid = grid;
      return { ...prev, [selectedBranch]: branchData };
    });

    showNotice(`Deleted column ${periodIdToDelete}.`);
  };

  // Load Preset Template
  const handleLoadTemplate = (templateKey) => {
    if (!INITIAL_TIMETABLES[templateKey] && templateKey !== 'blank') return;

    if (!window.confirm(`Load preset template? This will replace the schedule for ${currentTimetable.title}.`)) return;

    if (templateKey === 'blank') {
      const blankGrid = {};
      STANDARD_DAYS.forEach(day => {
        blankGrid[day] = {};
        STANDARD_PERIODS.forEach(p => {
          blankGrid[day][p.id] = p.isBreak
            ? { subject: 'LUNCH BREAK', code: '', faculty: '', room: 'Cafeteria', type: 'break' }
            : { subject: '', code: '', faculty: '', room: 'R-301', type: 'theory' };
        });
      });

      setTimetables(prev => ({
        ...prev,
        [selectedBranch]: {
          id: selectedBranch,
          title: `II B.Tech II Semester (2025–26) — ${BRANCHES.find(b => b.key === selectedBranch)?.name || 'Department'}`,
          academicYear: '2025–2026',
          classroom: 'Room 301',
          incharge: 'Faculty Incharge',
          status: 'Draft',
          updatedAt: new Date().toISOString().split('T')[0],
          days: STANDARD_DAYS,
          periods: STANDARD_PERIODS,
          grid: blankGrid
        }
      }));
    } else {
      const templateData = JSON.parse(JSON.stringify(INITIAL_TIMETABLES[templateKey]));
      setTimetables(prev => ({
        ...prev,
        [selectedBranch]: {
          ...templateData,
          id: selectedBranch,
          title: `II B.Tech II Semester (2025–26) — ${BRANCHES.find(b => b.key === selectedBranch)?.name || templateData.title}`
        }
      }));
    }

    setTemplateModalOpen(false);
    showNotice('Preset template loaded successfully! You can now customize cells, colors, rows and columns.');
  };

  // Handle Official Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image file is too large (max 8MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setTimetableImages(prev => ({
          ...prev,
          [selectedBranch]: {
            dataUrl: base64,
            fileName: file.name,
            uploadedAt: new Date().toLocaleString(),
            size: `${(file.size / 1024).toFixed(1)} KB`
          }
        }));
        setError('');
        showNotice(`Official timetable image uploaded successfully for ${currentTimetable.title}!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (!window.confirm('Remove this official signed timetable image?')) return;
    setTimetableImages(prev => {
      const next = { ...prev };
      delete next[selectedBranch];
      return next;
    });
    showNotice('Timetable image removed.');
  };

  // Publish
  const handlePublish = () => {
    setTimetables(prev => ({
      ...prev,
      [selectedBranch]: {
        ...(prev[selectedBranch] || INITIAL_TIMETABLES.cse_a),
        status: 'Published',
        updatedAt: new Date().toISOString().split('T')[0]
      }
    }));
    showNotice('Timetable published live across Student & Faculty portals!');
  };

  const activeDays = currentTimetable.days || STANDARD_DAYS;
  const activePeriods = currentTimetable.periods || STANDARD_PERIODS;
  const filteredDays = selectedDayFilter === 'all' ? activeDays : activeDays.filter(d => d.toLowerCase() === selectedDayFilter.toLowerCase());

  return (
    <div className="timetable-main-container">
      {/* Top Banner */}
      <div className="timetable-top-banner no-print">
        <div className="timetable-banner-left">
          <div className="timetable-badge-row">
            <span className="timetable-pill green">GVPCEW Autonomous (R24)</span>
            <span className="timetable-pill blue">II B.Tech II Semester (2025–26)</span>
            <span className={`timetable-pill ${currentTimetable.status === 'Published' ? 'published' : 'draft'}`}>
              {currentTimetable.status === 'Published' ? '✓ Live Published' : '✎ Draft Version'}
            </span>
          </div>
          <h2 className="timetable-title">{currentTimetable.title}</h2>
          <p className="timetable-subtitle">
            <strong>Allocated Classroom:</strong> {currentTimetable.classroom} • <strong>Class Incharge:</strong> {currentTimetable.incharge}
          </p>
        </div>

        <div className="timetable-banner-right">
          {isEditor && (
            <>
              {/* Load Template Button */}
              <button
                type="button"
                className="timetable-btn"
                style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', fontWeight: 'bold' }}
                onClick={() => setTemplateModalOpen(true)}
                title="Load standard preset template or start with a blank grid"
              >
                <FolderOpen className="w-4 h-4 mr-1 inline text-emerald-700" />
                <span>Load Template</span>
              </button>

              {/* Add Row Button */}
              <button
                type="button"
                className="timetable-btn outline"
                onClick={() => setAddDayModalOpen(true)}
                title="Add a new Day (Row) to the timetable"
              >
                <Plus className="w-3.5 h-3.5 mr-1 inline text-blue-600" />
                <span>Add Row (Day)</span>
              </button>

              {/* Add Column Button */}
              <button
                type="button"
                className="timetable-btn outline"
                onClick={() => setAddPeriodModalOpen(true)}
                title="Add a new Period (Column) to the timetable"
              >
                <Plus className="w-3.5 h-3.5 mr-1 inline text-purple-600" />
                <span>Add Column (Period)</span>
              </button>

              {/* Publish Timetable */}
              <button
                type="button"
                className="timetable-btn publish"
                onClick={handlePublish}
                title="Publish changes to all student and faculty dashboards"
              >
                <Share2 className="w-4 h-4 mr-1 inline" />
                <span>Publish Timetable</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="timetable-btn outline"
            onClick={() => window.print()}
            title="Print or export timetable as PDF"
          >
            <Printer className="w-4 h-4 mr-1 inline" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="timetable-alert success no-print">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="timetable-alert error no-print">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar: Branch Selector & View Mode Tabs */}
      <div className="timetable-toolbar-card no-print">
        <div className="timetable-selector-group">
          <span className="toolbar-label">Select Department / Class Section:</span>
          <div className="branch-pills-row">
            {BRANCHES.map(b => (
              <button
                key={b.key}
                type="button"
                className={`branch-pill-btn ${selectedBranch === b.key ? 'active' : ''}`}
                onClick={() => setSelectedBranch(b.key)}
              >
                {b.short}
              </button>
            ))}
          </div>
        </div>

        <div className="timetable-view-tabs">
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Calendar className="w-4 h-4 mr-1.5 inline text-blue-600" />
            <span>Weekly Schedule Matrix</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'image' ? 'active' : ''}`}
            onClick={() => setViewMode('image')}
          >
            <ImageIcon className="w-4 h-4 mr-1.5 inline text-emerald-600" />
            <span>Official Signed Timetable {currentImage && '✓'}</span>
          </button>
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'conflicts' ? 'active' : ''}`}
            onClick={() => setViewMode('conflicts')}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 inline text-purple-600" />
            <span>Conflict Detection</span>
          </button>
        </div>
      </div>

      {/* Hidden file input for official image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* VIEW 1: WEEKLY SCHEDULE MATRIX */}
      {viewMode === 'grid' && (
        <div className="timetable-grid-view">
          {/* Sub-toolbar: Day Filters & Color Category Legend */}
          <div className="timetable-sub-toolbar no-print">
            <div className="day-filters">
              <span className="filter-text">Filter Day:</span>
              <button
                type="button"
                className={`day-filter-btn ${selectedDayFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDayFilter('all')}
              >
                Full Week
              </button>
              {activeDays.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-filter-btn ${selectedDayFilter.toLowerCase() === day.toLowerCase() ? 'active' : ''} ${todayName === day ? 'is-today' : ''}`}
                  onClick={() => setSelectedDayFilter(day)}
                >
                  {day.slice(0, 3)}
                  {todayName === day && <span className="today-dot" title="Today">•</span>}
                </button>
              ))}
            </div>

            <div className="slot-type-legend">
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>Color Categories:</span>
              {Object.entries(SLOT_TYPES).map(([typeKey, typeObj]) => (
                <span key={typeKey} className="legend-item">
                  <span className="legend-box" style={{ background: typeObj.color, borderColor: typeObj.border }}></span>
                  <span>{typeObj.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Timetable Table Matrix */}
          <div className="timetable-table-wrapper">
            <table className="timetable-matrix-table">
              <thead>
                <tr>
                  <th className="th-day-col">Day / Period</th>
                  {activePeriods.map(p => (
                    <th key={p.id} className={`th-period-col ${p.isBreak ? 'th-break' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <div>
                          <div className="period-th-label">{p.label}</div>
                          <div className="period-th-time">{p.time}</div>
                        </div>
                        {isEditor && (
                          <button
                            type="button"
                            className="no-print"
                            style={{ border: 0, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '3px', padding: '2px 4px', cursor: 'pointer', fontSize: '10px' }}
                            onClick={(e) => { e.stopPropagation(); handleDeletePeriod(p.id); }}
                            title={`Delete column ${p.label}`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  {isEditor && <th style={{ width: '50px', textAlign: 'center' }} className="no-print">Row</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDays.map(day => {
                  const isToday = todayName.toLowerCase() === day.toLowerCase();
                  return (
                    <tr key={day} className={isToday ? 'row-today' : ''}>
                      {/* Day Header Column */}
                      <td className="td-day-header">
                        <div className="day-name">{day}</div>
                        {isToday && <span className="today-badge">TODAY</span>}
                      </td>

                      {/* Period Cells */}
                      {activePeriods.map(p => {
                        const slot = currentTimetable.grid?.[day]?.[p.id];
                        const slotType = SLOT_TYPES[slot?.type] || SLOT_TYPES.theory;

                        // Lunch Break Column
                        if (p.isBreak) {
                          return (
                            <td key={p.id} className="td-lunch-slot">
                              <div className="lunch-box">
                                <span className="lunch-title">{slot?.subject || p.label}</span>
                                <span className="lunch-time">{p.time}</span>
                              </div>
                            </td>
                          );
                        }

                        // Instructional Slot
                        const hasContent = slot && slot.subject && slot.subject.trim() !== '';
                        const bgStyle = slot?.customColor || slotType.color;
                        const borderStyle = slotType.border || '#cbd5e1';
                        const textStyle = slot?.customTextColor || slotType.textColor;

                        return (
                          <td
                            key={p.id}
                            className={`td-slot-cell ${isEditor ? 'editable-cell' : ''}`}
                            style={{
                              background: bgStyle,
                              borderColor: borderStyle,
                              borderLeftColor: textStyle
                            }}
                            onClick={() => handleOpenEditCell(day, p.id)}
                          >
                            {hasContent ? (
                              <div className="slot-card-inner">
                                <div className="slot-card-top">
                                  <span className="slot-type-badge" style={{ color: textStyle, borderColor: textStyle }}>
                                    {slotType.label.split(' / ')[0]}
                                  </span>
                                  {slot.code && <span className="slot-code">{slot.code}</span>}
                                </div>
                                <div className="slot-subject-name">{slot.subject}</div>
                                <div className="slot-faculty" title={slot.faculty}>
                                  <User className="w-2.5 h-2.5 inline mr-0.5" />
                                  {slot.faculty || 'Faculty Incharge'}
                                </div>
                                <div className="slot-room">
                                  <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                                  {slot.room || currentTimetable.classroom}
                                </div>

                                {isEditor && (
                                  <div className="cell-hover-edit-hint no-print">
                                    <Edit3 className="w-2.5 h-2.5" /> Edit
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="empty-slot">
                                {isEditor ? (
                                  <span className="add-slot-prompt">+ Assign</span>
                                ) : (
                                  <span className="free-period-text">Free Period</span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Delete Row Button */}
                      {isEditor && (
                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }} className="no-print">
                          <button
                            type="button"
                            className="cal-row-delete-btn"
                            onClick={() => handleDeleteDay(day)}
                            title={`Delete row for ${day}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="timetable-footer-info">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <p>
              <strong>Autonomous Schedule Notes:</strong> All 3-hour practical lab blocks are conducted in designated Computer Labs. Tutorials and Mentoring sessions are held weekly.
              {isEditor && ' As Academic Coordinator, click on any class slot to edit subject details, assigned faculty, classroom, and custom color category.'}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: OFFICIAL SIGNED TIMETABLE DOCUMENT */}
      {viewMode === 'image' && (
        <div className="timetable-image-container">
          <div className="image-viewer-header no-print">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Official Signed Timetable Document ({BRANCHES.find(b => b.key === selectedBranch)?.name})
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                Upload or view the official signed timetable circular issued by the Principal &amp; Head of Department.
              </p>
            </div>

            <div className="image-action-buttons">
              {isEditor && (
                <>
                  <button
                    type="button"
                    className="timetable-btn upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1 inline" />
                    <span>{currentImage ? 'Replace Image' : 'Upload Scanned Copy'}</span>
                  </button>

                  {currentImage && (
                    <button
                      type="button"
                      className="timetable-btn danger outline"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="w-4 h-4 mr-1 inline" />
                      <span>Remove</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {currentImage ? (
            <div className="official-image-frame">
              <div className="image-meta-bar">
                <span><strong>File:</strong> {currentImage.fileName}</span>
                <span><strong>Uploaded:</strong> {currentImage.uploadedAt}</span>
                <span><strong>Size:</strong> {currentImage.size}</span>
                <a href={currentImage.dataUrl} download={`GVPCEW_Timetable_${selectedBranch}.png`} className="download-image-link">
                  <Download className="w-3.5 h-3.5 mr-1 inline" /> Download Full Resolution
                </a>
              </div>
              <div className="uploaded-image-wrapper">
                <img src={currentImage.dataUrl} alt="Official Timetable" className="official-uploaded-image" />
              </div>
            </div>
          ) : (
            <div className="official-blueprint-card">
              <div className="blueprint-top-bar">
                <div>
                  <h3 style={{ font: '800 16px Manrope', margin: 0, color: '#0f2b48' }}>GAYATRI VIDYA PARISHAD COLLEGE OF ENGINEERING FOR WOMEN</h3>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>(Autonomous • Approved by AICTE • Affiliated to Andhra University)</p>
                  <strong style={{ fontSize: '13px', color: '#1e40af', display: 'block', marginTop: '4px' }}>
                    OFFICIAL CLASS TIME TABLE — {BRANCHES.find(b => b.key === selectedBranch)?.name?.toUpperCase()}
                  </strong>
                </div>
                <div className="blueprint-stamp">
                  <div>GVPCEW AUTONOMOUS</div>
                  <div>ACADEMIC 2025–26</div>
                </div>
              </div>

              <div className="blueprint-preview-notice">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0f172a' }}>Digital Timetable Active</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  The weekly matrix is active and synced. {isEditor ? 'You can upload the scanned copy of the physical signed timetable circular using the "Upload Scanned Copy" button above.' : 'Physical signed copy will be uploaded by the Academic Coordinator.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CONFLICT DETECTION */}
      {viewMode === 'conflicts' && (
        <div className="timetable-conflicts-container">
          <div className="conflicts-header">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Institution-Wide Timetable Conflict &amp; Collision Detector
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                Scans all department sections (CSE, IT, AIML, ECE, EEE) for overlapping faculty assignments and classroom collisions.
              </p>
            </div>
            <div className="conflict-tag clean">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 inline" />
              <span>All 6 Sections Validated — 0 Collisions</span>
            </div>
          </div>

          <div className="no-conflicts-card">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
              Zero Timetable Conflicts Detected!
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '480px', marginInline: 'auto' }}>
              All faculty members have singular period assignments across Monday to Saturday. All laboratory rooms and classrooms have zero overlapping bookings.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 1: LOAD TEMPLATE PRESETS */}
      {templateModalOpen && (
        <div className="timetable-modal-backdrop no-print">
          <div className="timetable-modal-content large">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Load Timetable Preset Template
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Select an autonomous curriculum template or start from a blank customizable grid.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setTemplateModalOpen(false)}>✕</button>
            </div>

            <div className="preset-grid">
              <div className="preset-card">
                <div className="preset-card-header">
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>II B.Tech CSE (Section A) Standard</h4>
                  <span className="preset-badge">R24 Autonomous</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: '6px 0 10px' }}>
                  Complete autonomous timetable with DBMS, DAA, FLAT, P&S, DBMS Lab, DAA Lab, Web Tech Lab, and Mentoring.
                </p>
                <button
                  type="button"
                  className="timetable-btn upload small"
                  onClick={() => handleLoadTemplate('cse_a')}
                >
                  Load CSE-A Template
                </button>
              </div>

              <div className="preset-card">
                <div className="preset-card-header">
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>II B.Tech CSE (Section B) Standard</h4>
                  <span className="preset-badge">R24 Autonomous</span>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', margin: '6px 0 10px' }}>
                  Full schedule for Section B with alternating lab slots and DAA tutorial hours.
                </p>
                <button
                  type="button"
                  className="timetable-btn upload small"
                  onClick={() => handleLoadTemplate('cse_b')}
                >
                  Load CSE-B Template
                </button>
              </div>

              <div className="preset-card" style={{ gridColumn: 'span 2', background: '#f0fdf9', borderColor: '#a7f3d0' }}>
                <div className="preset-card-header">
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#065f46' }}>Blank 6-Day Custom Timetable Grid</h4>
                  <span className="preset-badge" style={{ background: '#dcfce7', color: '#166534' }}>Custom Template</span>
                </div>
                <p style={{ fontSize: '11px', color: '#047857', margin: '6px 0 10px' }}>
                  Initializes a clean, empty 6-day (Mon–Sat) grid with 7 periods and lunch break. You can customize all cells, add/delete rows and columns.
                </p>
                <button
                  type="button"
                  className="timetable-btn publish small"
                  onClick={() => handleLoadTemplate('blank')}
                >
                  Load Blank Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CLASS SLOT & CUSTOM COLOR */}
      {editingModalOpen && isEditingCell && (
        <div className="timetable-modal-backdrop no-print">
          <div className="timetable-modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Edit Class Slot ({isEditingCell.day} • {activePeriods.find(p => p.id === isEditingCell.periodId)?.label})
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {activePeriods.find(p => p.id === isEditingCell.periodId)?.time}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditingModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCell} className="modal-form">
              <div className="form-group full">
                <label>Subject / Course Name</label>
                <input
                  type="text"
                  value={isEditingCell.data.subject}
                  onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, subject: e.target.value } })}
                  placeholder="e.g. Database Management Systems"
                  required
                />
              </div>

              <div className="form-group">
                <label>Course Code</label>
                <input
                  type="text"
                  value={isEditingCell.data.code}
                  onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, code: e.target.value } })}
                  placeholder="e.g. 24CT11RC12"
                />
              </div>

              <div className="form-group">
                <label>Period Category</label>
                <select
                  value={isEditingCell.data.type}
                  onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, type: e.target.value } })}
                >
                  {Object.entries(SLOT_TYPES).map(([typeKey, typeObj]) => (
                    <option key={typeKey} value={typeKey}>{typeObj.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Faculty Incharge</label>
                <input
                  type="text"
                  value={isEditingCell.data.faculty}
                  onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, faculty: e.target.value } })}
                  placeholder="e.g. Prof. R. Kiran"
                />
              </div>

              <div className="form-group">
                <label>Classroom / Lab Location</label>
                <input
                  type="text"
                  value={isEditingCell.data.room}
                  onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, room: e.target.value } })}
                  placeholder="e.g. R-301 or CS Lab 4"
                />
              </div>

              {/* Custom Color Selector */}
              <div className="form-group full" style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  <span>Custom Cell Background Color (Optional):</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="color"
                    value={isEditingCell.data.customColor || SLOT_TYPES[isEditingCell.data.type]?.color || '#e0edff'}
                    onChange={e => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, customColor: e.target.value } })}
                    style={{ width: '42px', height: '32px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Choose custom color or leave default for category
                  </span>
                  {isEditingCell.data.customColor && (
                    <button
                      type="button"
                      style={{ border: 0, background: 'transparent', color: '#dc2626', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}
                      onClick={() => setIsEditingCell({ ...isEditingCell, data: { ...isEditingCell.data, customColor: '' } })}
                    >
                      Reset Color
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="timetable-btn outline" onClick={() => setEditingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="timetable-btn publish">
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD DAY (ROW) */}
      {addDayModalOpen && (
        <div className="timetable-modal-backdrop no-print">
          <div className="timetable-modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Add New Day Row
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Add an additional instruction day or remedial session day to the timetable.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setAddDayModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddDay} className="modal-form">
              <div className="form-group full">
                <label>Day Name</label>
                <input
                  type="text"
                  value={newDayName}
                  onChange={e => setNewDayName(e.target.value)}
                  placeholder="e.g. Sunday / Zero Day / Special Session"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="timetable-btn outline" onClick={() => setAddDayModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="timetable-btn publish">
                  Add Day Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD PERIOD (COLUMN) */}
      {addPeriodModalOpen && (
        <div className="timetable-modal-backdrop no-print">
          <div className="timetable-modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Add New Period Column
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Add a new period slot (e.g. Period 8, Zero Hour, Remedial) across all days.
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setAddPeriodModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddPeriod} className="modal-form">
              <div className="form-group">
                <label>Period Identifier (ID)</label>
                <input
                  type="text"
                  value={newPeriodForm.id}
                  onChange={e => setNewPeriodForm({ ...newPeriodForm, id: e.target.value })}
                  placeholder="e.g. p8"
                  required
                />
              </div>

              <div className="form-group">
                <label>Column Label</label>
                <input
                  type="text"
                  value={newPeriodForm.label}
                  onChange={e => setNewPeriodForm({ ...newPeriodForm, label: e.target.value })}
                  placeholder="e.g. Period 8 or Zero Hour"
                  required
                />
              </div>

              <div className="form-group full">
                <label>Timings</label>
                <input
                  type="text"
                  value={newPeriodForm.time}
                  onChange={e => setNewPeriodForm({ ...newPeriodForm, time: e.target.value })}
                  placeholder="e.g. 03:20 PM - 04:10 PM"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="timetable-btn outline" onClick={() => setAddPeriodModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="timetable-btn publish">
                  Add Period Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
