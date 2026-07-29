import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/auth.service';
import { Scale, Eye, EyeOff, CheckCircle, User, Briefcase, Shield } from 'lucide-react';

const roles = [
  { value: 'user', label: 'Client / User', icon: <User size={22} />, desc: 'I need legal help and want to file complaints or find a lawyer.' },
  { value: 'lawyer', label: 'Lawyer', icon: <Briefcase size={22} />, desc: 'I am a verified advocate looking to offer my legal services.' },
];

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    barCouncilId: '', specialization: '', experience: '',
  });
  const [agreed, setAgreed] = useState(false);

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');

    try {
      // Setup payload based on role
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        city: 'Colombo', // Dummy for now since it's not in the UI
        role: role.toUpperCase(),
      };

      if (role === 'lawyer') {
        payload.specialization = form.specialization;
        payload.barCouncilId = form.barCouncilId;
        payload.experience = parseInt(form.experience, 10) || 0;
      }

      const response = await register(payload);
      if (response.success) {
        if (onLogin) {
          onLogin(response.data.user, response.data.user.role, response.data.accessToken);
        }
        
        setTimeout(() => {
          navigate(role === 'lawyer' ? '/lawyer' : '/user');
        }, 300);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-gradient-to-br from-primary via-primary-container to-[#1a2f7a] flex-col justify-between p-3xl text-on-primary">
        <div className="flex items-center gap-sm">
          <Scale size={28} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </div>
        <div>
          <h2 className="text-headline-lg font-bold mb-lg">Join Sri Lanka's Most Trusted Legal Platform</h2>
          <div className="space-y-lg">
            {[
              { icon: '⚖️', text: 'Access 1,500+ verified lawyers across Sri Lanka' },
              { icon: '📋', text: 'File and track legal complaints seamlessly' },
              { icon: '🔒', text: 'Secure, encrypted platform for sensitive matters' },
              { icon: '✅', text: '75%+ case resolution rate' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-md text-body-md text-on-primary/90">
                <span className="text-xl">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-body-sm text-on-primary/50">© 2024 LawLink. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex justify-center items-center p-lg overflow-y-auto">
        <div className="w-full max-w-[520px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-sm mb-xl">
            <Scale size={24} className="text-primary" />
            <span className="text-headline-sm font-bold text-primary">LawLink</span>
          </div>

          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            <div className="mb-xl">
              <h2 className="text-headline-lg text-on-surface">Create your account</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">Join LawLink and get started for free.</p>
            </div>

            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-sm mb-xl">
              {roles.map(r => (
                <div key={r.value} onClick={() => setRole(r.value)}
                  className={`p-lg rounded-xl border-2 cursor-pointer transition-all
                    ${role === r.value ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/30'}`}>
                  <div className={`mb-sm ${role === r.value ? 'text-primary' : 'text-on-surface-variant'}`}>{r.icon}</div>
                  <p className={`text-label-md font-bold ${role === r.value ? 'text-primary' : 'text-on-surface'}`}>{r.label}</p>
                  <p className="text-body-sm text-on-surface-variant mt-xs leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-md">
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-body-sm text-center">
                  {error}
                </div>
              )}
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Full Name *</label>
                  <input type="text" placeholder={role === 'lawyer' ? 'Adv. Your Name' : 'Your full name'}
                    value={form.name} onChange={e => update('name', e.target.value)} required
                    className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Phone Number *</label>
                  <input type="tel" placeholder="+94 77 123 4567"
                    value={form.phone} onChange={e => update('phone', e.target.value)} required
                    className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Email Address *</label>
                <input type="email" placeholder="you@email.com"
                  value={form.email} onChange={e => update('email', e.target.value)} required
                  className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>

              {/* Lawyer-specific fields */}
              {role === 'lawyer' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md p-lg bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="sm:col-span-2">
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Bar Association ID *</label>
                    <input type="text" placeholder="e.g. BASL/12345"
                      value={form.barCouncilId} onChange={e => update('barCouncilId', e.target.value)} required
                      className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Experience (years) *</label>
                    <input type="number" placeholder="e.g., 8"
                      value={form.experience} onChange={e => update('experience', e.target.value)} required
                      className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Specialization *</label>
                    <select value={form.specialization} onChange={e => update('specialization', e.target.value)} required
                      className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary transition-all">
                      <option value="">Select your specialization...</option>
                      {['Civil Law', 'Criminal Law', 'Family Law', 'Labour Law', 'Property Law', 'Corporate Law', 'Consumer Law'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Password *</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                      value={form.password} onChange={e => update('password', e.target.value)} required minLength={8}
                      className="w-full border border-outline-variant rounded-xl px-md py-sm pr-10 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-xs block">Confirm Password *</label>
                  <input type="password" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required
                    className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-sm cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-xs accent-primary" required />
                <span className="text-body-sm text-on-surface-variant">
                  I agree to LawLink's{' '}
                  <span className="text-primary underline cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-primary underline cursor-pointer">Privacy Policy</span>.
                </span>
              </label>

              <button type="submit" disabled={!agreed || loading}
                className={`w-full py-md rounded-xl text-body-lg font-semibold transition-all flex items-center justify-center gap-2
                  ${(agreed && !loading) ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
                {loading ? <div className="w-5 h-5 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-body-sm text-center text-on-surface-variant mt-lg">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline no-underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
