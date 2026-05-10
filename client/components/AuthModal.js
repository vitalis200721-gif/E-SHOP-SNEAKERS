'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, login, register, loginWithGoogle, googleEnabled } = useAuth();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authModalOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeAuthModal(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [authModalOpen, closeAuthModal]);

  useEffect(() => {
    if (!authModalOpen) {
      setForm({ name: '', email: '', password: '' });
      setError('');
      setMode('signin');
    }
  }, [authModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      closeAuthModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeAuthModal}
          className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0d0d0d] rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden"
          >
            {/* Decorative blob */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Close */}
            <button
              onClick={closeAuthModal}
              aria-label="Close"
              className="absolute top-6 right-6 w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
            >
              <X size={18} />
            </button>

            <div className="relative p-10">
              {/* Brand */}
              <div className="mb-8">
                <span className="text-2xl font-black tracking-tighter uppercase text-white">
                  SOLE<span className="text-accent">VAULT</span>
                </span>
                <h2 className="text-4xl font-black tracking-tighter uppercase mt-6 leading-none italic">
                  {mode === 'signin' ? (
                    <>Welcome<br />Back</>
                  ) : (
                    <>Join<br />The Vault</>
                  )}
                </h2>
                <p className="text-white/40 text-sm mt-3">
                  {mode === 'signin'
                    ? 'Access your collection and exclusive drops.'
                    : 'Create your account in under a minute.'}
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex bg-black border border-white/5 rounded-2xl p-1 mb-8">
                {['signin', 'signup'].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all ${
                      mode === m
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Create'}
                  </button>
                ))}
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={!googleEnabled}
                title={googleEnabled ? 'Sign in with Google' : 'Google Sign In is not configured on this server'}
                className={`w-full font-black uppercase text-xs tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg group relative ${
                  googleEnabled
                    ? 'bg-white text-black hover:bg-accent hover:text-white cursor-pointer'
                    : 'bg-white/10 text-white/40 border border-white/5 cursor-not-allowed'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className={googleEnabled ? 'group-hover:scale-110 transition-transform' : 'opacity-50'}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
                {!googleEnabled && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                    Setup
                  </span>
                )}
              </button>

              {!googleEnabled && (
                <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3 text-[11px] text-orange-300 leading-relaxed">
                  <strong className="font-black uppercase text-[10px] tracking-widest">Heads up:</strong> Google Sign In needs OAuth credentials in <code className="bg-black/40 px-1.5 py-0.5 rounded text-[10px]">server/.env</code>. Use email & password below for now.
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Full name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-sm font-medium outline-none focus:border-accent transition-all placeholder:text-white/20"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-sm font-medium outline-none focus:border-accent transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="password"
                    placeholder={mode === 'signup' ? 'Password (min. 6 chars)' : 'Password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-sm font-medium outline-none focus:border-accent transition-all placeholder:text-white/20"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-premium py-5 bg-accent text-white hover:bg-white hover:text-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-2 mt-7 text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">
                <ShieldCheck size={12} />
                Encrypted & Secure
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
