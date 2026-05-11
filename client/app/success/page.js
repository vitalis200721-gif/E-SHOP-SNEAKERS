'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/utils/api';

function SuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get('session_id');
  const orderId = params.get('order_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (sessionId) {
          await api.get(`/payments/session/${sessionId}`).catch(() => null);
        }
        if (orderId) {
          for (let i = 0; i < 6; i += 1) {
            const { data } = await api.get(`/orders/${orderId}`);
            if (cancelled) return;
            if (data.isPaid || data.status === 'paid') {
              setOrder(data);
              setLoading(false);
              return;
            }
            await new Promise((r) => setTimeout(r, 1500));
          }
          const { data } = await api.get(`/orders/${orderId}`);
          if (!cancelled) setOrder(data);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not verify payment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [sessionId, orderId]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 md:pt-40 pb-20 px-5 md:px-6">
      <div className="max-w-2xl mx-auto bg-[#0d0d0d] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -z-0 pointer-events-none" />
        <div className="relative z-10">
          {loading ? (
            <div className="text-center py-12 md:py-16">
              <Loader2 className="mx-auto animate-spin text-accent" size={48} />
              <p className="mt-6 font-black uppercase tracking-widest text-sm text-white/80">Verifying payment…</p>
              <p className="mt-2 text-xs text-white/30">Stripe webhook is processing — this may take a few seconds.</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="font-black text-2xl md:text-3xl uppercase tracking-tighter mb-4">Hmm…</p>
              <p className="text-white/40 mb-8">{error}</p>
              <button onClick={() => router.push('/profile?tab=orders')} className="btn-premium bg-accent text-white hover:bg-white hover:text-black px-10 py-5">
                Go to Orders
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-5 md:mb-6 border border-green-500/30">
                  <CheckCircle2 size={36} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3 md:mb-4">Payment Confirmed</h1>
                <p className="text-white/40 text-base md:text-lg mb-8 md:mb-10 max-w-md">
                  Your order is locked in. We sent a confirmation email shortly.
                </p>
              </div>

              {order && (
                <div className="bg-black rounded-2xl p-6 md:p-8 mb-8 md:mb-10 border border-white/5">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Order #</span>
                    <span className="font-black">{String(order._id).slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</span>
                    <span className="font-black text-xl">€{order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => router.push('/profile?tab=orders')}
                  className="flex-1 btn-premium bg-accent text-white hover:bg-white hover:text-black py-5 md:py-6 flex items-center justify-center gap-3"
                >
                  <Package size={18} /> View Order
                </button>
                <button
                  onClick={() => router.push('/shop')}
                  className="flex-1 px-6 md:px-8 py-5 md:py-6 rounded-2xl border border-white/10 text-white hover:bg-white hover:text-black transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                  Continue Shopping <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
