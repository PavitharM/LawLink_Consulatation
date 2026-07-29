import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ArrowRight, AlertCircle, ChevronRight, Upload,
  File, FileImage, FileVideo, FileBadge, CheckCircle, Trash2,
  Eye, X, PlusCircle, Check, Loader2
} from 'lucide-react';
import { createComplaint } from '../../services/complaint.service';
import { uploadFile } from '../../services/upload.service';

/* ─── Categories ─────────────────────────────────────────────── */
const categories = [
  { value: 'civil',     label: '🏠 Civil Law',      desc: 'Property, contracts, torts' },
  { value: 'criminal',  label: '⚖️ Criminal Law',   desc: 'FIR, bail, defense' },
  { value: 'family',    label: '👨‍👩‍👧 Family Law',  desc: 'Divorce, custody, adoption' },
  { value: 'labour',    label: '💼 Labour Law',      desc: 'Employment, termination, wages' },
  { value: 'consumer',  label: '🛒 Consumer Law',    desc: 'Fraud, product defects' },
  { value: 'property',  label: '🏗️ Property Law',   desc: 'Ownership, disputes, registry' },
  { value: 'corporate', label: '🏢 Corporate Law',   desc: 'Business, contracts, IP' },
  { value: 'other',     label: '📋 Other',           desc: 'Any other legal matter' },
];

/* ─── Document slot config ───────────────────────────────────── */
const DOC_SLOTS = [
  { id: 'id_proof',      label: 'Government ID Proof',            required: true,  multi: false, accept: '.pdf,.jpg,.jpeg,.png',             hint: 'PDF, JPG, PNG · max 10 MB', desc: 'NIC, Passport, or Driving License' },
  { id: 'complaint_doc', label: 'Complaint / FIR Document',       required: true,  multi: false, accept: '.pdf,.doc,.docx',                  hint: 'PDF, DOC, DOCX · max 10 MB', desc: 'Written complaint or FIR copy' },
  { id: 'evidence',      label: 'Supporting Evidence',            required: false, multi: true,  accept: '.pdf,.jpg,.jpeg,.png,.mp4,.zip,.doc,.docx', hint: 'PDF, JPG, PNG, MP4, ZIP · max 25 MB', desc: 'Photos, screenshots, videos (multiple allowed)' },
  { id: 'agreement',     label: 'Agreement / Contract',           required: false, multi: false, accept: '.pdf,.doc,.docx',                  hint: 'PDF, DOC, DOCX · max 10 MB', desc: 'Sale deed, rental or employment contract' },
  { id: 'court_orders',  label: 'Previous Court Orders / Notices',required: false, multi: true,  accept: '.pdf,.jpg,.jpeg,.png',             hint: 'PDF, JPG, PNG · max 10 MB', desc: 'Earlier judgements or legal notices' },
];

const MB = 1024 * 1024;
const MAX_SINGLE = 10 * MB;
const MAX_MULTI  = 25 * MB;

/* ─── File wrapper ───────────────────────────────────────────── */
function wrapFile(f, isMulti) {
  return {
    raw:        f,
    id:         `${f.name}-${f.size}-${Math.random()}`,
    name:       f.name,
    size:       f.size,
    type:       f.type,
    tooLarge:   f.size > (isMulti ? MAX_MULTI : MAX_SINGLE),
    previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
  };
}

function fmtSize(b) {
  if (b < 1024)     return `${b} B`;
  if (b < MB)       return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / MB).toFixed(2)} MB`;
}

function FileIcon({ mime }) {
  if (!mime)                    return <File      size={16} className="text-on-surface-variant" />;
  if (mime.startsWith('image/')) return <FileImage size={16} className="text-blue-500" />;
  if (mime.startsWith('video/')) return <FileVideo size={16} className="text-purple-500" />;
  if (mime.includes('pdf'))      return <FileText  size={16} className="text-red-500" />;
  if (mime.includes('zip'))      return <FileBadge size={16} className="text-orange-500" />;
  return <FileText size={16} className="text-primary" />;
}

/* ─── File row ───────────────────────────────────────────────── */
function FileRow({ fw, onRemove, onPreview }) {
  return (
    <div className={`flex items-center gap-sm rounded-lg px-sm py-xs transition-colors
      ${fw.tooLarge ? 'bg-red-50 border border-red-200' : 'bg-surface-container-low'}`}>
      <div className="w-7 h-7 rounded bg-white border border-surface-container-high flex items-center justify-center shrink-0">
        <FileIcon mime={fw.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-on-surface truncate">{fw.name}</p>
        <p className={`text-body-sm ${fw.tooLarge ? 'text-red-500' : 'text-on-surface-variant'}`}>
          {fmtSize(fw.size)}{fw.tooLarge ? ' — too large' : ''}
        </p>
      </div>
      {fw.previewUrl && !fw.tooLarge && (
        <button onClick={() => onPreview(fw)} className="p-xs rounded text-primary hover:bg-primary/10 transition-colors">
          <Eye size={13} />
        </button>
      )}
      <button onClick={onRemove} className="p-xs rounded text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* ─── Drop zone ──────────────────────────────────────────────── */
function DropZone({ slotId, multi, accept, hint, dragging, setDragging, onFiles }) {
  const ref = useRef(null);
  const handle = useCallback((list) => {
    if (list?.length) onFiles(Array.from(list));
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(slotId); }}
      onDragLeave={() => setDragging(null)}
      onDrop={(e) => { e.preventDefault(); setDragging(null); handle(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-lg text-center cursor-pointer transition-all duration-200
        ${dragging === slotId ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant hover:border-primary hover:bg-primary/[0.02]'}`}
    >
      <Upload size={22} className={`mx-auto mb-xs transition-colors ${dragging === slotId ? 'text-primary' : 'text-on-surface-variant'}`} />
      <p className="text-body-sm font-medium text-on-surface">
        Drop files or <span className="text-primary underline">browse</span>
      </p>
      <p className="text-body-sm text-on-surface-variant mt-xs">{hint}</p>
      {multi && <p className="text-label-sm text-primary mt-xs">Multiple files allowed</p>}
      <input ref={ref} type="file" className="hidden" accept={accept} multiple={multi}
        onChange={(e) => { handle(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

/* ─── Image preview modal ────────────────────────────────────── */
function PreviewModal({ fw, onClose }) {
  if (!fw) return null;
  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-lg" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-lg py-md border-b border-surface-container-high">
          <p className="text-body-md font-semibold text-on-surface truncate">{fw.name}</p>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-surface-container-low p-lg">
          {fw.previewUrl
            ? <img src={fw.previewUrl} alt={fw.name} className="max-w-full max-h-full rounded-xl object-contain" />
            : <div className="text-center"><FileText size={48} className="mx-auto text-on-surface-variant opacity-30 mb-md" /><p className="text-body-sm text-on-surface-variant">Preview not available</p></div>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Step Indicator ─────────────────────────────────────────── */
const STEPS = ['Basic Info', 'Case Details', 'Documents', 'Review'];

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-sm mb-xl">
      {STEPS.map((label, i) => {
        const s = i + 1;
        const done    = step > s;
        const current = step === s;
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-sm ${current || done ? 'text-primary' : 'text-on-surface-variant'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold transition-all
                ${done    ? 'bg-primary text-on-primary'
                : current ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                :           'bg-surface-container-high text-on-surface-variant'}`}>
                {done ? <Check size={14} /> : s}
              </div>
              <span className="text-label-sm font-semibold hidden sm:block">{label}</span>
            </div>
            {s < STEPS.length && (
              <div className={`flex-1 h-0.5 transition-colors ${done ? 'bg-primary' : 'bg-surface-container-high'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: '', priority: 'MEDIUM',
    description: '', incidentDate: '', location: '',
    opposingParty: '', additionalInfo: '',
  });

  // Document uploads — same pattern as UploadDocuments.jsx
  const [uploads,  setUploads]  = useState({});
  const [dragging, setDragging] = useState(null);
  const [preview,  setPreview]  = useState(null);

  const update = (f, v) => setFormData(prev => ({ ...prev, [f]: v }));

  /* file handlers */
  const addFiles = useCallback((slot, rawFiles) => {
    const wrapped = rawFiles.map(f => wrapFile(f, slot.multi));
    setUploads(prev => {
      const existing = prev[slot.id] || [];
      return { ...prev, [slot.id]: slot.multi ? [...existing, ...wrapped] : [wrapped[0]] };
    });
  }, []);

  const removeFile = useCallback((slotId, fileId) => {
    setUploads(prev => {
      const remaining = (prev[slotId] || []).filter(fw => fw.id !== fileId);
      if (!remaining.length) { const n = { ...prev }; delete n[slotId]; return n; }
      return { ...prev, [slotId]: remaining };
    });
  }, []);

  /* derived */
  const allUploaded     = Object.values(uploads).flat();
  const hasOversized    = allUploaded.some(fw => fw.tooLarge);
  const requiredSlots   = DOC_SLOTS.filter(s => s.required);
  const requiredDone    = requiredSlots.filter(s => (uploads[s.id] || []).some(fw => !fw.tooLarge)).length;
  const docsComplete    = requiredDone === requiredSlots.length && !hasOversized;
  const totalValidFiles = allUploaded.filter(fw => !fw.tooLarge).length;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const payload = { ...formData };
      
      if (payload.title.length < 5) {
        alert("Title must be at least 5 characters.");
        setSubmitting(false);
        return;
      }
      if (payload.description.length < 10) {
        alert("Description must be at least 10 characters.");
        setSubmitting(false);
        return;
      }
      if (!payload.incidentDate) delete payload.incidentDate;
      else payload.incidentDate = new Date(payload.incidentDate).toISOString();
      
      if (!payload.location) delete payload.location;
      if (!payload.opposingParty) delete payload.opposingParty;
      if (!payload.additionalInfo) delete payload.additionalInfo;
      
      const response = await createComplaint(payload);
      if (response.success) {
        const complaintId = response.data.id;
        
        // Upload documents
        const allUploadPromises = [];
        for (const [slotId, fileWrappers] of Object.entries(uploads)) {
          for (const fw of fileWrappers) {
            if (!fw.tooLarge && fw.raw) {
              allUploadPromises.push(uploadFile(complaintId, slotId, fw.raw));
            }
          }
        }
        
        if (allUploadPromises.length > 0) {
          await Promise.allSettled(allUploadPromises);
        }

        navigate(`/user/packages?complaintId=${complaintId}`);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Submit New Complaint</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Provide details about your legal issue and attach supporting documents.
        </p>
      </div>

      <StepBar step={step} />

      <div className="bg-white border border-surface-container-high rounded-2xl shadow-card overflow-hidden">

        {/* ══ STEP 1: Basic Info ════════════════════════════════ */}
        {step === 1 && (
          <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="p-xl space-y-lg">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Complaint Title *</label>
              <input
                type="text"
                placeholder="E.g., Property Boundary Dispute with Neighbor"
                value={formData.title}
                onChange={e => update('title', e.target.value)}
                required
                minLength={5}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <p className="text-body-sm text-on-surface-variant mt-xs">Be specific. Good titles help lawyers identify your issue faster.</p>
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-md">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
                {categories.map(c => (
                  <div
                    key={c.value}
                    onClick={() => update('category', c.value)}
                    className={`p-md rounded-xl border-2 cursor-pointer transition-all text-center
                      ${formData.category === c.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-surface-container-high hover:border-primary/40 hover:bg-surface-container-low'}`}
                  >
                    <div className="text-xl mb-xs">{c.label.split(' ')[0]}</div>
                    <p className="text-label-sm font-semibold text-on-surface">{c.label.split(' ').slice(1).join(' ')}</p>
                    <p className="text-body-sm text-on-surface-variant mt-xs">{c.desc}</p>
                    {formData.category === c.value && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mx-auto mt-sm">
                        <Check size={10} className="text-on-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Priority Level</label>
              <div className="flex gap-sm">
                {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                  <button key={p} type="button" onClick={() => update('priority', p)}
                    className={`flex-1 py-sm rounded-xl border-2 text-label-sm font-semibold transition-all
                      ${formData.priority === p
                        ? p === 'HIGH'   ? 'border-red-500 bg-red-50 text-red-600'
                        : p === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                        :                  'border-green-500 bg-green-50 text-green-600'
                        : 'border-surface-container-high text-on-surface-variant hover:border-outline-variant'}`}>
                    {p === 'LOW' ? 'Low' : p === 'MEDIUM' ? 'Medium' : 'High'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-md">
              <button type="submit" disabled={!formData.title || formData.title.length < 5 || !formData.category}
                className={`flex items-center gap-sm px-xl py-sm rounded-xl text-body-md font-semibold transition-all
                  ${(formData.title && formData.title.length >= 5 && formData.category) ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
                Next: Case Details <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ══ STEP 2: Case Details ═════════════════════════════ */}
        {step === 2 && (
          <form onSubmit={e => { e.preventDefault(); setStep(3); }} className="p-xl space-y-lg">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Detailed Description *</label>
              <textarea
                rows={6}
                placeholder="Describe your legal issue in full detail. Include what happened, when, who was involved, and what outcome you're seeking..."
                value={formData.description}
                onChange={e => update('description', e.target.value)}
                required
                minLength={10}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              />
              <p className={`text-body-sm mt-xs ${formData.description.length < 200 ? 'text-on-surface-variant' : 'text-green-600'}`}>
                {formData.description.length} / 200+ characters recommended
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-xs">Date of Incident</label>
                <input type="date" value={formData.incidentDate} onChange={e => update('incidentDate', e.target.value)}
                  className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-xs">Location of Incident</label>
                <input type="text" placeholder="e.g., Colombo, Western Province" value={formData.location} onChange={e => update('location', e.target.value)}
                  className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Opposing Party / Defendant Name</label>
              <input type="text" placeholder="Name of person, organization, or company (if applicable)" value={formData.opposingParty} onChange={e => update('opposingParty', e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all" />
            </div>

            <div>
              <label className="text-label-sm text-on-surface-variant block mb-xs">Additional Information</label>
              <textarea rows={3} placeholder="Any previous legal steps taken, police complaint numbers, FIR details, etc." value={formData.additionalInfo} onChange={e => update('additionalInfo', e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all resize-none" />
            </div>

            <div className="flex justify-between pt-md">
              <button type="button" onClick={() => setStep(1)} className="px-xl py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Back</button>
              <button type="submit" disabled={!formData.description || formData.description.length < 10}
                className={`flex items-center gap-sm px-xl py-sm rounded-xl text-body-md font-semibold transition-all
                  ${(formData.description && formData.description.length >= 10) ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
                Next: Upload Documents <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* ══ STEP 3: Document Upload ═══════════════════════════ */}
        {step === 3 && (
          <div className="p-xl space-y-lg">
            <div className="flex items-start gap-sm bg-primary/5 border border-primary/20 rounded-xl p-md">
              <AlertCircle size={18} className="text-primary shrink-0 mt-xs" />
              <div>
                <p className="text-label-md text-primary">Attach Supporting Documents</p>
                <p className="text-body-sm text-on-surface-variant mt-xs">
                  Upload your ID and complaint document (required). Add evidence or contracts to strengthen your case.
                </p>
              </div>
            </div>

            {/* Summary bar */}
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-md">
              <div className="flex items-center gap-lg text-body-sm">
                <span className="text-on-surface-variant">Required: <strong className={`${requiredDone === requiredSlots.length ? 'text-green-600' : 'text-primary'}`}>{requiredDone}/{requiredSlots.length}</strong></span>
                <span className="text-on-surface-variant">Total files: <strong className="text-on-surface">{totalValidFiles}</strong></span>
              </div>
              {docsComplete && (
                <div className="flex items-center gap-xs text-green-600 text-label-sm">
                  <CheckCircle size={14} /> All required docs added
                </div>
              )}
            </div>

            {/* Slots */}
            <div className="space-y-md">
              {DOC_SLOTS.map(slot => {
                const slotFiles = uploads[slot.id] || [];
                const hasFiles  = slotFiles.length > 0;
                const anyValid  = slotFiles.some(fw => !fw.tooLarge);

                return (
                  <div key={slot.id} className={`border rounded-xl p-lg transition-all duration-200
                    ${hasFiles && anyValid
                      ? slot.required ? 'border-green-300 bg-green-50/30' : 'border-primary/30 bg-primary/[0.02]'
                      : hasFiles ? 'border-red-300' : 'border-surface-container-high'}`}>

                    <div className="flex items-start justify-between mb-sm gap-md">
                      <div>
                        <h4 className="text-body-md font-semibold text-on-surface flex items-center gap-xs">
                          {slot.label}
                          {slot.required ? <span className="text-red-500 text-xs">*</span>
                            : <span className="text-label-sm font-normal text-on-surface-variant">(Optional)</span>}
                        </h4>
                        <p className="text-body-sm text-on-surface-variant">{slot.desc}</p>
                      </div>
                      {hasFiles && anyValid && (
                        <div className="flex items-center gap-xs text-green-600 text-label-sm shrink-0">
                          <CheckCircle size={13} /> {slotFiles.filter(f => !f.tooLarge).length} file{slotFiles.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* file rows */}
                    {hasFiles && (
                      <div className="space-y-xs mb-sm">
                        {slotFiles.map(fw => (
                          <FileRow key={fw.id} fw={fw}
                            onRemove={() => removeFile(slot.id, fw.id)}
                            onPreview={setPreview} />
                        ))}
                      </div>
                    )}

                    {/* drop zone */}
                    {(!hasFiles || slot.multi) && (
                      <DropZone slotId={slot.id} multi={slot.multi} accept={slot.accept} hint={slot.hint}
                        dragging={dragging} setDragging={setDragging}
                        onFiles={rawFiles => addFiles(slot, rawFiles)} />
                    )}

                    {/* replace for single slots */}
                    {hasFiles && !slot.multi && (
                      <button onClick={() => removeFile(slot.id, slotFiles[0].id)}
                        className="mt-xs flex items-center gap-xs text-body-sm text-on-surface-variant hover:text-red-500 transition-colors">
                        <X size={12} /> Replace file
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {hasOversized && (
              <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-xl px-md py-sm">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-body-sm text-red-600">Remove oversized files before proceeding.</p>
              </div>
            )}

            <div className="flex justify-between pt-md">
              <button onClick={() => setStep(2)} className="px-xl py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Back</button>
              <button onClick={() => setStep(4)} disabled={!docsComplete}
                className={`flex items-center gap-sm px-xl py-sm rounded-xl text-body-md font-semibold transition-all
                  ${docsComplete ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'}`}>
                Next: Review <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Review ═══════════════════════════════════ */}
        {step === 4 && (
          <div className="p-xl space-y-lg">
            <h2 className="text-headline-sm text-on-surface">Review Your Complaint</h2>

            {/* Case summary */}
            <div className="bg-surface-container-low rounded-xl p-lg space-y-md">
              {[
                { label: 'Title',          value: formData.title },
                { label: 'Category',       value: categories.find(c => c.value === formData.category)?.label || formData.category },
                { label: 'Priority',       value: formData.priority },
                { label: 'Incident Date',  value: formData.incidentDate  || 'Not specified' },
                { label: 'Location',       value: formData.location      || 'Not specified' },
                { label: 'Opposing Party', value: formData.opposingParty || 'Not specified' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-xs">
                  <span className="text-label-sm text-on-surface-variant min-w-[160px]">{item.label}</span>
                  <span className="text-body-md text-on-surface font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-label-sm text-on-surface-variant mb-xs">Description</p>
              <div className="bg-surface-container-low rounded-xl p-md">
                <p className="text-body-md text-on-surface leading-relaxed">{formData.description}</p>
              </div>
            </div>

            {/* Uploaded docs summary */}
            <div>
              <p className="text-label-sm text-on-surface-variant mb-sm">Uploaded Documents ({totalValidFiles} files)</p>
              <div className="space-y-xs">
                {DOC_SLOTS.map(slot => {
                  const valid = (uploads[slot.id] || []).filter(fw => !fw.tooLarge);
                  if (!valid.length) return null;
                  return (
                    <div key={slot.id} className="bg-surface-container-low rounded-xl p-md">
                      <p className="text-label-sm text-on-surface-variant mb-xs">{slot.label}</p>
                      {valid.map(fw => (
                        <div key={fw.id} className="flex items-center gap-sm">
                          <FileIcon mime={fw.type} />
                          <span className="text-body-sm text-on-surface">{fw.name}</span>
                          <span className="text-body-sm text-on-surface-variant ml-auto">{fmtSize(fw.size)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-md flex items-start gap-sm">
              <FileText size={18} className="text-yellow-600 shrink-0 mt-xs" />
              <div>
                <p className="text-label-sm text-yellow-700 font-semibold">Next: Choose a Legal Package</p>
                <p className="text-body-sm text-yellow-600">After submitting, you'll select a package to complete your case registration.</p>
              </div>
            </div>

            <div className="flex justify-between pt-md">
              <button onClick={() => setStep(3)} className="px-xl py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Submit & Choose Package</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <PreviewModal fw={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default SubmitComplaint;
