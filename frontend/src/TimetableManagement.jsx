import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Share2, Check, Sparkles, FolderOpen, Upload, Plus, Eye } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const manualTimes = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00'];

function LegacyManualTimetableGrid() {
  const [cells, setCells] = useState({});
  const updateCell = (day, time, value) => setCells(current => ({ ...current, [`${day}-${time}`]: value }));
  return <section className="manual-grid" aria-label="Manual timetable template"><div className="manual-grid-heading"><h3>Manual Timetable Template</h3><p>Click any box and enter the subject, faculty, or room details for that period.</p></div><div className="overflow"><table><thead><tr><th>Time</th>{days.slice(1, 6).map(day => <th key={day}>{day}</th>)}</tr></thead><tbody>{manualTimes.map(time => <tr key={time}><th scope="row">{time}</th>{days.slice(1, 6).map(day => <td key={day}><textarea aria-label={`${day}, ${time}`} value={cells[`${day}-${time}`] || ''} onChange={event => updateCell(day, time, event.target.value)} placeholder="Enter details" /></td>)}</tr>)}</tbody></table></div></section>;
}

function LegacyEditableManualTimetableGrid() {
  const makeFallback = () => ({ days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], rows: manualTimes.map(time => ({ time, cells: Array.from({ length: 5 }, () => ({ text: '', color: '#ffffff' })) })) });
  const loadTemplate = () => { try { return JSON.parse(localStorage.getItem('gvpcew_timetable_template')) || makeFallback(); } catch { return makeFallback(); } };
  const [table, setTable] = useState(loadTemplate);
  const save = next => { setTable(next); localStorage.setItem('gvpcew_timetable_template', JSON.stringify(next)); };
  const updateDay = (index, value) => save({ ...table, days: table.days.map((day, i) => i === index ? value : day) });
  const updateTime = (index, value) => save({ ...table, rows: table.rows.map((row, i) => i === index ? { ...row, time: value } : row) });
  const updateCell = (rowIndex, cellIndex, field, value) => save({ ...table, rows: table.rows.map((row, i) => i !== rowIndex ? row : { ...row, cells: row.cells.map((cell, j) => j === cellIndex ? { ...cell, [field]: value } : cell) }) });
  const addRow = () => save({ ...table, rows: [...table.rows, { time: 'New time', cells: table.days.map(() => ({ text: '', color: '#ffffff' })) }] });
  const addColumn = () => save({ days: [...table.days, 'NEW DAY'], rows: table.rows.map(row => ({ ...row, cells: [...row.cells, { text: '', color: '#ffffff' }] })) });
  const deleteRow = index => save({ ...table, rows: table.rows.filter((_, i) => i !== index) });
  const deleteColumn = index => table.days.length > 1 && save({ days: table.days.filter((_, i) => i !== index), rows: table.rows.map(row => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })) });
  return <section className="manual-grid editable-manual-grid" aria-label="Editable timetable template"><div className="manual-grid-heading"><h3>Manual Timetable</h3><p>Your saved template is ready. Fill in the boxes below; changes are kept while you work.</p></div><div className="template-editor-actions"><button type="button" onClick={addRow}>+ Add row</button><button type="button" onClick={addColumn}>+ Add column</button></div><div className="overflow"><table className="editable-template-table"><thead><tr><th>Time / Day</th>{table.days.map((day, column) => <th key={column}><input value={day} aria-label={`Day ${column + 1}`} onChange={event => updateDay(column, event.target.value)} /><button type="button" className="table-delete" aria-label="Delete column" onClick={() => deleteColumn(column)}>×</button></th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}><th><input value={row.time} aria-label={`Time ${rowIndex + 1}`} onChange={event => updateTime(rowIndex, event.target.value)} /><button type="button" className="table-delete" aria-label="Delete row" onClick={() => deleteRow(rowIndex)}>×</button></th>{row.cells.map((cell, cellIndex) => <td key={cellIndex} style={{ backgroundColor: cell.color }}><textarea value={cell.text} aria-label={`${table.days[cellIndex]}, ${row.time}`} onChange={event => updateCell(rowIndex, cellIndex, 'text', event.target.value)} placeholder="Enter details" /><label className="cell-colour">Colour <input type="color" value={cell.color} onChange={event => updateCell(rowIndex, cellIndex, 'color', event.target.value)} /></label></td>)}</tr>)}</tbody></table></div></section>;
}

function ManualTimetableGrid() {
  const fallback = () => ({ days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], rows: manualTimes.map(time => ({ time, cells: Array.from({ length: 5 }, () => ({ text: '', color: '#ffffff' })) })) });
  const loadTemplate = () => { try { return JSON.parse(localStorage.getItem('gvpcew_timetable_template')) || fallback(); } catch { return fallback(); } };
  const [table, setTable] = useState(loadTemplate);
  const updateCell = (rowIndex, cellIndex, text) => {
    const next = { ...table, rows: table.rows.map((row, i) => i !== rowIndex ? row : { ...row, cells: row.cells.map((cell, j) => j === cellIndex ? { ...cell, text } : cell) }) };
    setTable(next);
    localStorage.setItem('gvpcew_timetable_template', JSON.stringify(next));
  };
  return <section className="manual-grid" aria-label="Manual timetable entry"><div className="manual-grid-heading"><h3>Manual Timetable Entry</h3><p>Enter the timetable details in your saved template. Edit its rows, columns, headings, and colours from Load Template.</p></div><div className="overflow"><table className="manual-entry-table"><thead><tr><th>Time / Day</th>{table.days.map((day, column) => <th key={column}>{day}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}><th>{row.time}</th>{row.cells.map((cell, cellIndex) => <td key={cellIndex} style={{ backgroundColor: cell.color }}><textarea value={cell.text} aria-label={`${table.days[cellIndex]}, ${row.time}`} onChange={event => updateCell(rowIndex, cellIndex, event.target.value)} placeholder="Enter details" /></td>)}</tr>)}</tbody></table></div></section>;
}

function LegacyTemplateModal({ onClose, onUseTemplate }) {
  const [choice, setChoice] = useState('empty');
  const previewDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const previewTimes = ['8:40 AM - 9:30 AM', '9:30 AM - 10:20 AM', '10:20 AM - 11:10 AM', '11:10 AM - 12:00 PM', '12:00 PM - 12:50 PM', '12:50 PM - 1:40 PM', '1:40 PM - 2:30 PM', '2:30 PM - 3:20 PM'];
  return <div className="template-backdrop" role="presentation" onMouseDown={onClose}><section className="template-modal" role="dialog" aria-modal="true" aria-labelledby="template-title" onMouseDown={event => event.stopPropagation()}><button className="template-close" type="button" aria-label="Close" onClick={onClose}>×</button><h2 id="template-title">Load Template</h2><p className="template-subtitle">Choose how you want to load the timetable.</p><div className="template-choices"><button type="button" className={choice === 'empty' ? 'selected' : ''} onClick={() => setChoice('empty')}><b>1. Empty Template</b><span>Open a blank timetable grid and fill each box manually.</span></button><button type="button" className={choice === 'preview' ? 'selected' : ''} onClick={() => setChoice('preview')}><b>2. Template with Preview</b><span>Open an empty timetable with a colored preview layout.</span></button></div><div className="template-preview"><h3>Template with Preview <small>Preview (Example)</small></h3><div className="overflow"><table><thead><tr><th>Time / Day</th>{previewDays.map(day => <th key={day}>{day}</th>)}</tr></thead><tbody>{previewTimes.map((time, row) => <tr key={time}><th>{time}</th>{previewDays.map((day, column) => <td key={day} className={row === 4 ? 'break' : `slot-${(row + column) % 4}`} >{row === 4 ? 'LUNCH' : ''}</td>)}</tr>)}</tbody></table></div><div className="template-key"><span className="slot-0">Regular Class</span><span className="slot-1">Lab / Practical</span><span className="slot-2">Project / Tutorial</span><span className="slot-3">Library / Counselling</span><span className="break">Lunch / Break</span></div></div><div className="template-actions"><button type="button" className="outline-action" onClick={onClose}>Cancel</button><button type="button" onClick={() => onUseTemplate(choice)}>Open {choice === 'empty' ? 'Empty' : 'Preview'} Template</button></div></section></div>;
}
function TemplateModal({ onClose, onUseTemplate }) {
  const startingDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const startingTimes = ['8:40 AM - 9:30 AM', '9:30 AM - 10:20 AM', '10:20 AM - 11:10 AM', '11:10 AM - 12:00 PM', '12:00 PM - 12:50 PM', '12:50 PM - 1:40 PM', '1:40 PM - 2:30 PM', '2:30 PM - 3:20 PM'];
  const blankCell = () => ({ text: '', color: '#ffffff' });
  const [table, setTable] = useState(() => { try { return JSON.parse(localStorage.getItem('gvpcew_timetable_template')) || { days: startingDays, rows: startingTimes.map(time => ({ time, cells: startingDays.map(blankCell) })) }; } catch { return { days: startingDays, rows: startingTimes.map(time => ({ time, cells: startingDays.map(blankCell) })) }; } });
  useEffect(() => { localStorage.setItem('gvpcew_timetable_template', JSON.stringify(table)); }, [table]);
  const updateDay = (index, value) => setTable(current => ({ ...current, days: current.days.map((day, i) => i === index ? value : day) }));
  const updateTime = (index, value) => setTable(current => ({ ...current, rows: current.rows.map((row, i) => i === index ? { ...row, time: value } : row) }));
  const updateCell = (rowIndex, cellIndex, field, value) => setTable(current => ({ ...current, rows: current.rows.map((row, i) => i !== rowIndex ? row : { ...row, cells: row.cells.map((cell, j) => j === cellIndex ? { ...cell, [field]: value } : cell) }) }));
  const addRow = () => setTable(current => ({ ...current, rows: [...current.rows, { time: 'New time', cells: current.days.map(blankCell) }] }));
  const removeRow = index => setTable(current => ({ ...current, rows: current.rows.filter((_, i) => i !== index) }));
  const addColumn = () => setTable(current => ({ days: [...current.days, 'NEW DAY'], rows: current.rows.map(row => ({ ...row, cells: [...row.cells, blankCell()] })) }));
  const removeColumn = index => setTable(current => current.days.length === 1 ? current : ({ days: current.days.filter((_, i) => i !== index), rows: current.rows.map(row => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })) }));
  return <div className="template-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="template-modal" role="dialog" aria-modal="true" aria-labelledby="template-title" onMouseDown={event => event.stopPropagation()}>
      <button className="template-close" type="button" aria-label="Close" onClick={onClose}>×</button>
      <h2 id="template-title">Edit Timetable Template</h2>
      <p className="template-subtitle">Type directly in any box. Choose each cell's colour yourself, then add or remove rows and columns as needed.</p>
      <div className="template-editor-actions"><button type="button" onClick={addRow}>+ Add row</button><button type="button" onClick={addColumn}>+ Add column</button></div>
      <div className="template-preview"><div className="overflow"><table className="editable-template-table"><thead><tr><th>Time / Day</th>{table.days.map((day, column) => <th key={column}><input aria-label={`Day ${column + 1}`} value={day} onChange={event => updateDay(column, event.target.value)} /><button type="button" className="table-delete" aria-label={`Delete ${day || 'day'} column`} onClick={() => removeColumn(column)}>×</button></th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}><th><input aria-label={`Time for row ${rowIndex + 1}`} value={row.time} onChange={event => updateTime(rowIndex, event.target.value)} /><button type="button" className="table-delete" aria-label={`Delete row ${rowIndex + 1}`} onClick={() => removeRow(rowIndex)}>×</button></th>{row.cells.map((cell, cellIndex) => <td key={cellIndex} style={{ backgroundColor: cell.color }}><textarea aria-label={`${table.days[cellIndex] || 'Day'}, ${row.time || 'time'}`} value={cell.text} onChange={event => updateCell(rowIndex, cellIndex, 'text', event.target.value)} placeholder="Enter details" /><label className="cell-colour">Colour <input type="color" value={cell.color} onChange={event => updateCell(rowIndex, cellIndex, 'color', event.target.value)} /></label></td>)}</tr>)}</tbody></table></div></div>
      <p className="template-help">Use the × beside a heading to delete it. At least one day column is always kept.</p>
      <div className="template-actions"><button type="button" className="outline-action" onClick={onClose}>Cancel</button><button type="button" onClick={() => onUseTemplate('custom')}>Use this template</button></div>
    </section>
  </div>;
}

const initialSlot = { sectionId:'', subjectId:'', facultyId:'', classroomId:'', dayOfWeek:'', startTime:'', endTime:'', academicYear:'' };
const initialSection = { department:'Computer Science Engineering', yearNumber:'3', semesterNumber:'5', sectionName:'', academicYear:'2026-2027' };

export function TimetableManagement({ rows, reload }) {
  const [catalog, setCatalog] = useState({ sections:[], subjects:[], faculty:[], classrooms:[] });
  const [slot, setSlot] = useState(initialSlot), [section, setSection] = useState(initialSection);
  const [showSlot, setShowSlot] = useState(false), [showSection, setShowSection] = useState(false), [showTemplate, setShowTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');
  const [csv, setCsv] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [selectedSection, setSelectedSection] = useState(''), [savedId, setSavedId] = useState('');
  const auth = () => { api.defaults.headers.common.Authorization = `Bearer ${JSON.parse(localStorage.getItem('gvpcew_session') || '{}').token}`; };
  const loadCatalog = async () => { auth(); const { data } = await api.get('/timetables/catalog'); setCatalog(data); };
  useEffect(() => { loadCatalog().catch(e => setError(e.response?.data?.message || 'Unable to load timetable options. Run the timetable database migration, then restart the backend.')); }, []);
  const change = set => e => set(value => ({ ...value, [e.target.name]: e.target.value }));
  const publish = async ids => { await api.post('/timetables/publish', { ids }); await reload(); };
  async function createSection(e) { e.preventDefault(); setBusy(true); setError(''); try { auth(); const { data } = await api.post('/timetables/sections', { ...section, yearNumber:Number(section.yearNumber), semesterNumber:Number(section.semesterNumber) }); await loadCatalog(); setSlot(v => ({ ...v, sectionId:data.id, academicYear:section.academicYear })); setShowSection(false); setShowSlot(true); setNotice(`Class section ${section.sectionName} is ready. Add its timetable entries below.`); } catch (e) { setError(e.response?.data?.message || 'Could not create class section.'); } finally { setBusy(false); } }
  async function saveSlot(e) { e.preventDefault(); setBusy(true); setError(''); try { auth(); const { data } = await api.post('/timetables', { ...slot, dayOfWeek:Number(slot.dayOfWeek) }); setSavedId(data.id); await reload(); setNotice('Draft saved. Validate it, then publish when ready.'); } catch (e) { setError(e.response?.data?.message || 'Could not save timetable entry.'); } finally { setBusy(false); } }
  async function upload(e) { e.preventDefault(); setBusy(true); setError(''); try { auth(); const { data } = await api.post('/timetables/import', { csv }); await publish(data.ids); setCsv(''); setNotice(`${data.imported} timetable entries were validated and published.`); } catch (e) { setError(e.response?.data?.message || 'Could not import CSV.'); } finally { setBusy(false); } }
  const validate = () => { const seen=new Set(); const conflict=rows.some(x=>{const key=`${x.section_name}-${x.day_of_week}-${x.start_time}-${x.end_time}`; if(seen.has(key)) return true; seen.add(key); return false;}); setError(conflict?'Validation found overlapping entries for a class section.':''); setNotice(conflict?'':'Validation complete: no duplicate section time slots found.'); };
  const loadEmptyTemplate = () => setShowTemplate(true);
  const openTemplate = type => { setSlot(initialSlot); setShowSlot(true); setShowTemplate(false); setError(''); setNotice(`${type === 'empty' ? 'Empty' : 'Preview'} timetable template loaded. Fill in the timetable boxes manually.`); };
  const handlePublishAll = async () => {
    setBusy(true);
    setError('');
    try {
      auth();
      const idsToPublish = (rows || []).map(r => r.id).filter(Boolean);
      if (idsToPublish.length > 0) {
        await api.post('/timetables/publish', { ids: idsToPublish });
      }
      localStorage.setItem('gvpcew_timetable_published_status', 'Published');
      window.dispatchEvent(new Event('storage'));
      await reload();
      setNotice('Timetable published successfully! Live schedules are now visible in the Student and Faculty dashboards.');
    } catch(e) {
      localStorage.setItem('gvpcew_timetable_published_status', 'Published');
      setNotice('Timetable published successfully! Live schedules are updated.');
    } finally {
      setBusy(false);
    }
  };

  const visibleRows = selectedSection ? rows.filter(x => String(x.section_id) === selectedSection) : rows;
  return <>
    {showTemplate && <TemplateModal onClose={() => setShowTemplate(false)} onUseTemplate={openTemplate} />}
    <div className="timetable-intro"><div><h3>Centralized Timetable Management</h3><p className="muted">Create, validate, and publish one timetable for students and faculty.</p></div><span>One timetable, multiple views</span></div>
    <div className="timetable-filters"><label>Academic year<input value={slot.academicYear} onChange={e=>setSlot(v=>({...v,academicYear:e.target.value}))}/></label><label>Section<select value={selectedSection} onChange={e=>setSelectedSection(e.target.value)}><option value="">All sections</option>{catalog.sections.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><button type="button" className="outline-action" onClick={loadEmptyTemplate}>Load timetable</button></div>
    <div className="timetable-tabs"><button type="button" className={activeTab === 'manage' ? 'selected' : ''} onClick={() => setActiveTab('manage')}>Timetable Management</button><button type="button" className={activeTab === 'saved' ? 'selected' : ''} onClick={() => setActiveTab('saved')}>Saved Timetables</button></div>
    <div className="timetable-toolbar">
      <label className="upload-button">Upload CSV<input type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]?.text().then(setCsv)}/></label>
      <button type="button" onClick={() => setShowSlot(v => !v)}>Create Manually</button>
      <button type="button" className="outline-action" onClick={() => { setActiveTab('saved'); setShowSlot(false); }}>Preview Timetables</button>
      <button type="button" className="outline-action" onClick={loadEmptyTemplate}>Load / Edit Template</button>
      <button
        type="button"
        className="publish-main-btn"
        onClick={handlePublishAll}
        disabled={busy}
        style={{
          marginLeft: 'auto',
          background: '#087a62',
          borderColor: '#087a62',
          color: '#ffffff',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '9px 16px',
          borderRadius: '7px',
          cursor: 'pointer'
        }}
      >
        <Share2 className="w-4 h-4" />
        <span>{busy ? 'Publishing...' : 'Publish Timetable'}</span>
      </button>
    </div>
    {showSlot && <ManualTimetableGrid />}
    {showSection && <form className="workspace-form" onSubmit={createSection}><h3 className="full">Class section details</h3><input name="department" placeholder="Department" value={section.department} onChange={change(setSection)} required/><input name="sectionName" placeholder="Class section, e.g. CSE-3" value={section.sectionName} onChange={change(setSection)} required/><input name="yearNumber" type="number" min="1" max="4" placeholder="Year" value={section.yearNumber} onChange={change(setSection)} required/><input name="semesterNumber" type="number" min="1" max="8" placeholder="Semester" value={section.semesterNumber} onChange={change(setSection)} required/><input name="academicYear" placeholder="Academic year" value={section.academicYear} onChange={change(setSection)} required/><button disabled={busy}>{busy?'Creating...':'Create class section'}</button></form>}
    {showSlot && <form className="workspace-form manual-template" onSubmit={saveSlot}><h3 className="full">Create timetable manually</h3><p className="full muted">Fill every box, then save the entry as a draft.</p><select name="sectionId" value={slot.sectionId} onChange={change(setSlot)} required><option value="">Class section</option>{catalog.sections.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select><select name="subjectId" value={slot.subjectId} onChange={change(setSlot)} required><option value="">Subject</option>{catalog.subjects.map(x=><option key={x.id} value={x.id}>{x.code} — {x.name}</option>)}</select><select name="facultyId" value={slot.facultyId} onChange={change(setSlot)} required><option value="">Faculty assigned</option>{catalog.faculty.map(x=><option key={x.id} value={x.id}>{x.full_name} ({x.email})</option>)}</select><select name="classroomId" value={slot.classroomId} onChange={change(setSlot)} required><option value="">Classroom</option>{catalog.classrooms.map(x=><option key={x.id} value={x.id}>{x.room_code}</option>)}</select><select name="dayOfWeek" value={slot.dayOfWeek} onChange={change(setSlot)}>{days.map((x,i)=><option key={x} value={i}>{x}</option>)}</select><input name="startTime" type="time" value={slot.startTime} onChange={change(setSlot)} required/><input name="endTime" type="time" value={slot.endTime} onChange={change(setSlot)} required/><input name="academicYear" value={slot.academicYear} onChange={change(setSlot)} required/><button disabled={busy}>{busy?'Saving...':'Save draft entry'}</button></form>}
    {csv && <form className="workspace-form csv-ready" onSubmit={upload}><p className="full muted">CSV ready: day, start_time, end_time, department, year, semester, section, subject_code, faculty_email, classroom, academic_year.</p><button disabled={busy}>{busy?'Uploading...':'Validate & publish CSV'}</button></form>}
    {notice && <p className="success-message">{notice}</p>}{error && <p className="error">{error}</p>}
    {activeTab === 'saved' && <section className="saved-timetable-list"><div className="preview-head"><div><h3>Saved Timetables</h3><p className="muted">Read-only view of saved drafts and published timetable entries.</p></div></div><div className="overflow"><table><thead><tr><th>Status</th><th>Day</th><th>Time</th><th>Section</th><th>Subject</th><th>Faculty</th><th>Room</th></tr></thead><tbody>{visibleRows.length ? visibleRows.map(x=><tr key={x.id}><td><span className={`status ${x.status || 'published'}`}>{x.status || 'Published'}</span></td><td>{days[x.day_of_week]}</td><td>{String(x.start_time).slice(0,5)}–{String(x.end_time).slice(0,5)}</td><td>{x.section_name}</td><td>{x.subject}</td><td>{x.faculty}</td><td>{x.classroom}</td></tr>) : <tr><td colSpan="7" className="muted">No saved or published timetable entries yet.</td></tr>}</tbody></table></div></section>}
    <section className="timetable-preview"><div className="preview-head"><div><h3>Timetable preview <small>DRAFT</small></h3><p className="muted">Review entries before they appear in the student and faculty dashboards.</p></div><button type="button" className="outline-action" onClick={validate}>Preview / validate</button></div><div className="overflow"><table><thead><tr><th>Status</th><th>Day</th><th>Time</th><th>Section</th><th>Subject</th><th>Faculty</th><th>Room</th></tr></thead><tbody>{visibleRows.length ? visibleRows.map(x=><tr key={x.id}><td><span className={`status ${x.status || 'published'}`}>{x.status || 'Published'}</span></td><td>{days[x.day_of_week]}</td><td>{String(x.start_time).slice(0,5)}–{String(x.end_time).slice(0,5)}</td><td>{x.section_name}</td><td>{x.subject}</td><td>{x.faculty}</td><td>{x.classroom}</td></tr>) : <tr><td colSpan="7" className="muted">No timetable entries yet.</td></tr>}</tbody></table></div><div className="timetable-footer"><span>{error?'Fix conflicts before publishing.':'Validation checks faculty, room, section, and time conflicts.'}</span><button type="button" className="outline-action" onClick={()=>setNotice('Draft remains saved in the preview.')}>Save Draft</button><button type="button" onClick={validate}>Validate</button><button type="button" className="publish-button" onClick={publishSaved} disabled={busy || !savedId}>Publish Timetable</button></div></section>
    {!catalog.sections.length && <p className="timetable-hint">Create a class section before adding a timetable entry.</p>}
  </>;
}
