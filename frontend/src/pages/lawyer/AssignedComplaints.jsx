import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Eye, Clock, CheckCircle, AlertTriangle,
  ArrowRight, Calendar, User, MessageSquare, FileText,
  ChevronDown, ChevronUp, Briefcase, BarChart2, SortAsc,
  Loader2
} from 'lucide-react';
import { getComplaints } from '../../services/complaint.service';

/* ─── Config maps ────────────────────────────────────────────── */
const statusCfg = {
  'OPEN':      { pill: 'bg-blue-100 text-blue-700',   icon: Clock,          label: 'Open'      },
  'IN_REVIEW': { pill: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle, label: 'In Review' },
  'RESOLVED':  { pill: 'bg-green-100 text-green-700',  icon: CheckCircle,   label: 'Resolved'  },
  'CLOSED':    { pill: 'bg-gray-100 text-gray-600',    icon: CheckCircle,   label: 'Closed'    },
};

const priorityCfg = {
  HIGH:   'bg-red-50 text-red-600',
  MEDIUM: 'bg-yellow-50 text-yellow-600',
  LOW:    'bg-green-50 text-green-600',
};

/* ─── Helpers ────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const cfg = statusCfg[status] || statusCfg['OPEN'];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-xs text-label-sm px-sm py-xs rounded-full font-semibold ${cfg.pill}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

/* ─── Expandable Case Card ───────────────────────────────────── */
function CaseCard({ c, onView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white border rounded-2xl shadow-card transition-all duration-200
      ${expanded ? 'border-primary/30 shadow-md' : 'border-surface-container-high hover:shadow-md hover:border-primary/20'}`}>

      {/* ── main row ── */}
      <div className="p-lg">
        <div className="flex flex-col sm:flex-row sm:items-start gap-md">

          {/* left: client avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary shrink-0">
            {c.client?.name ? c.client.name.charAt(0) : 'C'}
          </div>

          {/* middle: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-sm flex-wrap mb-xs">
              <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id.split('-')[0]}</span>
              <StatusPill status={c.status} />
              <span className={`text-label-sm px-sm py-xs rounded-full font-semibold ${priorityCfg[c.priority] || ''}`}>{c.priority}</span>
              <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">{c.category}</span>
              <span className="text-label-sm bg-surface-container text-on-surface-variant px-sm py-xs rounded">📦 {c.packageId ? 'Purchased' : 'None'}</span>
              {c.unreadMessages > 0 && (
                <span className="flex items-center gap-xs text-label-sm bg-primary text-on-primary px-sm py-xs rounded-full">
                  <MessageSquare size={11} /> {c.unreadMessages} new
                </span>
              )}
            </div>

            <h3 className="text-headline-sm text-on-surface mb-xs">{c.title}</h3>

            <div className="flex items-center gap-lg flex-wrap text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-xs"><User size={12} /> {c.client?.name || 'Unknown'}</span>
              <span className="flex items-center gap-xs"><Clock size={12} /> Filed {new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
              <span className="flex items-center gap-xs">
                <Calendar size={12} />
                {c.hearingDate
                  ? <span className="font-medium text-on-surface">Hearing: {new Date(c.hearingDate).toLocaleDateString('en-GB')}</span>
                  : <span className="text-on-surface-variant">No hearing set</span>
                }
              </span>
              <span className="flex items-center gap-xs"><FileText size={12} /> {c.documents ? c.documents.length : 0} docs</span>
            </div>
          </div>

          {/* right: buttons */}
          <div className="flex items-center gap-sm shrink-0">
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              title={expanded ? 'Collapse' : 'Quick preview'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => onView(c.id)}
              className="flex items-center gap-xs px-lg py-sm rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Eye size={15} /> Review <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── expanded detail ── */}
      {expanded && (
        <div className="border-t border-surface-container-high px-lg pb-lg pt-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            <div className="sm:col-span-2">
              <p className="text-label-sm text-on-surface-variant mb-xs">Case Summary</p>
              <p className="text-body-md text-on-surface leading-relaxed">{c.description}</p>
            </div>
            <div className="space-y-sm">
              {c.nextAction !== '—' && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-md">
                  <p className="text-label-sm text-primary mb-xs">Next Action</p>
                  <p className="text-body-sm text-on-surface font-medium">{c.nextAction}</p>
                </div>
              )}
              {(c.hearingDate) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-md">
                  <p className="text-label-sm text-blue-700 mb-xs">📅 Court Hearing</p>
                  <p className="text-body-sm font-semibold text-on-surface">{new Date(c.hearingDate).toLocaleDateString('en-GB')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-sm mt-md flex-wrap">
            <button
              onClick={() => onView(c.id)}
              className="flex items-center gap-xs text-body-sm text-primary border border-primary/30 hover:bg-primary/5 px-md py-sm rounded-lg transition-colors"
            >
              <FileText size={13} /> View Full Case
            </button>
            <button className="flex items-center gap-xs text-body-sm text-on-surface-variant border border-outline-variant hover:bg-surface-container px-md py-sm rounded-lg transition-colors">
              <MessageSquare size={13} /> Message Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const AssignedComplaints = () => {
  const navigate = useNavigate();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy,       setSortBy]       = useState('filed');
  const [view,         setView]         = useState('list'); // 'list' | 'board'
  const [cases,        setCases]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await getComplaints();
        if (response.success) {
          setCases(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  /* unique categories */
  const categories = ['All', ...Array.from(new Set(cases.map(c => c.category)))];

  /* filter + sort */
  const filtered = cases
    .filter(c =>
      (statusFilter   === 'All' || c.status   === statusFilter)   &&
      (priorityFilter === 'All' || c.priority === priorityFilter) &&
      (categoryFilter === 'All' || c.category === categoryFilter) &&
      (
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  /* stats */
  const total     = cases.length;
  const active    = cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const inReview  = cases.filter(c => c.status === 'IN_REVIEW').length;
  const resolved  = cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const unread    = 0;
  const hearings  = cases.filter(c => c.hearingDate);

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Assigned Cases</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {total} cases assigned · {active} active · {unread > 0 ? `${unread} unread messages` : 'no unread messages'}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-md mb-xl">
        {[
          { label: 'Total',     value: total,    color: 'text-primary',    bg: 'bg-primary/5' },
          { label: 'Active',    value: active,   color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'In Review', value: inReview, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Resolved',  value: resolved, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Unread Msgs', value: unread, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-container-high rounded-2xl p-lg text-center shadow-card`}>
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card mb-lg">
        <div className="flex flex-col gap-md">
          {/* search row */}
          <div className="flex gap-md items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text" placeholder="Search by case ID, title or client name..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            {/* sort */}
            <div className="flex items-center gap-xs shrink-0">
              <SortAsc size={15} className="text-on-surface-variant" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-outline-variant rounded-xl px-md py-sm text-body-sm bg-white focus:outline-none focus:border-primary transition-all">
                <option value="filed">Filed Date</option>
                <option value="priority">Priority</option>
                <option value="messages">Unread Messages</option>
              </select>
            </div>
          </div>

          {/* filter chips row */}
          <div className="flex gap-sm flex-wrap items-center">
            <span className="flex items-center gap-xs text-label-sm text-on-surface-variant">
              <Filter size={13} /> Status:
            </span>
            {['All', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-md py-xs rounded-full text-label-sm transition-colors font-semibold
                  ${statusFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {f}
              </button>
            ))}
            <span className="w-px h-4 bg-surface-container-high mx-sm" />
            <span className="text-label-sm text-on-surface-variant">Priority:</span>
            {['All', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
              <button key={f} onClick={() => setPriorityFilter(f)}
                className={`px-md py-xs rounded-full text-label-sm transition-colors font-semibold
                  ${priorityFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {f}
              </button>
            ))}
            <span className="w-px h-4 bg-surface-container-high mx-sm" />
            <span className="text-label-sm text-on-surface-variant">Category:</span>
            {categories.map(f => (
              <button key={f} onClick={() => setCategoryFilter(f)}
                className={`px-md py-xs rounded-full text-label-sm transition-colors font-semibold
                  ${categoryFilter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-md">
        <p className="text-body-sm text-on-surface-variant">
          Showing <strong className="text-on-surface">{filtered.length}</strong> of {cases.length} cases
        </p>
        {(statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || search) && (
          <button
            onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); setSearch(''); }}
            className="text-body-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Case list ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-surface-container-high rounded-2xl p-3xl text-center shadow-card">
          <Briefcase size={48} className="mx-auto text-on-surface-variant opacity-20 mb-lg" />
          <p className="text-headline-sm text-on-surface-variant">No cases match your filters</p>
          <p className="text-body-md text-on-surface-variant mt-sm opacity-60">Try adjusting the search or filter options.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {filtered.map(c => (
            <CaseCard key={c.id} c={c} onView={id => navigate(`/lawyer/complaint/${id}`)} />
          ))}
        </div>
      )}

      {/* ── Upcoming Hearings ── */}
      {hearings.length > 0 && (
        <div className="mt-xl bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <h2 className="text-headline-sm text-on-surface mb-lg flex items-center gap-sm">
            <Calendar size={20} className="text-primary" /> Upcoming Court Hearings
          </h2>
          <div className="space-y-sm">
            {hearings.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-surface-container-low rounded-2xl p-md">
                <div className="flex items-center gap-md">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">{new Date(c.hearingDate).toLocaleDateString('en-GB')}</p>
                    <p className="text-body-sm text-on-surface-variant">{c.id.split('-')[0]} — {c.client?.name || 'Unknown'}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/lawyer/complaint/${c.id}`)}
                  className="flex items-center gap-xs text-body-sm text-primary font-medium hover:underline shrink-0"
                >
                  View Case <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
