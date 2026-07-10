import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, Clock, CheckCircle, XCircle, AlertTriangle,
  Filter, UserPlus, ChevronDown, ChevronUp, MessageSquare,
  Calendar, FileText, User, X, Check, ArrowRight, Briefcase,
  Scale, Loader2
} from 'lucide-react';
import { getComplaints, updateComplaintStatus, assignLawyer } from '../../services/complaint.service';
import { getLawyers } from '../../services/user.service';



/* ─── Config ─────────────────────────────────────────────────── */
const STATUS_CFG = {
  'Open':      { pill: 'bg-blue-100 text-blue-700',    icon: Clock,          dot: 'bg-blue-500'   },
  'In Review': { pill: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle,  dot: 'bg-yellow-500' },
  'Resolved':  { pill: 'bg-green-100 text-green-700',  icon: CheckCircle,   dot: 'bg-green-500'  },
  'Closed':    { pill: 'bg-gray-100 text-gray-600',    icon: XCircle,       dot: 'bg-gray-400'   },
};

const PRIORITY_CFG = {
  HIGH:   'bg-red-50 text-red-600 border-red-200',
  MEDIUM: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  LOW:    'bg-green-50 text-green-600 border-green-200',
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Open'];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-xs text-label-sm px-sm py-xs rounded-full font-semibold ${cfg.pill}`}>
      <Icon size={11} /> {status}
    </span>
  );
}

/* ─── Assign Modal ───────────────────────────────────────────── */
function AssignModal({ complaint, lawyersList, onAssign, onClose }) {
  const [selected, setSelected] = useState(complaint.assignedToObj?.id || '');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-lg" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-xl">
          <h3 className="text-headline-sm text-on-surface">Assign Lawyer</h3>
          <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant"><X size={18} /></button>
        </div>
        <p className="text-body-sm text-on-surface-variant mb-lg">
          Assigning lawyer for: <span className="font-semibold text-on-surface">{complaint.id} — {complaint.title}</span>
        </p>
        <div className="space-y-sm mb-xl">
          {lawyersList.map(lawyer => (
            <div key={lawyer.id} onClick={() => setSelected(lawyer.id)}
              className={`flex items-center justify-between p-md rounded-xl border-2 cursor-pointer transition-all
                ${selected === lawyer.id ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/30'}`}>
              <div className="flex items-center gap-md">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-label-sm font-bold text-primary uppercase">
                  {lawyer.name ? lawyer.name.charAt(0) : 'L'}
                </div>
                <span className="text-body-md text-on-surface font-medium">{lawyer.name}</span>
              </div>
              {selected === lawyer.id && <Check size={16} className="text-primary" />}
            </div>
          ))}
        </div>
        <div className="flex gap-sm justify-end">
          <button onClick={onClose} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Cancel</button>
          <button
            disabled={!selected}
            onClick={() => { onAssign(complaint.id, selected); onClose(); }}
            className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Scale size={16} /> Assign Lawyer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Modal ───────────────────────────────────────────── */
function DetailModal({ c, lawyersList, onClose, onStatusChange, onAssign }) {
  const [note, setNote] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-lg" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* header */}
          <div className="flex items-center justify-between p-xl border-b border-surface-container-high sticky top-0 bg-white">
            <div className="flex items-center gap-sm flex-wrap">
              <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id}</span>
              <StatusPill status={c.status} />
              <span className={`text-label-sm px-sm py-xs rounded-full border font-semibold ${PRIORITY_CFG[c.priority]}`}>{c.priority}</span>
            </div>
            <button onClick={onClose} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant"><X size={18} /></button>
          </div>

          <div className="p-xl space-y-lg">
            <h2 className="text-headline-sm text-on-surface">{c.title}</h2>

            {/* meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-md bg-surface-container-low rounded-xl p-lg">
              {[
                { label: 'Filed By',    value: c.user },
                { label: 'Email',       value: c.userEmail },
                { label: 'Phone',       value: c.userPhone },
                { label: 'Category',    value: c.category },
                { label: 'Filed On',    value: c.date },
                { label: 'Package',     value: c.package },
                { label: 'Hearing',     value: c.hearing },
                { label: 'Assigned To', value: c.assignedTo || '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                  <p className="text-body-md text-on-surface font-medium mt-xs">{item.value}</p>
                </div>
              ))}
            </div>

            {/* description */}
            <div>
              <p className="text-label-sm text-on-surface-variant mb-sm">Case Description</p>
              <p className="text-body-md text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-md">{c.description}</p>
            </div>

            {/* change status */}
            <div>
              <p className="text-label-sm text-on-surface-variant mb-sm">Update Status</p>
              <div className="flex gap-sm flex-wrap">
                {['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map(s => (
                  <button key={s} onClick={() => onStatusChange(c.id, s)}
                    className={`px-md py-sm rounded-lg text-label-sm font-semibold border-2 transition-all
                      ${c.status === s ? 'border-primary bg-primary text-on-primary' : 'border-surface-container-high text-on-surface-variant hover:border-primary/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* admin note */}
            <div>
              <label className="text-label-sm text-on-surface-variant mb-xs block">Admin Note / Response</label>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note, assignment reason, or resolution summary..."
                className="w-full border border-outline-variant rounded-xl p-md text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-all" />
            </div>

            {/* actions */}
            <div className="flex gap-sm flex-wrap justify-end">
              <button onClick={onClose} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Close</button>
              <button onClick={() => setShowAssign(true)}
                className="flex items-center gap-xs px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md hover:opacity-90 transition-opacity">
                <UserPlus size={16} /> {c.assignedTo ? 'Reassign Lawyer' : 'Assign Lawyer'}
              </button>
              {c.status !== 'RESOLVED' && (
                <button onClick={() => { onStatusChange(c.id, 'RESOLVED'); onClose(); }}
                  className="flex items-center gap-xs px-lg py-sm rounded-xl bg-green-600 text-white text-body-md hover:bg-green-700 transition-colors">
                  <CheckCircle size={16} /> Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssign && (
        <div className="z-50">
          <AssignModal complaint={c} lawyersList={lawyersList} onAssign={onAssign} onClose={() => setShowAssign(false)} />
        </div>
      )}
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const ManageComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [catFilter,    setCatFilter]    = useState('All');
  const [priFilter,    setPriFilter]    = useState('All');
  const [selected,     setSelected]     = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null); // complaint for standalone assign

  const fetchAllData = async () => {
    try {
      const [compRes, lawRes] = await Promise.all([
        getComplaints(),
        getLawyers()
      ]);
      if (compRes.success) {
        // Map data to UI format
        const mapped = compRes.data.map(c => ({
          id: c.id,
          user: c.client?.name || 'Unknown',
          userEmail: c.client?.email || 'N/A',
          userPhone: c.client?.phone || 'N/A',
          title: c.title,
          category: c.category || 'General',
          priority: c.priority || 'LOW',
          status: c.status || 'OPEN',
          assignedTo: c.assignedTo ? c.assignedTo.name : null,
          assignedToObj: c.assignedTo || null,
          date: new Date(c.createdAt).toLocaleDateString(),
          hearing: 'TBD',
          description: c.description || 'No description provided.',
          package: c.packageId ? 'Premium' : 'Free / Standard',
        }));
        setComplaints(mapped);
      }
      if (lawRes.success) {
        setLawyers(lawRes.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const categories = ['All', ...Array.from(new Set(complaints.map(c => c.category)))];

  const filtered = complaints.filter(c =>
    (statusFilter === 'All' || c.status   === statusFilter) &&
    (catFilter    === 'All' || c.category === catFilter)    &&
    (priFilter    === 'All' || c.priority === priFilter)    &&
    (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.user.toLowerCase().includes(search.toLowerCase())  ||
      c.id.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateComplaintStatus(id, { status: newStatus });
      if (response.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (id, lawyerId) => {
    try {
      const response = await assignLawyer(id, lawyerId);
      if (response.success) {
        fetchAllData(); // Refresh to get lawyer names
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unassigned = complaints.filter(c => !c.assignedTo && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Manage Complaints</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            View, assign, update and resolve all platform complaints.
          </p>
        </div>
        {unassigned > 0 && (
          <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-xl px-lg py-sm text-body-sm text-red-700 font-medium">
            <AlertTriangle size={16} className="text-red-500" />
            {unassigned} unassigned case{unassigned > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total',    value: complaints.length,                                  color: 'text-primary',    bg: 'bg-primary/5' },
          { label: 'Open',     value: complaints.filter(c => c.status === 'OPEN').length, color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'In Review',value: complaints.filter(c => c.status === 'IN_REVIEW').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: 'text-green-600',  bg: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-container-high rounded-2xl p-lg shadow-card text-center`}>
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card mb-lg space-y-md">
        <div className="flex gap-md items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input type="text" placeholder="Search by ID, title or user..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
        </div>
        <div className="flex gap-sm flex-wrap items-center">
          <span className="text-label-sm text-on-surface-variant flex items-center gap-xs"><Filter size={12} /> Status:</span>
          {['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-md py-xs rounded-full text-label-sm font-semibold transition-colors
                ${statusFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{f}</button>
          ))}
          <span className="w-px h-4 bg-surface-container-high" />
          <span className="text-label-sm text-on-surface-variant">Priority:</span>
          {['All', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
            <button key={f} onClick={() => setPriFilter(f)}
              className={`px-md py-xs rounded-full text-label-sm font-semibold transition-colors
                ${priFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{f}</button>
          ))}
          <span className="w-px h-4 bg-surface-container-high" />
          <span className="text-label-sm text-on-surface-variant">Category:</span>
          {categories.map(f => (
            <button key={f} onClick={() => setCatFilter(f)}
              className={`px-md py-xs rounded-full text-label-sm font-semibold transition-colors
                ${catFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-md">
        <p className="text-body-sm text-on-surface-variant">
          Showing <strong className="text-on-surface">{filtered.length}</strong> of {complaints.length}
        </p>
        {(statusFilter !== 'All' || priFilter !== 'All' || catFilter !== 'All' || search) && (
          <button onClick={() => { setStatusFilter('All'); setPriFilter('All'); setCatFilter('All'); setSearch(''); }}
            className="text-body-sm text-primary hover:underline">Clear filters</button>
        )}
      </div>

      {/* Complaint cards */}
      <div className="space-y-md">
        {filtered.length === 0 ? (
          <div className="bg-white border border-surface-container-high rounded-2xl p-3xl text-center shadow-card">
            <Briefcase size={48} className="mx-auto text-on-surface-variant opacity-20 mb-lg" />
            <p className="text-headline-sm text-on-surface-variant">No complaints match filters</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-md">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-sm flex-wrap mb-xs">
                  <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id}</span>
                  <StatusPill status={c.status} />
                  <span className={`text-label-sm px-sm py-xs rounded-full border font-semibold ${PRIORITY_CFG[c.priority]}`}>{c.priority}</span>
                  <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">{c.category}</span>
                  <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">📦 {c.package}</span>
                  {!c.assignedTo && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                    <span className="text-label-sm bg-red-50 text-red-600 border border-red-200 px-sm py-xs rounded-full font-semibold">Unassigned</span>
                  )}
                </div>
                <h3 className="text-headline-sm text-on-surface mb-xs">{c.title}</h3>
                <p className="text-body-sm text-on-surface-variant line-clamp-1 mb-sm">{c.description}</p>
                <div className="flex items-center gap-lg text-body-sm text-on-surface-variant flex-wrap">
                  <span className="flex items-center gap-xs"><User size={12} /> {c.user}</span>
                  <span className="flex items-center gap-xs"><Calendar size={12} /> {c.date}</span>
                  <span className="flex items-center gap-xs">
                    <Scale size={12} />
                    {c.assignedTo
                      ? <span className="text-on-surface font-medium">{c.assignedTo}</span>
                      : <span className="text-yellow-600 font-medium">Unassigned</span>}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-sm shrink-0 flex-wrap">
                {!c.assignedTo && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                  <button onClick={() => setShowAssignModal(c)}
                    className="flex items-center gap-xs px-md py-sm rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity">
                    <UserPlus size={14} /> Assign
                  </button>
                )}
                <button onClick={() => setSelected(c)}
                  className="flex items-center gap-xs px-md py-sm rounded-xl border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                  <Eye size={14} /> View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          c={selected}
          lawyersList={lawyers}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
        />
      )}

      {/* Standalone assign modal */}
      {showAssignModal && (
        <div className="z-50">
          <AssignModal
            complaint={showAssignModal}
            lawyersList={lawyers}
            onAssign={handleAssign}
            onClose={() => setShowAssignModal(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ManageComplaints;
