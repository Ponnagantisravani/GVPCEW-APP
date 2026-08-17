import React, { useState, useEffect } from 'react';
import {
  Calendar, Edit3, Check, Save, Share2, FolderOpen, Plus, Trash2,
  Printer, Filter, Sparkles, Award, ShieldCheck, Clock, BookOpen, ChevronRight, LayoutGrid, Layers
} from 'lucide-react';

export const BRANCHES = [
  { key: 'cse', name: 'Computer Science & Engineering', short: 'CSE' },
  { key: 'it', name: 'Information Technology', short: 'IT' },
  { key: 'aiml', name: 'CSE - Artificial Intelligence & ML', short: 'CSE-AIML' },
  { key: 'ece', name: 'Electronics & Communication Engineering', short: 'ECE' },
  { key: 'eee', name: 'Electrical & Electronics Engineering', short: 'EEE' }
];

export const INITIAL_EXAM_SCHEDULES = {
  regular_apr_2026: {
    id: 'regular_apr_2026',
    category: 'regular',
    typeLabel: 'Regular End Examinations',
    title: 'TIME TABLE OF II B.TECH. II SEMESTER REGULAR EXAMINATIONS [R24] APRIL 2026',
    batch: '[2024 Admitted Batch]',
    timings: '01:30 PM – 04:30 PM (Afternoon Session)',
    status: 'Published',
    rows: [
      {
        date: '13-04-2026 (Monday)',
        subjects: {
          cse: { title: 'Probability and Statistics', code: '24BM11RC06' },
          it: { title: 'Probability and Statistics', code: '24BM11RC06' },
          aiml: { title: 'Probability and Statistics', code: '24BM11RC06' },
          ece: { title: 'Probability Theory and Random Process', code: '24EC11RC16' },
          eee: { title: 'Electrical Machines 2', code: '24EE11RC09' }
        }
      },
      {
        date: '15-04-2026 (Wednesday)',
        subjects: {
          cse: { title: 'Design and Analysis of Algorithms', code: '24CT11RC18' },
          it: { title: 'Design and Analysis of Algorithms', code: '24CT11RC18' },
          aiml: { title: 'Design and Analysis of Algorithms', code: '24CT11RC18' },
          ece: { title: 'Digital System Design', code: '24EC11RC17' },
          eee: { title: 'Electrical Measurements', code: '24EE11RC10' }
        }
      },
      {
        date: '16-04-2026 (Thursday)',
        subjects: {
          cse: { title: 'Professional Ethics and Human Values', code: '24HM11MC01' },
          it: { title: 'Professional Ethics and Human Values', code: '24HM11MC01' },
          aiml: { title: 'Environmental Science', code: '24BC11MC01' },
          ece: { title: 'Environmental Science', code: '24BC11MC01' },
          eee: { title: 'Environmental Science', code: '24BC11MC01' }
        }
      },
      {
        date: '20-04-2026 (Monday)',
        subjects: {
          cse: { title: 'Database Management Systems', code: '24CT11RC12' },
          it: { title: 'Database Management Systems', code: '24CT11RC12' },
          aiml: { title: 'Data Warehousing & Data Mining', code: '24CT11RC19' },
          ece: { title: 'Electromagnetic Field Theory & Transmission Lines', code: '24EC11RC18' },
          eee: { title: 'EMF Theory', code: '24EE11RC11' }
        }
      },
      {
        date: '22-04-2026 (Wednesday)',
        subjects: {
          cse: { title: 'Formal Languages and Automata Theory', code: '24CT11RC20' },
          it: { title: 'Formal Languages and Automata Theory', code: '24CT11RC20' },
          aiml: { title: 'Artificial Intelligence', code: '24AI11RC01' },
          ece: { title: 'Microprocessors and Microcontrollers', code: '24EC11RC19' },
          eee: { title: 'Power Systems 1', code: '24EE11RC12' }
        }
      },
      {
        date: '27-04-2026 (Monday)',
        subjects: {
          cse: { title: 'Managerial Economics', code: '24HM11RC01' },
          it: { title: 'Managerial Economics', code: '24HM11RC01' },
          aiml: { title: 'Computer Organization', code: '24CT11RC11' },
          ece: { title: 'Managerial Economics', code: '24HM11RC01' },
          eee: { title: 'Managerial Economics', code: '24HM11RC01' }
        }
      },
      {
        date: '29-04-2026 (Wednesday)',
        subjects: {
          cse: { title: 'Data Visualization [Honors]', code: '24CA11HN02' },
          it: { title: '—', code: '' },
          aiml: { title: 'Data Visualization [Honors]', code: '24CA11HN02' },
          ece: { title: 'Artificial Intelligence and ML [Minor]', code: '24AI11MN01' },
          eee: { title: 'Artificial Intelligence and ML [Minor]', code: '24AI11MN01' }
        }
      },
      {
        date: '01-05-2026 (Friday)',
        subjects: {
          cse: { title: 'Social Media Analytics [Honors]', code: '24CT11HN02' },
          it: { title: '—', code: '' },
          aiml: { title: 'Social Media Analytics [Honors]', code: '24CT11HN02' },
          ece: { title: '—', code: '' },
          eee: { title: '—', code: '' }
        }
      }
    ]
  },
  mid1_sep_2025: {
    id: 'mid1_sep_2025',
    category: 'mid1',
    typeLabel: 'Mid-I Internal Examinations',
    title: 'TIME TABLE OF II B.TECH. II SEMESTER I MID-TERM EXAMINATIONS [R24] SEPTEMBER 2025',
    batch: '[2024 Admitted Batch]',
    timings: '10:00 AM – 11:30 AM (FN) & 02:00 PM – 03:30 PM (AN)',
    status: 'Published',
    rows: [
      {
        date: '08-09-2025 (Mon FN)',
        subjects: {
          cse: { title: 'Probability & Statistics', code: '24BM11RC06' },
          it: { title: 'Probability & Statistics', code: '24BM11RC06' },
          aiml: { title: 'Probability & Statistics', code: '24BM11RC06' },
          ece: { title: 'Probability Theory', code: '24EC11RC16' },
          eee: { title: 'Electrical Machines 2', code: '24EE11RC09' }
        }
      },
      {
        date: '08-09-2025 (Mon AN)',
        subjects: {
          cse: { title: 'Design & Analysis of Algorithms', code: '24CT11RC18' },
          it: { title: 'Design & Analysis of Algorithms', code: '24CT11RC18' },
          aiml: { title: 'Design & Analysis of Algorithms', code: '24CT11RC18' },
          ece: { title: 'Digital System Design', code: '24EC11RC17' },
          eee: { title: 'Electrical Measurements', code: '24EE11RC10' }
        }
      },
      {
        date: '09-09-2025 (Tue FN)',
        subjects: {
          cse: { title: 'Database Management Systems', code: '24CT11RC12' },
          it: { title: 'Database Management Systems', code: '24CT11RC12' },
          aiml: { title: 'Data Warehousing & Mining', code: '24CT11RC19' },
          ece: { title: 'EMF Theory', code: '24EC11RC18' },
          eee: { title: 'EMF Theory', code: '24EE11RC11' }
        }
      },
      {
        date: '09-09-2025 (Tue AN)',
        subjects: {
          cse: { title: 'Formal Languages & Automata', code: '24CT11RC20' },
          it: { title: 'Formal Languages & Automata', code: '24CT11RC20' },
          aiml: { title: 'Artificial Intelligence', code: '24AI11RC01' },
          ece: { title: 'Microprocessors & Microcontrollers', code: '24EC11RC19' },
          eee: { title: 'Power Systems 1', code: '24EE11RC12' }
        }
      },
      {
        date: '10-09-2025 (Wed FN)',
        subjects: {
          cse: { title: 'Managerial Economics', code: '24HM11RC01' },
          it: { title: 'Managerial Economics', code: '24HM11RC01' },
          aiml: { title: 'Computer Organization', code: '24CT11RC11' },
          ece: { title: 'Managerial Economics', code: '24HM11RC01' },
          eee: { title: 'Managerial Economics', code: '24HM11RC01' }
        }
      }
    ]
  }
};

export function ExamScheduleManagement({ role = 'academic_coordinator' }) {
  const isEditor = role === 'academic_coordinator' || role === 'admin';
  const STORAGE_KEY = 'gvpcew_exam_schedules_v2';

  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EXAM_SCHEDULES;
  });

  const [activeTab, setActiveTab] = useState('regular_apr_2026');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all'); // 'all' or branch key
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [editModal, setEditModal] = useState(null); // { rIdx, bKey, subject }

  const currentSchedule = schedules[activeTab] || schedules.regular_apr_2026;

  // Persist to local storage
  useEffect(() => {
    if (isEditor) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules, isEditor]);

  // Sync across tabs
  useEffect(() => {
    const handleSync = (e) => {
      if (!e || e.key === STORAGE_KEY) {
        try {
          const fresh = JSON.parse(localStorage.getItem(STORAGE_KEY));
          if (fresh) setSchedules(fresh);
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

  const handleUpdateScheduleMeta = (field, val) => {
    setSchedules(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: val }
    }));
  };

  const handlePublish = () => {
    setSchedules(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], status: 'Published' }
    }));
    showNotice('Examination Schedule published and broadcasted to Student & Faculty portals!');
  };

  const handleAddRow = () => {
    const newDate = 'New Exam Date (Day)';
    const newRow = {
      date: newDate,
      subjects: {
        cse: { title: 'New Subject Name', code: '24CT11RC00' },
        it: { title: 'New Subject Name', code: '24IT11RC00' },
        aiml: { title: 'New Subject Name', code: '24AI11RC00' },
        ece: { title: 'New Subject Name', code: '24EC11RC00' },
        eee: { title: 'New Subject Name', code: '24EE11RC00' }
      }
    };
    setSchedules(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        rows: [...prev[activeTab].rows, newRow]
      }
    }));
    showNotice('Added new exam date row.');
  };

  const handleDeleteRow = (idx) => {
    if (!window.confirm('Delete this examination row?')) return;
    setSchedules(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        rows: prev[activeTab].rows.filter((_, i) => i !== idx)
      }
    }));
    showNotice('Deleted exam date row.');
  };

  const handleSaveCellModal = (e) => {
    e.preventDefault();
    if (!editModal) return;
    const { rIdx, bKey, subject } = editModal;

    setSchedules(prev => {
      const schedule = { ...prev[activeTab] };
      const rows = [...schedule.rows];
      const targetRow = { ...rows[rIdx] };
      const subjectsMap = { ...targetRow.subjects };
      subjectsMap[bKey] = subject;
      targetRow.subjects = subjectsMap;
      rows[rIdx] = targetRow;
      schedule.rows = rows;
      return { ...prev, [activeTab]: schedule };
    });

    setEditModal(null);
    showNotice('Subject updated.');
  };

  const visibleBranches = selectedBranchFilter === 'all'
    ? BRANCHES
    : BRANCHES.filter(b => b.key === selectedBranchFilter);

  return (
    <div className="exam-timetable-wrapper">
      {/* Top Toolbar */}
      <div className="exam-top-toolbar no-print">
        {/* Schedule Selector */}
        <div className="exam-type-switch-group">
          <button
            type="button"
            className={`exam-tab-btn ${activeTab === 'regular_apr_2026' ? 'active' : ''}`}
            onClick={() => { setActiveTab('regular_apr_2026'); setIsEditing(false); }}
          >
            Regular Examinations (April 2026)
          </button>
          <button
            type="button"
            className={`exam-tab-btn ${activeTab === 'mid1_sep_2025' ? 'active' : ''}`}
            onClick={() => { setActiveTab('mid1_sep_2025'); setIsEditing(false); }}
          >
            Mid-I Internal Examinations
          </button>
        </div>

        {/* Branch Filter Tabs */}
        <div className="exam-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>View Mode:</span>
          <button
            type="button"
            className={`branch-filter-btn ${selectedBranchFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedBranchFilter('all')}
          >
            All Branches (Master Grid)
          </button>
          {BRANCHES.map(b => (
            <button
              key={b.key}
              type="button"
              className={`branch-filter-btn ${selectedBranchFilter === b.key ? 'active' : ''}`}
              onClick={() => setSelectedBranchFilter(b.key)}
            >
              {b.short}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="exam-action-buttons">
          {isEditor && (
            <>
              <button
                type="button"
                className={`calendar-btn edit-toggle-btn ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(prev => !prev)}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Close Editing' : 'Edit Schedule'}</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="calendar-btn"
                  style={{ background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}
                  onClick={handleAddRow}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exam Date</span>
                </button>
              )}

              <button
                type="button"
                className="calendar-btn publish-btn"
                onClick={handlePublish}
              >
                <Share2 className="w-4 h-4" />
                <span>Publish Schedule</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="calendar-btn"
            style={{ background: '#f8fafc', color: '#334155', borderColor: '#cbd5e1' }}
            onClick={() => window.print()}
            title="Print Schedule / Export PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="calendar-notice-banner no-print">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Official Time Table Document */}
      <section className={`exam-schedule-sheet ${isEditing ? 'exam-is-editing' : ''}`}>
        {/* Official Header */}
        <div className="exam-header-container">
          <div className="exam-header-crest">
            <div className="exam-crest-circle">
              <Award className="w-7 h-7 text-blue-900" />
            </div>
          </div>
          <div className="exam-header-text">
            <h2>GAYATRI VIDYA PARISHAD COLLEGE OF ENGINEERING FOR WOMEN</h2>
            <p className="exam-sub-inst">(Autonomous • Approved by AICTE • Affiliated to Andhra University)</p>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 6px', fontWeight: '700' }}>
              Madhurawada, Visakhapatnam - 530048, Andhra Pradesh
            </p>

            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '700px', margin: '10px auto' }}>
                <input
                  type="text"
                  className="cal-edit-title-input"
                  style={{ width: '100%', maxWidth: '100%' }}
                  value={currentSchedule.title}
                  onChange={e => handleUpdateScheduleMeta('title', e.target.value)}
                />
                <input
                  type="text"
                  className="cal-edit-title-input"
                  style={{ width: '100%', maxWidth: '100%' }}
                  value={currentSchedule.batch}
                  onChange={e => handleUpdateScheduleMeta('batch', e.target.value)}
                />
                <input
                  type="text"
                  className="cal-edit-title-input"
                  style={{ width: '100%', maxWidth: '100%' }}
                  value={currentSchedule.timings}
                  onChange={e => handleUpdateScheduleMeta('timings', e.target.value)}
                  placeholder="Exam Timings"
                />
              </div>
            ) : (
              <>
                <h3 className="exam-main-title">{currentSchedule.title}</h3>
                <p className="exam-batch-tag">{currentSchedule.batch}</p>
                <div className="exam-timings-badge">
                  <span><b>Examination Timings:</b> {currentSchedule.timings}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MASTER GRID VIEW (All Branches or Filtered) */}
        {selectedBranchFilter === 'all' ? (
          <div className="exam-table-scroll-container">
            <table className="exam-branch-master-table">
              <thead>
                <tr>
                  <th className="th-exam-date">Date / Day</th>
                  {BRANCHES.map(b => (
                    <th key={b.key} className="th-exam-branch">
                      <div className="branch-th-name">{b.name}</div>
                      <div className="branch-th-code">[{b.short}]</div>
                    </th>
                  ))}
                  {isEditing && <th style={{ width: '60px', textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {currentSchedule.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {/* Date Column */}
                    <td className="td-exam-date">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.date}
                          onChange={e => {
                            const val = e.target.value;
                            setSchedules(prev => {
                              const sch = { ...prev[activeTab] };
                              const rows = [...sch.rows];
                              rows[rIdx] = { ...rows[rIdx], date: val };
                              sch.rows = rows;
                              return { ...prev, [activeTab]: sch };
                            });
                          }}
                          style={{ width: '100%', padding: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      ) : (
                        <div className="date-badge-wrapper">
                          <span className="exam-date-text">{row.date}</span>
                        </div>
                      )}
                    </td>

                    {/* Branch Columns */}
                    {BRANCHES.map(b => {
                      const subjectObj = typeof row.subjects?.[b.key] === 'object'
                        ? row.subjects[b.key]
                        : { title: row.subjects?.[b.key] || '—', code: '' };
                      const isEmpty = !subjectObj.title || subjectObj.title === '—';

                      return (
                        <td
                          key={b.key}
                          className={`td-exam-subject-cell ${isEditing ? 'editable-cell' : ''}`}
                          onClick={() => {
                            if (isEditing) {
                              setEditModal({ rIdx, bKey: b.key, branchName: b.name, subject: { ...subjectObj } });
                            }
                          }}
                        >
                          {isEmpty ? (
                            <div className="exam-subject-empty">—</div>
                          ) : (
                            <div className="exam-subject-card">
                              <span className="exam-subject-title">{subjectObj.title}</span>
                              {subjectObj.code && (
                                <span className="exam-subject-code-badge">{subjectObj.code}</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {isEditing && (
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          type="button"
                          className="cal-row-delete-btn"
                          onClick={() => handleDeleteRow(rIdx)}
                          title="Delete Exam Date"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* SINGLE BRANCH CARD VIEW */
          <div className="exam-single-branch-container">
            <div className="single-branch-header">
              <span className="single-branch-badge">
                {BRANCHES.find(b => b.key === selectedBranchFilter)?.name} [{BRANCHES.find(b => b.key === selectedBranchFilter)?.short}]
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing all scheduled examination dates
              </span>
            </div>

            <div className="exam-cards-list">
              {currentSchedule.rows.map((row, rIdx) => {
                const subjectObj = typeof row.subjects?.[selectedBranchFilter] === 'object'
                  ? row.subjects[selectedBranchFilter]
                  : { title: row.subjects?.[selectedBranchFilter] || '—', code: '' };
                const isEmpty = !subjectObj.title || subjectObj.title === '—';

                return (
                  <div key={rIdx} className="exam-single-card">
                    <div className="exam-card-date-col">
                      <Calendar className="w-5 h-5 text-emerald-700 mb-1" />
                      <span className="exam-card-date-label">{row.date}</span>
                    </div>

                    <div className="exam-card-content-col">
                      {isEmpty ? (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No examination scheduled on this date</div>
                      ) : (
                        <>
                          <h4 className="exam-card-subject-name">{subjectObj.title}</h4>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                            {subjectObj.code && (
                              <span className="exam-card-code-pill">Course Code: {subjectObj.code}</span>
                            )}
                            <span className="exam-card-time-pill">
                              <Clock className="w-3.5 h-3.5 inline mr-1" /> {currentSchedule.timings}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {isEditing && (
                      <div className="exam-card-action-col">
                        <button
                          type="button"
                          className="calendar-btn-subtle"
                          onClick={() => setEditModal({ rIdx, bKey: selectedBranchFilter, branchName: BRANCHES.find(b => b.key === selectedBranchFilter)?.name, subject: { ...subjectObj } })}
                          title="Edit this subject"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Footer Signatures */}
        <div className="exam-footer-signatures">
          <div className="sig-block left">
            <div className="sig-space"></div>
            <strong>Controller of Examinations</strong>
            <span>Gayatri Vidya Parishad College of Engg. for Women</span>
            <small>Madhurawada, Visakhapatnam - 530048</small>
          </div>

          <div className="sig-block right">
            <div className="sig-space"></div>
            <strong>Principal</strong>
            <span>G.V.P. College of Engineering for Women (A)</span>
            <small>Visakhapatnam, Andhra Pradesh</small>
          </div>
        </div>
      </section>

      {/* Subject Edit Modal */}
      {editModal && (
        <div className="timetable-modal-backdrop no-print">
          <div className="timetable-modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Edit Examination Subject
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {editModal.branchName} • {currentSchedule.rows[editModal.rIdx]?.date}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setEditModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveCellModal} className="modal-form">
              <div className="form-group full">
                <label>Subject Title</label>
                <input
                  type="text"
                  value={editModal.subject.title || ''}
                  onChange={e => setEditModal({ ...editModal, subject: { ...editModal.subject, title: e.target.value } })}
                  placeholder="e.g. Database Management Systems"
                  required
                />
              </div>

              <div className="form-group full">
                <label>Course Code</label>
                <input
                  type="text"
                  value={editModal.subject.code || ''}
                  onChange={e => setEditModal({ ...editModal, subject: { ...editModal.subject, code: e.target.value } })}
                  placeholder="e.g. 24CT11RC12"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="timetable-btn outline" onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="timetable-btn publish">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
