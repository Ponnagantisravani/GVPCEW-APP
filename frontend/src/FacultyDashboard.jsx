import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Users, BookOpen,
  ClipboardList, Award, FileText, Check, Plus, Edit3, Trash2, Printer,
  Upload, Search, Filter, RefreshCw, Send, ShieldCheck, ChevronRight,
  TrendingUp, User, UserCheck, MessageSquare, ArrowRight, Sparkles, Layers,
  Lock, Unlock, Eye, HelpCircle, Download, Save, BookMarked
} from 'lucide-react';

// Storage Keys
const FACULTY_ATTENDANCE_KEY = 'gvpcew_faculty_attendance_v2';
const FACULTY_ASSIGNMENTS_KEY = 'gvpcew_faculty_assignments_v2';
const FACULTY_INTERNAL_MARKS_KEY = 'gvpcew_faculty_internal_marks_v2';
const FACULTY_CORRECTIONS_KEY = 'gvpcew_faculty_corrections_v2';
const FACULTY_SUBSTITUTIONS_KEY = 'gvpcew_faculty_substitutions_v2';

// -----------------------------------------------------------------------------
// COMPLETE OFFICIAL CSE SECTION 3 STUDENT ROSTER (INCLUDING 324103210170 to L19)
// -----------------------------------------------------------------------------
export const CSE_SECTION_3_STUDENTS = [
  // Starting subset from user screenshot
  { sno: 1, rollNo: '324103210127', name: 'Manchikanti alekhya', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 7 },
  { sno: 2, rollNo: '324103210128', name: 'Manda sai likhitha', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 9 },
  { sno: 3, rollNo: '324103210129', name: 'Mandadi niharika reddy', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 7, a2: 6, a3: 8 },
  { sno: 4, rollNo: '324103210130', name: 'Manem sai priya', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 6, a2: 5, a3: 7 },
  { sno: 5, rollNo: '324103210132', name: 'Matta richitha', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 9, a3: 8 },
  { sno: 6, rollNo: '324103210133', name: 'Miriyala vishnu vardhani devi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 7, rollNo: '324103210134', name: 'Modumudi naga lakshmi sarva', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 8, a3: 7 },
  { sno: 8, rollNo: '324103210135', name: 'Mohammad leenisha', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 9, a3: 9 },
  { sno: 9, rollNo: '324103210136', name: 'Morla thanuja', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 7, a2: 7, a3: 8 },
  { sno: 10, rollNo: '324103210137', name: 'Mounica sahu', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 9, a3: 8 },
  { sno: 11, rollNo: '324103210138', name: 'Muddada gnaneswari', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 12, rollNo: '324103210139', name: 'Mudunuri chetana pragnya', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 13, rollNo: '324103210140', name: 'Nagam jahanvi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 7, a3: 8 },
  { sno: 14, rollNo: '324103210141', name: 'Nagireddy pujitha', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 15, rollNo: '324103210142', name: 'Nagulakonda sai siri', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 16, rollNo: '324103210143', name: 'Namballa chareeshma', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 8, a3: 8 },
  { sno: 17, rollNo: '324103210144', name: 'Nambari pallavi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 9 },
  { sno: 18, rollNo: '324103210145', name: 'Nammi nomika', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 8 },
  { sno: 19, rollNo: '324103210146', name: 'Navara moda sravya', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 7, a3: 8 },
  { sno: 20, rollNo: '324103210147', name: 'Neelam mali', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 21, rollNo: '324103210148', name: 'Neelapu harika', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 22, rollNo: '324103210149', name: 'Nemalipuri pavithra', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 7, a3: 8 },
  { sno: 23, rollNo: '324103210150', name: 'Pallagani thanuja', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 24, rollNo: '324103210151', name: 'Pallela laxmi prasanna', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 25, rollNo: '324103210152', name: 'Pampana raahithya', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 8, a3: 7 },
  { sno: 26, rollNo: '324103210153', name: 'P.hemavallika', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 27, rollNo: '324103210154', name: 'Panduru lakshmi', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 8, a3: 8 },
  { sno: 28, rollNo: '324103210155', name: 'Pantham lavanya ratna mahalakshmi', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 7, a3: 8 },
  { sno: 29, rollNo: '324103210156', name: 'Pappu lakshmi durga', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 30, rollNo: '324103210157', name: 'Anuradha parupalli', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 31, rollNo: '324103210158', name: 'Parvathi rekhaprasanna', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 32, rollNo: '324103210159', name: 'Parveen begum', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 33, rollNo: '324103210160', name: 'Pasumarthi amrutha varshini', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 8, a3: 8 },
  { sno: 34, rollNo: '324103210161', name: 'Peddada vagdevi chaitra', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 35, rollNo: '324103210162', name: 'Peddinti madhuri', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 36, rollNo: '324103210163', name: 'Peddireddy mounika naga rani', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 37, rollNo: '324103210164', name: 'Pediredla sai nihitha', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 7, a3: 8 },
  { sno: 38, rollNo: '324103210165', name: 'P. Hasini', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 39, rollNo: '324103210166', name: 'Pemmaraju srinithya', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 40, rollNo: '324103210167', name: 'Penmetsa sai pranathi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 41, rollNo: '324103210168', name: 'P. Lasya varma', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 42, rollNo: '324103210169', name: 'Pilli thanmayee', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 7, a2: 8, a3: 7 },

  // SPECIFIED BY USER: 324103210170 TO 325103210L19
  { sno: 43, rollNo: '324103210170', name: 'Ponnaganti sravani', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 10, a2: 10, a3: 9 },
  { sno: 44, rollNo: '324103210171', name: 'Poojitha illa', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 9, a3: 9 },
  { sno: 45, rollNo: '324103210172', name: 'Poppoppu sai lakshmi aishwarya', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 8, a3: 9 },
  { sno: 46, rollNo: '324103210173', name: 'Potta jhansi laxmi', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 8, a3: 8 },
  { sno: 47, rollNo: '324103210174', name: 'Pulletikurthi sai santhoshi sri anusha', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 9, a3: 9 },
  { sno: 48, rollNo: '324103210175', name: 'Punnana kalyani', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 8 },
  { sno: 49, rollNo: '324103210176', name: 'Putta revathi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 8 },
  { sno: 50, rollNo: '324103210177', name: 'Rachamallu pujitha venkata naga', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 51, rollNo: '324103210178', name: 'Raparthi swarna keerthana', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 9 },
  { sno: 52, rollNo: '324103210179', name: 'Reddy jyothi prasanna', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 7, a3: 8 },
  { sno: 53, rollNo: '324103210180', name: 'Rejetj sireesha', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 54, rollNo: '324103210181', name: 'Routhu vennela', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 55, rollNo: '324103210182', name: 'S deekshita', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 9 },
  { sno: 56, rollNo: '324103210183', name: 'Sabah noor', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 8 },
  { sno: 57, rollNo: '324103210184', name: 'Savarapu sarvajni', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 9 },
  { sno: 58, rollNo: '324103210185', name: 'Seelam naga samhitha', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 8, a2: 8, a3: 7 },
  { sno: 59, rollNo: '324103210186', name: 'Surada jahnavi', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 60, rollNo: '324103210187', name: 'Tale charishma', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 9 },
  { sno: 61, rollNo: '324103210188', name: 'Tamalampudi annapurrna', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 8, a3: 8 },
  { sno: 62, rollNo: '324103210189', name: 'Sruthitattikayala', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 8 },
  { sno: 63, rollNo: '325103210L15', name: 'Marella sailu', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 8, a3: 9 },
  { sno: 64, rollNo: '325103210L16', name: 'Molleti bhargavsri', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 9, a3: 8 },
  { sno: 65, rollNo: '325103210L17', name: 'Narava saidurga', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 9, a2: 9, a3: 8 },
  { sno: 66, rollNo: '325103210L18', name: 'Paila jayasree jasmin', sec: '3', room: 'L19', elective: 'Information Retrieved System (IRS)', a1: 8, a2: 8, a3: 9 },
  { sno: 67, rollNo: '325103210L19', name: 'Paltasingi maithili', sec: '3', room: 'L19', elective: 'Microprocessors & Micro controllers', a1: 9, a2: 9, a3: 9 }
];

// August 2026 Academic Calendar Column Dates for Monthly Attendance
const AUGUST_DAYS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '17', '18', '19', '20', '21',
  '24', '25', '26', '27', '28', '31'
];

// Static Holiday / No Class Days in August 2026
const HOLIDAY_DAYS = ['7', '13', '21', '31'];

// Generate deterministic daily attendance (P, A, -) for August 2026
function getStudentAugustAttendance(student, index) {
  const attendancePattern = {};
  let present = 0;
  let absent = 0;

  AUGUST_DAYS.forEach((day, dIdx) => {
    if (HOLIDAY_DAYS.includes(day)) {
      attendancePattern[day] = '-';
    } else {
      // Deterministic realistic absent days matching screenshot
      let isAbsent = false;
      if (index === 0 && (day === '3' || day === '11')) isAbsent = true;
      if (index === 1 && (day === '3' || day === '10' || day === '11')) isAbsent = true;
      if (index === 2 && (day === '11')) isAbsent = true;
      if (index === 3 && (day === '3' || day === '10' || day === '11' || day === '25' || day === '28')) isAbsent = true;
      if (index === 4 && (day === '11')) isAbsent = true;
      if (index === 5 && (day === '11')) isAbsent = true;
      if (index === 6 && (day === '3' || day === '10' || day === '11')) isAbsent = true;
      if (index === 7 && (day === '11')) isAbsent = true;
      if (index === 8 && (day === '10')) isAbsent = true;
      if (index === 9 && (day === '11')) isAbsent = true;
      if (index > 9 && (dIdx % 11 === 0 || dIdx % 17 === 0) && day !== '1') isAbsent = true;

      if (isAbsent) {
        attendancePattern[day] = 'A';
        absent++;
      } else {
        attendancePattern[day] = 'P';
        present++;
      }
    }
  });

  const totalClasses = 24;
  const pct = ((present / totalClasses) * 100).toFixed(2);
  return { attendancePattern, present, absent, pct };
}

export function FacultyDashboard({ name = 'Dr. M. Lakshmi', activeTab = 'overview', onNavigate }) {
  // Filters & State
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'irs', 'mpmc', 'subset_170'
  const [activeCourse, setActiveCourse] = useState('IRS'); // 'IRS', 'MPMC', 'DAA'
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const [notice, setNotice] = useState('');

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(prev => (prev === msg ? '' : prev)), 3500);
  };

  // Filtered Student List based on chosen view
  const displayStudents = useMemo(() => {
    let list = CSE_SECTION_3_STUDENTS;
    if (filterMode === 'irs') {
      list = list.filter(s => s.elective.includes('IRS'));
    } else if (filterMode === 'mpmc') {
      list = list.filter(s => s.elective.includes('Microprocessors'));
    } else if (filterMode === 'subset_170') {
      list = list.filter(s => s.rollNo >= '324103210170' || s.rollNo.includes('L'));
    }
    return list;
  }, [filterMode]);

  return (
    <div className="faculty-dashboard-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Toast Notice */}
      {notice && (
        <div className="timetable-alert success no-print" style={{ animation: 'fadeIn 0.2s ease-in' }}>
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Global Section & Elective Switcher Toolbar */}
      <div style={{ background: '#ffffff', padding: '14px 20px', borderRadius: '10px', border: '1px solid #dce6f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Academic Section:
          </span>
          <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
            CSE • Section: 3 (Room: L19)
          </span>
          <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
            3-1 Semester 2026-27 Odd Sem
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700' }}>Filter View:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', border: '1px solid', cursor: 'pointer', background: filterMode === 'all' ? '#087a62' : '#ffffff', color: filterMode === 'all' ? '#ffffff' : '#334155', borderColor: filterMode === 'all' ? '#087a62' : '#cbd5e1' }}
          >
            All Sec 3 Students ({CSE_SECTION_3_STUDENTS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('subset_170')}
            style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', border: '1px solid', cursor: 'pointer', background: filterMode === 'subset_170' ? '#087a62' : '#ffffff', color: filterMode === 'subset_170' ? '#ffffff' : '#334155', borderColor: filterMode === 'subset_170' ? '#087a62' : '#cbd5e1' }}
          >
            Roll 324103210170 to L19 ({CSE_SECTION_3_STUDENTS.filter(s => s.rollNo >= '324103210170' || s.rollNo.includes('L')).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('irs')}
            style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', border: '1px solid', cursor: 'pointer', background: filterMode === 'irs' ? '#087a62' : '#ffffff', color: filterMode === 'irs' ? '#ffffff' : '#334155', borderColor: filterMode === 'irs' ? '#087a62' : '#cbd5e1' }}
          >
            IRS Elective ({CSE_SECTION_3_STUDENTS.filter(s => s.elective.includes('IRS')).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('mpmc')}
            style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', border: '1px solid', cursor: 'pointer', background: filterMode === 'mpmc' ? '#087a62' : '#ffffff', color: filterMode === 'mpmc' ? '#ffffff' : '#334155', borderColor: filterMode === 'mpmc' ? '#087a62' : '#cbd5e1' }}
          >
            MPMC Elective ({CSE_SECTION_3_STUDENTS.filter(s => s.elective.includes('Microprocessors')).length})
          </button>
        </div>
      </div>

      {/* =========================================================================
          1. ASSIGNMENT MARKS SECTION (MATCHING SCREENSHOT 1)
          ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'Assignments') && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dce6f4', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {/* Card Header with Green Icon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e6f8f0', color: '#087a62', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookMarked className="w-4 h-4" />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#087a62', letterSpacing: '0.2px' }}>
                Assignment Marks - IRS | Sec: 3
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Room: <strong>L19</strong></span>
            </div>
          </div>

          {/* Assignment Table */}
          <div className="overflow" style={{ borderTop: '1px solid #f1f5f9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '55px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>S.No.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', width: '130px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Roll Number</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Name</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '110px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Assignment 1<br /><span style={{ fontWeight: 'normal', fontSize: '11px', color: '#64748b' }}>(10)</span></th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '110px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Assignment 2<br /><span style={{ fontWeight: 'normal', fontSize: '11px', color: '#64748b' }}>(10)</span></th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '110px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Assignment 3<br /><span style={{ fontWeight: 'normal', fontSize: '11px', color: '#64748b' }}>(10)</span></th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', width: '85px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>Total<br /><span style={{ fontWeight: 'normal', fontSize: '11px', color: '#64748b' }}>(30)</span></th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', width: '85px', color: '#0f172a', fontWeight: '800', fontSize: '12px' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {(showAllAssignments ? displayStudents : displayStudents.slice(0, 15)).map((s, idx) => {
                  const total = s.a1 + s.a2 + s.a3;
                  const pct = ((total / 30) * 100).toFixed(2);

                  return (
                    <tr key={s.rollNo} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.12s ease' }}>
                      <td style={{ padding: '9px 8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={{ padding: '9px 12px', fontWeight: '800', color: '#0f172a' }}>{s.rollNo}</td>
                      <td style={{ padding: '9px 14px', color: '#1e293b', textTransform: 'lowercase' }}>
                        <span style={{ textTransform: 'capitalize' }}>{s.name}</span>
                      </td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>{s.a1}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>{s.a2}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>{s.a3}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{total}</td>
                      <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '800', color: Number(pct) >= 75 ? '#087a62' : '#dc2626' }}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Right: View All Link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => setShowAllAssignments(!showAllAssignments)}
              style={{ border: 0, background: 'transparent', color: '#087a62', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {showAllAssignments ? 'Collapse Assignment List ↑' : `View All Assignment Marks (${displayStudents.length} Students) →`}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. MONTHLY ATTENDANCE MATRIX (MATCHING SCREENSHOT 2)
          ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'Attendance') && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dce6f4', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {/* Card Header with Green Calendar Icon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#e6f8f0', color: '#087a62', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar className="w-4 h-4" />
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#087a62', letterSpacing: '0.2px' }}>
                Monthly Attendance - Information Retrieved System (IRS) | Sec: 3 | Room: L19 | August 2026
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="timetable-btn"
                style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', fontSize: '11.5px' }}
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1 inline" /> Print Register
              </button>
            </div>
          </div>

          {/* Month Matrix Table */}
          <div className="overflow" style={{ borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1050px' }}>
              <thead>
                <tr style={{ background: '#ffffff', borderBottom: '1.5px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'center', width: '40px', color: '#0f172a', fontWeight: '800' }}>S.No.</th>
                  <th style={{ padding: '8px 8px', textAlign: 'left', width: '110px', color: '#0f172a', fontWeight: '800' }}>Roll Number</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: '160px', color: '#0f172a', fontWeight: '800' }}>Name</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center', width: '35px', color: '#0f172a', fontWeight: '800' }}>Sec</th>
                  {AUGUST_DAYS.map(d => (
                    <th key={d} style={{ padding: '8px 2px', textAlign: 'center', width: '22px', color: '#0f172a', fontWeight: '700', fontSize: '11px', background: HOLIDAY_DAYS.includes(d) ? '#f8fafc' : '#ffffff' }}>
                      {d}
                    </th>
                  ))}
                  <th style={{ padding: '8px 6px', textAlign: 'center', width: '55px', color: '#0f172a', fontWeight: '800' }}>Present</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', width: '55px', color: '#0f172a', fontWeight: '800' }}>Absent</th>
                  <th style={{ padding: '8px 8px', textAlign: 'center', width: '60px', color: '#0f172a', fontWeight: '800' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((s, idx) => {
                  const { attendancePattern, present, absent, pct } = getStudentAugustAttendance(s, idx);

                  return (
                    <tr key={s.rollNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '7px 4px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{idx + 1}</td>
                      <td style={{ padding: '7px 8px', fontWeight: '800', color: '#0f172a' }}>{s.rollNo}</td>
                      <td style={{ padding: '7px 10px', color: '#1e293b', whiteSpace: 'nowrap' }}>
                        <span style={{ textTransform: 'capitalize' }}>{s.name}</span>
                      </td>
                      <td style={{ padding: '7px 4px', textAlign: 'center', color: '#475569', fontWeight: '700' }}>{s.sec}</td>

                      {AUGUST_DAYS.map(d => {
                        const status = attendancePattern[d];
                        return (
                          <td
                            key={d}
                            style={{
                              padding: '7px 2px',
                              textAlign: 'center',
                              fontWeight: '800',
                              fontSize: '11.5px',
                              color: status === 'P' ? '#15803d' : status === 'A' ? '#dc2626' : '#94a3b8',
                              background: status === 'A' ? '#fff5f5' : 'transparent'
                            }}
                          >
                            {status}
                          </td>
                        );
                      })}

                      <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>{present}</td>
                      <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: '800', color: absent > 0 ? '#dc2626' : '#0f172a' }}>{absent}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: '800', color: Number(pct) >= 75 ? '#087a62' : '#dc2626' }}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Legend & Total Classes Conducted Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: '800' }}>
                <strong style={{ fontSize: '13px' }}>P</strong> - Present
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontWeight: '800' }}>
                <strong style={{ fontSize: '13px' }}>A</strong> - Absent
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#64748b', fontWeight: '700' }}>
                <strong style={{ fontSize: '13px' }}>-</strong> Holiday / No Class
              </span>
            </div>

            <div style={{ fontWeight: '800', color: '#087a62', fontSize: '13px' }}>
              Total Classes Conducted : 24
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OTHER FACULTY SECTIONS (TIMETABLE, CORRECTIONS, SUBSTITUTIONS)
          ========================================================================= */}
      {activeTab === 'My Timetable' && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #dce6f4' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 12px', color: '#0f172a' }}>
            CSE Section 3 Weekly Teaching Schedule
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #087a62', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>MONDAY • P2</span>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>09:30 AM - 10:20 AM</span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>Information Retrieved System (IRS)</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Section: <strong>CSE-3</strong> • Room: <strong>L19</strong></p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #087a62', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>TUESDAY • P3</span>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>10:20 AM - 11:10 AM</span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>Information Retrieved System (IRS)</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Section: <strong>CSE-3</strong> • Room: <strong>L19</strong></p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #087a62', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', background: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>THURSDAY • P1</span>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>08:40 AM - 09:30 AM</span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>Information Retrieved System (IRS)</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Section: <strong>CSE-3</strong> • Room: <strong>L19</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
