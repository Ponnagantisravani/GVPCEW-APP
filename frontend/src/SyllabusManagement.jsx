import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Download, FolderOpen, Pencil, Printer, RefreshCw, Upload, X } from 'lucide-react';
import { SyllabusEditor, SyllabusDocument, syllabusTemplates } from './SyllabusEditor.jsx';
import './syllabus.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
function auth() {
  try { return { Authorization: `Bearer ${JSON.parse(localStorage.getItem('gvpcew_session') || '{}').token || ''}` }; }
  catch { return {}; }
}
const blank = { title: '', department: 'CSE', batch: '', description: '' };

export function SyllabusManagement({ role }) {
  const editor = ['academic_coordinator', 'admin'].includes(role);
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [templatePicker, setTemplatePicker] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [previewAttempt, setPreviewAttempt] = useState(0);

  async function refresh() {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/syllabi', { headers: auth(), params: { manage: editor } });
      setRecords(data.syllabi);
      setSelected(current => data.syllabi.find(row => row.id === current?.id) || data.syllabi[0] || null);
    } catch (e) { setError(e.response?.data?.message || 'Could not connect to the syllabus service. Check the server connection and retry.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [role]);
  useEffect(() => {
    let alive = true, url;
    setPdfUrl(''); setPdfError('');
    if (selected && !selected.structure) api.get(`/syllabi/${selected.id}/pdf`, { headers: auth(), responseType: 'blob' })
      .then(({ data }) => { if (alive) { url = URL.createObjectURL(data); setPdfUrl(url); } })
      .catch(() => { if (alive) setPdfError('Could not load the PDF. Please retry.'); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [selected?.id, previewAttempt]);

  async function saveStructure(draft) {
    setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.request({ method: draft.id ? 'put' : 'post', url: draft.id ? `/syllabi/${draft.id}` : '/syllabi', data: { title: draft.title, department: draft.department, batch: draft.batch, description: draft.description, structure: draft.structure }, headers: auth() });
      setRecords(current => [data.syllabus, ...current.filter(row => row.id !== data.syllabus.id)]);
      setSelected(data.syllabus); setEditing(null); setQuery(''); setStatusFilter('all');
      setNotice('Draft saved. Review the document, then publish it to students.');
    } catch (e) { setError(e.response?.data?.message || 'Could not save your syllabus. Your edits are still here; please retry.'); }
    finally { setBusy(false); }
  }

  async function saveDraft(event) {
    event.preventDefault(); setError(''); setNotice('');
    if (!file || !file.name.toLowerCase().endsWith('.pdf') || file.size > 15 * 1024 * 1024) {
      setError('Choose a PDF document no larger than 15 MB.'); return;
    }
    setBusy(true);
    try {
      const pdf = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onerror = reject;
        reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(file);
      });
      const { data } = await api.post('/syllabi', { ...form, file_name: file.name, pdf }, { headers: auth() });
      setRecords(current => [data.syllabus, ...current]); setSelected(data.syllabus);
      setCreating(false); setForm(blank); setFile(null);
      setNotice('Draft saved. Review the PDF below, then publish it to students.');
    } catch (e) { setError(e.response?.data?.message || 'Could not save the draft. Please try again.'); }
    finally { setBusy(false); }
  }
  async function publish() {
    setBusy(true); setError(''); setNotice('');
    try {
      const { data } = await api.post(`/syllabi/${selected.id}/publish`, {}, { headers: auth() });
      setRecords(current => current.map(row => row.id === data.syllabus.id ? data.syllabus : row));
      setSelected(data.syllabus); setNotice('Syllabus published. Students can now view and download it from their Syllabus menu.');
    } catch (e) { setError(e.response?.data?.message || 'Publishing failed. Please try again.'); }
    finally { setBusy(false); }
  }
  const visible = records.filter(row => (statusFilter === 'all' || row.status === statusFilter) && `${row.title} ${row.department} ${row.batch}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="syllabus-workspace">
    <div className="syllabus-heading">
      <div><p className="eyebrow">ACADEMICS / SYLLABUS</p><h2><BookOpen size={24} /> Course structure & syllabi</h2>
        <p className="muted">{editor ? 'Create from a template or upload an official PDF. Review, save and publish from one place.' : 'Your college’s published course structures and complete syllabus documents.'}</p></div>
      {!editing && <div className="syllabus-actions"><button type="button" className="syllabus-secondary" onClick={refresh} disabled={loading || busy}><RefreshCw size={16} /> Refresh list</button></div>}
    </div>
    {error && <p role="alert" className="error">{error}</p>}
    {notice && <p role="status" className="syllabus-notice">{notice}</p>}
    {editor && !editing && !creating && <div className="syllabus-start-options">
      <button type="button" disabled={busy} onClick={() => setTemplatePicker(true)}><span className="syllabus-option-icon"><FolderOpen size={24} /></span><span><strong>Load template</strong><small>Create and edit semester tables, subjects and detailed syllabi in the portal.</small><b>Choose a template →</b></span></button>
      <button type="button" disabled={busy} onClick={() => { setCreating(true); setNotice(''); }}><span className="syllabus-option-icon"><Upload size={24} /></span><span><strong>Upload syllabus PDF</strong><small>Already have the college document? Upload it with its original layout intact.</small><b>Upload a document →</b></span></button>
    </div>}
    {templatePicker && <div className="syllabus-modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="syllabus-template-title" className="syllabus-template-modal" onKeyDown={e => { if (e.key === 'Escape') setTemplatePicker(false); }}>
      <div className="syllabus-heading"><div><p className="eyebrow">CREATE IN THE PORTAL</p><h2 id="syllabus-template-title">Load a syllabus template</h2><p className="muted">Choose a starting point. Every field can be edited before publishing.</p></div><button type="button" autoFocus className="syllabus-icon-button" aria-label="Close templates" onClick={() => setTemplatePicker(false)}><X size={20} /></button></div>
      <div className="syllabus-template-options">{syllabusTemplates.map(template => <button type="button" key={template.id} onClick={() => { setEditing(template.create()); setTemplatePicker(false); setError(''); setNotice(''); }}><span className="syllabus-badge">{template.tag}</span><h3>{template.name}</h3><p>{template.description}</p><b>Use template →</b></button>)}</div>
    </section></div>}
    {editor && editing && <SyllabusEditor initial={editing} onSave={saveStructure} onCancel={() => setEditing(null)} busy={busy} />}
    {editor && creating && <form className="syllabus-form" onSubmit={saveDraft}>
      <div className="syllabus-heading"><div><p className="eyebrow">UPLOAD A DOCUMENT</p><h3>Upload syllabus PDF</h3></div><button type="button" className="syllabus-secondary" disabled={busy} onClick={() => { if ((!file && !form.title) || window.confirm('Discard this unsaved upload?')) { setCreating(false); setFile(null); setForm(blank); } }}>Cancel upload</button></div>
      <div className="syllabus-fields">
        <label>Document title<input required maxLength={180} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="B.Tech. CSE — Four Year Scheme and Syllabi" /></label>
        <label>Department<input required maxLength={100} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="CSE" /></label>
        <label>Applicable admitted batch<input required maxLength={100} value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="2024–25 onwards" /></label>
        <label>Official syllabus PDF (up to 15 MB)<input required type="file" accept="application/pdf,.pdf" onChange={e => setFile(e.target.files[0] || null)} /></label>
      </div>
      <label>Description<textarea maxLength={3000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Program, semesters covered and any revision details" /></label>
      <p className="muted">The PDF keeps the college’s original semester tables, course codes, categories, hours, marks, credits and detailed syllabi.</p>
      <button disabled={busy}><Upload size={16} /> {busy ? 'Saving…' : 'Save draft for review'}</button>
    </form>}
    {!editing && !creating && <>
    <div className="syllabus-library-header"><div><p className="eyebrow">DOCUMENT LIBRARY</p><h3>{editor ? 'Your syllabi' : 'Published syllabi'}</h3></div><span>{records.filter(row => row.status === 'published').length} published{editor ? ` · ${records.filter(row => row.status === 'draft').length} drafts` : ''}</span></div>
    <div className="syllabus-library-filters"><label className="syllabus-search">Find a syllabus<input type="search" placeholder="Search by title, department or batch" value={query} onChange={e => setQuery(e.target.value)} /></label>{editor && <label>Status<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All documents</option><option value="draft">Drafts</option><option value="published">Published</option></select></label>}</div>
    {loading ? <p role="status">Loading syllabi…</p> : !records.length ? <div className="syllabus-empty"><BookOpen size={32} /><h3>{editor ? 'No syllabus documents yet' : 'No syllabus published yet'}</h3><p>{editor ? 'Add the college syllabus PDF to start a draft.' : 'Your academic coordinator’s published syllabus will appear here.'}</p></div> : <>
      {!visible.length && <p>No syllabi match your search.</p>}
      <div className="syllabus-list">{visible.map(row => <button type="button" key={row.id} disabled={busy} className={`syllabus-card ${selected?.id === row.id ? 'selected' : ''}`} onClick={() => setSelected(row)}>
        <span className={`syllabus-badge ${row.status}`}>{row.status === 'published' ? 'Published' : 'Draft · coordinator review'}</span>
        <strong>{row.title}</strong><span>{row.department} · {row.batch}</span><small>{row.structure ? 'Created in portal' : 'PDF document'}</small>
        <small>{row.published_at ? `Published ${new Date(row.published_at).toLocaleDateString('en-IN')}` : 'Not visible to students'}</small>
      </button>)}</div>
      {selected && <section className="syllabus-document" aria-label="Syllabus document preview">
        <div className="syllabus-heading"><div><h3>{selected.title}</h3><p>{selected.department} · Admitted batch: {selected.batch}</p></div>
          <div className="syllabus-actions">{pdfUrl && <a href={pdfUrl} download={selected.file_name}><Download size={16} /> Download PDF</a>}
            {selected.structure && <button type="button" className="syllabus-secondary" onClick={() => window.print()}><Printer size={16} /> Print / save PDF</button>}
            {editor && selected.structure && <button type="button" className="syllabus-secondary" disabled={busy} onClick={() => { setEditing({ ...selected, id: selected.status === 'draft' ? selected.id : undefined }); setNotice(''); setError(''); }}><Pencil size={16} />{selected.status === 'draft' ? 'Edit draft' : 'Create revised draft'}</button>}
            {editor && selected.status === 'draft' && <button type="button" onClick={publish} disabled={busy || (!pdfUrl && !selected.structure)}>{busy ? 'Publishing…' : 'Publish to students'}</button>}</div></div>
        {selected.description && <p className="muted">{selected.description}</p>}
        {selected.status === 'draft' && <p className="syllabus-draft-note">Draft preview — students will see this document only after publication.</p>}
        {selected.structure ? <SyllabusDocument record={selected} /> : pdfError ? <p role="alert">{pdfError} <button type="button" onClick={() => setPreviewAttempt(n => n + 1)}>Retry PDF</button></p> : pdfUrl ? <>
          <p className="muted">Use the PDF page controls to browse semesters and subjects. If preview is unavailable on your device, download the PDF.</p>
          <iframe title={`${selected.title} PDF preview`} src={pdfUrl} className="syllabus-pdf" />
        </> : <p role="status">Loading document…</p>}
      </section>}
    </>}
    </>}
  </div>;
}
