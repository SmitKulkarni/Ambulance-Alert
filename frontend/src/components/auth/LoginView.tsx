/**
 * src/components/auth/LoginView.tsx
 * -----------------------------------
 * Full-screen login page shown to unauthenticated users.
 * Matches the AmbuAlert brand design system.
 */

import React, { useState, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const LoginView: React.FC = () => {
  const { login, register, loginError, isLoading, clearLoginError } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearLoginError();
    if (isRegister) {
      await register(name.trim(), email.trim(), password);
    } else {
      await login(email.trim(), password);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 font-['Inter',sans-serif]">
      {/* Background ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#e5eeff] shadow-xl shadow-blue-100/30 overflow-hidden">

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#e5eeff] bg-[#f8f9ff] flex flex-col items-center gap-3">
            <Logo size="lg" showText />
            <p className="text-xs text-slate-500 text-center font-medium">
              AI-Powered Emergency Traffic Management Platform
            </p>
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full tracking-wide uppercase">
              Authorised Access Only
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 flex flex-col gap-5">
            <div>
              <h1 className="text-xl font-bold text-[#0b1c30] mb-1">
                {isRegister ? 'Create an account' : 'Sign in to your account'}
              </h1>
              <p className="text-xs text-slate-500">
                {isRegister ? 'Enter your details to register.' : 'Enter your credentials to access the control centre.'}
              </p>
            </div>

            {/* Error banner */}
            {loginError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
              >
                <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Name field (for register) */}
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name-input" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dce9ff] bg-white text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                />
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ambualert.gov"
                className="w-full px-4 py-2.5 rounded-xl border border-[#dce9ff] bg-white text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[#dce9ff] bg-white text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading || !email || !password || (isRegister && !name)}
              className="w-full py-3 rounded-xl bg-[#0b1c30] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  {isRegister ? 'Registering…' : 'Authenticating…'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {isRegister ? 'person_add' : 'login'}
                  </span>
                  {isRegister ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>

            {/* Toggle Link */}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  clearLoginError();
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 bg-[#f8f9ff] border-t border-[#e5eeff] text-center">
            <p className="text-[10px] text-slate-400">
              Ambulance Alert © {new Date().getFullYear()} — Secure encrypted session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
