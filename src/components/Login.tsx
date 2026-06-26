import React, { useState } from 'react';
import { PlaneTakeoff, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      onLoginSuccess(idToken, user.email || '');
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      // Clean up common firebase errors into friendly Bengali messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError('লগইন পপআপটি বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      } else if (err.code === 'auth/blocked-by-popup-killer') {
        setError('পপআপ ব্লকার সক্রিয় আছে। অনুগ্রহ করে পপআপ অনুমোদন করুন।');
      } else {
        setError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
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
              Travel Agency Database (Cloud SQL)
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
            <div className="text-center space-y-3 mb-8">
              <div className="mx-auto p-4 bg-blue-600/15 text-blue-500 rounded-2xl w-fit border border-blue-500/20 shadow-inner">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  হ্যামাফ এয়ার ট্রাভেল ডাটাবেজ
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  নিরাপদ ক্লাউড এসকিউএল (Google Cloud SQL) ডাটাবেজে প্রবেশ করতে আপনার গুগল অ্যাকাউন্ট ব্যবহার করে লগইন করুন।
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

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 disabled:bg-slate-100 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer shadow-lg shadow-white/5 border border-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-slate-600">গুগল সাইন-ইন হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.31-3.1 3.32v2.75h4.99c2.92-2.69 4.61-6.64 4.61-11.32z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.99-2.75c-1.39.93-3.17 1.49-4.94 1.49-3.78 0-6.98-2.56-8.12-6.02H1.05v3.13C3.03 21.84 7.21 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.88 14.82A7.21 7.21 0 013.5 12c0-.98.17-1.92.47-2.82V6.05H1.05A11.964 11.964 0 000 12c0 2.23.6 4.31 1.66 6.13l2.22-3.31z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.21 0 3.03 2.16 1.05 6.05l2.83 2.82c1.14-3.46 4.34-6.12 8.12-6.12z"
                    />
                  </svg>
                  <span>Google দিয়ে লগইন করুন (Google Sign In)</span>
                </>
              )}
            </button>

            {/* Extra assurance */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <span>🔒 Firebase Auth দ্বারা সম্পূর্ণ সুরক্ষিত</span>
            </div>

          </motion.div>

          {/* Secure System Assurance Box */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Google Cloud SQL Database Active
            </p>
            <p className="text-[9px] text-slate-700 max-w-xs mx-auto">
              আপনার প্রবেশকৃত তথ্য ক্লাউড এসকিউএল ডাটাবেজে সম্পূর্ণ পৃথক সেশন দ্বারা সুরক্ষিত। এক ব্যবহারকারীর তথ্য অন্য কেউ দেখতে পারেন না।
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
