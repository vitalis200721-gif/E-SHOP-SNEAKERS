'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(params.token);
        if (cancelled) return;
        setStatus('success');
        setMessage('Email verified successfully.');
        setTimeout(() => router.push('/profile'), 1800);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      }
    })();
    return () => { cancelled = true; };
  }, [params.token, verifyEmail, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 pt-32 pb-20">
      <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-12 max-w-lg w-full text-center text-white">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-accent mx-auto animate-spin mb-6" />
            <h1 className="text-3xl font-black uppercase tracking-tighter">Verifying…</h1>
            <p className="text-white/40 mt-3">Activating your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Verified</h1>
            <p className="text-white/50 mt-3">{message}</p>
            <button onClick={() => router.push('/profile')} className="btn-premium bg-accent text-white hover:bg-white hover:text-black mt-8 inline-flex items-center gap-2">
              Go to Profile <ArrowRight size={16} />
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Link Invalid</h1>
            <p className="text-white/50 mt-3">{message}</p>
            <button onClick={() => router.push('/')} className="px-8 py-4 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase text-xs tracking-widest mt-8 inline-flex items-center gap-2">
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
