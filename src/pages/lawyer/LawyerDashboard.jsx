import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, Star, TrendingUp, Users, Calendar, ArrowRight, MessageSquare, Bell, Loader2 } from 'lucide-react';
import { getComplaints } from '../../services/complaint.service';
import { AuthContext } from '../../App';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeCases, setActiveCases] = useState([]);
  const [resolvedCases, setResolvedCases] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await getComplaints();
        if (response.success) {
          const allCases = response.data;
          const active = allCases.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
          const resolved = allCases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
          setActiveCases(active.slice(0, 5)); // show top 5
          setResolvedCases(resolved.length);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = allCases
            .filter(c => c.hearingDate && new Date(c.hearingDate).setHours(0,0,0,0) >= today)
            .sort((a,b) => new Date(a.hearingDate) - new Date(b.hearingDate));
          setUpcomingHearings(upcoming.slice(0, 3));
          
          const recentCases = [...allCases].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
          setRecentActivity(recentCases);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Welcome, {user?.name || 'Advocate'}! 👋</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Here's your current caseload and upcoming schedule.</p>
        </div>
        <button onClick={() => navigate('/lawyer/assigned-complaints')} className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity">
          <Briefcase size={18} /> View All Cases
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Active Cases', value: activeCases.length, icon: <Briefcase size={24} className="text-primary" />, bg: 'bg-primary/5' },
          { label: 'Resolved Cases', value: resolvedCases, icon: <CheckCircle size={24} className="text-green-600" />, bg: 'bg-green-50' },
          { label: 'Avg Rating', value: '4.8 ⭐', icon: <Star size={24} className="text-yellow-500" />, bg: 'bg-yellow-50' },
          { label: 'Total Earnings', value: `₹${(resolvedCases * (user?.lawyerProfile?.consultationFee || 1500)).toLocaleString()}`, icon: <TrendingUp size={24} className="text-blue-600" />, bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-md`}>{s.icon}</div>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-headline-md font-bold text-on-surface mt-xs">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Active Cases */}
        <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-xl shadow-card">
          <div className="flex items-center justify-between p-xl border-b border-surface-container-high">
            <h2 className="text-headline-sm text-on-surface">Active Cases</h2>
            <button onClick={() => navigate('/lawyer/assigned-complaints')} className="text-body-sm text-primary hover:underline flex items-center gap-xs">
              All cases <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-surface-container-high">
            {activeCases.map(c => (
              <div key={c.id} onClick={() => navigate(`/lawyer/complaint/${c.id}`)}
                className="p-lg hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs flex-wrap">
                      <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id.split('-')[0]}</span>
                      <span className={`text-label-sm px-sm py-xs rounded-full ${c.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : c.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.status === 'OPEN' ? 'NEW REQUEST' : c.status}
                      </span>
                      <span className={`text-label-sm px-sm py-xs rounded-full ${c.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{c.priority}</span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">{c.title}</p>
                    <div className="flex items-center gap-md mt-xs text-body-sm text-on-surface-variant flex-wrap">
                      <span>👤 {c.client?.name || 'Unknown'}</span>
                      <span>📂 {c.category}</span>
                      <span>📅 {c.hearingDate ? new Date(c.hearingDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-on-surface-variant shrink-0 mt-xs" />
                </div>
              </div>
            ))}
            {activeCases.length === 0 && (
              <div className="p-xl text-center text-on-surface-variant">No active cases assigned to you.</div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-lg">
          {/* Quick Actions */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md">Quick Actions</h3>
            <div className="space-y-sm">
              {[
                { label: 'Assigned Cases', icon: <Briefcase size={18} />, to: '/lawyer/assigned-complaints' },
                { label: 'Notifications', icon: <Bell size={18} />, to: '/lawyer/notifications' },
                { label: 'Package Rates', icon: <TrendingUp size={18} />, to: '/lawyer/packages' },
                { label: 'My Profile', icon: <Users size={18} />, to: '/lawyer/profile' },
              ].map((a, i) => (
                <div key={i} onClick={() => navigate(a.to)}
                  className="flex items-center gap-md px-md py-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
                  <span className="text-primary">{a.icon}</span>
                  <span className="text-body-md text-on-surface">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md">Recent Activity</h3>
            <div className="space-y-sm">
              {recentActivity.length > 0 ? recentActivity.map((c, i) => (
                <div key={i} onClick={() => navigate(`/lawyer/complaint/${c.id}`)} className="flex items-start gap-sm cursor-pointer hover:bg-surface-container-low p-sm rounded-lg transition-colors -mx-sm">
                  <span className="text-xl shrink-0">📋</span>
                  <div>
                    <p className="text-body-sm text-on-surface">Case <span className="font-semibold">{c.id.split('-')[0]}</span> was updated to <span className="font-semibold">{c.status}</span></p>
                    <p className="text-body-sm text-on-surface-variant mt-xs">{new Date(c.updatedAt).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              )) : (
                <p className="text-body-sm text-on-surface-variant">No recent case activity.</p>
              )}
            </div>
          </div>

          {/* Upcoming Hearings */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-xl text-on-primary shadow-card">
            <Calendar size={28} className="mb-md" />
            <p className="text-label-md opacity-80 mb-md">Upcoming Court Hearings</p>
            {upcomingHearings.length > 0 ? (
              <div className="space-y-md divide-y divide-white/20">
                {upcomingHearings.map((h, i) => (
                  <div key={i} className={i > 0 ? "pt-md" : ""}>
                    <p className="text-headline-sm font-bold">{new Date(h.hearingDate).toLocaleDateString('en-GB')}</p>
                    <p className="text-body-sm opacity-90 mt-xs">{new Date(h.hearingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} — {h.location || 'TBD'}</p>
                    <p className="text-body-sm opacity-80 mt-xs">{h.id.split('-')[0]} — {h.client?.name || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm opacity-90 mt-xs">No upcoming hearings scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
