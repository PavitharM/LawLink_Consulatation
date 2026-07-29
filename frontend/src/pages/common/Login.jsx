import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/auth.service';
import { Scale, Eye, EyeOff, Mail, Lock, User, Briefcase, Shield } from 'lucide-react';

const roles = [
  { value: 'user', label: 'Client', icon: <User size={20} />, desc: 'Login as a user', path: '/user' },
  { value: 'lawyer', label: 'Lawyer', icon: <Briefcase size={20} />, desc: 'Login as a lawyer', path: '/lawyer' },
  { value: 'admin', label: 'Admin', icon: <Shield size={20} />, desc: 'Admin console', path: '/admin' },
];

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginApi({ email, password });
      
      if (response.success) {
        if (onLogin) {
          onLogin(response.data.user, response.data.user.role, response.data.accessToken);
        }
        
        // Wait briefly for smooth transition
        setTimeout(() => {
          const r = roles.find(r => r.value === response.data.user.role.toLowerCase());
          navigate(r?.path || '/user');
        }, 300);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-gradient-to-br from-primary via-primary-container to-[#1a2f7a] flex-col justify-between p-3xl text-on-primary relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-sm">
          <Scale size={28} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-headline-lg font-bold mb-md leading-tight">
            Access Your Legal Dashboard
          </h2>
          <p className="text-body-lg text-on-primary/80 mb-xl leading-relaxed">
            Manage your cases, connect with lawyers, and track your legal journey — all in one place.
          </p>
          <div className="space-y-md">
              {[
                { icon: '⚖️', text: 'Access to top legal professionals' },
                { icon: '🔒', text: '100% confidential and secure' },
                { icon: '📱', text: 'Available 24/7, anywhere in Sri Lanka' },
              ].map((item, i) => (
              <div key={i} className="flex items-center gap-md">
                <span className="text-xl">{item.icon}</span>
                <span className="text-body-md text-on-primary/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

          <div className="relative z-10 h-full flex flex-col justify-end pb-2xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-xl border border-white/20">
              <div className="flex gap-xs text-yellow-400 mb-md">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-body-lg font-medium leading-relaxed mb-md">"LawLink made finding the right lawyer incredibly simple. The platform is seamless and the professionals are top-notch."</p>
              <p className="text-label-md text-on-primary font-semibold">— Kavindu Perera, Colombo</p>
            </div>
          </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-[460px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-sm mb-xl">
            <Scale size={24} className="text-primary" />
            <span className="text-headline-sm font-bold text-primary">LawLink</span>
          </div>

          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            <div className="mb-xl">
              <h2 className="text-headline-lg text-on-surface">Welcome back</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">Sign in to your LawLink account.</p>
            </div>

            {/* Role Selector 
            <div className="mb-xl">
              <p className="text-label-sm text-on-surface-variant mb-sm">Login as</p>
              <div className="grid grid-cols-3 gap-sm">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-xs py-md px-sm rounded-xl border-2 transition-all
                      ${role === r.value ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/30 hover:bg-surface-container-low'}`}
                  >
                    <span className={role === r.value ? 'text-primary' : 'text-on-surface-variant'}>{r.icon}</span>
                    <span className={`text-label-sm font-semibold ${role === r.value ? 'text-primary' : 'text-on-surface-variant'}`}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            */}

            {error && (
              <div className="mb-md p-3 bg-error/10 border border-error/20 text-error rounded-lg text-body-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-md">
              {/* Email */}
              <div>
                <label className="text-label-sm text-on-surface-variant mb-xs block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-md border border-outline-variant rounded-xl py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label className="text-label-sm text-on-surface-variant">Password</label>
                  <Link to="/forgot-password" className="text-body-sm text-primary hover:underline no-underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 border border-outline-variant rounded-xl py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" className="accent-primary" />
                <span className="text-body-sm text-on-surface-variant">Remember me for 30 days</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-md rounded-xl text-body-lg font-semibold transition-all flex items-center justify-center gap-sm
                  ${loading ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary text-on-primary hover:opacity-90'}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-md my-lg">
              <div className="flex-1 h-px bg-surface-container-high" />
              <span className="text-body-sm text-on-surface-variant">New to LawLink?</span>
              <div className="flex-1 h-px bg-surface-container-high" />
            </div>

            <Link to="/register" className="no-underline">
              <button className="w-full py-sm rounded-xl border border-outline-variant text-body-md font-semibold text-on-surface hover:bg-surface-container-low hover:border-primary/30 transition-all">
                Create a Free Account
              </button>
            </Link>
          </div>

          <p className="text-body-sm text-center text-on-surface-variant mt-lg">
            By logging in, you agree to our{' '}
            <span className="text-primary cursor-pointer hover:underline">Terms</span> &{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
