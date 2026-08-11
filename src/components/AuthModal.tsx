import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, User, Mail, Lock, Sparkles, ShieldCheck, AlertCircle, ArrowRight, Compass } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginAnonymously } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      setSuccessMsg('Successfully logged in with Google!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMsg(`Domain "${window.location.hostname}" is not authorized for Google Sign-In in Firebase Console. You can sign in using Email/Password or Guest mode below!`);
      } else {
        setErrorMsg(err?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await registerWithEmail(email, password, name);
        setSuccessMsg('Account created successfully!');
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Welcome back! Logged in successfully.');
      }
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1200);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. If you do not have an account, click "Create One" below.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginAnonymously();
      setSuccessMsg('Logged in as Guest Traveller!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to sign in as guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-slate-900 border border-slate-800 text-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
        >
          {/* Background Glow Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D8F864]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar with Close */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-2xl bg-[#D8F864] text-slate-950 flex items-center justify-center font-black shadow-md">
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">VELORA AI</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1 relative z-10">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {mode === 'signup' ? 'Create Your Account' : mode === 'guest' ? 'Continue as Guest' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {mode === 'signup'
                ? 'Sign up to sync saved itineraries, preferences, and custom trip twins.'
                : mode === 'guest'
                ? 'Explore Velora AI features immediately without password setup.'
                : 'Sign in to access your cloud-synced trips and personalized AI recommendations.'}
            </p>
          </div>

          {/* Notice / Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social Google Sign-In Button */}
          {mode !== 'guest' && (
            <div className="space-y-3 relative z-10">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-3 border border-slate-700 hover:border-slate-600 transition-all shadow-md group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center space-x-3 py-1">
                <div className="flex-1 border-t border-slate-800" />
                <span className="text-[10px] uppercase font-extrabold text-slate-500">or email</span>
                <div className="flex-1 border-t border-slate-800" />
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          {mode !== 'guest' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 relative z-10">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase">Full Name</label>
                  <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 focus-within:border-[#D8F864] rounded-2xl px-3.5 py-2.5 transition-all">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vasanth Kumar"
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 font-semibold outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Email Address</label>
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 focus-within:border-[#D8F864] rounded-2xl px-3.5 py-2.5 transition-all">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Password</label>
                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 focus-within:border-[#D8F864] rounded-2xl px-3.5 py-2.5 transition-all">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 font-semibold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 relative z-10 text-center py-2">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Guest mode allows instant access to Velora AI's itineraries, interactive maps, regional travel guides, and translation tools.
              </p>

              <button
                onClick={handleGuestSignIn}
                disabled={loading}
                className="w-full bg-[#D8F864] hover:bg-[#cbe352] text-slate-950 font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enter as Guest Traveller</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode Switcher Links */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold relative z-10">
            {mode === 'signin' ? (
              <>
                <span>Don't have an account?</span>
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="text-[#D8F864] hover:underline font-black"
                >
                  Create One →
                </button>
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Already registered?</span>
                <button
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className="text-[#D8F864] hover:underline font-black"
                >
                  Sign In →
                </button>
              </>
            ) : (
              <>
                <span>Prefer account login?</span>
                <button
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className="text-[#D8F864] hover:underline font-black"
                >
                  Sign In →
                </button>
              </>
            )}
          </div>

          {/* Guest Mode Option Footer */}
          {mode !== 'guest' && (
            <div className="text-center pt-1 relative z-10">
              <button
                onClick={() => {
                  setMode('guest');
                  setErrorMsg(null);
                }}
                className="text-[11px] text-slate-400 hover:text-white font-extrabold underline transition-all"
              >
                Or continue as Guest Traveller
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
