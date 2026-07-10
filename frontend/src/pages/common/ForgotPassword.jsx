import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'sent' | 'reset'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setStep('sent');
  };

  const handleOtp = (e) => {
    e.preventDefault();
    setStep('reset');
  };

  const handleReset = (e) => {
    e.preventDefault();
    setDone(true);
  };

  const updateOtp = (i, val) => {
    if (val.length > 1) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-lg">
        <div className="w-full max-w-md bg-white border border-surface-container-high rounded-2xl p-xl shadow-card text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-xl">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-headline-lg text-on-surface mb-md">Password Reset!</h2>
          <p className="text-body-md text-on-surface-variant mb-xl">Your password has been successfully updated. You can now log in with your new password.</p>
          <Link to="/login" className="no-underline">
            <button className="w-full py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity">
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-container-low">
      {/* Left Branding */}
      <div className="hidden lg:flex w-[380px] shrink-0 bg-gradient-to-br from-primary to-primary-container flex-col justify-between p-3xl text-on-primary">
        <div className="flex items-center gap-sm">
          <Scale size={28} />
          <span className="text-headline-sm font-bold">LawLink</span>
        </div>
        <div>
          <h2 className="text-headline-md font-bold mb-md">Secure Account Recovery</h2>
          <p className="text-body-md text-on-primary/80 leading-relaxed">
            Don't worry — it happens to the best of us. We'll help you safely recover your LawLink account in just a few steps.
          </p>
          <div className="mt-xl space-y-md">
            {['Enter your registered email', 'Get a 6-digit OTP', 'Set a new secure password'].map((s, i) => (
              <div key={i} className="flex items-center gap-md">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-label-sm font-bold">{i + 1}</div>
                <span className="text-body-md text-on-primary/80">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-body-sm text-on-primary/50">© 2024 LawLink</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-md">
          {/* Step Indicator */}
          <div className="flex items-center gap-sm mb-xl">
            {['email', 'sent', 'reset'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold transition-all
                  ${step === s || (s === 'email' && step === 'sent') || (s === 'email' && step === 'reset') || (s === 'sent' && step === 'reset')
                    ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 ${(s === 'email' && (step === 'sent' || step === 'reset')) || (s === 'sent' && step === 'reset') ? 'bg-primary' : 'bg-surface-container-high'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white border border-surface-container-high rounded-2xl p-xl shadow-card">
            {/* Step 1: Enter Email */}
            {step === 'email' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-lg">
                  <Mail size={28} className="text-primary" />
                </div>
                <h2 className="text-headline-lg text-on-surface mb-xs">Forgot Password?</h2>
                <p className="text-body-md text-on-surface-variant mb-xl">Enter your registered email address and we'll send you a one-time password (OTP) to reset your password.</p>
                <form onSubmit={handleSend} className="space-y-lg">
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                        className="w-full pl-10 pr-md border border-outline-variant rounded-xl py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity">
                    Send OTP
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 'sent' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-lg">
                  <span className="text-2xl">📨</span>
                </div>
                <h2 className="text-headline-lg text-on-surface mb-xs">Check Your Email</h2>
                <p className="text-body-md text-on-surface-variant mb-xl">
                  We've sent a 6-digit OTP to <strong>{email}</strong>. Enter it below to verify your identity.
                </p>
                <form onSubmit={handleOtp} className="space-y-xl">
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-md block">Enter OTP</label>
                    <div className="flex gap-sm justify-between">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => updateOtp(i, e.target.value)}
                          onKeyDown={e => e.key === 'Backspace' && !digit && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()}
                          className="w-12 h-14 text-center text-headline-sm font-bold border-2 border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-all"
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={otp.join('').length < 6}
                    className={`w-full py-md rounded-xl text-body-lg font-semibold transition-all
                      ${otp.join('').length >= 6 ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
                    Verify OTP
                  </button>
                </form>
                <p className="text-body-sm text-center text-on-surface-variant mt-lg">
                  Didn't receive it?{' '}
                  <button className="text-primary font-semibold hover:underline" onClick={() => {}}>Resend OTP</button>
                </p>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 'reset' && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-lg">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-headline-lg text-on-surface mb-xs">Set New Password</h2>
                <p className="text-body-md text-on-surface-variant mb-xl">Create a strong new password for your LawLink account.</p>
                <form onSubmit={handleReset} className="space-y-md">
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">New Password</label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                        value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8}
                        className="w-full border border-outline-variant rounded-xl px-md py-sm pr-10 text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant mb-xs block">Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password"
                      value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required
                      className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                  </div>

                  {/* Password strength */}
                  {newPass.length > 0 && (
                    <div className="space-y-xs">
                      <p className="text-label-sm text-on-surface-variant">Password strength</p>
                      <div className="flex gap-xs">
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className={`flex-1 h-1.5 rounded-full transition-colors ${
                            newPass.length >= n * 3 ? (newPass.length >= 10 ? 'bg-green-500' : newPass.length >= 7 ? 'bg-yellow-500' : 'bg-red-400') : 'bg-surface-container-high'
                          }`} />
                        ))}
                      </div>
                      <p className="text-body-sm text-on-surface-variant">
                        {newPass.length < 7 ? 'Weak' : newPass.length < 10 ? 'Fair' : 'Strong'}
                      </p>
                    </div>
                  )}

                  <button type="submit"
                    className="w-full py-md rounded-xl bg-primary text-on-primary text-body-lg font-semibold hover:opacity-90 transition-opacity mt-lg">
                    Reset Password
                  </button>
                </form>
              </>
            )}

            <div className="mt-lg text-center">
              <Link to="/login" className="flex items-center justify-center gap-xs text-body-sm text-primary hover:underline no-underline">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
