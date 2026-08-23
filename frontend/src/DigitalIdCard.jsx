import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, Edit3, Save, Printer, RotateCcw, Check, Sparkles, User,
  Upload, QrCode, ShieldCheck, Award, Phone, MapPin, RefreshCw, Layers
} from 'lucide-react';

export function DigitalIdCard({ student }) {
  const STORAGE_KEY = 'gvpcew_digital_id_v2';
  const fileInputRef = useRef(null);

  const defaultDetails = {
    name: student?.profile?.full_name || student?.full_name || 'PONNAGANTI SRAVANI',
    course: 'B.Tech',
    branch: student?.profile?.department || 'Computer Science & Engineering',
    branchCode: 'CSE',
    batch: '2024–2028',
    section: student?.profile?.section || 'A',
    rollNo: student?.profile?.roll_number || student?.roll_number || '324103210170',
    dob: '15-08-2006',
    bloodGroup: 'O+ Positive',
    validTill: 'JULY 2028',
    fatherName: 'P. Venkata Rao',
    emergencyContact: '+91 98765 43210',
    address: 'Madhurawada, Visakhapatnam - 530048',
    collegeContact: '0891-2739144, 2526639',
    photo: student?.profile?.photo_url || ''
  };

  const [details, setDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultDetails, ...JSON.parse(saved) };
    } catch {}
    return defaultDetails;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [notice, setNotice] = useState('');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  }, [details]);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(prev => (prev === msg ? '' : prev)), 3500);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDetails(prev => ({ ...prev, photo: reader.result }));
        showNotice('Passport photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, val) => {
    setDetails(prev => ({ ...prev, [field]: val }));
  };

  const handleReset = () => {
    if (window.confirm('Reset ID card details to default?')) {
      setDetails(defaultDetails);
      setIsEditing(false);
      showNotice('ID card details reset.');
    }
  };

  return (
    <div className="digital-id-container">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Top Action Toolbar */}
      <div className="id-card-toolbar no-print">
        <div className="id-toolbar-left">
          <button
            type="button"
            className="id-tool-btn upload-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload student photograph"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            className={`id-tool-btn edit-toggle-btn ${isEditing ? 'active' : ''}`}
            onClick={() => setIsEditing(prev => !prev)}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Close Editor' : 'Edit Details'}</span>
          </button>

          <button
            type="button"
            className="id-tool-btn"
            style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}
            onClick={() => setShowBack(prev => !prev)}
          >
            <Layers className="w-4 h-4" />
            <span>{showBack ? 'View Front Side' : 'View Back Side'}</span>
          </button>
        </div>

        <div className="id-toolbar-right">
          <button
            type="button"
            className="id-tool-btn print-card-btn"
            onClick={() => window.print()}
            title="Print Official ID Badge"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>

          <button
            type="button"
            className="calendar-btn-subtle"
            onClick={handleReset}
            title="Reset ID Card"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div className="calendar-notice-banner no-print">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Edit Form Panel */}
      {isEditing && (
        <div className="id-edit-panel no-print" style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>Edit Student ID Card Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Student Full Name</label>
              <input type="text" className="id-form-input" value={details.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Roll Number</label>
              <input type="text" className="id-form-input" value={details.rollNo} onChange={e => handleChange('rollNo', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Branch / Department</label>
              <select
                className="id-form-input"
                value={details.branch}
                onChange={e => {
                  const b = e.target.value;
                  let code = 'CSE';
                  if (b.includes('Artificial') || b.includes('CSM')) code = 'CSM';
                  else if (b.includes('Cyber') || b.includes('CSC')) code = 'CSC';
                  else if (b.includes('Electronics') || b.includes('ECE')) code = 'ECE';
                  else if (b.includes('Electrical') || b.includes('EEE')) code = 'EEE';
                  else if (b.includes('Information') || b.includes('IT')) code = 'IT';
                  setDetails(prev => ({ ...prev, branch: b, branchCode: code }));
                }}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="CSE - Artificial Intelligence & ML">CSE - Artificial Intelligence & ML (CSM)</option>
                <option value="CSE - Cyber Security">CSE - Cyber Security (CSC)</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering (EEE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Branch Code (e.g. CSE)</label>
              <input type="text" className="id-form-input" value={details.branchCode} onChange={e => handleChange('branchCode', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Course</label>
              <input type="text" className="id-form-input" value={details.course} onChange={e => handleChange('course', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Section</label>
              <select className="id-form-input" value={details.section} onChange={e => handleChange('section', e.target.value)}>
                <option value="1">Section 1</option>
                <option value="2">Section 2</option>
                <option value="3">Section 3</option>
                <option value="4">Section 4</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Batch</label>
              <input type="text" className="id-form-input" value={details.batch} onChange={e => handleChange('batch', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Blood Group</label>
              <input type="text" className="id-form-input" value={details.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Valid Upto</label>
              <input type="text" className="id-form-input" value={details.validTill} onChange={e => handleChange('validTill', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { setIsEditing(false); showNotice('ID card details saved!'); }}
              style={{ background: '#087a62', color: '#fff', border: 0, padding: '7px 16px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ID Card Stage */}
      <div className="id-card-stage">
        {!showBack ? (
          /* FRONT SIDE */
          <div className="gvpcew-physical-card front">
            {/* Top Cyan / Turquoise Header Bar */}
            <div className="gvpcew-id-header">
              {/* Official GVP Emblem Seal */}
              <div className="gvpcew-emblem-badge">
                <div className="gvpcew-emblem-inner">
                  {/* Gayatri Mata Flame / Lamp Emblem Art */}
                  <div className="gvp-crest-art">
                    <div className="gvp-flame-core"></div>
                    <div className="gvp-lamp-base"></div>
                  </div>
                </div>
                <div className="gvp-telugu-text">గాయత్రీ విద్యా పరిషత్</div>
                <div className="gvp-autonomous-tag">AUTONOMOUS</div>
              </div>

              {/* Header Titles */}
              <div className="gvpcew-header-titles">
                <h1 className="gvpcew-title-primary">GAYATRI VIDYA PARISHAD</h1>
                <h2 className="gvpcew-title-secondary">COLLEGE OF ENGINEERING FOR WOMEN</h2>
                <p className="gvpcew-title-affiliation">(Autonomous • Affiliated to Andhra University, Visakhapatnam)</p>
                <p className="gvpcew-title-sub">Approved by AICTE, New Delhi • Accredited by NBA & NAAC</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="gvpcew-id-body">
              {/* Holographic Watermark Pattern */}
              <div className="gvpcew-card-watermark">
                <ShieldCheck className="w-36 h-36" />
              </div>

              {/* Student Photo */}
              <div
                className="gvpcew-photo-frame"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change student photo"
              >
                {details.photo ? (
                  <img src={details.photo} alt={details.name} className="gvpcew-photo-img" />
                ) : (
                  <div className="gvpcew-photo-placeholder">
                    <User className="w-12 h-12 text-slate-400" />
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', marginTop: '4px' }}>
                      CLICK TO UPLOAD
                    </span>
                  </div>
                )}
                <div className="gvpcew-photo-overlay no-print">
                  <Camera className="w-4 h-4 text-white" />
                  <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>Change</span>
                </div>
              </div>

              {/* Student Details Column */}
              <div className="gvpcew-details-column">
                <div className="gvpcew-field-list">
                  <div className="gvpcew-row">
                    <span className="gvpcew-label">Name</span>
                    <span className="gvpcew-colon">:</span>
                    <span className="gvpcew-val gvpcew-name-val">{details.name}</span>
                  </div>

                  <div className="gvpcew-row">
                    <span className="gvpcew-label">Course</span>
                    <span className="gvpcew-colon">:</span>
                    <span className="gvpcew-val">{details.course}</span>
                  </div>

                  <div className="gvpcew-row">
                    <span className="gvpcew-label">Batch</span>
                    <span className="gvpcew-colon">:</span>
                    <span className="gvpcew-val">{details.batch}</span>
                  </div>

                  <div className="gvpcew-row">
                    <span className="gvpcew-label">Section</span>
                    <span className="gvpcew-colon">:</span>
                    <span className="gvpcew-val">{details.section}</span>
                  </div>

                  <div className="gvpcew-roll-row">
                    <span className="gvpcew-roll-label">Roll No</span>
                    <span className="gvpcew-colon">:</span>
                    <span className="gvpcew-roll-val">{details.rollNo}</span>
                  </div>
                </div>

                {/* Bottom Row inside Body: Barcode on Left, Principal Signature on Right */}
                <div className="gvpcew-body-bottom-row">
                  {/* High-density barcode for Roll Number */}
                  <div className="gvpcew-barcode-container">
                    <div className="gvpcew-barcode-lines">
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-thick"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-med"></div>
                      <div className="b-bar b-thick"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-med"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-thick"></div>
                      <div className="b-bar b-med"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-thick"></div>
                      <div className="b-bar b-med"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-thick"></div>
                      <div className="b-bar b-thin"></div>
                      <div className="b-bar b-med"></div>
                      <div className="b-bar b-thick"></div>
                    </div>
                    <span className="gvpcew-barcode-text">*{details.rollNo}*</span>
                  </div>

                  {/* Official Principal Signature & Seal */}
                  <div className="gvpcew-signature-box">
                    <div className="gvpcew-sig-ink">
                      {/* Elegant Blue Signature Script */}
                      <svg viewBox="0 0 110 32" className="gvpcew-sig-svg">
                        <path
                          d="M 6 22 C 16 6, 26 28, 38 10 C 44 2, 50 24, 58 14 C 68 4, 74 26, 88 8 C 96 18, 102 10, 106 18 M 8 26 L 102 24"
                          stroke="#004b99"
                          strokeWidth="2.2"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="gvpcew-sig-text">PRINCIPAL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Cyan / Turquoise Footer Bar */}
            <div className="gvpcew-id-footer">
              <div className="gvpcew-footer-branch">
                {details.branchCode || 'CSE'}
              </div>

              <div className="gvpcew-footer-center">
                <p className="gvpcew-footer-addr">{details.address}</p>
                <p className="gvpcew-footer-contact">Contact : {details.collegeContact}</p>
              </div>

              <div className="gvpcew-footer-college-code">
                GVPW
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="gvpcew-physical-card back">
            <div className="gvpcew-id-header" style={{ padding: '8px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                <span style={{ color: '#fef08a', fontWeight: '800', fontSize: '12px' }}>GVPCEW STUDENT ID CARD (TERMS &amp; DETAILS)</span>
                <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>CODE: 530048</span>
              </div>
            </div>

            <div className="gvpcew-id-body" style={{ flexDirection: 'column', gap: '10px', padding: '14px 18px', minHeight: '210px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div><strong>Date of Birth:</strong> {details.dob}</div>
                <div><strong>Blood Group:</strong> <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{details.bloodGroup}</span></div>
                <div><strong>Father / Guardian:</strong> {details.fatherName}</div>
                <div><strong>Emergency Ph:</strong> {details.emergencyContact}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Valid Upto:</strong> {details.validTill} (Subject to College Rules)</div>
              </div>

              <div style={{ marginTop: '6px', padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '10px', color: '#475569', lineHeight: '1.4' }}>
                <strong>INSTRUCTIONS:</strong>
                <ol style={{ margin: '4px 0 0', paddingLeft: '14px' }}>
                  <li>This card is non-transferable and must be displayed on campus at all times.</li>
                  <li>Loss of card must be reported immediately to the Academic Coordinator office.</li>
                  <li>Card is required for Library book issue, Lab sessions, and Examination Hall entry.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  Web: <strong>www.gvpcew.ac.in</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#087a62', fontWeight: 'bold' }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Autonomous RFID Badge
                </div>
              </div>
            </div>

            <div className="gvpcew-id-footer">
              <div className="gvpcew-footer-branch" style={{ fontSize: '14px' }}>GVPCEW</div>
              <div className="gvpcew-footer-center">
                <p className="gvpcew-footer-addr">Kommadi, Madhurawada, Visakhapatnam - 530048</p>
              </div>
              <div className="gvpcew-footer-college-code">AUTONOMOUS</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
