import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit3, Save, Printer, RotateCcw, Check, Sparkles, User, Upload } from 'lucide-react';

export function DigitalIdCard({ student }) {
  const STORAGE_KEY = 'gvpcew_digital_id';
  const fileInputRef = useRef(null);

  const defaultDetails = {
    name: student?.profile?.full_name || student?.full_name || 'PONNAGANTI SRAVANI',
    course: 'B.Tech',
    batch: '2024-2028',
    section: student?.profile?.section || student?.section || 'A',
    branch: 'CSE',
    rollNo: student?.profile?.roll_number || student?.roll_number || '324103210170',
    contact: '0891-2739144,2526639',
    address: 'Madhurawada, Visakhapatnam- 48',
    photo: student?.profile?.photo_url || ''
  };

  const [details, setDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultDetails, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return defaultDetails;
  });

  const [isEditing, setIsEditing] = useState(false);
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
        alert('Please choose a photo smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setDetails(prev => ({ ...prev, photo: reader.result }));
        showNotice('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, val) => {
    setDetails(prev => ({ ...prev, [field]: val }));
  };

  const handleReset = () => {
    if (window.confirm('Reset ID Card details back to default?')) {
      setDetails(defaultDetails);
      setIsEditing(false);
      showNotice('ID card details reset to default.');
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
            title="Upload new passport photo from your computer/device"
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
            <span>{isEditing ? 'Done Editing' : 'Edit Names / Sections'}</span>
          </button>
        </div>

        <div className="id-toolbar-right">
          <button
            type="button"
            className="id-tool-btn print-card-btn"
            onClick={() => window.print()}
            title="Print or Save ID card as PDF"
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
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="calendar-notice-banner no-print">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Edit Form Panel when editing mode is active */}
      {isEditing && (
        <div className="id-edit-panel no-print">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Edit Digital ID Card Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Student Full Name</label>
              <input
                type="text"
                className="id-form-input"
                value={details.name}
                onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
                placeholder="e.g. PONNAGANTI SRAVANI"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Roll Number</label>
              <input
                type="text"
                className="id-form-input"
                value={details.rollNo}
                onChange={(e) => handleChange('rollNo', e.target.value)}
                placeholder="e.g. 324103210170"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Course</label>
              <input
                type="text"
                className="id-form-input"
                value={details.course}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="e.g. B.Tech"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Branch Code</label>
              <select
                className="id-form-input"
                value={details.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
              >
                <option value="CSE">CSE (Computer Science & Engineering)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="CSM">CSM (CSE - AIML)</option>
                <option value="ECE">ECE (Electronics & Communication)</option>
                <option value="EEE">EEE (Electrical & Electronics)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Section</label>
              <input
                type="text"
                className="id-form-input"
                value={details.section}
                onChange={(e) => handleChange('section', e.target.value)}
                placeholder="e.g. A, B, CSE-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Batch / Academic Years</label>
              <input
                type="text"
                className="id-form-input"
                value={details.batch}
                onChange={(e) => handleChange('batch', e.target.value)}
                placeholder="e.g. 2024-2028"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="id-save-btn flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded hover:bg-emerald-700 cursor-pointer"
              onClick={() => { setIsEditing(false); showNotice('ID card details saved!'); }}
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Official GVPCEW ID Card Physical Replica */}
      <div className="id-card-stage">
        <div className="gvpcew-physical-card">
          {/* Top Cyan / Turquoise Header Bar */}
          <div className="gvpcew-id-header">
            {/* Left Circular Emblem */}
            <div className="gvpcew-emblem-badge">
              <div className="gvpcew-emblem-inner">
                <div className="gvpcew-emblem-art">
                  <div className="gvpcew-goddess-glow"></div>
                  <span className="gvpcew-telugu-arc">గాయత్రీ విద్యా పరిషత్</span>
                </div>
              </div>
              <span className="gvpcew-emblem-sub">Autonomous</span>
            </div>

            {/* Header Text Block */}
            <div className="gvpcew-header-titles">
              <h1 className="gvpcew-title-primary">GAYATRI VIDYA PARISHAD</h1>
              <h2 className="gvpcew-title-secondary">COLLEGE OF ENGINEERING FOR WOMEN (Autonomous)</h2>
              <p className="gvpcew-title-affiliation">(Affiliated to AU, Visakhapatnam)</p>
            </div>
          </div>

          {/* Card Body Area */}
          <div className="gvpcew-id-body">
            {/* Left Student Photo Frame */}
            <div
              className="gvpcew-photo-frame"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change / upload student photo"
            >
              {details.photo ? (
                <img src={details.photo} alt={details.name} className="gvpcew-photo-img" />
              ) : (
                <div className="gvpcew-photo-placeholder">
                  <User className="w-16 h-16 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-bold mt-1">Upload Photo</span>
                </div>
              )}
              <div className="gvpcew-photo-overlay no-print">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-bold text-white uppercase mt-0.5">Change</span>
              </div>
            </div>

            {/* Right Student Details with Watermark */}
            <div className="gvpcew-details-column">
              {/* Subtle background watermark */}
              <div className="gvpcew-card-watermark"></div>

              {/* Student Fields */}
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
                  <span className="gvpcew-roll-label">Roll No:</span>
                  <span className="gvpcew-roll-val">{details.rollNo}</span>
                </div>
              </div>

              {/* Principal Signature on the bottom right */}
              <div className="gvpcew-signature-box">
                <div className="gvpcew-sig-ink">
                  <svg viewBox="0 0 100 40" className="gvpcew-sig-svg">
                    <path
                      d="M 5 28 C 15 10, 25 35, 35 15 C 45 5, 48 30, 55 18 C 65 8, 70 32, 85 12 C 90 20, 95 10, 98 25 M 10 32 L 95 28"
                      stroke="#15803d"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="gvpcew-sig-text">PRINCIPAL</span>
              </div>
            </div>
          </div>

          {/* Bottom Cyan / Turquoise Footer Bar */}
          <div className="gvpcew-id-footer">
            <div className="gvpcew-footer-branch">
              {details.branch}
            </div>

            <div className="gvpcew-footer-center">
              <p className="gvpcew-footer-addr">{details.address}</p>
              <p className="gvpcew-footer-contact">Contact : {details.contact}</p>
            </div>

            <div className="gvpcew-footer-college-code">
              GVPW
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
