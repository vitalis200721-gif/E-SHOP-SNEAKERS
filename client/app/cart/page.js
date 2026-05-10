'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, totalPrice, isLoaded } = useCart();

  if (!isLoaded) return <div className="h-screen bg-black flex items-center justify-center text-accent animate-pulse uppercase font-black tracking-widest">Accessing Vault...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="pt-60 flex flex-col items-center justify-center text-center px-4">
          <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mb-12 border border-white/10 animate-float">
            <ShoppingBag size={64} className="text-white/20" />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">Your vault is empty</h1>
          <p className="text-white/40 mb-12 text-lg">Your collection starts here. Find your next grail in our shop.</p>
          <Link href="/shop" className="btn-premium px-16 py-8 bg-white text-black hover:bg-accent hover:text-white">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const formattedTotal = (totalPrice || 0).toFixed(2);

  return (
    <div className="bg-black text-white min-h-screen pb-40">
      <div className="pt-40 max-w-[1440px] mx-auto px-10">
        <div className="flex items-center gap-6 mb-20">
           <h1 className="text-8xl font-black tracking-tighter uppercase leading-none">Your bag</h1>
           <div className="h-12 w-[2px] bg-accent/30 self-end mb-2" />
           <span className="text-accent text-lg font-black uppercase tracking-widest self-end mb-2">{cartItems.length} items secured</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <motion.div 
                layout
                key={`${item._id}-${item.size}`}
                className="group relative bg-[#0d0d0d] p-8 rounded-[3rem] flex items-center gap-10 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="w-40 h-40 bg-black rounded-3xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500">
                  <img src={item.images[0]} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-accent font-black text-[10px] uppercase tracking-[0.4em] mb-2">{item.brand}</p>
                      <h3 className="font-bold text-2xl tracking-tight mb-2">{item.name}</h3>
                      <p className="inline-block bg-white/5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white/60">EU {item.size}</p>
                    </div>
                    <button onClick={() => removeFromCart(item._id, item.size)} className="bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-2xl p-4 transition-all">
                      <Trash2 size={24} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end pt-4">
                    <div className="flex items-center bg-black rounded-2xl border border-white/10 p-2">
                      <button onClick={() => updateQty(item._id, item.size, item.qty - 1)} className="p-3 hover:text-accent transition-colors"><Minus size={18} /></button>
                      <span className="w-12 text-center font-black text-lg">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.size, item.qty + 1)} className="p-3 hover:text-accent transition-colors"><Plus size={18} /></button>
                    </div>
                    <p className="font-black text-3xl tracking-tighter">€{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-40">
            <div className="bg-[#0d0d0d] p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
               {/* Background Decorative Element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
               
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-12">Summary</h3>
               <div className="space-y-6 mb-12 pb-10 border-b border-white/5">
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
               <div className="flex justify-between items-center mb-16">
                  <span className="text-lg font-black uppercase tracking-widest text-white">Total</span>
                  <span className="text-5xl font-black tracking-tighter text-accent">€{formattedTotal}</span>
               </div>
               
               <Link href="/checkout" className="w-full btn-premium py-10 bg-white text-black hover:bg-accent hover:text-white flex items-center justify-center gap-4 text-xl tracking-tighter">
                  SECURE CHECKOUT <ArrowRight size={24} />
               </Link>
               
               <p className="text-center mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Fully Encrypted Transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
