import { useContext, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/auth.service';
import { Scale, Eye, EyeOff, Mail, Lock, AlertCircle, ShieldCheck, BadgeCheck, Clock3, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const homeFor = { user: '/user', lawyer: '/lawyer', admin: '/admin' };

/** Return to the page that bounced us to /login, if it belongs to this role. */
const destinationFor = (role, from) => {
  const home = homeFor[role] || '/user';
  return from && from.startsWith(home) ? from : home;
};

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role: currentRole } = useContext(AuthContext);
  const from = location.state?.from;
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
        const role = response.data.user.role.toLowerCase();
        onLogin?.(response.data.user, role, response.data.accessToken);
        navigate(destinationFor(role, from), { replace: true });
        return;
      }
      setError('Sign in failed. Please try again.');
    } catch (err) {
      setError(err?.message || 'Incorrect email or password.');
    }
    setLoading(false);
  };

  // Already signed in — skip the form.
  if (currentRole && !loading) return <Navigate to={destinationFor(currentRole, from)} replace />;

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-gradient-to-br from-primary via-primary-container to-[#1a2f7a] flex-col justify-between p-3xl text-on-primary relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <Link to="/" className="relative z-10 flex items-center gap-sm text-on-primary no-underline">
          <Scale size={28} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-headline-lg font-bold mb-md leading-tight">
            Access Your Legal Dashboard
          </h2>
          <p className="text-body-lg text-on-primary/80 mb-xl leading-relaxed">
            Manage your cases, connect with lawyers, and track your legal journey — all in one place.
          </p>
          <ul className="space-y-md">
            {[
              { icon: BadgeCheck, text: 'Verified, top-rated legal professionals' },
              { icon: ShieldCheck, text: 'Private and confidential by default' },
              { icon: Clock3, text: 'Available 24/7, anywhere in Sri Lanka' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-md">
                <span className="w-8 h-8 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </span>
                <span className="text-body-md text-on-primary/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

          <div className="relative z-10">
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
        <div className="w-full max-w-[440px] animate-slide-up">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-sm mb-xl no-underline">
            <Scale size={24} className="text-primary" />
            <span className="text-headline-sm font-bold text-primary">LawLink</span>
          </Link>

          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            <div className="mb-xl">
              <h2 className="text-headline-lg text-on-surface">Welcome back</h2>
              <p className="text-body-md text-on-surface-variant mt-xs">Sign in to your LawLink account.</p>
            </div>


            {error && (
              <div role="alert" className="mb-md flex items-start gap-sm p-md bg-error-container/60 border border-error/20 text-on-error-container rounded-xl text-body-sm animate-fade-in">
                <AlertCircle size={18} className="shrink-0 mt-[1px]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-md">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="text-label-sm font-semibold text-on-surface-variant mb-xs block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                    required
                    className="w-full pl-10 pr-md border border-outline-variant rounded-xl py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label htmlFor="login-password" className="text-label-sm font-semibold text-on-surface-variant">Password</label>
                  <Link to="/forgot-password" className="text-body-sm text-primary hover:underline no-underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    id="login-password"
                    autoComplete="current-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                    required
                    className="w-full pl-10 pr-12 border border-outline-variant rounded-xl py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full mt-sm py-md rounded-xl text-body-lg font-semibold transition-all flex items-center justify-center gap-sm bg-primary text-on-primary hover:bg-primary-container shadow-card hover:shadow-card-hover disabled:opacity-70 disabled:cursor-wait"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-md my-lg">
              <div className="flex-1 h-px bg-surface-container-high" />
              <span className="text-body-sm text-on-surface-variant">New to LawLink?</span>
              <div className="flex-1 h-px bg-surface-container-high" />
            </div>

            <Link to="/register" className="block w-full text-center no-underline py-sm rounded-xl border border-outline-variant text-body-md font-semibold text-on-surface hover:bg-surface-container-low hover:border-primary/30 transition-all">
              Create a free account
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
