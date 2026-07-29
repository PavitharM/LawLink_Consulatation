import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Scale, Bell, TrendingUp, Clock, CheckCircle, AlertTriangle, ArrowRight, User, Loader2, Phone } from 'lucide-react';
import { getComplaints } from '../../services/complaint.service';
import { getMe } from '../../services/user.service';
import { triggerEmergencyAlert } from '../../services/notification.service';

const statusConfig = {
  'OPEN': { color: 'bg-blue-100 text-blue-700', icon: <Clock size={12} /> },
  'IN_REVIEW': { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle size={12} /> },
  'RESOLVED': { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  'CLOSED': { color: 'bg-gray-100 text-gray-700', icon: <CheckCircle size={12} /> },
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, compRes] = await Promise.all([getMe(), getComplaints()]);
        if (meRes.success) {
          setUserName(meRes.data.name.split(' ')[0]);
          setUserProfile(meRes.data);
        }
        if (compRes.success) setComplaints(compRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCases = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
  const inReview = complaints.filter(c => c.status === 'IN_REVIEW').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface">Welcome back, {userName || 'User'}! 👋</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Here's an overview of your active cases and recent activity.</p>
        </div>
        <button
          onClick={() => navigate('/user/complaints/new')}
          className="flex items-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Active Cases', value: activeCases, icon: <Scale size={24} className="text-primary" />, bg: 'bg-primary/5', change: 'Current active' },
          { label: 'In Review', value: inReview, icon: <Clock size={24} className="text-yellow-600" />, bg: 'bg-yellow-50', change: 'Lawyer reviewing' },
          { label: 'Resolved', value: resolved, icon: <CheckCircle size={24} className="text-green-600" />, bg: 'bg-green-50', change: 'All time' },
          { label: 'Unread Notifications', value: 3, icon: <Bell size={24} className="text-blue-600" />, bg: 'bg-blue-50', change: 'View all' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-md`}>{s.icon}</div>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-display text-on-surface mt-xs">{s.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-xs">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Recent Complaints */}
        <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-xl shadow-card">
          <div className="flex items-center justify-between p-xl border-b border-surface-container-high">
            <h2 className="text-headline-sm text-on-surface">Recent Complaints</h2>
            <Link to="/user/complaints" className="text-body-sm text-primary hover:underline no-underline flex items-center gap-xs">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-surface-container-high">
            {complaints.slice(0, 3).map(c => (
              <div key={c.id} className="p-lg hover:bg-surface-container-low transition-colors cursor-pointer" onClick={() => navigate(`/user/complaints/${c.id}`)}>
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs flex-wrap">
                      <span className="text-label-sm font-bold text-primary bg-primary/10 px-sm py-xs rounded">{c.id}</span>
                      <span className={`text-label-sm px-sm py-xs rounded-full flex items-center gap-xs ${statusConfig[c.status]?.color}`}>
                        {statusConfig[c.status]?.icon} {c.status}
                      </span>
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">{c.title}</p>
                    <div className="flex items-center gap-md mt-xs text-body-sm text-on-surface-variant flex-wrap">
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className={!c.assignedTo ? 'text-yellow-600 font-medium' : ''}>{c.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-on-surface-variant shrink-0 mt-xs" />
                </div>
              </div>
            ))}
            {complaints.length === 0 && (
              <div className="p-xl text-center text-on-surface-variant">
                No recent complaints found.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-lg">
          {/* Quick Actions */}
          <div className="bg-white border border-surface-container-high rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface mb-md">Quick Actions</h3>
            <div className="space-y-sm">
              {[
                { label: 'Submit New Complaint', icon: <PlusCircle size={18} />, to: '/user/complaints/new', primary: true },
                { label: 'Find a Lawyer', icon: <User size={18} />, to: '/user/lawyers/search', primary: false },
                { label: 'My Complaints', icon: <FileText size={18} />, to: '/user/complaints', primary: false },
                { label: 'Notifications', icon: <Bell size={18} />, to: '/user/notifications', primary: false },
              ].map((a, i) => (
                <Link key={i} to={a.to} className="no-underline">
                  <div className={`flex items-center gap-md px-md py-sm rounded-xl transition-colors cursor-pointer
                    ${a.primary ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                    {a.icon}
                    <span className="text-body-md">{a.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Emergency Help */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-xl shadow-card">
            <h3 className="text-headline-sm text-red-700 mb-xs flex items-center gap-xs">
              <AlertTriangle size={20} /> Emergency Help
            </h3>
            <p className="text-body-sm text-red-600 mb-lg">
              Need immediate legal or police assistance? Contact authorities or alert our admin instantly.
            </p>
            <div className="flex flex-col gap-sm">
              <a href="tel:119" className="w-full flex items-center justify-center gap-xs py-sm rounded-xl bg-red-600 text-white font-semibold text-center hover:bg-red-700 transition-colors no-underline">
                <Phone size={16} /> Call Police (119)
              </a>
              <button 
                onClick={() => setShowEmergencyModal(true)} 
                className="w-full flex items-center justify-center gap-xs py-sm rounded-xl border-2 border-red-600 text-red-700 font-semibold hover:bg-red-100 transition-colors"
              >
                <Bell size={16} /> Alert Admin Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-600 p-lg text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-md">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <h2 className="text-headline-sm text-white font-bold">Emergency Alert</h2>
              <p className="text-body-sm text-red-100 mt-xs">The following profile details will be sent immediately to the LawLink Admin for urgent assistance.</p>
            </div>
            
            <div className="p-xl space-y-md">
              <div className="bg-surface-container-low rounded-xl p-md border border-surface-container-high space-y-sm">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">Name</span>
                  <span className="text-body-md font-semibold text-on-surface">{userProfile?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">Email</span>
                  <span className="text-body-md font-semibold text-on-surface">{userProfile?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">Phone</span>
                  <span className="text-body-md font-semibold text-on-surface">{userProfile?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">City</span>
                  <span className="text-body-md font-semibold text-on-surface">{userProfile?.city || 'N/A'}</span>
                </div>
              </div>

              <div className="flex gap-md pt-md border-t border-surface-container-high">
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 py-sm rounded-xl border border-outline-variant text-body-md font-semibold hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSendingEmergency}
                  onClick={async () => {
                    try {
                      setIsSendingEmergency(true);
                      await triggerEmergencyAlert();
                      alert('Emergency alert successfully dispatched to the admin team!');
                      setShowEmergencyModal(false);
                    } catch (err) {
                      alert('Failed to send emergency alert.');
                    } finally {
                      setIsSendingEmergency(false);
                    }
                  }}
                  className="flex-1 py-sm rounded-xl bg-red-600 text-white text-body-md font-bold hover:bg-red-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSendingEmergency ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
