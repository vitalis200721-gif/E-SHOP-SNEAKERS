'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="bg-premium-50 min-h-screen pb-20">
      <div className="pt-40 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-black/5 border border-white">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Secure Checkout</h1>
            </div>

            <form onSubmit={handleCheckout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <Field label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <Field label="Address" name="address" value={formData.address} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="City" name="city" value={formData.city} onChange={handleChange} required />
                <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                <Field label="Country" name="country" value={formData.country} onChange={handleChange} required />
              </div>

              <div className="bg-premium-100 p-8 rounded-[2rem] border border-premium-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} />
                    <span className="font-bold">Payment Method</span>
                  </div>
                  <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-accent uppercase tracking-widest">
                    Stripe Secure
                  </span>
                </div>
                <p className="text-sm text-premium-500">
                  You will be redirected to Stripe for a safe and encrypted transaction.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full btn-premium py-8 flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {loading ? 'PROCESSING…' : (
                  <>
                    <Lock size={20} />
                    PAY NOW ${totalPrice.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-black text-white p-12 rounded-[3rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] -z-0" />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 relative z-10">Order Summary</h3>
              <div className="space-y-6 relative z-10">
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <img src={item.images?.[0]} className="w-16 h-16 object-cover rounded-xl bg-white/10" alt={item.name} />
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-[10px] uppercase text-premium-400">Size: {item.size} × {item.qty}</p>
                      </div>
                    </div>
                    <p className="font-black">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-6 flex justify-between items-center text-3xl font-black uppercase tracking-tighter">
                  <span>Total</span>
                  <span className="text-accent">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-white rounded-[2rem] border border-premium-100">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-widest">Safe & Insured</p>
                <p className="text-xs text-premium-400">All orders are protected by our vault guarantee.</p>
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
      <label className="text-[10px] font-black uppercase tracking-widest text-premium-400">{label}</label>
      <input
        {...props}
        className="w-full bg-premium-50 border-none rounded-2xl p-5 outline-none focus:ring-2 ring-accent transition-all"
      />
    </div>
  );
}
