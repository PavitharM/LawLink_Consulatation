import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Eye, MessageSquare, Inbox, SearchX, X, CalendarDays, UserRound, Gavel } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { caseRef } from '../../components/ui/status';
import EmptyState from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { getComplaints } from '../../services/complaint.service';

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

  const q = search.trim().toLowerCase().replace(/^#/, '');
  const filtered = complaints.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    (!q || c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q))
  );
  const countFor = (v) => (v === 'All' ? complaints.length : complaints.filter(c => c.status === v).length);
  const fmt = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <PageSkeleton stats={4} rows={3} />;

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
          className="flex items-center justify-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold shadow-card hover:bg-primary-container hover:shadow-card-hover transition-all"
        >
          <PlusCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Cases', value: complaints.length, color: 'text-primary' },
          { label: 'Open', value: complaints.filter(c => c.status === 'OPEN').length, color: 'text-blue-600' },
          { label: 'In Review', value: complaints.filter(c => c.status === 'IN_REVIEW').length, color: 'text-amber-600' },
          { label: 'Resolved', value: complaints.filter(c => c.status === 'RESOLVED').length, color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card text-center">
            <p className={`text-display font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-surface-container-high rounded-xl p-md shadow-card mb-lg">
        <div className="flex flex-col lg:flex-row gap-md lg:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              type="search" placeholder="Search by title, category or case ID…"
              aria-label="Search complaints"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-sm border border-outline-variant rounded-lg text-body-md bg-white focus:outline-none focus:border-primary focus:shadow-focus transition-shadow [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search"
                className="absolute right-sm top-1/2 -translate-y-1/2 p-1 rounded-md text-on-surface-variant hover:bg-surface-container">
                <X size={14} />
              </button>
            )}
          </div>
          <div role="tablist" aria-label="Filter by status" className="flex items-center gap-xs p-1 bg-surface-container-low rounded-xl overflow-x-auto">
            {[{v:'All',l:'All'}, {v:'OPEN',l:'Open'}, {v:'IN_REVIEW',l:'In Review'}, {v:'RESOLVED',l:'Resolved'}, {v:'CLOSED',l:'Closed'}].map(f => {
              const active = statusFilter === f.v;
              return (
                <button key={f.v} role="tab" aria-selected={active} onClick={() => setStatusFilter(f.v)}
                  className={`flex items-center gap-xs px-md py-xs rounded-lg text-label-sm whitespace-nowrap transition-all ${active ? 'bg-white text-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {f.l}
                  <span className={`text-[11px] tabular-nums px-1.5 rounded-full ${active ? 'bg-primary/10' : 'bg-surface-container'}`}>{countFor(f.v)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cases List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-surface-container-high rounded-xl shadow-card">
          {complaints.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="You haven't filed any complaints"
              description="Describe your legal issue and we'll match you with a verified lawyer."
              action={{ label: 'File a complaint', to: '/user/complaints/new', icon: <PlusCircle size={16} /> }}
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No matching complaints"
              description="Try a different search term or status filter."
              action={{ label: 'Clear filters', onClick: () => { setSearch(''); setStatusFilter('All'); } }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map(c => (
            <div key={c.id} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md">
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-sm mb-sm flex-wrap">
                    <span className="text-label-sm font-mono font-semibold text-primary bg-primary/5 px-sm py-0.5 rounded">{caseRef(c.id)}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.category && <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-0.5 rounded">{c.category}</span>}
                  </div>

                  {/* Title */}
                  <h3 className="text-headline-sm text-on-surface mb-md">
                    <Link to={`/user/complaints/${c.id}`} className="no-underline text-inherit hover:text-primary transition-colors">{c.title}</Link>
                  </h3>

                  {/* Meta */}
                  <dl className="flex flex-wrap gap-x-xl gap-y-sm text-body-sm">
                    <div className="flex items-center gap-xs">
                      <CalendarDays size={14} className="text-on-surface-variant" />
                      <dt className="sr-only">Filed</dt>
                      <dd className="text-on-surface-variant">Filed <span className="text-on-surface font-medium">{fmt(c.createdAt)}</span></dd>
                    </div>
                    <div className="flex items-center gap-xs">
                      <UserRound size={14} className="text-on-surface-variant" />
                      <dt className="sr-only">Lawyer</dt>
                      <dd className={`font-medium ${!c.assignedTo ? 'text-amber-700' : 'text-on-surface'}`}>{c.assignedTo?.name || 'Awaiting lawyer'}</dd>
                    </div>
                    <div className="flex items-center gap-xs">
                      <Gavel size={14} className="text-on-surface-variant" />
                      <dt className="sr-only">Next hearing</dt>
                      <dd className="text-on-surface-variant">Hearing <span className="text-on-surface font-medium">{c.hearingDate ? fmt(c.hearingDate) : 'TBD'}</span></dd>
                    </div>
                  </dl>
                </div>

                {/* Actions */}
                <div className="flex gap-sm shrink-0">
                  {c.status === 'IN_REVIEW' && (
                    <Link to="/user/consultation" className="no-underline flex items-center gap-xs px-md py-sm rounded-lg bg-surface-container text-on-surface text-body-sm font-medium hover:bg-surface-container-high transition-colors">
                      <MessageSquare size={14} /> Chat
                    </Link>
                  )}
                  <Link to={`/user/complaints/${c.id}`} className="no-underline flex items-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary text-body-sm font-medium hover:bg-primary-container transition-colors">
                    <Eye size={14} /> View Details
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
