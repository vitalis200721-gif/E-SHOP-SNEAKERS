'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      await resetPassword(params.token, password);
      setDone(true);
      toast('Password updated. You are now signed in.', 'success', 4000);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-32 pb-20">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-12 max-w-md w-full text-white shadow-[0_0_80px_rgba(59,130,246,0.15)]">
        {done ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Password Updated</h1>
            <p className="text-white/50 mt-3">Taking you to your profile…</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-2xl font-black tracking-tighter uppercase">
                SOLE<span className="text-accent">VAULT</span>
              </span>
              <h1 className="text-4xl font-black uppercase tracking-tighter mt-6 leading-none italic">
                Reset<br />Password
              </h1>
              <p className="text-white/40 mt-3 text-sm">Choose a new password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password" placeholder="New password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-sm font-medium outline-none focus:border-accent transition-all placeholder:text-white/20"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password" placeholder="Confirm password" required minLength={6}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-5 py-5 text-sm font-medium outline-none focus:border-accent transition-all placeholder:text-white/20"
                />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-xs font-medium">{error}</div>
              )}
              <button
                type="submit" disabled={submitting}
                className="w-full btn-premium py-5 bg-accent text-white hover:bg-white hover:text-black flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Update Password <ArrowRight size={16} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
