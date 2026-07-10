import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Eye, Clock, CheckCircle, AlertTriangle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { getComplaints } from '../../services/complaint.service';

const statusConfig = {
  'OPEN': { color: 'bg-blue-100 text-blue-700', icon: <Clock size={12} />, label: 'Open' },
  'IN_REVIEW': { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle size={12} />, label: 'In Review' },
  'RESOLVED': { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} />, label: 'Resolved' },
  'CLOSED': { color: 'bg-gray-100 text-gray-600', icon: <XCircle size={12} />, label: 'Closed' },
};

const priorityColor = {
  HIGH: 'text-red-600 bg-red-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  LOW: 'text-green-600 bg-green-50',
};

const MyComplaints = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await getComplaints();
        if (response.success) {
          setComplaints(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">My Complaints</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Track all your legal cases and their current status.</p>
        </div>
        <button
          onClick={() => navigate('/user/complaints/new')}
          className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Cases', value: complaints.length, color: 'text-primary' },
          { label: 'Open', value: complaints.filter(c => c.status === 'OPEN').length, color: 'text-blue-600' },
          { label: 'In Review', value: complaints.filter(c => c.status === 'IN_REVIEW').length, color: 'text-yellow-600' },
          { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card text-center">
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card mb-lg">
        <div className="flex flex-col sm:flex-row gap-md items-start sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text" placeholder="Search by title or case ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-sm flex-wrap">
            <Filter size={16} className="text-on-surface-variant" />
            {[{v:'All',l:'All'}, {v:'OPEN',l:'Open'}, {v:'IN_REVIEW',l:'In Review'}, {v:'RESOLVED',l:'Resolved'}, {v:'CLOSED',l:'Closed'}].map(f => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)}
                className={`px-md py-xs rounded-lg text-label-sm transition-colors ${statusFilter === f.v ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-surface-container-high rounded-xl p-3xl text-center shadow-card">
          <AlertTriangle size={48} className="mx-auto text-on-surface-variant mb-lg opacity-30" />
          <p className="text-headline-sm text-on-surface-variant">No complaints found</p>
          <p className="text-body-md text-on-surface-variant mt-xs">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map(c => (
            <div key={c.id} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-sm mb-sm flex-wrap">
                    <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id.split('-')[0]}</span>
                    <span className={`text-label-sm px-sm py-xs rounded-full font-semibold flex items-center gap-xs ${statusConfig[c.status]?.color}`}>
                      {statusConfig[c.status]?.icon} {statusConfig[c.status]?.label}
                    </span>
                    <span className={`text-label-sm px-sm py-xs rounded-full font-semibold ${priorityColor[c.priority]}`}>{c.priority}</span>
                    <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">{c.category}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-headline-sm text-on-surface mb-sm">{c.title}</h3>

                  {/* Meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Filed</p>
                      <p className="text-body-sm text-on-surface font-medium">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Lawyer</p>
                      <p className={`text-body-sm font-medium ${!c.assignedTo ? 'text-yellow-600' : 'text-on-surface'}`}>{c.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant">Next Hearing</p>
                      <p className="text-body-sm text-on-surface font-medium">{c.hearingDate ? new Date(c.hearingDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-sm shrink-0">
                  {c.status === 'IN_REVIEW' && (
                    <Link to="/user/consultation" className="no-underline">
                      <button className="flex items-center gap-xs px-md py-sm rounded-lg bg-surface-container text-on-surface text-body-sm hover:bg-surface-container-high transition-colors">
                        💬 Chat
                      </button>
                    </Link>
                  )}
                  <Link to={`/user/complaints/${c.id}`} className="no-underline">
                    <button className="flex items-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary text-body-sm hover:opacity-90 transition-opacity">
                      <Eye size={14} /> View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
