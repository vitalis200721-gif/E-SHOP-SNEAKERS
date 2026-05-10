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
    <div className="min-h-screen bg-premium-50 pt-40 pb-20 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-white">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="mx-auto animate-spin text-accent" size={48} />
            <p className="mt-6 font-black uppercase tracking-widest text-sm">Verifying payment…</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="font-black text-2xl uppercase tracking-tighter mb-4">Hmm…</p>
            <p className="text-premium-500">{error}</p>
            <button onClick={() => router.push('/profile?tab=orders')} className="btn-premium mt-8">
              Go to Orders
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Payment Confirmed</h1>
              <p className="text-premium-500 text-lg mb-10">
                Your order is locked in. You will receive a confirmation email shortly.
              </p>
            </div>

            {order && (
              <div className="bg-premium-50 rounded-2xl p-8 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-premium-400">Order #</span>
                  <span className="font-black">{String(order._id).slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-premium-400">Status</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-premium-400">Total</span>
                  <span className="font-black text-xl">${order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/profile?tab=orders')}
                className="flex-1 btn-premium flex items-center justify-center gap-3"
              >
                <Package size={18} /> View Order
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="flex-1 px-8 py-5 rounded-2xl border border-premium-200 hover:bg-black hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
