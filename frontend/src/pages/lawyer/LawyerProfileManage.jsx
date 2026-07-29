import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  Briefcase, Star, Award, GraduationCap, FileText,
  Shield, Bell, Camera, CheckCircle, Eye, EyeOff,
  Lock, AlertCircle, ChevronRight, Upload, Trash2,
  Clock, Settings, Loader2, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateLawyerProfile, uploadAvatar } from '../../services/user.service';
import { AuthContext } from '../../App';

/* ─── Toggle ─────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/* ─── Field helper ───────────────────────────────────────────── */
function Field({ label, field, value, type = 'text', editing, draft, setDraft, fullWidth, selectOptions, rows }) {
  const base = "w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="text-label-sm text-on-surface-variant block mb-xs">{label}</label>
      {editing ? (
        rows
          ? <textarea rows={rows} value={draft[field]} onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))} className={`${base} resize-none`} />
          : selectOptions
            ? <select value={draft[field]} onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))} className={`${base} bg-white`}>
                {selectOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            : <input type={type} value={draft[field]} onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))} className={base} />
      ) : (
        <p className="text-body-md text-on-surface font-medium">{value || '—'}</p>
      )}
    </div>
  );
}

/* ─── Tabs config ────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',   label: 'Profile',       icon: User },
  { id: 'security',  label: 'Security',      icon: Shield },
  { id: 'notif',     label: 'Notifications', icon: Bell },
  { id: 'documents', label: 'Credentials',   icon: GraduationCap },
];

/* ─── Main ───────────────────────────────────────────────────── */
const LawyerProfileManage = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [tab,     setTab]     = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name:            '',
    email:           '',
    phone:           '',
    barCouncilId:    '',
    specialization:  'Civil Law',
    experience:      '',
    location:        '',
    state:           '',
    languages:       '',
    education:       '',
    bio:             '',
    consultationFee: '',
    availability:    '',
    linkedIn:        '',
    website:         '',
    avatarUrl:       null,
  });

  const [draft, setDraft] = useState(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          const user = response.data;
          const p = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            barCouncilId: user.lawyerProfile?.barCouncilId || '',
            specialization: user.lawyerProfile?.specialization || 'Civil Law',
            experience: user.lawyerProfile?.experience || '',
            location: user.lawyerProfile?.location || '',
            state: user.lawyerProfile?.state || '',
            languages: user.lawyerProfile?.languages || '',
            education: user.lawyerProfile?.education || '',
            bio: user.lawyerProfile?.bio || '',
            consultationFee: user.lawyerProfile?.consultationFee || '',
            availability: user.lawyerProfile?.availability || '',
            linkedIn: user.lawyerProfile?.linkedIn || '',
            website: user.lawyerProfile?.website || '',
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
    fetchProfile();
  }, []);

  // Password
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });
  const [pwdErr, setPwdErr] = useState('');
  const [pwdOk, setPwdOk]   = useState(false);

  // Notifications
  const [notif, setNotif] = useState({
    newCaseAssigned:  true,
    clientMessages:   true,
    hearingReminders: true,
    paymentReceived:  true,
    clientReviews:    true,
    adminAlerts:      true,
    emailDigest:      false,
    smsAlerts:        true,
    promotionalEmails: false,
  });

  const initials = profile.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'A';

  const handleSave = async () => {
    try {
      const response = await updateLawyerProfile({
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        lawyerProfile: {
          specialization: draft.specialization,
          experience: draft.experience ? parseInt(draft.experience) : null,
          location: draft.location,
          state: draft.state,
          languages: draft.languages,
          education: draft.education,
          bio: draft.bio,
          consultationFee: draft.consultationFee ? parseFloat(draft.consultationFee) : null,
          availability: draft.availability,
          linkedIn: draft.linkedIn,
          website: draft.website,
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
      setProfile(p => ({ ...p, avatarUrl: profile.avatarUrl }));
      setDraft(p => ({ ...p, avatarUrl: draft.avatarUrl }));
    }
  };

  const handlePwd = (e) => {
    e.preventDefault();
    setPwdErr('');
    if (!pwd.current)              return setPwdErr('Enter your current password.');
    if (pwd.newPwd.length < 8)     return setPwdErr('New password must be at least 8 characters.');
    if (pwd.newPwd !== pwd.confirm) return setPwdErr('Passwords do not match.');
    setPwdOk(true);
    setPwd({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setPwdOk(false), 3000);
  };

  const stats = [
    { label: 'Cases Handled', value: '48',  color: 'text-primary',    bg: 'bg-primary/5',  icon: <Briefcase  size={18} className="text-primary"    /> },
    { label: 'Success Rate',  value: '87%', color: 'text-green-600',  bg: 'bg-green-50',   icon: <Award      size={18} className="text-green-600"  /> },
    { label: 'Rating',        value: '4.8', color: 'text-yellow-600', bg: 'bg-yellow-50',  icon: <Star       size={18} className="text-yellow-500" /> },
    { label: 'Reviews',       value: '36',  color: 'text-blue-600',   bg: 'bg-blue-50',    icon: <FileText   size={18} className="text-blue-600"   /> },
  ];

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">My Profile</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Manage your professional profile, security and notification settings.</p>
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
              <button onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
                <Camera size={14} />
              </button>
              <input ref={avatarRef} type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
            </div>

            <h2 className="text-headline-sm text-on-surface">{profile.name}</h2>
            <p className="text-body-sm text-on-surface-variant mt-xs">{profile.specialization} Specialist</p>
            <div className="flex items-center justify-center gap-xs mt-sm text-body-sm text-on-surface-variant">
              <MapPin size={13} /> {profile.location}, {profile.state}
            </div>

            <div className="mt-md bg-green-50 border border-green-200 rounded-xl p-sm">
              <p className="text-label-sm text-green-700 font-semibold">✅ Verified Lawyer</p>
              <p className="text-body-sm text-green-600 mt-xs">{profile.barCouncilId}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-lg shadow-card">
            <h3 className="text-label-md font-semibold text-on-surface mb-md">Performance</h3>
            <div className="space-y-sm">
              {stats.map((s, i) => (
                <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl px-md py-sm`}>
                  <div className="flex items-center gap-sm">{s.icon}<span className="text-body-sm text-on-surface">{s.label}</span></div>
                  <span className={`text-body-md font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Availability quick card */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-lg space-y-md">
            <div>
              <p className="text-label-sm text-primary">Availability</p>
              <p className="text-body-md font-semibold text-on-surface mt-xs">{profile.availability}</p>
            </div>
            <div>
              <p className="text-label-sm text-primary">Consultation Fee</p>
              <p className="text-body-md font-semibold text-on-surface mt-xs">{profile.consultationFee} / session</p>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="bg-white border border-surface-container-high rounded-2xl shadow-card overflow-hidden">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-md px-lg py-md text-body-md transition-colors border-l-[3px]
                  ${tab === t.id
                    ? 'border-primary text-primary bg-primary/5 font-semibold'
                    : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}>
                <t.icon size={16} /> {t.label}
                {tab === t.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right content ── */}
        <div className="lg:col-span-3 space-y-lg">

          {/* ═══ TAB: Profile ═════════════════════════════════ */}
          {tab === 'profile' && (
            <>
              {/* Professional Details */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <div className="flex items-center justify-between mb-xl">
                  <div className="flex items-center gap-md">
                    <h3 className="text-headline-sm text-on-surface flex items-center gap-sm">
                      <Briefcase size={18} className="text-primary" /> Professional Details
                    </h3>
                  </div>
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
                  <Field label="Full Name"            field="name"            value={profile.name}            editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="Specialization"       field="specialization"  value={profile.specialization}  editing={editing} draft={draft} setDraft={setDraft}
                    selectOptions={['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Consumer Law', 'Corporate Law', 'Property Law', 'Tax Law']} />
                  <Field label="Experience (years)"   field="experience"      value={profile.experience}      editing={editing} draft={draft} setDraft={setDraft} type="number" />
                  <Field label="Languages Known"      field="languages"       value={profile.languages}       editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="City / Location"      field="location"        value={profile.location}        editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="State"                field="state"           value={profile.state}           editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="Consultation Fee"     field="consultationFee" value={profile.consultationFee} editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="Availability"         field="availability"    value={profile.availability}    editing={editing} draft={draft} setDraft={setDraft} />
                  <Field label="Education / Degree"   field="education"       value={profile.education}       editing={editing} draft={draft} setDraft={setDraft} fullWidth />
                  <Field label="LinkedIn Profile URL" field="linkedIn"        value={profile.linkedIn}        editing={editing} draft={draft} setDraft={setDraft} fullWidth />
                  <Field label="Professional Bio"     field="bio"             value={profile.bio}             editing={editing} draft={draft} setDraft={setDraft} rows={4} fullWidth />
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                  <Mail size={18} className="text-primary" /> Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {[
                    { icon: Mail,  label: 'Email',        field: 'email', type: 'email' },
                    { icon: Phone, label: 'Phone Number', field: 'phone', type: 'tel'   },
                  ].map(({ icon: Icon, label, field, type }) => (
                    <div key={field} className="flex items-center gap-md bg-surface-container-low rounded-xl p-md">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-label-sm text-on-surface-variant">{label}</p>
                        {editing
                          ? <input type={type} value={draft[field]} onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))}
                              className="w-full border border-outline-variant rounded-lg px-sm py-xs text-body-md focus:outline-none focus:border-primary mt-xs" />
                          : <p className="text-body-md font-medium text-on-surface">{profile[field]}</p>
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

              {pwdOk && (
                <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-md py-sm mb-lg">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-body-sm text-green-700 font-medium">Password updated successfully!</p>
                </div>
              )}
              {pwdErr && (
                <div className="flex items-center gap-sm bg-red-50 border border-red-200 rounded-xl px-md py-sm mb-lg">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-body-sm text-red-600">{pwdErr}</p>
                </div>
              )}

              <form onSubmit={handlePwd} className="space-y-md">
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
                        {showPwd[id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Strength bar */}
                {pwd.newPwd && (
                  <div>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          pwd.newPwd.length > i * 2
                            ? pwd.newPwd.length < 6 ? 'bg-red-400' : pwd.newPwd.length < 10 ? 'bg-yellow-400' : 'bg-green-500'
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

              {/* Two-Factor */}
              <div className="mt-xl pt-xl border-t border-surface-container-high">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-body-md font-semibold text-on-surface">Two-Factor Authentication</h4>
                    <p className="text-body-sm text-on-surface-variant mt-xs">Add an extra layer of security to your lawyer account.</p>
                  </div>
                  <button className="text-label-sm text-primary border border-primary/30 hover:bg-primary/5 px-md py-sm rounded-lg transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-xl pt-xl border-t border-surface-container-high">
                 <h3 className="text-headline-sm text-red-600 mb-sm flex items-center gap-sm">
                  <AlertCircle size={18} className="text-red-500" /> Danger Zone
                </h3>
                <p className="text-body-md text-on-surface-variant mb-lg">
                  Once you delete your account, all your cases, documents and data will be permanently removed. This cannot be undone.
                </p>
                <div className="flex gap-sm">
                  <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-sm px-xl py-sm rounded-xl border border-outline-variant text-body-md font-semibold hover:bg-surface-container transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: Notifications ═══════════════════════════ */}
          {tab === 'notif' && (
            <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
              <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                <Bell size={20} className="text-primary" /> Notification Settings
              </h3>

              <div className="space-y-xl">
                {/* Case notifications */}
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Case Activity</p>
                  <div className="space-y-sm">
                    {[
                      { key: 'newCaseAssigned',  label: 'New Case Assigned',      desc: 'When admin assigns a new case to you' },
                      { key: 'clientMessages',   label: 'Client Messages',         desc: 'When a client sends you a new message' },
                      { key: 'hearingReminders', label: 'Hearing Reminders',       desc: '24-hour reminder before court hearings' },
                      { key: 'clientReviews',    label: 'Client Reviews',          desc: 'When a client rates or reviews your service' },
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

                {/* Payment & Admin */}
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Payments & Admin</p>
                  <div className="space-y-sm">
                    {[
                      { key: 'paymentReceived', label: 'Payment Received',   desc: 'Fee credited to your account for a case' },
                      { key: 'adminAlerts',     label: 'Admin Alerts',       desc: 'Important notices from the LawLink admin team' },
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

                {/* External channels */}
                <div>
                  <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">External Channels</p>
                  <div className="space-y-sm">
                    {[
                      { key: 'smsAlerts',        label: 'SMS Alerts',         desc: 'Critical case updates via SMS' },
                      { key: 'emailDigest',       label: 'Weekly Email Digest',desc: 'Summary of all case activities by email' },
                      { key: 'promotionalEmails', label: 'Platform Newsletters',desc: 'Updates, tips and news from LawLink' },
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
                  onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                  className="flex items-center gap-sm px-xl py-sm rounded-xl bg-primary text-on-primary text-body-md font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save size={16} /> Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* ═══ TAB: Documents / Credentials ════════════════ */}
          {tab === 'documents' && (
            <div className="space-y-lg">
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
                  <GraduationCap size={20} className="text-primary" /> Legal Credentials
                </h3>

                <div className="space-y-sm">
                  {[
                    { label: 'Bar Association Certificate', status: 'Verified',        color: 'bg-green-100 text-green-700', expiry: 'Valid for life' },
                    { label: 'Law Degree Certificate',  status: 'Verified',        color: 'bg-green-100 text-green-700', expiry: 'Permanent' },
                    { label: 'Practice Certificate 2024', status: 'Pending Renewal', color: 'bg-yellow-100 text-yellow-700', expiry: 'Expires Dec 2024' },
                    { label: 'Good Standing Certificate', status: 'Not Uploaded',  color: 'bg-red-100 text-red-600',    expiry: '—' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-container-low rounded-xl p-md">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-lg bg-white border border-surface-container-high flex items-center justify-center">
                          <FileText size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-body-md text-on-surface font-medium">{doc.label}</p>
                          <p className="text-body-sm text-on-surface-variant mt-xs">{doc.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className={`text-label-sm px-sm py-xs rounded-full ${doc.color}`}>{doc.status}</span>
                        <button className="flex items-center gap-xs text-body-sm text-primary hover:underline">
                          <Upload size={13} /> Upload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Association ID */}
              <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
                <h3 className="text-headline-sm text-on-surface mb-md">Bar Association Registration</h3>
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-lg">
                  <div>
                    <p className="text-label-sm text-green-700">Registered ID</p>
                    <p className="text-body-md font-bold text-on-surface mt-xs">{profile.barCouncilId}</p>
                    <p className="text-body-sm text-green-600 mt-xs">✅ Verified by LawLink on June 15, 2024</p>
                  </div>
                  <Shield size={32} className="text-green-600 opacity-40" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerProfileManage;
