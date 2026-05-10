'use client';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-premium-50 pt-40 pb-20 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-white text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Payment Cancelled</h1>
        <p className="text-premium-500 text-lg mb-10">
          No worries — your cart is still saved. You can try again anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/cart')}
            className="px-8 py-5 rounded-2xl border border-premium-200 hover:bg-black hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Cart
          </button>
          <button
            onClick={() => router.push('/checkout')}
            className="btn-premium flex items-center justify-center gap-3"
          >
            <ShoppingBag size={18} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
