import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  Shield, Clock, Briefcase, Camera, CheckCircle,
  Eye, EyeOff, AlertCircle, Bell, BellOff, Lock,
  Trash2, ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateMe, uploadAvatar } from '../../services/user.service';
import { AuthContext } from '../../App';

/* ─── Tabs ───────────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',   label: 'Personal Info',  icon: User },
  { id: 'security',  label: 'Security',       icon: Shield },
  { id: 'notif',     label: 'Notifications',  icon: Bell },
  { id: 'account',   label: 'Account',        icon: Settings2 },
];

// inline icon since lucide has no Settings2 in older builds
function Settings2({ size = 18, className = '' }) {
  return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function Field({ label, value, field, type = 'text', editing, draft, setDraft, selectOptions }) {
  if (!editing) {
    return (
      <div>
        <label className="text-label-sm text-on-surface-variant block mb-xs">{label}</label>
        <p className="text-body-md text-on-surface font-medium">{value || '—'}</p>
      </div>
    );
  }
  if (selectOptions) {
    return (
      <div>
        <label className="text-label-sm text-on-surface-variant block mb-xs">{label}</label>
        <select
          value={draft[field]}
          onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))}
          className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
        >
          {selectOptions.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="text-label-sm text-on-surface-variant block mb-xs">{label}</label>
      <input
        type={type}
        value={draft[field]}
        onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))}
        className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
const UserProfile = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [tab,     setTab]     = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name:     '',
    email:    '',
    phone:    '',
    city:     '',
    state:    '',
    pincode:  '',
    dob:      '',
    gender:   'Prefer not to say',
    language: '',
    address:  '',
    bio:      '',
    avatarUrl: null,
  });

  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          const user = response.data;
          const p = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            state: user.clientProfile?.state || '',
            pincode: user.clientProfile?.pincode || '',
            dob: user.clientProfile?.dob || '',
            gender: user.clientProfile?.gender || 'Prefer not to say',
            language: user.clientProfile?.preferredLanguage || '',
            address: user.clientProfile?.address || '',
            bio: user.clientProfile?.bio || '',
            avatarUrl: user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${user.avatar}`) : null,
          };
          setProfile(p);
          setDraft(p);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // password state
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // notification prefs
  const [notif, setNotif] = useState({
    caseUpdates:      true,
    lawyerMessages:   true,
    hearingReminders: true,
    paymentAlerts:    true,
    newsAndTips:      false,
    smsAlerts:        true,
    emailDigest:      false,
  });

  const initials = profile.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  /* save profile */
  const handleSave = async () => {
    try {
      const response = await updateMe({
        name: draft.name,
        phone: draft.phone,
        city: draft.city,
        clientProfile: {
          state: draft.state,
          pincode: draft.pincode,
          dob: draft.dob,
          gender: draft.gender,
          preferredLanguage: draft.language,
          address: draft.address,
          bio: draft.bio,
        }
      });
      if (response.success) {
        setProfile(draft);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* avatar pick */
  const handleAvatar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Show local preview immediately
    const localUrl = URL.createObjectURL(f);
    setProfile(p => ({ ...p, avatarUrl: localUrl }));
    setDraft(p => ({ ...p, avatarUrl: localUrl }));

    try {
      const response = await uploadAvatar(f);
      if (response.success) {
        const remoteUrl = response.data.avatarUrl.startsWith('http') ? response.data.avatarUrl : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${response.data.avatarUrl}`;
        setProfile(p => ({ ...p, avatarUrl: remoteUrl }));
        setDraft(p => ({ ...p, avatarUrl: remoteUrl }));
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('Failed to save profile picture. If using Cloudinary, check your API keys in .env!');
      // Revert preview
      setProfile(p => ({ ...p, avatarUrl: profile.avatarUrl }));
      setDraft(p => ({ ...p, avatarUrl: draft.avatarUrl }));
    }
  };

  /* password change */
  const handlePwdChange = (e) => {
    e.preventDefault();
    setPwdError('');
    if (!pwd.current)             return setPwdError('Enter your current password.');
    if (pwd.newPwd.length < 8)    return setPwdError('New password must be at least 8 characters.');
    if (pwd.newPwd !== pwd.confirm) return setPwdError('Passwords do not match.');
    setPwdSuccess(true);
    setPwd({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const stats = [
    { label: 'Cases Filed',   value: 3, color: 'text-primary',    bg: 'bg-primary/10',  icon: <Briefcase size={18} className="text-primary" /> },
    { label: 'Active Cases',  value: 2, color: 'text-yellow-600', bg: 'bg-yellow-50',   icon: <Clock     size={18} className="text-yellow-600" /> },
    { label: 'Resolved',      value: 1, color: 'text-green-600',  bg: 'bg-green-50',    icon: <CheckCircle size={18} className="text-green-600" /> },
  ];

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">My Profile</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Manage your personal info, security and notification preferences.</p>
      </div>

      {/* ── Save toast ── */}
      {saved && (
        <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-body-md text-green-700 font-medium">Profile updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">

        {/* ── Left sidebar ── */}
        <div className="space-y-lg">
          {/* Avatar card */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card text-center">
            <div className="relative w-24 h-24 mx-auto mb-lg">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
                : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-headline-lg font-bold text-on-primary border-4 border-primary/20">{initials}</div>
              }
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                title="Change photo"
              >
                <Camera size={14} />
              </button>
              <input ref={avatarRef} type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
            </div>

            <h2 className="text-headline-sm text-on-surface">{profile.name}</h2>
            <p className="text-body-sm text-on-surface-variant mt-xs">Registered User</p>
            <div className="flex items-center justify-center gap-xs mt-sm text-body-sm text-on-surface-variant">
              <MapPin size={13} /> {profile.city}, {profile.state}
            </div>
            <div className="mt-lg pt-lg border-t border-surface-container-high">
              <p className="text-body-sm text-on-surface-variant italic leading-relaxed">"{profile.bio}"</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card">
            <h3 className="text-label-md font-semibold text-on-surface mb-md">Case Summary</h3>
            <div className="space-y-sm">
              {stats.map((s, i) => (
                <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl px-md py-sm`}>
                  <div className="flex items-center gap-sm">
                    {s.icon}
                    <span className="text-body-sm text-on-surface">{s.label}</span>
                  </div>
                  <span className={`text-headline-sm font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav tabs */}
          <div className="bg-white border border-surface-container-high rounded-2xl shadow-card overflow-hidden">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-md px-lg py-md text-body-md transition-colors border-l-[3px]
                  ${tab === t.id
                    ? 'border-primary text-primary bg-primary/5 font-semibold'
                    : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                <t.icon size={16} />
                {t.label}
                {tab === t.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="lg:col-span-3 space-y-lg">

          {/* ═══ TAB: Personal Info ═══════════════════════════ */}
          {tab === 'profile' && (
            <>
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <div className="flex items-center justify-between mb-xl">
                  <h3 className="text-headline-sm text-on-surface flex items-center gap-sm">
                    <User size={20} className="text-primary" /> Personal Information
                  </h3>
                  {!editing ? (
                    <button onClick={() => { setDraft(profile); setEditing(true); }}
                      className="flex items-center gap-xs px-md py-xs rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                      <Edit2 size={13} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-sm">
                      <button onClick={() => setEditing(false)}
                        className="flex items-center gap-xs px-md py-xs rounded-lg border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                        <X size={13} /> Cancel
                      </button>
                      <button onClick={handleSave}
                        className="flex items-center gap-xs px-md py-xs rounded-lg bg-primary text-on-primary text-body-sm hover:opacity-90 transition-opacity">
                        <Save size={13} /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  <Field label="Full Name"        field="name"     value={profile.name}     editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="Date of Birth"    field="dob"      value={profile.dob}      editing={editing} draft={draft} setDraft={setDraft} type="date" />
                  <Field label="Gender"           field="gender"   value={profile.gender}   editing={editing} draft={draft} setDraft={setDraft} selectOptions={['Male', 'Female', 'Other', 'Prefer not to say']} />
                  <Field label="Preferred Language" field="language" value={profile.language} editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="City"             field="city"     value={profile.city}     editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="State"            field="state"    value={profile.state}    editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="PIN Code"         field="pincode"  value={profile.pincode}  editing={editing} draft={draft} setDraft={setDraft} />
                  <div className="sm:col-span-2">
                    <label className="text-label-sm text-on-surface-variant block mb-xs">Bio / About</label>
                    {editing
                      ? <textarea rows={2} value={draft.bio} onChange={e => setDraft(p => ({ ...p, bio: e.target.value }))}
                          className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary resize-none transition-all" />
                      : <p className="text-body-md text-on-surface font-medium">{profile.bio}</p>
                    }
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-label-sm text-on-surface-variant block mb-xs">Full Address</label>
                    {editing
                      ? <textarea rows={2} value={draft.address} onChange={e => setDraft(p => ({ ...p, address: e.target.value }))}
                          className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary resize-none transition-all" />
                      : <p className="text-body-md text-on-surface font-medium">{profile.address}</p>
                    }
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                  <Mail size={20} className="text-primary" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  {[
                    { icon: Mail,  label: 'Email Address', value: profile.email,  field: 'email', type: 'email' },
                    { icon: Phone, label: 'Phone Number',  value: profile.phone,  field: 'phone', type: 'tel'   },
                  ].map(({ icon: Icon, label, value, field, type }) => (
                    <div key={field} className="flex items-center gap-md bg-surface-container-low rounded-xl p-md">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-sm text-on-surface-variant">{label}</p>
                        {editing
                          ? <input type={type} value={draft[field]} onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-sm py-xs text-body-md focus:outline-none focus:border-primary mt-xs" />
                          : <p className="text-body-md font-medium text-on-surface">{value}</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ TAB: Security ════════════════════════════════ */}
          {tab === 'security' && (
            <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                <Shield size={20} className="text-primary" /> Change Password
              </h3>

              {pwdSuccess && (
                <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-md py-sm mb-lg">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-body-sm text-green-700 font-medium">Password updated successfully!</p>
                </div>
              )}
              {pwdError && (
                <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-xl px-md py-sm mb-lg">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-body-sm text-red-600">{pwdError}</p>
                </div>
              )}

              <form onSubmit={handlePwdChange} className="space-y-md">
                {[
                  { id: 'current', label: 'Current Password',     placeholder: '••••••••' },
                  { id: 'newPwd',  label: 'New Password',         placeholder: 'Min 8 characters' },
                  { id: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
                ].map(({ id, label, placeholder }) => (
                  <div key={id}>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">{label}</label>
                    <div className="relative">
                      <input
                        type={showPwd[id] ? 'text' : 'password'}
                        placeholder={placeholder}
                        value={pwd[id]}
                        onChange={e => setPwd(p => ({ ...p, [id]: e.target.value }))}
                        className="w-full border border-outline-variant rounded-xl px-md py-sm pr-10 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <button type="button" onClick={() => setShowPwd(p => ({ ...p, [id]: !p[id] }))}
                        className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                        {showPwd[id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* strength indicator */}
                {pwd.newPwd && (
                  <div>
                    <div className="flex gap-1 mt-xs">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          pwd.newPwd.length > i * 2
                            ? pwd.newPwd.length < 6  ? 'bg-red-400'
                            : pwd.newPwd.length < 10 ? 'bg-yellow-400'
                            :                          'bg-green-500'
                            : 'bg-surface-container-high'}`} />
                      ))}
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-xs">
                      {pwd.newPwd.length < 6 ? 'Weak' : pwd.newPwd.length < 10 ? 'Fair' : 'Strong'} password
                    </p>
                  </div>
                )}

                <button type="submit"
                  className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity">
                  <Lock size={16} /> Update Password
                </button>
              </form>

              {/* Active sessions */}
              <div className="mt-xl pt-xl border-t border-surface-container-high">
                <h4 className="text-headline-sm text-on-surface mb-lg">Active Sessions</h4>
                <div className="space-y-sm">
                  {[
                    { device: 'Chrome on Windows', location: 'Colombo, Sri Lanka', time: 'Now — current session', current: true },
                    { device: 'Safari on iPhone',  location: 'Colombo, Sri Lanka', time: '2 hours ago',           current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container-low rounded-xl p-md">
                      <div>
                        <p className="text-body-md text-on-surface font-medium flex items-center gap-sm">
                          {s.device}
                          {s.current && <span className="text-label-sm bg-green-100 text-green-700 px-sm py-xs rounded-full">Current</span>}
                        </p>
                        <p className="text-body-sm text-on-surface-variant mt-xs">{s.location} · {s.time}</p>
                      </div>
                      {!s.current && (
                        <button className="text-body-sm text-red-500 hover:underline flex items-center gap-xs">
                          <LogOut size={13} /> Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: Notifications ═══════════════════════════ */}
          {tab === 'notif' && (
            <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                <Bell size={20} className="text-primary" /> Notification Preferences
              </h3>

              <div className="space-y-lg">
                {/* In-app */}
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">In-App Notifications</p>
                  <div className="space-y-sm">
                    {[
                      { key: 'caseUpdates',      label: 'Case Status Updates',   desc: 'When your case status changes' },
                      { key: 'lawyerMessages',   label: 'Lawyer Messages',        desc: 'New messages from your assigned lawyer' },
                      { key: 'hearingReminders', label: 'Hearing Reminders',      desc: 'Reminders before court hearings' },
                      { key: 'paymentAlerts',    label: 'Payment Alerts',         desc: 'Payment confirmations and receipts' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between bg-surface-container-low rounded-xl px-lg py-md">
                        <div>
                          <p className="text-body-md text-on-surface font-medium">{label}</p>
                          <p className="text-body-sm text-on-surface-variant">{desc}</p>
                        </div>
                        <Toggle checked={notif[key]} onChange={v => setNotif(p => ({ ...p, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* External */}
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">External Channels</p>
                  <div className="space-y-sm">
                    {[
                      { key: 'smsAlerts',   label: 'SMS Alerts',       desc: 'Critical updates via SMS to your phone' },
                      { key: 'emailDigest', label: 'Email Digest',      desc: 'Weekly summary of all case activities' },
                      { key: 'newsAndTips', label: 'News & Legal Tips', desc: 'Helpful legal articles and platform news' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between bg-surface-container-low rounded-xl px-lg py-md">
                        <div>
                          <p className="text-body-md text-on-surface font-medium">{label}</p>
                          <p className="text-body-sm text-on-surface-variant">{desc}</p>
                        </div>
                        <Toggle checked={notif[key]} onChange={v => setNotif(p => ({ ...p, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { setSaved(true); setTab('profile'); setTimeout(() => setSaved(false), 3000); }}
                  className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save size={16} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB: Account ═════════════════════════════════ */}
          {tab === 'account' && (
            <div className="space-y-lg">
              {/* Account info */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface mb-xl">Account Details</h3>
                <div className="space-y-md">
                  {[
                    { label: 'Account Type',   value: 'Registered User' },
                    { label: 'Member Since',   value: 'January 12, 2024' },
                    { label: 'Account Status', value: 'Active ✅' },
                    { label: 'User ID',        value: 'USR-00847' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container-low rounded-xl px-lg py-md">
                      <span className="text-body-md text-on-surface-variant">{item.label}</span>
                      <span className="text-body-md font-semibold text-on-surface">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data export */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface mb-sm">Your Data</h3>
                <p className="text-body-md text-on-surface-variant mb-lg">Download a copy of all your case data, documents and account information.</p>
                <button className="flex items-center gap-sm px-xl py-sm rounded-xl border border-outline-variant text-body-md hover:bg-surface-container transition-colors">
                  Export My Data
                </button>
              </div>

              {/* Danger zone */}
              <div className="bg-white border border-red-200 rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-red-600 mb-sm flex items-center gap-sm">
                  <AlertCircle size={18} className="text-red-500" /> Danger Zone
                </h3>
                <p className="text-body-md text-on-surface-variant mb-lg">
                  Once you delete your account, all your cases, documents and data will be permanently removed. This cannot be undone.
                </p>
                <div className="flex gap-sm">
                  <button className="flex items-center gap-sm px-xl py-sm rounded-xl bg-red-600 text-white text-body-md font-semibold hover:bg-red-700 transition-colors">
                    <Trash2 size={16} /> Delete My Account
                  </button>
                  <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-sm px-xl py-sm rounded-xl border border-outline-variant text-body-md font-semibold hover:bg-surface-container transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
