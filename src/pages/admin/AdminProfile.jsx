import React, { useState, useEffect, useRef } from 'react';
import { Shield, Mail, Key, Edit2, Save, X, CheckCircle, Smartphone, Globe, AlertCircle, Eye, EyeOff, Loader2, Camera } from 'lucide-react';
import { getMe, updateMe, uploadAvatar } from '../../services/user.service';

const AdminProfile = () => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@lawlink.in',
    phone: '',
    role: 'ADMIN',
    avatarUrl: null,
  });
  const [draft, setDraft] = useState(profile);
  const avatarRef = useRef(null);

  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          const user = response.data;
          const p = {
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
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
    fetchMe();
  }, []);

  const handleAvatar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
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

  const handleSaveProfile = async () => {
    try {
      const response = await updateMe({ name: draft.name, phone: draft.phone });
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

  const handlePwdChange = (e) => {
    e.preventDefault();
    if (!pwd.current || !pwd.newPwd) return setPwdMsg({ type: 'error', text: 'Please fill all fields.' });
    if (pwd.newPwd.length < 8) return setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
    if (pwd.newPwd !== pwd.confirm) return setPwdMsg({ type: 'error', text: 'Passwords do not match.' });

    setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
    setPwd({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
  };

  const inputCls = "w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

  if (loading) return <div className="flex justify-center p-xl"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface">Admin Profile</h1>
        <p className="text-body-md text-on-surface-variant mt-xs">Manage your platform administrator account and security settings.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-sm bg-green-50 border border-green-200 rounded-xl px-lg py-md mb-lg">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-body-md text-green-700 font-medium">Profile updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        {/* Left Col - Avatar & Role */}
        <div className="space-y-lg">
          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card text-center">
            <div className="relative w-24 h-24 mx-auto mb-lg">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-red-50 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center border-4 border-red-50 shadow-sm">
                  <Shield size={40} className="text-red-600" />
                </div>
              )}
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
                <Camera size={14} />
              </button>
              <input ref={avatarRef} type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
            </div>
            <h2 className="text-headline-sm text-on-surface">{profile.name}</h2>
            <span className="inline-block bg-red-50 text-red-700 border border-red-200 px-md py-xs rounded-full text-label-sm font-bold mt-sm">
              {profile.role}
            </span>
          </div>

          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-lg">
            <h3 className="text-label-md font-semibold text-on-surface flex items-center gap-xs mb-md">
              <Globe size={16} className="text-primary" /> Active Session
            </h3>
            <div className="space-y-sm text-body-sm text-on-surface-variant">
              <p>Device: Chrome / Mac</p>
              <p>Logged in: Recently</p>
            </div>
          </div>
        </div>

        {/* Right Col - Details & Security */}
        <div className="md:col-span-2 space-y-xl">

          {/* Profile Details */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            <div className="flex items-center justify-between mb-xl">
              <h3 className="text-headline-sm text-on-surface">Account Details</h3>
              {!editing ? (
                <button onClick={() => { setDraft(profile); setEditing(true); }} className="flex items-center gap-xs px-md py-sm rounded-xl border border-outline-variant text-body-sm hover:bg-surface-container transition-colors">
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-sm">
                  <button onClick={() => setEditing(false)} className="flex items-center gap-xs p-sm rounded-xl border border-outline-variant text-body-sm hover:bg-surface-container transition-colors"><X size={16} /></button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-xs px-lg py-sm rounded-xl bg-primary text-on-primary text-body-sm font-semibold hover:opacity-90 transition-opacity">
                    <Save size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Full Name</label>
                {editing ? (
                  <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputCls} />
                ) : (
                  <p className="text-body-md font-medium text-on-surface bg-surface-container-low p-sm rounded-lg">{profile.name}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Email Address</label>
                  {editing ? (
                    <input type="email" value={draft.email} disabled className={`${inputCls} bg-surface-container opacity-60 cursor-not-allowed`} />
                  ) : (
                    <p className="text-body-md font-medium text-on-surface flex items-center gap-sm bg-surface-container-low p-sm rounded-lg"><Mail size={16} className="text-primary" /> {profile.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Phone Number</label>
                  {editing ? (
                    <input type="tel" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className={inputCls} />
                  ) : (
                    <p className="text-body-md font-medium text-on-surface flex items-center gap-sm bg-surface-container-low p-sm rounded-lg"><Smartphone size={16} className="text-primary" /> {profile.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-sm mb-xl">
              <Key size={20} className="text-primary" /> Change Password
            </h3>

            {pwdMsg.text && (
              <div className={`flex items-center gap-sm rounded-xl px-lg py-md mb-lg border ${pwdMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                {pwdMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <p className="text-body-md font-medium">{pwdMsg.text}</p>
              </div>
            )}

            <form onSubmit={handlePwdChange} className="space-y-md">
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Current Password</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} className={inputCls} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">New Password</label>
                  <input type={showPwd ? "text" : "password"} value={pwd.newPwd} onChange={e => setPwd({ ...pwd, newPwd: e.target.value })} className={inputCls} placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Confirm Password</label>
                  <input type={showPwd ? "text" : "password"} value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} className={inputCls} placeholder="••••••••" />
                </div>
              </div>

              {pwd.newPwd && (
                <div className="flex gap-1 pt-xs">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${pwd.newPwd.length > i * 2 ? (pwd.newPwd.length < 6 ? 'bg-red-400' : pwd.newPwd.length < 10 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-surface-container-high'
                      }`} />
                  ))}
                </div>
              )}

              <div className="pt-sm">
                <button type="submit" className="flex items-center gap-sm px-xl py-sm rounded-xl bg-on-surface text-surface text-body-md font-semibold hover:opacity-90 transition-opacity">
                  <Key size={16} /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
