import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Users, Briefcase, FileText, TrendingUp, AlertTriangle, Bell, Loader2, ArrowRight } from 'lucide-react';
import { getAdminStats } from '../../services/admin.service';
import { getNotifications, markNotificationRead } from '../../services/notification.service';
import { AuthContext } from '../../App';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          getAdminStats(),
          getNotifications().catch(() => ({ data: [] }))
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (notifRes.data) {
          const activeEmergencies = notifRes.data.filter(n => n.type === 'EMERGENCY' && !n.read);
          setEmergencies(activeEmergencies);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center p-xl">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  // Build a combined recent activity feed from real data, keeping complaint IDs for navigation
  const recentActivity = [
    ...(stats?.recentComplaints || []).map(c => ({
      id: c.id,
      type: 'complaint',
      user: c.client?.name || 'Unknown',
      action: `Submitted complaint: "${c.title}"`,
      time: new Date(c.createdAt).toLocaleDateString('en-IN'),
      link: `/admin/complaints`,
    })),
    ...(stats?.recentUsers || []).map(u => ({
      id: u.id,
      type: u.role === 'LAWYER' ? 'lawyer' : 'user',
      user: u.name,
      action: `Registered as ${u.role === 'LAWYER' ? 'a Lawyer' : 'a User'}`,
      time: new Date(u.createdAt).toLocaleDateString('en-IN'),
      link: u.role === 'LAWYER' ? '/admin/lawyers' : '/admin/users',
    })),
  ].slice(0, 8);

  const typeIcon = { complaint: '📋', user: '👤', lawyer: '⚖️' };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Admin Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Welcome, {user?.name || 'Admin'} — LawLink management console.
          </p>
        </div>
        <div className="text-body-sm text-on-surface-variant bg-white border border-surface-container-high rounded-xl px-lg py-sm shadow-card">
          📅 {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {/* Registered Clients */}
        <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-md">
            <Users size={24} className="text-primary" />
          </div>
          <p className="text-label-md text-on-surface-variant">Registered Clients</p>
          <p className="text-display text-on-surface mt-xs">{stats?.totalUsers ?? '—'}</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">Total user accounts</p>
        </div>

        {/* Active Lawyers */}
        <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-md">
            <Scale size={24} className="text-green-600" />
          </div>
          <p className="text-label-md text-on-surface-variant">Registered Lawyers</p>
          <p className="text-display text-on-surface mt-xs">{stats?.totalLawyers ?? '—'}</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">Total lawyer accounts</p>
        </div>

        {/* Open Complaints */}
        <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-md">
            <AlertTriangle size={24} className="text-yellow-600" />
          </div>
          <p className="text-label-md text-on-surface-variant">Open Complaints</p>
          <p className="text-display text-on-surface mt-xs">{stats?.openComplaints ?? '—'}</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">{stats?.unassignedComplaints ?? 0} unassigned</p>
        </div>

        {/* Total Complaints */}
        <div className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-md">
            <Briefcase size={24} className="text-blue-600" />
          </div>
          <p className="text-label-md text-on-surface-variant">Total Complaints</p>
          <p className="text-display text-on-surface mt-xs">{stats?.totalComplaints ?? '—'}</p>
          <p className="text-body-sm text-on-surface-variant mt-xs">{stats?.resolvedComplaints ?? 0} resolved</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Cases In Review', value: stats?.inReviewComplaints ?? '—', color: 'text-yellow-600' },
          { label: 'Cases Resolved', value: stats?.resolvedComplaints ?? '—', color: 'text-green-600' },
          { label: 'Unassigned Cases', value: stats?.unassignedComplaints ?? '—', color: 'text-red-600' },
          { label: 'Articles Published', value: stats?.totalArticles ?? '—', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-md shadow-card text-center">
            <p className={`text-headline-md font-bold ${s.color}`}>{s.value}</p>
            <p className="text-label-sm text-on-surface-variant mt-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Activity Feed — clickable */}
        <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-xl shadow-card">
          <div className="flex items-center justify-between p-xl border-b border-surface-container-high">
            <h2 className="text-headline-sm text-on-surface">Recent Activity</h2>
            <button
              onClick={() => navigate('/admin/complaints')}
              className="text-body-sm text-primary hover:underline flex items-center gap-xs"
            >
              View all complaints <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-surface-container-high">
            {recentActivity.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant">No recent activity yet.</div>
            ) : (
              recentActivity.map((a, i) => (
                <div
                  key={i}
                  onClick={() => navigate(a.link)}
                  className="flex items-start gap-md p-lg hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <div className="text-xl w-8 text-center shrink-0">{typeIcon[a.type] || '📝'}</div>
                  <div className="flex-1">
                    <p className="text-body-md text-on-surface group-hover:text-primary transition-colors">
                      <span className="font-semibold">{a.user}</span> — {a.action}
                    </p>
                    <p className="text-body-sm text-on-surface-variant mt-xs">{a.time}</p>
                  </div>
                  <ArrowRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity mt-xs shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-lg">
          {/* Quick Manage */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md">Quick Manage</h3>
            <div className="space-y-sm">
              {[
                {
                  label: 'Manage Clients',
                  icon: <Users size={18} />,
                  to: '/admin/users',
                  badge: stats?.totalUsers ?? '…',
                },
                {
                  label: 'Manage Lawyers',
                  icon: <Scale size={18} />,
                  to: '/admin/lawyers',
                  badge: stats?.totalLawyers ?? '…',
                },
                {
                  label: 'Complaints',
                  icon: <Briefcase size={18} />,
                  to: '/admin/complaints',
                  badge: (stats?.unassignedComplaints ?? 0) > 0 ? `${stats.unassignedComplaints} unassigned` : `${stats?.totalComplaints ?? 0} total`,
                  badgeColor: (stats?.unassignedComplaints ?? 0) > 0 ? 'bg-red-100 text-red-700' : null,
                },
                {
                  label: 'Articles',
                  icon: <FileText size={18} />,
                  to: '/admin/articles',
                  badge: stats?.totalArticles ?? '…',
                },
              ].map((a, i) => (
                <div
                  key={i}
                  onClick={() => navigate(a.to)}
                  className="flex items-center justify-between px-md py-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-sm text-on-surface">
                    <span className="text-primary">{a.icon}</span>
                    <span className="text-body-md">{a.label}</span>
                  </div>
                  <span className={`text-label-sm px-sm py-xs rounded-full ${a.badgeColor || 'bg-white border border-surface-container-high text-on-surface-variant'}`}>
                    {a.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md flex items-center gap-sm">
              <Bell size={18} className="text-primary" /> Alerts
            </h3>
            <div className="space-y-sm">
              {emergencies.map(em => (
                <div key={em.id} className="bg-red-600 border border-red-700 rounded-xl p-md shadow-lg animate-pulse">
                  <p className="text-label-sm text-white font-bold flex items-center gap-xs">
                    <AlertTriangle size={16} /> EMERGENCY ALERT
                  </p>
                  <p className="text-body-sm text-red-50 mt-xs">{em.message}</p>
                  <button
                    onClick={async () => {
                      await markNotificationRead(em.id);
                      setEmergencies(prev => prev.filter(e => e.id !== em.id));
                    }}
                    className="mt-sm px-sm py-xs bg-white text-red-700 text-label-sm rounded-lg hover:bg-red-50 transition-colors font-bold"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}

              {(stats?.unassignedComplaints ?? 0) > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-md">
                  <p className="text-label-sm text-red-700 font-semibold">
                    🔴 {stats.unassignedComplaints} Complaints Unassigned
                  </p>
                  <p className="text-body-sm text-red-600 mt-xs">Cases waiting for a lawyer to be assigned.</p>
                  <button
                    onClick={() => navigate('/admin/complaints')}
                    className="text-body-sm text-red-700 font-medium hover:underline mt-xs block"
                  >
                    Assign Now →
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-md">
                  <p className="text-label-sm text-green-700 font-semibold">✅ All complaints assigned</p>
                  <p className="text-body-sm text-green-600 mt-xs">No unassigned cases right now.</p>
                </div>
              )}

              {(stats?.openComplaints ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-md">
                  <p className="text-label-sm text-yellow-700 font-semibold">
                    ⚠️ {stats.openComplaints} Open Complaints
                  </p>
                  <p className="text-body-sm text-yellow-600 mt-xs">These are awaiting review or assignment.</p>
                  <button
                    onClick={() => navigate('/admin/complaints')}
                    className="text-body-sm text-yellow-700 font-medium hover:underline mt-xs block"
                  >
                    Review Now →
                  </button>
                </div>
              )}

              {(stats?.unassignedComplaints ?? 0) === 0 && (stats?.openComplaints ?? 0) === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-md">
                  <p className="text-label-sm text-green-700 font-semibold">✅ No alerts</p>
                  <p className="text-body-sm text-green-600 mt-xs">Platform is running smoothly.</p>
                </div>
              )}
            </div>
          </div>

          {/* Reports CTA */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-xl text-on-primary shadow-card">
            <TrendingUp size={32} className="mb-md" />
            <p className="text-headline-sm font-bold mb-xs">Reports</p>
            <p className="text-body-sm opacity-80 mb-lg">View full analytics and platform metrics.</p>
            <button
              onClick={() => navigate('/admin/report')}
              className="bg-white text-primary text-body-sm font-semibold px-lg py-sm rounded-xl hover:bg-on-primary-container transition-colors"
            >
              View Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
