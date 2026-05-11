'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lock, CreditCard, ShieldCheck, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import api from '@/utils/api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  useEffect(() => {
    if (user) {
      setFormData((s) => ({
        ...s,
        fullName: s.fullName || user.name || '',
        email: s.email || user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to continue.', 'info');
      openAuthModal?.();
      return;
    }
    if (cartItems.length === 0) {
      toast('Your cart is empty.', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        qty: item.qty,
        size: item.size,
      }));

      const { data: order } = await api.post('/orders', {
        orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        paymentMethod: 'stripe',
      });

      if (!stripePromise) {
        toast('Stripe is not configured. Order saved as pending.', 'info');
        clearCart();
        router.push(`/profile?tab=orders`);
        return;
      }

      const { data: session } = await api.post('/payments/create-checkout-session', {
        orderId: order._id,
      });

      const stripe = await stripePromise;
      if (session.url) {
        clearCart();
        window.location.href = session.url;
        return;
      }
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) toast(error.message, 'error');
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || 'Checkout failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="pt-40 md:pt-60 flex flex-col items-center justify-center text-center px-5">
          <div className="w-28 h-28 md:w-40 md:h-40 bg-white/5 rounded-full flex items-center justify-center mb-8 md:mb-12 border border-white/10">
            <ShoppingBag size={48} className="md:hidden text-white/20" />
            <ShoppingBag size={64} className="hidden md:block text-white/20" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Cart is empty</h1>
          <p className="text-white/40 mb-8 max-w-md">Add a pair before heading to checkout.</p>
          <Link href="/shop" className="btn-premium px-10 md:px-14 py-5 md:py-7 bg-white text-black hover:bg-accent hover:text-white">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pb-20 md:pb-40">
      <div className="pt-32 md:pt-40 max-w-[1440px] mx-auto px-5 md:px-10">
        <Link href="/cart" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-10">
          <ArrowLeft size={14} /> Back to Bag
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div className="bg-[#0d0d0d] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/5">
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Lock size={22} />
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Secure Checkout</h1>
            </div>

            <form onSubmit={handleCheckout} className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <Field label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <Field label="Address" name="address" value={formData.address} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Field label="City" name="city" value={formData.city} onChange={handleChange} required />
                <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                <Field label="Country" name="country" value={formData.country} onChange={handleChange} required />
              </div>

              <div className="bg-black p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/10">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-3 text-white">
                    <CreditCard size={20} />
                    <span className="font-bold text-sm md:text-base">Payment Method</span>
                  </div>
                  <span className="text-[10px] font-black bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-widest">
                    Stripe Secure
                  </span>
                </div>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed">
                  You will be redirected to Stripe for a safe and encrypted transaction.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full btn-premium py-6 md:py-8 bg-accent text-white hover:bg-white hover:text-black flex items-center justify-center gap-3 md:gap-4 group disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    PROCESSING…
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    PAY NOW €{totalPrice.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6 md:space-y-8 lg:sticky lg:top-40 self-start">
            <div className="bg-black text-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] -z-0" />
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-8 md:mb-10 relative z-10">Order Summary</h3>
              <div className="space-y-4 md:space-y-6 relative z-10">
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex justify-between items-center gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <img src={item.images?.[0]} className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl bg-white/10 flex-shrink-0" alt={item.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-xs md:text-sm truncate">{item.name}</p>
                        <p className="text-[10px] uppercase text-white/40">Size: {item.size} × {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-black text-sm md:text-base flex-shrink-0">€{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-4 md:pt-6 flex justify-between items-center text-xl md:text-3xl font-black uppercase tracking-tighter">
                  <span>Total</span>
                  <span className="text-accent">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 md:gap-6 p-5 md:p-8 bg-[#0d0d0d] rounded-[1.5rem] md:rounded-[2rem] border border-white/5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-black text-[10px] md:text-xs uppercase tracking-widest text-white">Safe &amp; Insured</p>
                <p className="text-[10px] md:text-xs text-white/40">All orders are protected by our vault guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>
      <input
        {...props}
        className="w-full bg-black text-white caret-accent border border-white/10 rounded-2xl px-4 md:px-5 py-4 md:py-5 text-sm outline-none focus:border-accent transition-all placeholder:text-white/20"
      />
    </div>
  );
}
