import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Scale, Bell, Clock, CheckCircle, AlertTriangle, ArrowRight, User, Loader2, Phone, Inbox } from 'lucide-react';
import { getComplaints } from '../../services/complaint.service';
import { getMe } from '../../services/user.service';
import { triggerEmergencyAlert } from '../../services/notification.service';
import { useNotifications } from '../../contexts/NotificationContext';
import { useToast } from '../../contexts/ToastContext';
import { StatusBadge } from '../../components/ui/Badge';
import { caseRef } from '../../components/ui/status';
import EmptyState from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const toast = useToast();

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

  if (loading) return <PageSkeleton stats={4} rows={3} />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-xs">{greeting}</p>
          <h1 className="text-headline-lg text-on-surface">Welcome back, {userName || 'there'}</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Here's an overview of your active cases and recent activity.</p>
        </div>
        <button
          onClick={() => navigate('/user/complaints/new')}
          className="flex items-center justify-center gap-sm px-lg py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold shadow-card hover:bg-primary-container hover:shadow-card-hover transition-all"
        >
          <PlusCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Active Cases', value: activeCases, icon: <Scale size={22} className="text-primary" />, bg: 'bg-primary/5', change: 'Currently open', to: '/user/complaints' },
          { label: 'In Review', value: inReview, icon: <Clock size={22} className="text-amber-600" />, bg: 'bg-amber-50', change: 'With a lawyer', to: '/user/complaints' },
          { label: 'Resolved', value: resolved, icon: <CheckCircle size={22} className="text-emerald-600" />, bg: 'bg-emerald-50', change: 'All time', to: '/user/complaints' },
          { label: 'Unread', value: unreadCount, icon: <Bell size={22} className="text-blue-600" />, bg: 'bg-blue-50', change: 'Notifications', to: '/user/notifications' },
        ].map((s, i) => (
          <Link key={s.label} to={s.to} style={{ animationDelay: `${i * 50}ms` }} className="group no-underline bg-white border border-surface-container-high rounded-xl p-lg shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/20 transition-all animate-slide-up">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-md`}>{s.icon}</div>
              <ArrowRight size={16} className="text-outline opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
            <p className="text-display text-on-surface mt-xs tabular-nums">{s.value}</p>
            <p className="text-body-sm text-on-surface-variant mt-xs">{s.change}</p>
          </Link>
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
              <Link key={c.id} to={`/user/complaints/${c.id}`} className="group block no-underline p-lg hover:bg-surface-container-low focus-visible:bg-surface-container-low transition-colors">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs flex-wrap">
                      <span className="text-label-sm font-mono font-semibold text-primary bg-primary/5 px-sm py-0.5 rounded">{caseRef(c.id)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-body-md font-semibold text-on-surface">{c.title}</p>
                    <div className="flex items-center gap-md mt-xs text-body-sm text-on-surface-variant flex-wrap">
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className={!c.assignedTo ? 'text-yellow-600 font-medium' : ''}>{c.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-on-surface-variant shrink-0 mt-xs group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
            {complaints.length === 0 && (
              <EmptyState
                compact
                icon={Inbox}
                title="No complaints yet"
                description="When you file a complaint, you can track its progress here."
                action={{ label: 'File your first complaint', to: '/user/complaints/new', icon: <PlusCircle size={16} /> }}
              />
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
              ].map((a) => (
                <Link key={a.to} to={a.to} className={`group flex items-center gap-md px-md py-sm rounded-xl no-underline transition-colors
                    ${a.primary ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
                  {a.icon}
                  <span className="text-body-md flex-1">{a.label}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="emergency-title" onClick={(e) => { if (e.target === e.currentTarget && !isSendingEmergency) setShowEmergencyModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-pop-in">
            <div className="bg-red-600 p-lg text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-md">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <h2 id="emergency-title" className="text-headline-sm text-white font-bold">Emergency Alert</h2>
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
                      toast.success('The admin team has been alerted and will contact you shortly.', { title: 'Emergency alert sent' });
                      setShowEmergencyModal(false);
                    } catch (err) {
                      toast.error(err?.message || 'Please call 119 if you are in immediate danger.', { title: 'Could not send alert' });
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
