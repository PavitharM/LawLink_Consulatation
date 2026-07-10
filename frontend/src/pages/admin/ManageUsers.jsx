import React, { useState, useEffect } from 'react';
import { Search, Eye, UserX, UserCheck, Filter, Phone, Mail, Calendar, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, X, Loader2 } from 'lucide-react';
import { getUsers, toggleUserStatus } from '../../services/user.service';

const statusConfig = {
  ACTIVE: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
  INACTIVE: { color: 'bg-gray-100 text-gray-600', icon: Calendar, label: 'Inactive' },
  SUSPENDED: { color: 'bg-red-100 text-red-700', icon: ShieldAlert, label: 'Suspended' },
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAllUsers = async () => {
    try {
      const response = await getUsers();
      if (response.success) {
        // filter out lawyers/admins if this page is only for clients
        const clients = response.data.filter(u => u.role === 'USER');
        setUsers(clients);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const filtered = users.filter(u =>
    (filter === 'All' || u.status === filter.toUpperCase()) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const response = await toggleUserStatus(id, newStatus);
      if (response.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
        setToast(`User has been ${newStatus.toLowerCase()}.`);
        setTimeout(() => setToast(null), 3000);
        if (selected?.id === id) {
          setSelected(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Manage Users</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">View and manage all registered clients on LawLink.</p>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-sm bg-blue-50 border border-blue-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-blue-600" />
          <p className="text-body-md text-blue-700 font-medium">{toast}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Inactive', value: users.filter(u => u.status === 'INACTIVE').length, color: 'text-gray-600', bg: 'bg-surface-container' },
          { label: 'Suspended', value: users.filter(u => u.status === 'SUSPENDED').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border border-surface-container-high rounded-2xl p-lg shadow-card text-center`}>
            <p className={`text-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card mb-lg space-y-md">
        <div className="flex gap-md items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text" placeholder="Search by name, email or ID..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-md py-sm border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-sm flex-wrap items-center">
          <span className="text-label-sm text-on-surface-variant flex items-center gap-xs"><Filter size={12} /> Status:</span>
          {['All', 'Active', 'Inactive', 'Suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-md py-xs rounded-full text-label-sm font-semibold transition-colors
                ${filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards replacing the table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl mb-xl">
        {filtered.map(user => {
          const config = statusConfig[user.status] || statusConfig.ACTIVE;
          const StatusIcon = config.icon;
          return (
            <div key={user.id} className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-label-md font-bold text-primary uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <h3 className="text-headline-sm text-on-surface">{user.name}</h3>
                    <p className="text-body-sm text-on-surface-variant line-clamp-1">{user.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(user)} className="p-sm text-primary hover:bg-surface-container rounded-lg transition-colors">
                  <Eye size={18} />
                </button>
              </div>

              <div className="space-y-sm mb-lg">
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs"><Mail size={14} /> Email</span>
                  <span className="text-on-surface font-medium truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs"><Phone size={14} /> Phone</span>
                  <span className="text-on-surface font-medium">{user.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs"><Calendar size={14} /> Joined</span>
                  <span className="text-on-surface font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-xs"><ArrowRight size={14} /> Cases Filed</span>
                  <span className="text-primary font-bold">{user._count?.complaints || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-surface-container-high pt-md">
                <span className={`text-label-sm px-sm py-xs rounded-full font-semibold flex items-center gap-xs ${config.color}`}>
                  <StatusIcon size={12} /> {config.label}
                </span>
                <button
                  onClick={() => toggleStatus(user.id, user.status)}
                  className={`text-body-sm font-semibold transition-colors hover:underline ${user.status === 'SUSPENDED' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {user.status === 'SUSPENDED' ? 'Reinstate User' : 'Suspend User'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-lg" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-xl">
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-headline-md font-bold text-primary uppercase">
                  {selected.name ? selected.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h2 className="text-headline-sm text-on-surface">{selected.name}</h2>
                  <div className="flex items-center gap-sm mt-xs">
                    <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded line-clamp-1 max-w-[120px]">{selected.id}</span>
                    <span className={`text-label-sm px-sm py-xs rounded-full font-semibold ${statusConfig[selected.status]?.color || 'bg-gray-100 text-gray-700'}`}>{statusConfig[selected.status]?.label || selected.status}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-xs rounded-lg hover:bg-surface-container text-on-surface-variant">
                <X size={20} />
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-lg mb-xl">
              <h3 className="text-label-md font-semibold text-on-surface mb-md">Contact & Location</h3>
              <div className="grid grid-cols-2 gap-md">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Phone', value: selected.phone || 'N/A' },
                  { icon: Filter, label: 'City', value: selected.city || 'N/A' },
                  { icon: Calendar, label: 'Joined', value: new Date(selected.createdAt).toLocaleDateString() },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col overflow-hidden">
                    <span className="text-label-sm text-on-surface-variant flex items-center gap-xs mb-xs"><item.icon size={12} /> {item.label}</span>
                    <span className="text-body-md text-on-surface font-medium truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-lg mb-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-label-sm text-primary">Current Plan</p>
                  <p className="text-body-md font-bold text-on-surface mt-xs">{selected.activePackageId ? 'Premium' : 'Free / Standard'}</p>
                </div>
                <div className="text-right">
                  <p className="text-label-sm text-primary">Cases Filed</p>
                  <p className="text-body-md font-bold text-on-surface mt-xs">{selected._count?.complaints || 0}</p>
                </div>
              </div>
            </div>

            {selected.status === 'SUSPENDED' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-lg mb-xl flex gap-md">
                <AlertTriangle size={20} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-label-sm text-red-700 font-semibold">Account Suspended</p>
                  <p className="text-body-sm text-red-600 mt-xs">This user cannot log in or file new cases. They can be reinstated at any time.</p>
                </div>
              </div>
            )}

            <div className="flex gap-md justify-end border-t border-surface-container-high pt-lg">
              <button onClick={() => setSelected(null)} className="px-lg py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">Close</button>
              {selected.status !== 'SUSPENDED' ? (
                <button onClick={() => { toggleStatus(selected.id, selected.status); setSelected(null); }} className="px-lg py-sm rounded-xl bg-red-500 text-white text-body-md font-semibold hover:bg-red-600 transition-colors">Suspend User</button>
              ) : (
                <button onClick={() => { toggleStatus(selected.id, selected.status); setSelected(null); }} className="px-lg py-sm rounded-xl bg-green-600 text-white text-body-md font-semibold hover:bg-green-700 transition-colors">Reinstate User</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
