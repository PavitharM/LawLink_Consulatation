import React, { useState, useEffect } from 'react';
import {
  Search, Filter, CheckCircle, XCircle, Eye, Star, Briefcase,
  MapPin, Phone, Mail, Loader2, Clock, Shield, AlertCircle,
  User, BarChart2, ChevronDown
} from 'lucide-react';
import { getUsers, toggleUserStatus, verifyLawyer } from '../../services/user.service';

/* ── Status helpers ────────────────────────────────────────── */
const getUIStatus = (l) => {
  if (l.status === 'SUSPENDED') return 'SUSPENDED';
  if (!l.lawyerProfile?.isVerified) return 'PENDING';
  if (l.status === 'ACTIVE') return 'ACTIVE';
  return 'INACTIVE';
};

const STATUS_STYLES = {
  ACTIVE:    'bg-green-100 text-green-700 border-green-200',
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
  INACTIVE:  'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_ICON = {
  ACTIVE:    <CheckCircle size={14} />,
  PENDING:   <Clock size={14} />,
  SUSPENDED: <XCircle size={14} />,
  INACTIVE:  <AlertCircle size={14} />,
};

/* ── Status Change Dropdown ────────────────────────────────── */
function StatusDropdown({ lawyer, onStatusChange, loading }) {
  const [open, setOpen] = useState(false);
  const current = getUIStatus(lawyer);

  const options = [
    { label: 'Approve (Active)', value: 'ACTIVE', color: 'text-green-700 hover:bg-green-50' },
    { label: 'Set Inactive', value: 'INACTIVE', color: 'text-gray-700 hover:bg-gray-50' },
    { label: 'Suspend', value: 'SUSPENDED', color: 'text-red-700 hover:bg-red-50' },
  ].filter(o => o.value !== current);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`flex items-center gap-xs text-label-sm px-sm py-xs rounded-full border font-semibold ${STATUS_STYLES[current]}`}
      >
        {STATUS_ICON[current]} {current} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-xs z-10 bg-white border border-surface-container-high rounded-xl shadow-lg w-44 overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { setOpen(false); onStatusChange(lawyer, o.value); }}
              className={`w-full text-left px-md py-sm text-body-sm flex items-center gap-sm transition-colors ${o.color}`}
            >
              {STATUS_ICON[o.value]} {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
const ManageLawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of lawyer being changed
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchLawyers = async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        const mapped = response.data
          .filter(u => u.role === 'LAWYER')
          .map(l => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            city: l.city,
            status: l.status,
            createdAt: l.createdAt,
            cases: l._count?.complaints || 0,
            lawyerProfile: l.lawyerProfile,
            specialization: l.lawyerProfile?.specialization || 'Not specified',
            experience: l.lawyerProfile?.experience || 0,
            location: l.lawyerProfile?.location || l.city || 'Not specified',
            barCouncilId: l.lawyerProfile?.barCouncilId || 'N/A',
            education: l.lawyerProfile?.education || 'N/A',
            bio: l.lawyerProfile?.bio || '',
            consultationFee: l.lawyerProfile?.consultationFee,
            isVerified: l.lawyerProfile?.isVerified || false,
            uiStatus: getUIStatus(l),
          }));
        setLawyers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch lawyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLawyers(); }, []);

  /* ── Status Change Handler ─────────────────────────────── */
  const handleStatusChange = async (lawyer, newStatus) => {
    setActionLoading(lawyer.id);
    try {
      // If approving a pending lawyer, also verify them
      if (newStatus === 'ACTIVE' && !lawyer.isVerified) {
        await verifyLawyer(lawyer.id, true);
      }
      // If suspending or deactivating, also un-verify
      if (newStatus === 'SUSPENDED' || newStatus === 'INACTIVE') {
        if (lawyer.isVerified) await verifyLawyer(lawyer.id, false);
      }
      await toggleUserStatus(lawyer.id, newStatus);
      showToast(`${lawyer.name}'s status changed to ${newStatus}`);
      await fetchLawyers();
      // Update selected if modal is open
      if (selected?.id === lawyer.id) {
        setSelected(prev => ({ ...prev, status: newStatus, uiStatus: newStatus, isVerified: newStatus === 'ACTIVE' }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to change status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = lawyers.filter(l => {
    const matchFilter = filter === 'All' || l.uiStatus === filter;
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.specialization.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = lawyers.filter(l => l.uiStatus === 'PENDING').length;

  if (loading) return (
    <div className="flex justify-center p-xl">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-surface-container-high rounded-xl shadow-lg px-lg py-md flex items-center gap-sm text-body-md text-on-surface">
          <CheckCircle size={18} className="text-green-600 shrink-0" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Manage Lawyers</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Review, approve and manage registered lawyers on LawLink.
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setFilter('PENDING')}
            className="flex items-center gap-sm bg-yellow-500 text-white px-lg py-sm rounded-xl text-body-md font-semibold hover:bg-yellow-600 transition-colors shadow-sm"
          >
            <Clock size={16} />
            {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Lawyers', value: lawyers.length, color: 'text-primary', onClick: () => setFilter('All') },
          { label: 'Active', value: lawyers.filter(l => l.uiStatus === 'ACTIVE').length, color: 'text-green-600', onClick: () => setFilter('ACTIVE') },
          { label: 'Pending Approval', value: pendingCount, color: 'text-yellow-600', onClick: () => setFilter('PENDING') },
          { label: 'Suspended', value: lawyers.filter(l => l.uiStatus === 'SUSPENDED').length, color: 'text-red-600', onClick: () => setFilter('SUSPENDED') },
        ].map((s, i) => (
          <div
            key={i}
            onClick={s.onClick}
            className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card cursor-pointer hover:shadow-md transition-shadow"
          >
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className={`text-display ${s.color} mt-xs`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card mb-lg">
        <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name, email or specialization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <Filter size={16} className="text-on-surface-variant shrink-0" />
            {['All', 'ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-md py-xs rounded-lg text-label-sm transition-colors ${filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-container-high rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-surface-container-high">
              <tr>
                {['Lawyer', 'Specialization', 'Experience', 'Cases', 'Bar Association ID', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-lg py-md text-label-md text-on-surface-variant whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-lg py-xl text-center text-on-surface-variant">
                    No lawyers found.
                  </td>
                </tr>
              ) : filtered.map(lawyer => (
                <tr key={lawyer.id} className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors">
                  {/* Lawyer name */}
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container uppercase shrink-0">
                        {lawyer.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{lawyer.name}</p>
                        <p className="text-body-sm text-on-surface-variant">{lawyer.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Specialization */}
                  <td className="px-lg py-md">
                    <span className="text-body-sm bg-surface-container px-sm py-xs rounded-lg text-on-surface-variant">
                      {lawyer.specialization}
                    </span>
                  </td>
                  {/* Experience */}
                  <td className="px-lg py-md text-body-sm text-on-surface-variant whitespace-nowrap">
                    {lawyer.experience} yr{lawyer.experience !== 1 ? 's' : ''}
                  </td>
                  {/* Cases */}
                  <td className="px-lg py-md text-body-md font-semibold text-on-surface">{lawyer.cases}</td>
                  {/* Bar Association ID */}
                  <td className="px-lg py-md text-body-sm text-on-surface-variant font-mono">{lawyer.barCouncilId}</td>
                  {/* Status */}
                  <td className="px-lg py-md">
                    <StatusDropdown
                      lawyer={lawyer}
                      onStatusChange={handleStatusChange}
                      loading={actionLoading === lawyer.id}
                    />
                  </td>
                  {/* Actions */}
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <button
                        onClick={() => setSelected(lawyer)}
                        className="p-xs rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="View Profile"
                      >
                        <Eye size={16} />
                      </button>
                      {lawyer.uiStatus === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(lawyer, 'ACTIVE')}
                          disabled={actionLoading === lawyer.id}
                          className="flex items-center gap-xs px-sm py-xs rounded-lg bg-green-100 text-green-700 text-label-sm font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {actionLoading === lawyer.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <CheckCircle size={14} />}
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-lg py-md border-t border-surface-container-high text-body-sm text-on-surface-variant">
          Showing {filtered.length} of {lawyers.length} lawyers
        </div>
      </div>

      {/* ── Profile Detail Modal ─────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-xl border-b border-surface-container-high">
              <div className="flex items-center gap-lg">
                <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-display font-bold text-on-primary-container uppercase shrink-0">
                  {selected.name?.charAt(0) || 'L'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-sm flex-wrap">
                    <h2 className="text-headline-md text-on-surface">{selected.name}</h2>
                    {selected.isVerified && (
                      <span className="flex items-center gap-xs text-label-sm bg-primary/10 text-primary px-sm py-xs rounded-full">
                        <Shield size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-body-md text-primary font-medium mt-xs">{selected.specialization}</p>
                  <div className="mt-sm">
                    <StatusDropdown
                      lawyer={selected}
                      onStatusChange={(lawyer, status) => {
                        handleStatusChange(lawyer, status);
                      }}
                      loading={actionLoading === selected.id}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-xl space-y-xl">
              {/* Contact Info */}
              <div>
                <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {[
                    { icon: <Mail size={16} />, label: 'Email', value: selected.email },
                    { icon: <Phone size={16} />, label: 'Phone', value: selected.phone || 'Not provided' },
                    { icon: <MapPin size={16} />, label: 'Location', value: selected.location },
                    { icon: <User size={16} />, label: 'City', value: selected.city || 'Not provided' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-sm bg-surface-container-low rounded-xl p-md">
                      <span className="text-primary mt-xs shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                        <p className="text-body-md text-on-surface font-medium mt-xs break-all">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {[
                    { icon: <Briefcase size={16} />, label: 'Specialization', value: selected.specialization },
                    { icon: <BarChart2 size={16} />, label: 'Experience', value: `${selected.experience} year(s)` },
                    { icon: <Shield size={16} />, label: 'Bar Association ID', value: selected.barCouncilId },
                    { icon: <Star size={16} />, label: 'Cases Handled', value: `${selected.cases} cases` },
                    { icon: <Briefcase size={16} />, label: 'Consultation Fee', value: selected.consultationFee ? `LKR ${selected.consultationFee}` : 'Not set' },
                    { icon: <User size={16} />, label: 'Education', value: selected.education },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-sm bg-surface-container-low rounded-xl p-md">
                      <span className="text-primary mt-xs shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-label-sm text-on-surface-variant">{item.label}</p>
                        <p className="text-body-md text-on-surface font-medium mt-xs">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div>
                  <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Bio</h3>
                  <p className="text-body-md text-on-surface leading-relaxed bg-surface-container-low rounded-xl p-md">
                    {selected.bio}
                  </p>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Account Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="bg-surface-container-low rounded-xl p-md">
                    <p className="text-label-sm text-on-surface-variant">Registered On</p>
                    <p className="text-body-md text-on-surface font-medium mt-xs">
                      {new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-md">
                    <p className="text-label-sm text-on-surface-variant">Verification</p>
                    <p className={`text-body-md font-semibold mt-xs ${selected.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selected.isVerified ? '✅ Verified' : '⏳ Not yet verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-xl py-lg border-t border-surface-container-high flex items-center justify-between gap-md flex-wrap">
              <div className="flex items-center gap-sm flex-wrap">
                {selected.uiStatus === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(selected, 'ACTIVE')}
                    disabled={actionLoading === selected.id}
                    className="flex items-center gap-xs px-lg py-sm rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selected.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Approve Lawyer
                  </button>
                )}
                {selected.uiStatus !== 'SUSPENDED' && (
                  <button
                    onClick={() => handleStatusChange(selected, 'SUSPENDED')}
                    disabled={actionLoading === selected.id}
                    className="flex items-center gap-xs px-lg py-sm rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> Suspend
                  </button>
                )}
                {selected.uiStatus === 'SUSPENDED' && (
                  <button
                    onClick={() => handleStatusChange(selected, 'ACTIVE')}
                    disabled={actionLoading === selected.id}
                    className="flex items-center gap-xs px-lg py-sm rounded-xl border border-green-200 text-green-600 font-semibold hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Reactivate
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLawyers;
