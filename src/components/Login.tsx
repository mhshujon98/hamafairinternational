import React, { useState, useEffect } from 'react';
import { PlaneTakeoff, Phone, ShieldCheck, ArrowRight, Loader2, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (token: string, phone: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simulatedOTP, setSimulatedOTP] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Request OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('অনুগ্রহ করে আপনার সচল মোবাইল নম্বরটি লিখুন।');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSimulatedOTP(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।');
      }

      setSuccessMsg(data.message);
      // Retrieve simulation OTP from server to display in the UI for premium simulation
      if (data.simulationCode) {
        setSimulatedOTP(data.simulationCode);
      }
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Complete Login
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError('অনুগ্রহ করে সঠিক ৬-সংখ্যার ওটিপি কোডটি লিখুন।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone.trim(),
          code: code.trim() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'ওটিপি ভেরিফিকেশন ব্যর্থ হয়েছে।');
      }

      // Success
      localStorage.setItem('hamaf_auth_token', data.token);
      localStorage.setItem('hamaf_auth_phone', data.phone);
      onLoginSuccess(data.token, data.phone);
    } catch (err: any) {
      setError(err.message || 'কোডটি সঠিক নয়। অনুগ্রহ করে পুনরায় সঠিক কোড দিয়ে চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setCode('');
    setError(null);
    setSuccessMsg(null);
    setSimulatedOTP(null);
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
          
          {/* Simulated SMS Notification Banner */}
          <AnimatePresence>
            {simulatedOTP && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl h-fit">
                    <MessageSquare className="h-5 w-5 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">📩 SMS ওটিপি সিমুলেশন (Test Environment)</span>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">
                      আপনার মোবাইল নম্বরে পাঠানো ওটিপি কোডটি নিচে দেওয়া হলো। এটি কপি করে নিচের ইনপুটে সাবমিট করুন:
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-slate-900 border border-blue-500/40 text-blue-300 font-mono font-black text-sm tracking-widest rounded-lg">
                        {simulatedOTP}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(simulatedOTP);
                          // Temporarily update button text
                          const el = document.getElementById('copy-otp-btn');
                          if (el) el.innerText = 'কপি করা হয়েছে!';
                          setTimeout(() => {
                            if (el) el.innerText = 'কপি করুন';
                          }, 2000);
                        }}
                        id="copy-otp-btn"
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer"
                      >
                        কপি করুন
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md"
          >
            {/* Card Icon & Header */}
            <div className="text-center space-y-3 mb-8">
              <div className="mx-auto p-4 bg-blue-600/15 text-blue-500 rounded-2xl w-fit border border-blue-500/20 shadow-inner">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  নিরাপদ ওটিপি লগইন
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  আপনার ডেটার সর্বোচ্চ নিরাপত্তা নিশ্চিতে ওটিপি ভিত্তিক সিস্টেম। আপনার ফোন নম্বর দিয়ে লগইন করুন এবং ওটিপি দিয়ে কোড ভেরিফাই করুন।
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: PHONE NUMBER INPUT FORM */}
            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="phone-number-field" className="text-xs font-bold text-slate-300 block">
                    মোবাইল নম্বর লিখুন
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="phone-number-field"
                      type="tel"
                      required
                      placeholder="যেমন: 01712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm focus:outline-none transition-all placeholder-slate-600 font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-normal">
                    * ডেমো যাত্রী ডেটা দেখতে নিচের যেকোনো একটি নম্বর ব্যবহার করতে পারেন:<br />
                    <strong className="text-blue-400/90 font-mono">01712345678, 01898765432, 01555443322</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-800 disabled:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 transform active:scale-98 cursor-pointer border border-blue-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>কোড পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>ওটিপি কোড পাঠান</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP VERIFICATION CODE FORM */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="otp-code-field" className="text-xs font-bold text-slate-300 block">
                      ওটিপি কোড লিখুন
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">কোড পাঠানো হয়েছে ({phone})</span>
                  </div>
                  <input
                    id="otp-code-field"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="৬-সংখ্যার কোড দিন"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full tracking-widest text-center py-3 bg-slate-950 text-slate-100 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-lg font-bold font-mono focus:outline-none transition-all placeholder-slate-700"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-800 disabled:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 transform active:scale-98 cursor-pointer border border-emerald-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>কোড যাচাই করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>কোড সাবমিট করুন</span>
                        <ShieldCheck className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-[11px] pt-2">
                    <button
                      type="button"
                      onClick={handleBackToPhone}
                      className="text-slate-400 hover:text-white hover:underline cursor-pointer"
                    >
                      নম্বর পরিবর্তন করুন
                    </button>
                    
                    {countdown > 0 ? (
                      <span className="text-slate-500">
                        পুনরায় পাঠান ({countdown} সেকেন্ড)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-blue-400 hover:text-blue-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>পুনরায় কোড পাঠান</span>
                      </button>
                    )}
                  </div>
                </div>
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
