import React, { useState, useEffect } from 'react';
import {
  Bell, Mail, Shield, Users, Briefcase,
  CheckCircle, Save, Globe,
  Clock, Loader2, AlertTriangle, UserPlus, FileText
} from 'lucide-react';
import { getAdminStats } from '../../services/admin.service';
import { useNavigate } from 'react-router-dom';

/* ─── Toggle ─────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle, color = 'text-primary' }) {
  return (
    <div className="flex items-start gap-md mb-lg">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'text-primary' ? 'bg-primary/10' :
        color === 'text-blue-600' ? 'bg-blue-50' :
        color === 'text-green-600' ? 'bg-green-50' :
        color === 'text-purple-600' ? 'bg-purple-50' : 'bg-surface-container-low'
      }`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <h3 className="text-headline-sm text-on-surface">{title}</h3>
        {subtitle && <p className="text-body-sm text-on-surface-variant mt-xs">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Row item ───────────────────────────────────────────────── */
function NotifRow({ id, label, desc, checked, onChange, badge }) {
  return (
    <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-lg py-md">
      <div className="flex-1 min-w-0 mr-lg">
        <p className="text-body-md font-medium text-on-surface flex items-center gap-sm">
          {label}
          {badge && <span className="text-label-sm bg-primary text-on-primary px-sm py-xs rounded-full">{badge}</span>}
        </p>
        <p className="text-body-sm text-on-surface-variant mt-xs">{desc}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const AdminNotificationSettings = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('admin@lawlink.in');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(r => { if (r.success) setStats(r.data); })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const [settings, setSettings] = useState({
    newUserRegistered:    true,
    newLawyerRegistered:  true,
    lawyerPendingApproval:true,
    newComplaintFiled:    true,
    complaintUnassigned:  true,
    complaintResolved:    false,
    paymentReceived:      true,
    paymentFailed:        true,
    dailyDigest:          true,
    weeklyReport:         false,
    monthlyReport:        true,
    systemAlerts:         true,
    securityAlerts:       true,
    maintenanceNotices:   false,
    browserPush:          false,
    smsAlerts:            true,
    lawyerCaseUpdate:     true,
    lawyerLogin:          false,
    lawyerRatingReceived: true,
    userLogin:            false,
    userProfileUpdate:    false,
    userDocumentUploaded: true,
  });

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const ALL_PLATFORM  = ['newUserRegistered','newLawyerRegistered','lawyerPendingApproval','newComplaintFiled','complaintUnassigned','complaintResolved','paymentReceived','paymentFailed'];
  const ALL_EMAIL     = ['dailyDigest','weeklyReport','monthlyReport'];
  const ALL_SYSTEM    = ['systemAlerts','securityAlerts','maintenanceNotices'];
  const ALL_LAWYER    = ['lawyerCaseUpdate','lawyerLogin','lawyerRatingReceived'];
  const ALL_USER      = ['userLogin','userProfileUpdate','userDocumentUploaded'];

  const allOn  = (keys) => keys.every(k => settings[k]);
  const toggle = (keys, val) => keys.forEach(k => set(k, val));

  // Build real notifications from stats
  const liveNotifications = [];
  if (stats) {
    if (stats.unassignedComplaints > 0) {
      liveNotifications.push({
        type: 'alert',
        icon: <AlertTriangle size={18} className="text-red-600" />,
        bg: 'bg-red-50 border-red-200',
        text: `${stats.unassignedComplaints} complaint(s) are unassigned and waiting for a lawyer.`,
        action: 'Assign Now',
        link: '/admin/complaints',
        time: 'Right now',
      });
    }
    if (stats.openComplaints > 0) {
      liveNotifications.push({
        type: 'warning',
        icon: <Bell size={18} className="text-yellow-600" />,
        bg: 'bg-yellow-50 border-yellow-200',
        text: `${stats.openComplaints} open complaint(s) need review or assignment.`,
        action: 'View Complaints',
        link: '/admin/complaints',
        time: 'Right now',
      });
    }
    (stats.recentUsers || []).forEach(u => {
      liveNotifications.push({
        type: 'info',
        icon: <UserPlus size={18} className="text-primary" />,
        bg: 'bg-primary/5 border-primary/20',
        text: `${u.name} registered as a ${u.role === 'LAWYER' ? 'Lawyer' : 'Client'}.`,
        action: u.role === 'LAWYER' ? 'View Lawyers' : 'View Users',
        link: u.role === 'LAWYER' ? '/admin/lawyers' : '/admin/users',
        time: new Date(u.createdAt).toLocaleDateString('en-IN'),
      });
    });
    (stats.recentComplaints || []).forEach(c => {
      liveNotifications.push({
        type: 'complaint',
        icon: <FileText size={18} className="text-blue-600" />,
        bg: 'bg-blue-50 border-blue-200',
        text: `${c.client?.name || 'A user'} submitted: "${c.title}"`,
        action: 'View Complaints',
        link: '/admin/complaints',
        time: new Date(c.createdAt).toLocaleDateString('en-IN'),
      });
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Notifications</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Platform alerts and notification preferences.
        </p>
      </div>

      {/* ── LIVE PLATFORM NOTIFICATIONS ── */}
      <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card mb-xl">
        <div className="flex items-center gap-sm mb-lg">
          <Bell size={20} className="text-primary" />
          <h2 className="text-headline-sm text-on-surface">Platform Notifications</h2>
          {liveNotifications.length > 0 && (
            <span className="text-label-sm bg-primary text-on-primary px-sm py-xs rounded-full">
              {liveNotifications.length}
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-xl">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : liveNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-xl text-center">
            <CheckCircle size={36} className="text-green-500 mb-md" />
            <p className="text-body-md text-on-surface font-medium">All clear!</p>
            <p className="text-body-sm text-on-surface-variant mt-xs">No pending alerts right now.</p>
          </div>
        ) : (
          <div className="space-y-sm">
            {liveNotifications.map((n, i) => (
              <div key={i} className={`flex items-start gap-md p-md rounded-xl border ${n.bg}`}>
                <div className="shrink-0 mt-xs">{n.icon}</div>
                <div className="flex-1">
                  <p className="text-body-md text-on-surface">{n.text}</p>
                  <div className="flex items-center gap-md mt-xs">
                    <span className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                      <Clock size={12} /> {n.time}
                    </span>
                    <button
                      onClick={() => navigate(n.link)}
                      className="text-body-sm text-primary font-medium hover:underline"
                    >
                      {n.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save toast */}
      {saved && (
        <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-body-md text-green-700 font-medium">Notification preferences saved!</p>
        </div>
      )}

      <div className="space-y-xl">
        {/* ── Platform Events ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <SectionHeader icon={Bell} title="Platform Event Preferences" subtitle="Choose which platform events trigger admin notifications" />
            <button onClick={() => toggle(ALL_PLATFORM, !allOn(ALL_PLATFORM))}
              className="text-label-sm text-primary hover:underline shrink-0">
              {allOn(ALL_PLATFORM) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          <div className="space-y-sm">
            <NotifRow id="newUserRegistered"     label="New User Registered"       desc="When a new user creates an account"                                checked={settings.newUserRegistered}     onChange={v => set('newUserRegistered', v)} />
            <NotifRow id="newLawyerRegistered"   label="New Lawyer Registered"     desc="When a lawyer submits their registration"                          checked={settings.newLawyerRegistered}   onChange={v => set('newLawyerRegistered', v)} />
            <NotifRow id="lawyerPendingApproval" label="Lawyer Awaiting Approval"  desc="When a lawyer registration is pending your review"                 checked={settings.lawyerPendingApproval} onChange={v => set('lawyerPendingApproval', v)} badge="Important" />
            <NotifRow id="newComplaintFiled"     label="New Complaint Filed"        desc="When a user submits a new legal complaint"                         checked={settings.newComplaintFiled}     onChange={v => set('newComplaintFiled', v)} />
            <NotifRow id="complaintUnassigned"   label="Unassigned Complaint Alert" desc="When a complaint remains unassigned for more than 24 hours"        checked={settings.complaintUnassigned}   onChange={v => set('complaintUnassigned', v)} badge="Urgent" />
            <NotifRow id="complaintResolved"     label="Complaint Resolved"         desc="When a lawyer marks a case as resolved"                            checked={settings.complaintResolved}     onChange={v => set('complaintResolved', v)} />
            <NotifRow id="paymentReceived"       label="Payment Received"           desc="Confirmation when a user completes a package payment"              checked={settings.paymentReceived}       onChange={v => set('paymentReceived', v)} />
            <NotifRow id="paymentFailed"         label="Payment Failed"             desc="When a payment attempt fails or is declined"                       checked={settings.paymentFailed}         onChange={v => set('paymentFailed', v)} />
          </div>
        </div>

        {/* ── Email Digests ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <SectionHeader icon={Mail} title="Email Digests & Reports" subtitle="Scheduled email summaries delivered to your admin inbox" color="text-blue-600" />
            <button onClick={() => toggle(ALL_EMAIL, !allOn(ALL_EMAIL))} className="text-label-sm text-primary hover:underline shrink-0">
              {allOn(ALL_EMAIL) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          <div className="mb-lg">
            <label className="text-label-sm text-on-surface-variant mb-xs block">Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all max-w-sm"
            />
            <p className="text-body-sm text-on-surface-variant mt-xs">All digest emails will be sent to this address.</p>
          </div>
          <div className="space-y-sm">
            <NotifRow id="dailyDigest"   label="Daily Activity Digest"    desc="Summary of all platform activity from the previous day — sent at 7 AM" checked={settings.dailyDigest}   onChange={v => set('dailyDigest', v)} />
            <NotifRow id="weeklyReport"  label="Weekly Performance Report" desc="Case stats, revenue, and lawyer activity for the past 7 days"           checked={settings.weeklyReport}  onChange={v => set('weeklyReport', v)} />
            <NotifRow id="monthlyReport" label="Monthly Analytics Report"  desc="Full platform analytics including growth metrics — sent on the 1st"     checked={settings.monthlyReport} onChange={v => set('monthlyReport', v)} />
          </div>
        </div>

        {/* ── Lawyer Activity ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <SectionHeader icon={Briefcase} title="Lawyer Activity" subtitle="Notifications about lawyers on the platform" color="text-green-600" />
            <button onClick={() => toggle(ALL_LAWYER, !allOn(ALL_LAWYER))} className="text-label-sm text-primary hover:underline shrink-0">
              {allOn(ALL_LAWYER) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          <div className="space-y-sm">
            <NotifRow id="lawyerCaseUpdate"     label="Lawyer Updates Case Status"    desc="When a lawyer changes the status of an assigned case"        checked={settings.lawyerCaseUpdate}     onChange={v => set('lawyerCaseUpdate', v)} />
            <NotifRow id="lawyerLogin"          label="Lawyer Login Activity"          desc="When a lawyer logs in to their account (security monitoring)" checked={settings.lawyerLogin}          onChange={v => set('lawyerLogin', v)} />
            <NotifRow id="lawyerRatingReceived" label="New Lawyer Rating / Review"     desc="When a client rates or reviews an assigned lawyer"           checked={settings.lawyerRatingReceived} onChange={v => set('lawyerRatingReceived', v)} />
          </div>
        </div>

        {/* ── User Activity ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <SectionHeader icon={Users} title="User Activity" subtitle="Track registered user actions across the platform" color="text-purple-600" />
            <button onClick={() => toggle(ALL_USER, !allOn(ALL_USER))} className="text-label-sm text-primary hover:underline shrink-0">
              {allOn(ALL_USER) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          <div className="space-y-sm">
            <NotifRow id="userLogin"           label="User Login Activity"        desc="When a registered user logs into the platform"              checked={settings.userLogin}           onChange={v => set('userLogin', v)} />
            <NotifRow id="userProfileUpdate"   label="User Profile Updated"        desc="When a user makes changes to their profile information"     checked={settings.userProfileUpdate}   onChange={v => set('userProfileUpdate', v)} />
            <NotifRow id="userDocumentUploaded" label="Document Uploaded by User"  desc="When a user uploads a document to an existing case"         checked={settings.userDocumentUploaded} onChange={v => set('userDocumentUploaded', v)} />
          </div>
        </div>

        {/* ── System / Security ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <div className="flex items-center justify-between mb-lg">
            <SectionHeader icon={Shield} title="System & Security" subtitle="Critical infrastructure and security alerts" />
            <button onClick={() => toggle(ALL_SYSTEM, !allOn(ALL_SYSTEM))} className="text-label-sm text-primary hover:underline shrink-0">
              {allOn(ALL_SYSTEM) ? 'Disable All' : 'Enable All'}
            </button>
          </div>
          <div className="space-y-sm">
            <NotifRow id="systemAlerts"      label="System Health Alerts"      desc="Errors, downtime, or performance issues detected"              checked={settings.systemAlerts}      onChange={v => set('systemAlerts', v)} badge="Critical" />
            <NotifRow id="securityAlerts"    label="Security Alerts"           desc="Suspicious login attempts or access policy violations"         checked={settings.securityAlerts}    onChange={v => set('securityAlerts', v)} badge="Critical" />
            <NotifRow id="maintenanceNotices" label="Maintenance Notices"      desc="Scheduled maintenance windows and system update notifications" checked={settings.maintenanceNotices} onChange={v => set('maintenanceNotices', v)} />
          </div>
        </div>

        {/* ── Delivery Channels ── */}
        <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
          <SectionHeader icon={Globe} title="Delivery Channels" subtitle="Choose how to receive your admin notifications" />
          <div className="space-y-sm">
            <NotifRow id="browserPush" label="Browser Push Notifications" desc="Real-time notifications in the browser (requires permission)" checked={settings.browserPush} onChange={v => set('browserPush', v)} />
            <NotifRow id="smsAlerts"   label="SMS Alerts"                 desc="Critical alerts sent to the registered admin phone number"   checked={settings.smsAlerts}   onChange={v => set('smsAlerts', v)} />
          </div>
        </div>

        {/* Save button */}
        <div className="flex gap-md justify-end">
          <button onClick={handleSave}
            className="flex items-center gap-sm px-2xl py-md rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity shadow-md">
            <Save size={18} /> Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationSettings;
