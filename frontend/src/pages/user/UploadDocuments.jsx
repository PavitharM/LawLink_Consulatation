import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, File, FileText, FileImage, FileVideo,
  FileBadge, CheckCircle, Trash2, AlertCircle,
  ArrowRight, ArrowLeft, X, Eye, PlusCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { uploadFile } from '../../services/upload.service';

/* ─── Document slot config ───────────────────────────────────── */
const DOC_SLOTS = [
  {
    id: 'id_proof',
    label: 'Government ID Proof',
    description: 'NIC, Passport, or Driving License',
    required: true,
    multi: false,
    accept: '.pdf,.jpg,.jpeg,.png',
    hint: 'PDF, JPG, PNG  ·  max 10 MB',
  },
  {
    id: 'complaint_doc',
    label: 'Complaint / FIR Document',
    description: 'Written complaint, FIR copy, or official incident report',
    required: true,
    multi: false,
    accept: '.pdf,.doc,.docx',
    hint: 'PDF, DOC, DOCX  ·  max 10 MB',
  },
  {
    id: 'evidence',
    label: 'Supporting Evidence',
    description: 'Photos, screenshots, videos, or any documents supporting your case — upload as many files as needed',
    required: false,
    multi: true,
    accept: '.pdf,.jpg,.jpeg,.png,.mp4,.mov,.zip,.doc,.docx',
    hint: 'PDF, JPG, PNG, MP4, ZIP, DOC  ·  max 25 MB each',
  },
  {
    id: 'agreement',
    label: 'Agreement / Contract',
    description: 'Sale deed, rental agreement, employment contract, loan document, etc.',
    required: false,
    multi: false,
    accept: '.pdf,.doc,.docx',
    hint: 'PDF, DOC, DOCX  ·  max 10 MB',
  },
  {
    id: 'court_orders',
    label: 'Previous Court Orders / Legal Notices',
    description: 'Earlier judgements, notices, summons, or any prior legal orders related to this matter',
    required: false,
    multi: true,
    accept: '.pdf,.jpg,.jpeg,.png',
    hint: 'PDF, JPG, PNG  ·  max 10 MB each',
  },
  {
    id: 'witness',
    label: 'Witness Statements',
    description: 'Signed statements or affidavits from witnesses (if available)',
    required: false,
    multi: true,
    accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
    hint: 'PDF, JPG, PNG, DOC, DOCX  ·  max 10 MB each',
  },
];

const MB = 1024 * 1024;
const MAX_SINGLE = 10 * MB;
const MAX_MULTI  = 25 * MB;

/* ─── File wrapper: avoids mutating the read-only File object ── */
function wrapFile(f, slotMulti) {
  return {
    raw:        f,
    name:       f.name,
    size:       f.size,
    type:       f.type,
    previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    id:         `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
    tooLarge:   f.size > (slotMulti ? MAX_MULTI : MAX_SINGLE),
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(2)} MB`;
}

function FileTypeIcon({ mime }) {
  if (!mime)                    return <File      size={18} className="text-on-surface-variant" />;
  if (mime.startsWith('image/')) return <FileImage size={18} className="text-blue-500" />;
  if (mime.startsWith('video/')) return <FileVideo size={18} className="text-purple-500" />;
  if (mime.includes('pdf'))      return <FileText  size={18} className="text-red-500" />;
  if (mime.includes('zip'))      return <FileBadge size={18} className="text-orange-500" />;
  return <FileText size={18} className="text-primary" />;
}

/* ─── Single file row ────────────────────────────────────────── */
function FileRow({ fw, onRemove, onPreview }) {
  return (
    <div className={`flex items-center gap-md rounded-xl px-md py-sm transition-colors
      ${fw.tooLarge ? 'bg-red-50 border border-red-200' : 'bg-surface-container-low'}`}
    >
      <div className="w-9 h-9 rounded-lg bg-white border border-surface-container-high flex items-center justify-center shrink-0">
        <FileTypeIcon mime={fw.type} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-on-surface truncate">{fw.name}</p>
        <p className={`text-body-sm ${fw.tooLarge ? 'text-red-500 font-medium' : 'text-on-surface-variant'}`}>
          {formatSize(fw.size)}{fw.tooLarge ? ' — exceeds size limit' : ''}
        </p>
      </div>

      {fw.previewUrl && !fw.tooLarge && (
        <button
          onClick={() => onPreview(fw)}
          className="p-xs rounded-lg text-primary hover:bg-primary/10 transition-colors shrink-0"
          title="Preview image"
        >
          <Eye size={15} />
        </button>
      )}

      <button
        onClick={onRemove}
        className="p-xs rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
        title="Remove file"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ─── Drop-zone ──────────────────────────────────────────────── */
function DropZone({ slotId, multi, accept, hint, dragging, setDragging, onFiles }) {
  const ref = useRef(null);

  const handle = useCallback((rawFiles) => {
    if (rawFiles && rawFiles.length) onFiles(Array.from(rawFiles));
  }, [onFiles]);

  return (
    <div
      onDragOver={(e)  => { e.preventDefault(); setDragging(slotId); }}
      onDragLeave={()  => setDragging(null)}
      onDrop={(e)      => { e.preventDefault(); setDragging(null); handle(e.dataTransfer.files); }}
      onClick={()      => ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-xl text-center cursor-pointer select-none
        transition-all duration-200
        ${dragging === slotId
          ? 'border-primary bg-primary/5 scale-[1.01] shadow-inner'
          : 'border-outline-variant hover:border-primary hover:bg-primary/[0.03]'}`}
    >
      <Upload size={28} className={`mx-auto mb-sm transition-colors ${dragging === slotId ? 'text-primary' : 'text-on-surface-variant'}`} />
      <p className="text-body-md font-medium text-on-surface mb-xs">
        Drag &amp; drop or{' '}
        <span className="text-primary font-semibold underline underline-offset-2">browse files</span>
      </p>
      <p className="text-body-sm text-on-surface-variant">{hint}</p>
      {multi && (
        <span className="inline-flex items-center gap-xs mt-sm text-label-sm text-primary bg-primary/10 px-md py-xs rounded-full">
          <PlusCircle size={12} /> Multiple files allowed
        </span>
      )}
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multi}
        onChange={(e) => { handle(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

/* ─── Image preview modal ────────────────────────────────────── */
function PreviewModal({ fw, onClose }) {
  if (!fw) return null;
  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-lg"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-lg py-md border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-sm min-w-0">
            <FileTypeIcon mime={fw.type} />
            <p className="text-body-md font-semibold text-on-surface truncate">{fw.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-surface-container-low p-lg">
          {fw.previewUrl ? (
            <img
              src={fw.previewUrl}
              alt={fw.name}
              className="max-w-full max-h-full rounded-xl object-contain shadow"
            />
          ) : (
            <div className="text-center py-3xl">
              <FileText size={64} className="mx-auto text-on-surface-variant mb-md opacity-30" />
              <p className="text-body-md text-on-surface-variant">Preview not available</p>
              <p className="text-body-sm text-on-surface-variant mt-xs opacity-60">{fw.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function UploadDocuments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId   = searchParams.get('case');        // e.g. CMP-001 when coming from ComplaintDetails
  const fromCase = searchParams.get('from');        // 'details' flag

  // uploads: { [slotId]: FileWrapper[] }
  const [uploads,  setUploads]  = useState({});
  const [dragging, setDragging] = useState(null);
  const [preview,  setPreview]  = useState(null);   // FileWrapper | null
  const [isUploading, setIsUploading] = useState(false);

  /* add files ─────────────────────────────────────────────────── */
  const addFiles = useCallback((slot, rawFiles) => {
    const wrapped = rawFiles.map((f) => wrapFile(f, slot.multi));
    setUploads((prev) => {
      const existing = prev[slot.id] || [];
      const merged   = slot.multi ? [...existing, ...wrapped] : [wrapped[0]];
      return { ...prev, [slot.id]: merged };
    });
  }, []);

  /* remove one file ───────────────────────────────────────────── */
  const removeFile = useCallback((slotId, fileId) => {
    setUploads((prev) => {
      const remaining = (prev[slotId] || []).filter((fw) => fw.id !== fileId);
      if (remaining.length === 0) {
        const next = { ...prev };
        delete next[slotId];
        return next;
      }
      return { ...prev, [slotId]: remaining };
    });
  }, []);

  /* derived stats ──────────────────────────────────────────────── */
  const allUploaded    = Object.values(uploads).flat();
  const validUploaded  = allUploaded.filter((fw) => !fw.tooLarge);
  const hasOversized   = allUploaded.some((fw) => fw.tooLarge);

  const requiredSlots     = DOC_SLOTS.filter((s) => s.required);
  const requiredDone      = requiredSlots.filter((s) => (uploads[s.id] || []).some((fw) => !fw.tooLarge)).length;
  const requiredComplete  = requiredDone === requiredSlots.length && !hasOversized;
  const optionalFilled    = DOC_SLOTS.filter((s) => !s.required && (uploads[s.id] || []).length > 0).length;
  const pct               = Math.round((requiredDone / requiredSlots.length) * 100);

  /* back navigation ───────────────────────────────────────────── */
  const handleBack = () => {
    if (fromCase === 'details' && caseId) navigate(`/user/complaints/${caseId}`);
    else navigate('/user/payment');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">
          {fromCase === 'details' ? `Add Documents — ${caseId}` : 'Upload Documents'}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Attach all relevant documents to support your legal case.
          Fields marked <span className="text-red-500 font-bold">*</span> are required.
        </p>
      </div>

      {/* ── Step / context banner ── */}
      <div className={`border rounded-xl p-lg mb-xl flex items-start gap-md
        ${fromCase === 'details'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-primary/5 border-primary/20'}`}
      >
        <AlertCircle size={20} className={`shrink-0 mt-xs ${fromCase === 'details' ? 'text-blue-600' : 'text-primary'}`} />
        <div>
          {fromCase === 'details' ? (
            <>
              <p className="text-label-md text-blue-700">Adding more documents to case <strong>{caseId}</strong></p>
              <p className="text-body-sm text-blue-600 mt-xs">
                These documents will be attached to your existing case and shared with your assigned lawyer.
              </p>
            </>
          ) : (
            <>
              <p className="text-label-md text-primary">Step 3 of 4 — Document Upload</p>
              <p className="text-body-sm text-on-surface-variant mt-xs">
                Upload at least the required documents to proceed. Adding optional docs strengthens your case.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Slots ── */}
      <div className="space-y-lg mb-xl">
        {DOC_SLOTS.map((slot) => {
          const slotFiles = uploads[slot.id] || [];
          const hasFiles  = slotFiles.length > 0;
          const allValid  = slotFiles.every((fw) => !fw.tooLarge);
          const anyValid  = slotFiles.some((fw)  => !fw.tooLarge);

          return (
            <div
              key={slot.id}
              className={`bg-white border rounded-xl p-xl shadow-card transition-all duration-200
                ${hasFiles
                  ? anyValid
                    ? slot.required ? 'border-green-300' : 'border-primary/30'
                    : 'border-red-300'
                  : 'border-surface-container-high'}`}
            >
              {/* slot header */}
              <div className="flex items-start justify-between mb-md gap-md">
                <div className="min-w-0">
                  <h3 className="text-headline-sm text-on-surface flex items-center gap-xs flex-wrap">
                    {slot.label}
                    {slot.required
                      ? <span className="text-red-500">*</span>
                      : <span className="text-label-sm text-on-surface-variant font-normal">(Optional)</span>
                    }
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-xs">{slot.description}</p>
                </div>

                {hasFiles && (
                  <div className={`flex items-center gap-xs text-label-sm shrink-0
                    ${allValid ? 'text-green-600' : 'text-red-500'}`}
                  >
                    <CheckCircle size={14} />
                    {slotFiles.length} file{slotFiles.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* uploaded file rows */}
              {hasFiles && (
                <div className="space-y-sm mb-md">
                  {slotFiles.map((fw) => (
                    <FileRow
                      key={fw.id}
                      fw={fw}
                      onRemove={() => removeFile(slot.id, fw.id)}
                      onPreview={setPreview}
                    />
                  ))}
                </div>
              )}

              {/* drop zone — always shown for multi; shown for single only when empty */}
              {(!hasFiles || slot.multi) && (
                <DropZone
                  slotId={slot.id}
                  multi={slot.multi}
                  accept={slot.accept}
                  hint={slot.hint}
                  dragging={dragging}
                  setDragging={setDragging}
                  onFiles={(rawFiles) => addFiles(slot, rawFiles)}
                />
              )}

              {/* replace option for single-file slots that already have a file */}
              {hasFiles && !slot.multi && (
                <button
                  onClick={() => removeFile(slot.id, slotFiles[0].id)}
                  className="mt-sm flex items-center gap-xs text-body-sm text-on-surface-variant hover:text-red-500 transition-colors"
                >
                  <X size={13} /> Replace file
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Summary card ── */}
      <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card mb-xl">
        <h3 className="text-headline-sm text-on-surface mb-md">Upload Summary</h3>

        <div className="grid grid-cols-3 gap-md mb-lg">
          <div className="text-center bg-surface-container-low rounded-xl p-lg">
            <p className="text-display font-bold text-primary">{validUploaded.length}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">Valid Files</p>
          </div>
          <div className="text-center bg-surface-container-low rounded-xl p-lg">
            <p className="text-display font-bold text-green-600">{requiredDone}/{requiredSlots.length}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">Required Done</p>
          </div>
          <div className="text-center bg-surface-container-low rounded-xl p-lg">
            <p className="text-display font-bold text-blue-600">{optionalFilled}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">Optional Added</p>
          </div>
        </div>

        {/* progress bar */}
        <div>
          <div className="flex justify-between text-body-sm text-on-surface-variant mb-xs">
            <span>Required documents</span>
            <span className={`font-semibold ${pct === 100 ? 'text-green-600' : 'text-primary'}`}>{pct}%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* oversized warning */}
        {hasOversized && (
          <div className="mt-md flex items-start gap-sm bg-red-50 border border-red-200 rounded-lg px-md py-sm">
            <AlertCircle size={15} className="text-red-500 shrink-0 mt-xs" />
            <p className="text-body-sm text-red-600">
              Some files exceed the size limit. Please remove or replace them before proceeding.
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation buttons ── */}
      <div className="flex gap-md justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-sm px-xl py-md rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors"
        >
          <ArrowLeft size={18} />
          {fromCase === 'details' ? `Back to ${caseId}` : 'Back'}
        </button>

        <button
          disabled={!requiredComplete || isUploading}
          onClick={async () => {
            if (fromCase === 'details' && caseId) {
              setIsUploading(true);
              try {
                const allUploadPromises = [];
                for (const [slotId, fileWrappers] of Object.entries(uploads)) {
                  for (const fw of fileWrappers) {
                    if (!fw.tooLarge && fw.raw) {
                      allUploadPromises.push(uploadFile(caseId, slotId, fw.raw));
                    }
                  }
                }
                if (allUploadPromises.length > 0) {
                  await Promise.allSettled(allUploadPromises);
                }
                navigate(`/user/complaints/${caseId}`);
              } catch (err) {
                console.error('Upload failed', err);
              } finally {
                setIsUploading(false);
              }
            } else {
              navigate('/user/review');
            }
          }}
          className={`flex items-center gap-sm px-xl py-md rounded-xl text-body-md font-semibold transition-all
            ${requiredComplete
              ? 'bg-primary text-on-primary hover:opacity-90 shadow-md'
              : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'}`}
        >
          {isUploading ? 'Uploading...' : (fromCase === 'details' ? 'Save Documents' : 'Review & Submit')}
          {!isUploading && <ArrowRight size={18} />}
        </button>
      </div>

      {/* ── Image preview modal ── */}
      <PreviewModal fw={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
