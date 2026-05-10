'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Edit3,
  FileText,
  Home,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  Package,
  Plane,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCart } from '@/context/CartContext';

const STORAGE_KEYS = {
  profile: 'solevault_profile',
  settings: 'solevault_settings',
};

const defaultSettings = {
  newsletter: true,
  orderUpdates: true,
  smsUpdates: false,
  twoFactor: false,
};

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30', progress: 15 },
  processing: { label: 'Processing', icon: Clock, className: 'bg-amber-500/10 text-amber-400 border-amber-500/30', progress: 35 },
  paid: { label: 'Paid', icon: CreditCard, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', progress: 55 },
  shipped: { label: 'Shipped', icon: Truck, className: 'bg-blue-500/10 text-blue-400 border-blue-500/30', progress: 80 },
  delivered: { label: 'Delivered', icon: Check, className: 'bg-green-500/10 text-green-400 border-green-500/30', progress: 100 },
  cancelled: { label: 'Cancelled', icon: X, className: 'bg-red-500/10 text-red-400 border-red-500/30', progress: 0 },
  refunded: { label: 'Refunded', icon: RefreshCw, className: 'bg-pink-500/10 text-pink-400 border-pink-500/30', progress: 0 },
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value));

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SV';

const shortId = (id) => String(id || '').slice(-8).toUpperCase();

function ProfileInner() {
  const { user: authUser, isAuthenticated, isLoading, openAuthModal, logout } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', city: '', postalCode: '',
  });
  const [draftProfile, setDraftProfile] = useState(profile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.settings) : null;
    setSettings(stored ? JSON.parse(stored) : defaultSettings);
    const t = setTimeout(() => setPageLoading(false), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authUser) return;
    const storedProfile = typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.profile)
      : null;
    const saved = storedProfile ? JSON.parse(storedProfile) : {};
    const next = {
      name: authUser.name || saved.name || '',
      email: authUser.email || saved.email || '',
      phone: saved.phone || '',
      address: saved.address || '',
      city: saved.city || '',
      postalCode: saved.postalCode || '',
    };
    setProfile(next);
    setDraftProfile(next);
  }, [authUser]);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
      if (data.length > 0 && !selectedOrderId) setSelectedOrderId(data[0]._id);
    } catch (err) {
      setOrdersError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o._id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      processing: orders.filter((o) => ['pending', 'processing'].includes(o.status)).length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    }),
    [orders]
  );

  const handleNavigate = (tab) => {
    setActionLoading(`nav-${tab}`);
    setTimeout(() => {
      setActiveTab(tab);
      setActionLoading('');
    }, 150);
  };

  const handleViewOrder = (id) => {
    setActionLoading(`order-${id}`);
    setTimeout(() => {
      setSelectedOrderId(id);
      setActiveTab('orders');
      setActionLoading('');
    }, 150);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/me', {
        name: draftProfile.name,
      });
      const next = {
        ...draftProfile,
        name: data.user.name,
        email: data.user.email,
      };
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
      setProfile(next);
      setDraftProfile(next);
      setEditingProfile(false);
      toast('Profile updated successfully.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setDraftProfile(profile);
    setEditingProfile(false);
  };

  const handleSettingToggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    toast('Settings saved.', 'success', 2000);
  };

  const handleReorder = async (order) => {
    setActionLoading(`reorder-${order._id}`);
    try {
      for (const item of order.orderItems) {
        const { data: product } = await api.get(`/products/${item.product}`);
        addToCart(product, item.size);
      }
      toast('Items added to cart.', 'success');
      router.push('/cart');
    } catch (err) {
      toast('Failed to reorder some items.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleTrackOrder = (order) => {
    setActionLoading(`track-${order._id}`);
    setTimeout(() => {
      setActionLoading('');
      setTrackingOrder(order);
    }, 200);
  };

  const handlePay = async (order) => {
    setActionLoading(`pay-${order._id}`);
    try {
      const { data } = await api.post('/payments/create-checkout-session', {
        orderId: order._id,
      });
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast(err.response?.data?.message || 'Could not start payment.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleLogout = () => {
    setActionLoading('logout');
    setTimeout(() => {
      logout();
      setActionLoading('');
      toast('Signed out successfully.', 'success');
      router.push('/');
    }, 250);
  };

  if (isLoading || pageLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-5">
          <Loader2 size={34} className="animate-spin text-accent" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-10 text-center shadow-[0_0_80px_rgba(59,130,246,0.12)]"
        >
          <div className="w-24 h-24 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-8">
            <ShieldCheck size={42} className="text-accent" />
          </div>
          <p className="text-accent font-black uppercase text-[10px] tracking-[0.5em] mb-4">Private Vault</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-5">Sign In Required</h1>
          <p className="text-white/40 leading-relaxed mb-10">
            Access your orders, delivery tracking, saved profile, and account settings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={openAuthModal} className="btn-premium bg-white text-black hover:bg-accent hover:text-white px-10 py-5">
              Sign In
            </button>
            <Link href="/shop" className="px-10 py-5 rounded-2xl border border-white/10 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">
              Browse Shop
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="pt-40 max-w-[1600px] mx-auto px-6 md:px-10 pb-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <p className="text-accent font-black uppercase text-[10px] tracking-[0.5em] mb-4">Account Dashboard</p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] italic">Your<br />Vault</h1>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            {[['Total', orderStats.total], ['Shipped', orderStats.shipped], ['Delivered', orderStats.delivered]].map(([label, value]) => (
              <div key={label} className="bg-[#0d0d0d] border border-white/10 rounded-3xl px-6 py-5 min-w-[120px]">
                <p className="text-3xl font-black tracking-tighter">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-5 lg:sticky lg:top-32">
              <div className="p-5 border-b border-white/5 mb-3">
                <div className="flex items-center gap-4">
                  {authUser?.avatar ? (
                    <img src={authUser.avatar} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center font-black text-xl">
                      {initialsFor(profile.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-black text-lg truncate">{profile.name}</p>
                    <p className="text-white/40 text-xs truncate">{profile.email}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  const loading = actionLoading === `nav-${tab.id}`;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleNavigate(tab.id)}
                      className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-[0.98] ${active ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={17} />
                        {tab.label}
                      </span>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={15} />}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-5 mt-5 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  disabled={actionLoading === 'logout'}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {actionLoading === 'logout' ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  Sign Out
                </button>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.section key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="space-y-8">
                  <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                      <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Profile Details</h2>
                        <p className="text-white/40 mt-2">Manage the identity connected to orders and delivery updates.</p>
                      </div>
                      {!editingProfile && (
                        <button onClick={() => setEditingProfile(true)} className="btn-premium bg-white text-black hover:bg-accent hover:text-white px-7 py-4 flex items-center gap-2">
                          <Edit3 size={16} /> Edit Profile
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        ['name', 'Full Name', User, false],
                        ['email', 'Email Address', Mail, true],
                        ['phone', 'Phone Number', Bell, false],
                        ['address', 'Street Address', Home, false],
                        ['city', 'City', MapPin, false],
                        ['postalCode', 'Postal Code', MapPin, false],
                      ].map(([key, label, Icon, locked]) => (
                        <label key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 block mb-3">{label}</span>
                          <div className="relative">
                            <Icon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                              value={draftProfile[key]}
                              disabled={!editingProfile || locked}
                              onChange={(e) => setDraftProfile({ ...draftProfile, [key]: e.target.value })}
                              className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-12 pr-5 outline-none focus:border-accent transition-all disabled:text-white/50 disabled:cursor-not-allowed"
                              required={key === 'name' || key === 'email'}
                              type={key === 'email' ? 'email' : 'text'}
                            />
                          </div>
                        </label>
                      ))}

                      {editingProfile && (
                        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
                          <button type="submit" disabled={savingProfile} className="btn-premium bg-accent text-white hover:bg-white hover:text-black px-8 py-5 flex items-center justify-center gap-2 disabled:opacity-60">
                            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                          </button>
                          <button type="button" onClick={handleCancelEdit} className="px-8 py-5 rounded-2xl border border-white/10 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                  {orders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {orders.slice(0, 3).map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <button
                            key={order._id}
                            onClick={() => handleViewOrder(order._id)}
                            className="text-left bg-[#0d0d0d] border border-white/10 hover:border-accent/40 rounded-3xl p-6 transition-all active:scale-[0.98] group"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <span className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${status.className}`}>
                                <StatusIcon size={13} />
                                {status.label}
                              </span>
                              <ChevronRight size={18} className="text-white/20 group-hover:text-accent transition-colors" />
                            </div>
                            <p className="text-xl font-black">#{shortId(order._id)}</p>
                            <p className="text-white/40 text-sm mt-1">{formatDate(order.createdAt)}</p>
                            <p className="text-3xl font-black tracking-tighter mt-5">${order.totalPrice.toFixed(2)}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              )}

              {activeTab === 'orders' && (
                <motion.section key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-5 space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Order History</h2>
                        <p className="text-white/40 mt-2">All your past and active orders.</p>
                      </div>
                      <button onClick={fetchOrders} className="p-3 rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all" aria-label="Refresh orders">
                        {ordersLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      </button>
                    </div>

                    {ordersError && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-400 text-sm">
                        {ordersError}
                      </div>
                    )}

                    {ordersLoading && orders.length === 0 ? (
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-10 text-center">
                        <Loader2 className="animate-spin text-accent mx-auto" size={28} />
                        <p className="text-white/40 mt-4 text-sm">Loading orders…</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-10 text-center">
                        <Package size={32} className="mx-auto text-white/30 mb-4" />
                        <p className="font-black text-lg mb-2">No orders yet</p>
                        <p className="text-white/40 text-sm mb-6">When you place your first order it will appear here.</p>
                        <Link href="/shop" className="btn-premium bg-white text-black hover:bg-accent hover:text-white inline-flex items-center gap-2">
                          <ShoppingBag size={16} /> Start Shopping
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => {
                        const active = selectedOrder?._id === order._id;
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        return (
                          <button
                            key={order._id}
                            onClick={() => handleViewOrder(order._id)}
                            className={`w-full text-left rounded-3xl p-6 border transition-all active:scale-[0.98] group ${active ? 'bg-white text-black border-white' : 'bg-[#0d0d0d] border-white/10 hover:border-accent/50 text-white'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xl font-black">#{shortId(order._id)}</p>
                                <p className={active ? 'text-black/50 text-sm mt-1' : 'text-white/40 text-sm mt-1'}>
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                              {actionLoading === `order-${order._id}` ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <ChevronRight size={18} className={active ? 'text-black' : 'text-white/20 group-hover:text-accent'} />
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-6">
                              <span className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${active ? 'bg-black/5 text-black border-black/10' : status.className}`}>
                                <StatusIcon size={13} />
                                {status.label}
                              </span>
                              <span className="font-black text-2xl tracking-tighter">${order.totalPrice.toFixed(2)}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="xl:col-span-7">
                    {selectedOrder && (
                      <motion.div key={selectedOrder._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-8 md:p-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
                          <div>
                            <button onClick={() => setActiveTab('profile')} className="xl:hidden flex items-center gap-2 text-white/40 hover:text-white text-xs font-black uppercase tracking-widest mb-5">
                              <ArrowLeft size={14} /> Dashboard
                            </button>
                            <p className="text-accent font-black uppercase text-[10px] tracking-[0.4em] mb-3">Order Details</p>
                            <h2 className="text-4xl font-black tracking-tighter">#{shortId(selectedOrder._id)}</h2>
                            <p className="text-white/40 mt-2">{formatDate(selectedOrder.createdAt)}</p>
                          </div>
                          <StatusBadge status={selectedOrder.status} />
                        </div>

                        <div className="mb-10">
                          <div className="h-3 bg-black rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(statusConfig[selectedOrder.status] || statusConfig.pending).progress}%` }}
                              transition={{ duration: 0.6 }}
                              className="h-full bg-accent rounded-full"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                          <InfoCard icon={Truck} label="Tracking" value={selectedOrder.trackingNumber || '—'} />
                          <InfoCard icon={MapPin} label="Carrier" value={selectedOrder.carrier || 'Not assigned'} />
                          <InfoCard icon={CreditCard} label="Payment" value={selectedOrder.isPaid ? 'Paid' : 'Pending'} />
                        </div>

                        <div className="space-y-4 mb-10">
                          <h3 className="text-xl font-black uppercase tracking-tighter">Items</h3>
                          {selectedOrder.orderItems.map((item) => (
                            <div key={`${selectedOrder._id}-${item.product}-${item.size}`} className="flex items-center gap-5 bg-black rounded-3xl p-5 border border-white/5">
                              {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover bg-white/5" />}
                              <div className="flex-1 min-w-0">
                                <p className="font-black truncate">{item.name}</p>
                                <p className="text-white/40 text-xs mt-1">EU {item.size || '—'} × {item.qty}</p>
                              </div>
                              <p className="font-black text-xl">${(item.price * item.qty).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        <div className="bg-black border border-white/5 rounded-3xl p-6 mb-10 space-y-2">
                          <Row label="Items" value={`$${selectedOrder.itemsPrice?.toFixed(2)}`} />
                          <Row label="Shipping" value={selectedOrder.shippingPrice > 0 ? `$${selectedOrder.shippingPrice.toFixed(2)}` : 'Free'} />
                          {selectedOrder.taxPrice > 0 && <Row label="Tax" value={`$${selectedOrder.taxPrice.toFixed(2)}`} />}
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <Row label="Total" value={`$${selectedOrder.totalPrice.toFixed(2)}`} bold />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          {!selectedOrder.isPaid && selectedOrder.status !== 'cancelled' && (
                            <button onClick={() => handlePay(selectedOrder)} disabled={actionLoading === `pay-${selectedOrder._id}`} className="btn-premium bg-accent text-white hover:bg-white hover:text-black px-8 py-5 flex items-center justify-center gap-2 disabled:opacity-60">
                              {actionLoading === `pay-${selectedOrder._id}` ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                              Pay Now
                            </button>
                          )}
                          {selectedOrder.isPaid && (
                            <button onClick={() => handleTrackOrder(selectedOrder)} disabled={actionLoading === `track-${selectedOrder._id}`} className="btn-premium bg-white text-black hover:bg-accent hover:text-white px-8 py-5 flex items-center justify-center gap-2 disabled:opacity-60">
                              {actionLoading === `track-${selectedOrder._id}` ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                              Track Order
                            </button>
                          )}
                          <button onClick={() => handleReorder(selectedOrder)} disabled={actionLoading === `reorder-${selectedOrder._id}`} className="px-8 py-5 rounded-2xl border border-white/10 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                            {actionLoading === `reorder-${selectedOrder._id}` ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                            Reorder
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.section>
              )}

              {activeTab === 'settings' && (
                <motion.section key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-8 md:p-10">
                  <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Settings</h2>
                  <p className="text-white/40 mb-10">Control communication, security, and shopping preferences.</p>
                  <div className="space-y-4">
                    <ToggleRow title="Newsletter Drops" description="Receive weekly sneaker drops and member-only sales." enabled={settings.newsletter} onClick={() => handleSettingToggle('newsletter')} />
                    <ToggleRow title="Order Updates" description="Email notifications for processing, shipping, and delivery events." enabled={settings.orderUpdates} onClick={() => handleSettingToggle('orderUpdates')} />
                    <ToggleRow title="SMS Delivery Alerts" description="Short delivery messages when your order is moving." enabled={settings.smsUpdates} onClick={() => handleSettingToggle('smsUpdates')} />
                    <ToggleRow title="Two-Factor Authentication" description="Add an extra confirmation layer for future sign-ins." enabled={settings.twoFactor} onClick={() => handleSettingToggle('twoFactor')} />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <TrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onCopyTracking={(value) => {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(value);
            toast('Tracking number copied to clipboard.', 'success', 2500);
          }
        }}
        onRefresh={() => {
          fetchOrders();
          toast('Tracking refreshed.', 'success', 2000);
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProfileInner />
    </Suspense>
  );
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-black border border-white/5 rounded-3xl p-5">
      <Icon size={18} className="text-accent mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{label}</p>
      <p className="font-bold text-sm leading-relaxed break-words">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'font-black text-lg' : 'text-white/50 text-sm'}>{label}</span>
      <span className={bold ? 'font-black text-2xl tracking-tighter' : 'font-black'}>{value}</span>
    </div>
  );
}

function ToggleRow({ title, description, enabled, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between gap-6 bg-black border border-white/5 hover:border-accent/40 rounded-3xl p-6 transition-all active:scale-[0.99]"
    >
      <div>
        <p className="font-black uppercase tracking-tighter">{title}</p>
        <p className="text-white/40 text-sm mt-1">{description}</p>
      </div>
      <div className={`w-16 h-9 rounded-full p-1 flex items-center transition-colors ${enabled ? 'bg-accent' : 'bg-white/10'}`}>
        <motion.div
          animate={{ x: enabled ? 28 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-7 h-7 bg-white rounded-full shadow-lg"
        />
      </div>
    </button>
  );
}

const eventIcons = {
  check: Check,
  truck: Truck,
  building: Building2,
  plane: Plane,
  package: Package,
  file: FileText,
};

function formatEventTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function buildTimelineEvents(order) {
  if (!order) return [];
  const events = [];
  if (order.status === 'delivered') {
    events.push({ date: order.deliveredAt || order.updatedAt, location: order.shippingAddress?.city || '—', status: 'Delivered', description: 'Package delivered to recipient.', icon: 'check' });
  }
  if (['shipped', 'delivered'].includes(order.status)) {
    events.push({ date: order.updatedAt, location: order.carrier || 'Carrier hub', status: 'Shipped', description: 'Package picked up by carrier.', icon: 'truck' });
  }
  if (order.isPaid) {
    events.push({ date: order.paidAt, location: 'Online', status: 'Payment confirmed', description: 'Payment processed successfully.', icon: 'file' });
  }
  events.push({ date: order.createdAt, location: 'Online', status: 'Order placed', description: 'Order received and queued for processing.', icon: 'package' });
  return events.filter((e) => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function TrackingModal({ order, onClose, onCopyTracking, onRefresh }) {
  useEffect(() => {
    if (!order) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [order, onClose]);

  if (!order) return <AnimatePresence />;

  const events = buildTimelineEvents(order);
  const config = statusConfig[order.status] || statusConfig.pending;
  const progress = config.progress;
  const dest = order.shippingAddress
    ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
    : '—';

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} onClick={onClose}
          className="fixed inset-0 z-[2400] bg-black/85 backdrop-blur-2xl flex items-end md:items-center justify-center p-4 md:p-10"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }}
            transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] shadow-[0_0_120px_rgba(59,130,246,0.18)]"
          >
            <button onClick={onClose} aria-label="Close tracking" className="absolute top-5 right-5 w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
              <X size={18} />
            </button>

            <div className="relative p-8 md:p-10 space-y-8">
              <div>
                <p className="text-accent font-black uppercase text-[10px] tracking-[0.5em] mb-3">Live Tracking</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">#{shortId(order._id)}</h2>
                <p className="text-white/40 mt-3 text-sm">{order.carrier || 'Carrier pending'} · {config.label}</p>
              </div>

              <div className="bg-black border border-white/5 rounded-3xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center">
                    <Navigation size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Destination</p>
                    <p className="text-xl font-black truncate">{dest}</p>
                    <p className="text-white/40 text-sm mt-1">{config.label}</p>
                  </div>
                </div>

                <div className="relative mb-3">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-accent via-accent to-white rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-black border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Tracking #</p>
                  <p className="font-black truncate">{order.trackingNumber || '—'}</p>
                </div>
                <div className="bg-black border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Carrier</p>
                  <p className="font-black truncate">{order.carrier || 'Pending'}</p>
                </div>
                <div className="bg-black border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Status</p>
                  <p className="font-black truncate">{config.label}</p>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => onCopyTracking(order.trackingNumber)} className="flex-1 px-5 py-4 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Copy size={14} /> Copy Tracking #
                  </button>
                  <button type="button" onClick={onRefresh} className="flex-1 px-5 py-4 rounded-2xl border border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 active:scale-[0.98]">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-5">Tracking History</h3>
                <ol className="relative pl-7">
                  <span className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
                  {events.map((event, idx) => {
                    const Icon = eventIcons[event.icon] || Package;
                    const isLatest = idx === 0;
                    return (
                      <li key={`${event.date}-${idx}`} className="relative pb-6 last:pb-0">
                        <span className={`absolute -left-7 top-0 w-7 h-7 rounded-full border flex items-center justify-center ${isLatest ? 'bg-accent border-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-black border-white/15 text-white/50'}`}>
                          <Icon size={12} />
                        </span>
                        <div className={`rounded-2xl border p-5 transition-all ${isLatest ? 'bg-accent/5 border-accent/30' : 'bg-black border-white/5'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <p className="font-black text-sm uppercase tracking-tighter">{event.status}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{formatEventTime(event.date)}</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
                          <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                            <MapPin size={11} /> {event.location}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex gap-4">
                <ShieldCheck size={20} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-white/60 leading-relaxed">
                  Live tracking updates as carrier scans become available. For carrier-side detail open the tracking number on the official carrier website.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
