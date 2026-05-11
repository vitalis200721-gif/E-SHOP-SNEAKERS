'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Search, X, Loader2, Package, ShieldAlert, Save, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const emptyForm = {
  name: '',
  brand: '',
  price: '',
  oldPrice: '',
  description: '',
  images: '',
  sizes: '',
  color: '',
  category: '',
  stock: '',
  featured: false,
  trending: false,
};

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState('products');
  const [shippingOrder, setShippingOrder] = useState(null);
  const [shipForm, setShipForm] = useState({ trackingNumber: '', carrier: 'DHL Express' });
  const [shipSaving, setShipSaving] = useState(false);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        api.get('/products', { params: { limit: 100 } }),
        api.get('/orders/admin/all').catch(() => ({ data: [] })),
      ]);
      setProducts(pRes.data.products || []);
      setOrders(oRes.data || []);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price ?? '',
      oldPrice: product.oldPrice ?? '',
      description: product.description || '',
      images: (product.images || []).join(', '),
      sizes: (product.sizes || []).join(', '),
      color: product.color || '',
      category: product.category || '',
      stock: product.stock ?? '',
      featured: !!product.featured,
      trending: !!product.trending,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        description: form.description.trim(),
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)),
        color: form.color.trim(),
        category: form.category.trim(),
        stock: Number(form.stock),
        featured: !!form.featured,
        trending: !!form.trending,
      };
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, payload);
        setProducts((p) => p.map((x) => (x._id === editingId ? data : x)));
        toast('Product updated.', 'success');
      } else {
        const { data } = await api.post('/products', payload);
        setProducts((p) => [data, ...p]);
        toast('Product created.', 'success');
      }
      setShowForm(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((p) => p.filter((x) => x._id !== product._id));
      toast('Product deleted.', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const handleOrderStatus = async (order, status) => {
    if (status === 'shipped' && (!order.trackingNumber || !order.carrier)) {
      setShippingOrder(order);
      setShipForm({
        trackingNumber: order.trackingNumber || '',
        carrier: order.carrier || 'DHL Express',
      });
      return;
    }
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { status });
      setOrders((o) => o.map((x) => (x._id === order._id ? { ...x, ...data, user: x.user } : x)));
      toast(`Order marked as ${status}.`, 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const handleShip = async (e) => {
    e.preventDefault();
    if (!shipForm.trackingNumber.trim() || !shipForm.carrier.trim()) return;
    setShipSaving(true);
    try {
      const { data } = await api.put(`/orders/${shippingOrder._id}/ship`, shipForm);
      setOrders((o) => o.map((x) => (x._id === shippingOrder._id ? { ...x, ...data, user: x.user } : x)));
      toast('Order shipped. Customer notified via email.', 'success');
      setShippingOrder(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Ship update failed.', 'error');
    } finally {
      setShipSaving(false);
    }
  };

  const filtered = products.filter((p) =>
    [p.name, p.brand, p.category].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-black min-h-screen text-white pt-40 px-6 flex items-center justify-center">
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] p-12 max-w-lg text-center">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-6" />
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Admin Access Only</h1>
          <p className="text-white/40 mb-8">You don&rsquo;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="pt-32 max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-white/40 mt-2">Manage inventory and orders in real time.</p>
          </div>
          {tab === 'products' && (
            <button onClick={openCreate} className="btn-premium bg-white text-black hover:bg-accent hover:text-white flex items-center gap-2">
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { id: 'products', label: `Products (${products.length})` },
            { id: 'orders', label: `Orders (${orders.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                tab === t.id ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search products…"
                  className="w-full pl-12 pr-4 py-3 bg-black border border-white/10 rounded-xl outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-16 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={28} /></div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/40 text-xs font-bold uppercase tracking-widest text-white/40">
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((p) => (
                      <tr key={p._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden">
                              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="font-bold">{p.name}</p>
                              <p className="text-xs text-white/40">{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{p.category}</td>
                        <td className="px-6 py-4 font-bold">${p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(p)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Edit">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDelete(p)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" aria-label="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                          <Package size={28} className="mx-auto mb-3 text-white/20" />
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-16 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={28} /></div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/40 text-xs font-bold uppercase tracking-widest text-white/40">
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold">#{String(o._id).slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-white/40">{new Date(o.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-bold">{o.user?.name || '—'}</p>
                          <p className="text-xs text-white/40">{o.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold">${o.totalPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10">{o.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {o.isPaid && o.status !== 'shipped' && o.status !== 'delivered' && (
                              <button
                                onClick={() => { setShippingOrder(o); setShipForm({ trackingNumber: o.trackingNumber || '', carrier: o.carrier || 'DHL Express' }); }}
                                className="px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-1"
                              >
                                <Truck size={14} /> Ship
                              </button>
                            )}
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatus(o, e.target.value)}
                              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs font-bold uppercase"
                            >
                              {['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-white/40">No orders yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {shippingOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShippingOrder(null)}
            className="fixed inset-0 z-[2400] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            <motion.form
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleShip}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-5"
            >
              <button type="button" onClick={() => setShippingOrder(null)} className="absolute top-5 right-5 w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white">
                <X size={18} />
              </button>
              <div>
                <div className="w-12 h-12 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center mb-4">
                  <Truck size={20} className="text-accent" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Mark as Shipped</h2>
                <p className="text-white/40 text-sm mt-2">Order #{String(shippingOrder._id).slice(-8).toUpperCase()} · {shippingOrder.user?.email}</p>
              </div>

              <Input label="Carrier" value={shipForm.carrier} onChange={(v) => setShipForm({ ...shipForm, carrier: v })} required placeholder="DHL Express" />
              <Input label="Tracking Number" value={shipForm.trackingNumber} onChange={(v) => setShipForm({ ...shipForm, trackingNumber: v })} required placeholder="e.g. JD0002342342" />

              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-xs text-white/60 leading-relaxed">
                Customer will be notified by email when you confirm.
              </div>

              <button
                type="submit" disabled={shipSaving}
                className="w-full btn-premium bg-accent text-white hover:bg-white hover:text-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {shipSaving ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                Confirm Shipment
              </button>
            </motion.form>
          </motion.div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 z-[2400] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            <motion.form
              initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-5"
            >
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-5 right-5 w-11 h-11 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white/60 hover:text-white">
                <X size={18} />
              </button>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                {editingId ? 'Edit Product' : 'New Product'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Input label="Brand" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} required />
                <Input label="Price" type="number" step="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
                <Input label="Old Price" type="number" step="0.01" value={form.oldPrice} onChange={(v) => setForm({ ...form, oldPrice: v })} />
                <Input label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} required />
                <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} required />
                <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
                <Input label="Sizes (comma-separated)" value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} placeholder="40, 41, 42, 43" />
              </div>

              <Input label="Image URLs (comma-separated)" value={form.images} onChange={(v) => setForm({ ...form, images: v })} />

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-accent transition-all"
                />
              </div>

              <div className="flex gap-6">
                <Checkbox label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                <Checkbox label="Trending" checked={form.trending} onChange={(v) => setForm({ ...form, trending: v })} />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-premium bg-accent text-white hover:bg-white hover:text-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required, step, placeholder }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block mb-2">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-black border border-white/10 rounded-2xl py-3 px-4 outline-none focus:border-accent transition-all"
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-accent"
      />
      <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
    </label>
  );
}
