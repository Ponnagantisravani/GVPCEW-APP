import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Check, Save, Share2, FolderOpen, Plus, Trash2, Printer, Filter, Sparkles, Award, ShieldCheck } from 'lucide-react';

export const BRANCHES = [
  { key: 'cse', name: 'Computer Science & Engineering', short: 'CSE' },
  { key: 'it', name: 'Information Technology', short: 'IT' },
  { key: 'aiml', name: 'Computer Science & Engineering - AIML', short: 'CSE-AIML' },
  { key: 'ece', name: 'Electronics and Communication Engineering', short: 'ECE' },
  { key: 'eee', name: 'Electrical and Electronics Engineering', short: 'EEE' }
];

export const INITIAL_EXAM_SCHEDULES = {
  regular_apr_2026: {
    id: 'regular_apr_2026',
    category: 'regular',
    typeLabel: 'Regular End Examinations',
    title: 'TIME TABLE OF II B.TECH. II SEMESTER REGULAR EXAMINATIONS [R24] APRIL 2026',
    batch: '[2024 Admitted Batch]',
    timings: '01:30 PM - 04:30 PM',
    status: 'Published',
    rows: [
      {
        date: '13-04-26 Mon',
        subjects: {
          cse: 'Probability and Statistics [24BM11RC06]',
          it: 'Probability and Statistics [24BM11RC06]',
          aiml: 'Probability and Statistics [24BM11RC06]',
          ece: 'Probability Theory and Random Process [24EC11RC16]',
          eee: 'Electrical Machines 2 [24EE11RC09]'
        }
      },
      {
        date: '15-04-26 Wed',
        subjects: {
          cse: 'Design and Analysis of Algorithms [24CT11RC18]',
          it: 'Design and Analysis of Algorithms [24CT11RC18]',
          aiml: 'Design and Analysis of Algorithms [24CT11RC18]',
          ece: 'Digital System Design [24EC11RC17]',
          eee: 'Electrical Measurements [24EE11RC10]'
        }
      },
      {
        date: '16-04-26 Thu',
        subjects: {
          cse: 'Professional Ethics and Human Values [24HM11MC01]',
          it: 'Professional Ethics and Human Values [24HM11MC01]',
          aiml: 'Environmental Science [24BC11MC01]',
          ece: 'Environmental Science [24BC11MC01]',
          eee: 'Environmental Science [24BC11MC01]'
        }
      },
      {
        date: '20-04-26 Mon',
        subjects: {
          cse: 'Database Management Systems [24CT11RC12]',
          it: 'Database Management Systems [24CT11RC12]',
          aiml: 'Data Warehousing & Data Mining [24CT11RC19]',
          ece: 'Electromagnetic Field Theory and Transmission Lines [24EC11RC18]',
          eee: 'EMF Theory [24EE11RC11]'
        }
      },
      {
        date: '22-04-26 Wed',
        subjects: {
          cse: 'Formal Languages and Automata Theory [24CT11RC20]',
          it: 'Formal Languages and Automata Theory [24CT11RC20]',
          aiml: 'Artificial Intelligence [24AI11RC01]',
          ece: 'Microprocessors and Microcontrollers [24EC11RC19]',
          eee: 'Power Systems 1 [24EE11RC12]'
        }
      },
      {
        date: '27-04-26 Mon',
        subjects: {
          cse: 'Managerial Economics [24HM11RC01]',
          it: 'Managerial Economics [24HM11RC01]',
          aiml: 'Computer Organization [24CT11RC11]',
          ece: 'Managerial Economics [24HM11RC01]',
          eee: 'Managerial Economics [24HM11RC01]'
        }
      },
      {
        date: '29-04-26 Wed',
        subjects: {
          cse: 'Data Visualization [24CA11HN02] - [Honors]',
          it: '—',
          aiml: 'Data Visualization [24CA11HN02] - [Honors]',
          ece: 'Artificial Intelligence and Machine Learning [24AI11MN01] - [Minor]',
          eee: 'Artificial Intelligence and Machine Learning [24AI11MN01] - [Minor]'
        }
      },
      {
        date: '01-05-26 Fri',
        subjects: {
          cse: 'Social Media Analytics [24CT11HN02] [Honors]',
          it: '—',
          aiml: 'Social Media Analytics [24CT11HN02] [Honors]',
          ece: '—',
          eee: '—'
        }
      }
    ]
  },
  mid2_apr_2026: {
    id: 'mid2_apr_2026',
    category: 'mid2',
    typeLabel: 'II Mid Examinations (Internals)',
    title: 'TIME TABLE OF II B.TECH. II SEMESTER II-MID EXAMINATIONS [R24] APRIL 2026',
    batch: '[2024 Admitted Batch]',
    timings: 'Session 1: 10:00 AM - 12:00 PM | Session 2: 02:00 PM - 04:00 PM',
    status: 'Published',
    rows: [
      {
        date: '01-04-26 Wed (FN)',
        subjects: {
          cse: 'Probability and Statistics [24BM11RC06]',
          it: 'Probability and Statistics [24BM11RC06]',
          aiml: 'Probability and Statistics [24BM11RC06]',
          ece: 'Probability Theory & Random Process [24EC11RC16]',
          eee: 'Electrical Machines 2 [24EE11RC09]'
        }
      },
      {
        date: '01-04-26 Wed (AN)',
        subjects: {
          cse: 'Design and Analysis of Algorithms [24CT11RC18]',
          it: 'Design and Analysis of Algorithms [24CT11RC18]',
          aiml: 'Design and Analysis of Algorithms [24CT11RC18]',
          ece: 'Digital System Design [24EC11RC17]',
          eee: 'Electrical Measurements [24EE11RC10]'
        }
      },
      {
        date: '02-04-26 Thu (FN)',
        subjects: {
          cse: 'Professional Ethics and Human Values [24HM11MC01]',
          it: 'Professional Ethics and Human Values [24HM11MC01]',
          aiml: 'Environmental Science [24BC11MC01]',
          ece: 'Environmental Science [24BC11MC01]',
          eee: 'Environmental Science [24BC11MC01]'
        }
      },
      {
        date: '02-04-26 Thu (AN)',
        subjects: {
          cse: 'Database Management Systems [24CT11RC12]',
          it: 'Database Management Systems [24CT11RC12]',
          aiml: 'Data Warehousing & Data Mining [24CT11RC19]',
          ece: 'Electromagnetic Field Theory [24EC11RC18]',
          eee: 'EMF Theory [24EE11RC11]'
        }
      },
      {
        date: '04-04-26 Sat (FN)',
        subjects: {
          cse: 'Formal Languages & Automata Theory [24CT11RC20]',
          it: 'Formal Languages & Automata Theory [24CT11RC20]',
          aiml: 'Artificial Intelligence [24AI11RC01]',
          ece: 'Microprocessors & Microcontrollers [24EC11RC19]',
          eee: 'Power Systems 1 [24EE11RC12]'
        }
      },
      {
        date: '04-04-26 Sat (AN)',
        subjects: {
          cse: 'Managerial Economics [24HM11RC01]',
          it: 'Managerial Economics [24HM11RC01]',
          aiml: 'Computer Organization [24CT11RC11]',
          ece: 'Managerial Economics [24HM11RC01]',
          eee: 'Managerial Economics [24HM11RC01]'
        }
      }
    ]
  },
  mid1_feb_2026: {
    id: 'mid1_feb_2026',
    category: 'mid1',
    typeLabel: 'I Mid Examinations (Internals)',
    title: 'TIME TABLE OF II B.TECH. II SEMESTER I-MID EXAMINATIONS [R24] FEBRUARY 2026',
    batch: '[2024 Admitted Batch]',
    timings: 'Session 1: 10:00 AM - 12:00 PM | Session 2: 02:00 PM - 04:00 PM',
    status: 'Published',
    rows: [
      {
        date: '02-02-26 Mon (FN)',
        subjects: {
          cse: 'Probability and Statistics [24BM11RC06] (Units 1 & 2)',
          it: 'Probability and Statistics [24BM11RC06] (Units 1 & 2)',
          aiml: 'Probability and Statistics [24BM11RC06] (Units 1 & 2)',
          ece: 'Probability Theory & Random Process [24EC11RC16]',
          eee: 'Electrical Machines 2 [24EE11RC09]'
        }
      },
      {
        date: '02-02-26 Mon (AN)',
        subjects: {
          cse: 'Design and Analysis of Algorithms [24CT11RC18]',
          it: 'Design and Analysis of Algorithms [24CT11RC18]',
          aiml: 'Design and Analysis of Algorithms [24CT11RC18]',
          ece: 'Digital System Design [24EC11RC17]',
          eee: 'Electrical Measurements [24EE11RC10]'
        }
      },
      {
        date: '03-02-26 Tue (FN)',
        subjects: {
          cse: 'Professional Ethics & Human Values [24HM11MC01]',
          it: 'Professional Ethics & Human Values [24HM11MC01]',
          aiml: 'Environmental Science [24BC11MC01]',
          ece: 'Environmental Science [24BC11MC01]',
          eee: 'Environmental Science [24BC11MC01]'
        }
      },
      {
        date: '03-02-26 Tue (AN)',
        subjects: {
          cse: 'Database Management Systems [24CT11RC12]',
          it: 'Database Management Systems [24CT11RC12]',
          aiml: 'Data Warehousing & Mining [24CT11RC19]',
          ece: 'Electromagnetic Field Theory [24EC11RC18]',
          eee: 'EMF Theory [24EE11RC11]'
        }
      },
      {
        date: '04-02-26 Wed (FN)',
        subjects: {
          cse: 'Formal Languages & Automata Theory [24CT11RC20]',
          it: 'Formal Languages & Automata Theory [24CT11RC20]',
          aiml: 'Artificial Intelligence [24AI11RC01]',
          ece: 'Microprocessors & Microcontrollers [24EC11RC19]',
          eee: 'Power Systems 1 [24EE11RC12]'
        }
      },
      {
        date: '04-02-26 Wed (AN)',
        subjects: {
          cse: 'Managerial Economics [24HM11RC01]',
          it: 'Managerial Economics [24HM11RC01]',
          aiml: 'Computer Organization [24CT11RC11]',
          ece: 'Managerial Economics [24HM11RC01]',
          eee: 'Managerial Economics [24HM11RC01]'
        }
      }
    ]
  }
};

export function ExamScheduleManagement({ role = 'academic_coordinator' }) {
  const isEditor = role === 'academic_coordinator' || role === 'admin';
  const STORAGE_KEY = 'gvpcew_exam_schedules';

  const [schedules, setSchedules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_EXAM_SCHEDULES;
  });

  const [selectedExamKey, setSelectedExamKey] = useState('regular_apr_2026');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState('');

  const currentSchedule = schedules[selectedExamKey] || schedules.regular_apr_2026;

  // Persist changes (only when editor modifies)
  useEffect(() => {
    if (isEditor) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }
  }, [schedules, isEditor]);

  // Sync automatically when academic coordinator publishes or updates exam schedules
  useEffect(() => {
    const handleSync = (e) => {
      if ((!e || e.key === STORAGE_KEY) && localStorage.getItem(STORAGE_KEY)) {
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
    setTimeout(() => setNotice(prev => (prev === msg ? '' : prev)), 4000);
  };

  const handleUpdateScheduleMeta = (field, value) => {
    setSchedules(prev => ({
      ...prev,
      [selectedExamKey]: {
        ...prev[selectedExamKey],
        [field]: value
      }
    }));
  };

  const handleUpdateCell = (rowIndex, branchKey, value) => {
    setSchedules(prev => {
      const current = prev[selectedExamKey];
      const updatedRows = [...current.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        subjects: {
          ...updatedRows[rowIndex].subjects,
          [branchKey]: value
        }
      };
      return {
        ...prev,
        [selectedExamKey]: {
          ...current,
          rows: updatedRows
        }
      };
    });
  };

  const handleUpdateDate = (rowIndex, value) => {
    setSchedules(prev => {
      const current = prev[selectedExamKey];
      const updatedRows = [...current.rows];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        date: value
      };
      return {
        ...prev,
        [selectedExamKey]: {
          ...current,
          rows: updatedRows
        }
      };
    });
  };

  const handleAddRow = () => {
    setSchedules(prev => {
      const current = prev[selectedExamKey];
      const newRow = {
        date: 'DD-MM-YY Day',
        subjects: {
          cse: '',
          it: '',
          aiml: '',
          ece: '',
          eee: ''
        }
      };
      return {
        ...prev,
        [selectedExamKey]: {
          ...current,
          rows: [...current.rows, newRow]
        }
      };
    });
  };

  const handleDeleteRow = (rowIndex) => {
    setSchedules(prev => {
      const current = prev[selectedExamKey];
      const updatedRows = current.rows.filter((_, idx) => idx !== rowIndex);
      return {
        ...prev,
        [selectedExamKey]: {
          ...current,
          rows: updatedRows
        }
      };
    });
  };

  const handleSaveDraft = () => {
    handleUpdateScheduleMeta('status', 'Draft');
    setIsEditing(false);
    showNotice(`Draft saved for ${currentSchedule.typeLabel}.`);
  };

  const handlePublish = () => {
    handleUpdateScheduleMeta('status', 'Published');
    setIsEditing(false);
    showNotice(`Official Examination Time Table for ${currentSchedule.typeLabel} published successfully!`);
  };

  const handleResetToStandard = () => {
    if (window.confirm(`Reset "${currentSchedule.typeLabel}" back to official GVPCEW default schedule?`)) {
      setSchedules(prev => ({
        ...prev,
        [selectedExamKey]: INITIAL_EXAM_SCHEDULES[selectedExamKey]
      }));
      setIsEditing(false);
      showNotice('Reset back to official GVPCEW standard timetable.');
    }
  };

  const visibleBranches = selectedBranchFilter === 'all'
    ? BRANCHES
    : BRANCHES.filter(b => b.key === selectedBranchFilter);

  return (
    <div className="exam-timetable-wrapper">
      {/* Top Controls & Exam Category Switcher */}
      <div className="exam-top-toolbar">
        <div className="exam-type-switch-group">
          <button
            type="button"
            className={`exam-tab-btn ${selectedExamKey === 'regular_apr_2026' ? 'active' : ''}`}
            onClick={() => { setSelectedExamKey('regular_apr_2026'); setIsEditing(false); }}
          >
            Regular Examinations (R24)
          </button>
          <button
            type="button"
            className={`exam-tab-btn ${selectedExamKey === 'mid2_apr_2026' ? 'active' : ''}`}
            onClick={() => { setSelectedExamKey('mid2_apr_2026'); setIsEditing(false); }}
          >
            II Mid (Internals)
          </button>
          <button
            type="button"
            className={`exam-tab-btn ${selectedExamKey === 'mid1_feb_2026' ? 'active' : ''}`}
            onClick={() => { setSelectedExamKey('mid1_feb_2026'); setIsEditing(false); }}
          >
            I Mid (Internals)
          </button>
        </div>

        {/* Filter by branch */}
        <div className="exam-filter-group">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Branch View:</span>
            <select
              className="exam-branch-select"
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
            >
              <option value="all">All Branches (Official Matrix)</option>
              {BRANCHES.map(b => (
                <option key={b.key} value={b.key}>{b.short} - {b.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Coordinator / Admin Action Buttons */}
        <div className="exam-action-buttons">
          <span className={`calendar-status-badge ${currentSchedule.status === 'Published' ? 'published' : 'draft'}`}>
            {isEditing ? 'Editing Mode' : (currentSchedule.status || 'Draft')}
          </span>

          <button
            type="button"
            className="exam-btn print-btn"
            onClick={() => window.print()}
            title="Print or Save Official Examination Time Table as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print Time Table</span>
          </button>

          {isEditor && (
            <>
              <button
                type="button"
                className={`exam-btn edit-btn ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(prev => !prev)}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Done Editing' : 'Edit Exam Schedule'}</span>
              </button>

              {isEditing && (
                <button type="button" className="exam-btn save-btn" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
              )}

              <button
                type="button"
                className="exam-btn publish-btn"
                onClick={handlePublish}
                title="Publish this examination schedule live for all students and faculty"
              >
                <Share2 className="w-4 h-4" />
                <span>Publish Schedule</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="calendar-notice-banner">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Official Time Table Document */}
      <section className={`exam-schedule-sheet ${isEditing ? 'exam-is-editing' : ''}`}>
        {/* Official Header */}
        <div className="exam-header-container">
          <div className="exam-header-crest">
            <div className="exam-crest-circle">
              <Award className="w-8 h-8 text-blue-900" />
            </div>
          </div>
          <div className="exam-header-text">
            <h2>GAYATRI VIDYA PARISHAD COLLEGE OF ENGINEERING FOR WOMEN</h2>
            <p className="exam-sub-inst">(Autonomous)</p>

            {isEditing ? (
              <div className="exam-meta-edit-fields">
                <input
                  type="text"
                  className="exam-title-input"
                  value={currentSchedule.title}
                  onChange={(e) => handleUpdateScheduleMeta('title', e.target.value)}
                  placeholder="TIME TABLE OF II B.TECH. II SEMESTER REGULAR EXAMINATIONS [R24] APRIL 2026"
                />
                <input
                  type="text"
                  className="exam-batch-input"
                  value={currentSchedule.batch}
                  onChange={(e) => handleUpdateScheduleMeta('batch', e.target.value)}
                  placeholder="[2024 Admitted Batch]"
                />
              </div>
            ) : (
              <>
                <h3 className="exam-main-title">{currentSchedule.title}</h3>
                <p className="exam-batch-tag">{currentSchedule.batch}</p>
              </>
            )}

            <div className="exam-timings-badge">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="font-bold text-xs">Examination Timings :</span>
                  <input
                    type="text"
                    className="exam-timings-input"
                    value={currentSchedule.timings}
                    onChange={(e) => handleUpdateScheduleMeta('timings', e.target.value)}
                    placeholder="01:30 PM - 04:30 PM"
                  />
                </div>
              ) : (
                <span><b>Examination Timings :</b> {currentSchedule.timings}</span>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Branch Time Table Grid */}
        <div className="overflow-x-auto mt-4">
          <table className="exam-branch-table">
            <thead>
              <tr>
                <th className="exam-col-date">Date / Branch</th>
                {visibleBranches.map(branch => (
                  <th key={branch.key} className="exam-col-branch">
                    {branch.name}
                  </th>
                ))}
                {isEditing && <th className="exam-col-action">Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentSchedule.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {/* Exam Date & Day */}
                  <td className="exam-cell-date">
                    {isEditing ? (
                      <input
                        type="text"
                        className="exam-date-input"
                        value={row.date}
                        onChange={(e) => handleUpdateDate(rIdx, e.target.value)}
                        placeholder="DD-MM-YY Day"
                      />
                    ) : (
                      <div className="font-bold text-slate-800 whitespace-nowrap">{row.date}</div>
                    )}
                  </td>

                  {/* Branch Subject Cells */}
                  {visibleBranches.map(branch => {
                    const cellVal = row.subjects[branch.key] || '—';
                    const isHonorsOrMinor = cellVal.includes('[Honors]') || cellVal.includes('[Minor]');

                    return (
                      <td
                        key={branch.key}
                        className={`exam-cell-subject ${isHonorsOrMinor ? 'honors-minor-slot' : ''} ${cellVal === '—' ? 'exam-cell-empty' : ''}`}
                      >
                        {isEditing ? (
                          <textarea
                            className="exam-cell-textarea"
                            value={row.subjects[branch.key] || ''}
                            onChange={(e) => handleUpdateCell(rIdx, branch.key, e.target.value)}
                            placeholder="Subject name [Code] or —"
                            rows={2}
                          />
                        ) : (
                          <div className="exam-subject-display">
                            {cellVal}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Action Column for Delete in Edit Mode */}
                  {isEditing && (
                    <td className="exam-cell-action">
                      <button
                        type="button"
                        className="cal-row-delete-btn"
                        title="Delete Exam Date"
                        onClick={() => handleDeleteRow(rIdx)}
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

        {/* Add Row Button in Edit Mode */}
        {isEditing && (
          <div className="exam-add-row-bar">
            <button
              type="button"
              className="cal-add-row-btn"
              onClick={handleAddRow}
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Date / Row</span>
            </button>
            <button
              type="button"
              className="cal-reset-btn ml-3"
              onClick={handleResetToStandard}
            >
              <span>Reset to Standard Time Table</span>
            </button>
          </div>
        )}

        {/* Official Signatures Section */}
        <div className="exam-signatures-section">
          <div className="exam-sig-block exam-sig-left">
            <div className="exam-sig-line"></div>
            <p className="exam-sig-title">Controller of Examinations</p>
            <p className="exam-sig-dept">Gayatri Vidya Parishad</p>
            <p className="exam-sig-dept">College of Engineering for Women (A)</p>
            <p className="exam-sig-dept">Madhurawada, Visakhapatnam</p>
          </div>

          <div className="exam-sig-block exam-sig-right">
            <div className="exam-sig-line"></div>
            <p className="exam-sig-title">Principal</p>
            <p className="exam-sig-dept">G.V.P. College of Engineering for Women (A)</p>
            <p className="exam-sig-dept">Madhurawada</p>
            <p className="exam-sig-dept">Visakhapatnam-530048</p>
          </div>
        </div>
      </section>
    </div>
  );
}
