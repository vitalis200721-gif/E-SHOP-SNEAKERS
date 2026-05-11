'use client';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black text-white pt-32 md:pt-40 pb-20 px-5 md:px-6">
      <div className="max-w-2xl mx-auto bg-[#0d0d0d] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] -z-0 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6 border border-red-500/30">
            <XCircle size={36} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3 md:mb-4">Payment Cancelled</h1>
          <p className="text-white/40 text-base md:text-lg mb-8 md:mb-10 max-w-md mx-auto">
            No worries — your cart is still saved. You can try again anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button
              onClick={() => router.push('/cart')}
              className="px-6 md:px-8 py-5 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Cart
            </button>
            <button
              onClick={() => router.push('/checkout')}
              className="btn-premium bg-accent text-white hover:bg-white hover:text-black py-5 flex items-center justify-center gap-3"
            >
              <ShoppingBag size={18} /> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
