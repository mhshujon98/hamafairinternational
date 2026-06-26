import React, { useState } from 'react';
import { PlaneTakeoff, ShieldCheck, ArrowRight, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Registration States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই পূরণ করুন।');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim()
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'লগইন করতে ব্যর্থ হয়েছে।');
      }

      localStorage.setItem('hamaf_auth_token', data.token);
      localStorage.setItem('hamaf_auth_email', data.email);
      onLoginSuccess(data.token, data.email);
    } catch (err: any) {
      setError(err.message || 'সার্ভার কানেকশন ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('অনুগ্রহ করে সব প্রয়োজনীয় ঘরগুলো পূরণ করুন।');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          password: registerPassword.trim()
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে।');
      }

      setSuccessMsg(data.message);
      
      localStorage.setItem('hamaf_auth_token', data.token);
      localStorage.setItem('hamaf_auth_email', data.email);
      
      setTimeout(() => {
        onLoginSuccess(data.token, data.email);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'সার্ভার কানেকশন ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Background radial soft light blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[140px] opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-15 pointer-events-none"></div>

      {/* Header Bar */}
      <header className="p-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <PlaneTakeoff className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white leading-none">
              Hamaf Air International
            </h1>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">
              Travel Agency Database
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Core Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md"
          >
            {/* Card Icon & Header */}
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto p-4 bg-blue-600/15 text-blue-500 rounded-2xl w-fit border border-blue-500/20 shadow-inner">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  হ্যামাফ এয়ার ট্রাভেল ডাটাবেজ
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  আপনার একাউন্টে লগইন করুন অথবা সম্পূর্ণ নতুন একাউন্ট তৈরি করে ডাটাবেজে প্রবেশ করুন।
                </p>
              </div>
            </div>

            {/* Custom Tabs Bar */}
            <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                লগইন (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                নিবন্ধন (Sign Up)
              </button>
            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message Box */}
            <AnimatePresence mode="wait">
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="leading-relaxed">{successMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-email-field" className="text-xs font-bold text-slate-300 block">
                    ইমেইল ঠিকানা (Email)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="login-email-field"
                      type="email"
                      required
                      placeholder="যেমন: admin@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="login-password-field" className="text-xs font-bold text-slate-300 block">
                    পাসওয়ার্ড (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="login-password-field"
                      type="password"
                      required
                      placeholder="পাসওয়ার্ড লিখুন"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 transform active:scale-98 cursor-pointer border border-blue-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>লগইন করুন</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: REGISTRATION FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-name-field" className="text-xs font-bold text-slate-300 block">
                    আপনার নাম (Full Name)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="reg-name-field"
                      type="text"
                      required
                      placeholder="যেমন: হাফেজ মোঃ মাহমুদুল হাসান"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-email-field" className="text-xs font-bold text-slate-300 block">
                    ইমেইল ঠিকানা (Email)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="reg-email-field"
                      type="email"
                      required
                      placeholder="যেমন: rina@gmail.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-phone-field" className="text-xs font-bold text-slate-300 block">
                    মোবাইল নম্বর (Phone - ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="reg-phone-field"
                      type="tel"
                      placeholder="যেমন: 01712345678"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-password-field" className="text-xs font-bold text-slate-300 block">
                    পাসওয়ার্ড (Password - অন্তত ৬ অক্ষর)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="reg-password-field"
                      type="password"
                      required
                      placeholder="পাসওয়ার্ড লিখুন"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-700 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-800 disabled:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 transform active:scale-98 cursor-pointer border border-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>অ্যাকাউন্ট তৈরি করুন</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </motion.div>

          {/* Secure System Assurance Box */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Zero-Trust Data Isolation Enabled
            </p>
            <p className="text-[9px] text-slate-700 max-w-xs mx-auto">
              আপনার প্রবেশকৃত তথ্য সার্ভার-সাইড সেশন দ্বারা সুরক্ষিত। এক ব্যবহারকারীর তথ্য অন্য কোনো ব্যবহারকারী কখনো দেখতে পারবেন না।
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-600 text-[10px] relative z-10 font-mono">
        <p>© 2026 Hamaf Air International Travel Agency • All Rights Reserved.</p>
      </footer>

    </div>
  );
}
