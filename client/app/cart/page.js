'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const ItemSkeleton = () => (
  <div className="bg-[#0d0d0d] p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] flex items-center gap-5 md:gap-10 border border-white/5">
    <div className="w-24 h-24 md:w-40 md:h-40 bg-white/5 rounded-2xl md:rounded-3xl flex-shrink-0 animate-pulse" />
    <div className="flex-1 space-y-3">
      <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
      <div className="h-5 w-2/3 bg-white/5 rounded animate-pulse" />
      <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, totalPrice, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="bg-black text-white min-h-screen pb-40">
        <div className="pt-32 md:pt-40 max-w-[1440px] mx-auto px-5 md:px-10">
          <div className="h-12 md:h-20 w-1/2 bg-white/5 rounded-2xl mb-10 md:mb-20 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {Array.from({ length: 3 }).map((_, i) => <ItemSkeleton key={i} />)}
            </div>
            <div className="lg:col-span-4 bg-[#0d0d0d] p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-white/5 h-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="pt-40 md:pt-60 flex flex-col items-center justify-center text-center px-5">
          <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 rounded-full flex items-center justify-center mb-8 md:mb-12 border border-white/10 animate-float">
            <ShoppingBag size={48} className="md:hidden text-white/20" />
            <ShoppingBag size={64} className="hidden md:block text-white/20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Your vault is empty</h1>
          <p className="text-white/40 mb-8 md:mb-12 text-base md:text-lg max-w-md">Your collection starts here. Find your next grail in our shop.</p>
          <Link href="/shop" className="btn-premium px-10 md:px-16 py-5 md:py-8 bg-white text-black hover:bg-accent hover:text-white">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const formattedTotal = (totalPrice || 0).toFixed(2);

  return (
    <div className="bg-black text-white min-h-screen pb-40">
      <div className="pt-32 md:pt-40 max-w-[1440px] mx-auto px-5 md:px-10">
        <div className="flex flex-wrap items-end gap-3 md:gap-6 mb-10 md:mb-20">
           <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">Your bag</h1>
           <div className="hidden md:block h-12 w-[2px] bg-accent/30 self-end mb-2" />
           <span className="text-accent text-xs md:text-lg font-black uppercase tracking-widest mb-1 md:mb-2">{cartItems.length} item{cartItems.length === 1 ? '' : 's'} secured</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {cartItems.map((item) => (
              <motion.div
                layout
                key={`${item._id}-${item.size}`}
                className="group relative bg-[#0d0d0d] p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] flex items-start md:items-center gap-5 md:gap-10 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="w-24 h-24 md:w-40 md:h-40 bg-black rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500">
                  <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                </div>

                <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-1 md:mb-2">{item.brand}</p>
                      <h3 className="font-bold text-base md:text-2xl tracking-tight mb-2 truncate">{item.name}</h3>
                      <p className="inline-block bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest text-white/60">EU {item.size}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id, item.size)}
                      aria-label={`Remove ${item.name}`}
                      className="bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-2xl p-2.5 md:p-4 transition-all flex-shrink-0"
                    >
                      <Trash2 size={18} className="md:hidden" />
                      <Trash2 size={24} className="hidden md:block" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end pt-2 md:pt-4 gap-3">
                    <div className="flex items-center bg-black rounded-2xl border border-white/10 p-1.5 md:p-2">
                      <button onClick={() => updateQty(item._id, item.size, item.qty - 1)} aria-label="Decrease quantity" className="p-2 md:p-3 hover:text-accent transition-colors"><Minus size={16} /></button>
                      <span className="w-8 md:w-12 text-center font-black text-base md:text-lg">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.size, item.qty + 1)} aria-label="Increase quantity" className="p-2 md:p-3 hover:text-accent transition-colors"><Plus size={16} /></button>
                    </div>
                    <p className="font-black text-xl md:text-3xl tracking-tighter">€{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <div className="bg-[#0d0d0d] p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

               <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-8 md:mb-12">Summary</h3>
               <div className="space-y-4 md:space-y-6 mb-8 md:mb-12 pb-6 md:pb-10 border-b border-white/5">
                  <div className="flex justify-between text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">€{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <span>Authenticity Check</span>
                    <span className="text-accent uppercase">INCLUDED</span>
                  </div>
                  <div className="flex justify-between text-white/40 font-bold uppercase text-[10px] tracking-widest">
                    <span>Insured Shipping</span>
                    <span className="text-green-500 uppercase">FREE</span>
                  </div>
               </div>
               <div className="flex justify-between items-center mb-8 md:mb-16">
                  <span className="text-sm md:text-lg font-black uppercase tracking-widest text-white">Total</span>
                  <span className="text-3xl md:text-5xl font-black tracking-tighter text-accent">€{formattedTotal}</span>
               </div>

               <Link href="/checkout" className="w-full btn-premium py-6 md:py-10 bg-white text-black hover:bg-accent hover:text-white flex items-center justify-center gap-3 md:gap-4 text-base md:text-xl tracking-tighter">
                  SECURE CHECKOUT <ArrowRight size={22} />
               </Link>

               <p className="text-center mt-6 md:mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Fully Encrypted Transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
