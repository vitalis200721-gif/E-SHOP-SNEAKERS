'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, ShoppingBag, DollarSign, Activity, ArrowUpRight, Plus } from 'lucide-react';
import api from '@/utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, prodRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/products')
        ]);
        setStats(statsRes.data);
        setInventory(prodRes.data.products || []);
      } catch (err) {
        console.error("Error fetching admin data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Analytics...</div>;

  const cards = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, trend: '+12%', color: 'text-green-500' },
    { title: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, trend: '+5%', color: 'text-blue-500' },
    { title: 'Active Users', value: stats?.totalUsers || 0, icon: Users, trend: 'Live', color: 'text-purple-500' },
    { title: 'Products', value: inventory.length, icon: Activity, trend: 'OK', color: 'text-red-500' },
  ];

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="pt-32 max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin Panel</h1>
            <p className="text-premium-500 mt-2">Real-time database metrics.</p>
          </div>
          <button className="btn-premium flex items-center gap-2"><Plus size={20} /> New Item</button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card, idx) => (
            <div key={idx} className="p-8 border border-premium-200 rounded-3xl bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-premium-50 ${card.color}`}><card.icon size={24} /></div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-600">{card.trend}</span>
              </div>
              <h3 className="text-premium-500 text-sm font-medium">{card.title}</h3>
              <p className="text-3xl font-black mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Inventory Section */}
        <div className="p-8 border border-premium-200 rounded-3xl bg-white">
          <h3 className="font-bold text-xl mb-8 uppercase tracking-widest">Inventory List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-premium-100 text-premium-400 uppercase text-[10px] tracking-[0.2em]">
                  <th className="pb-4">Product Name</th>
                  <th className="pb-4 text-center">Stock</th>
                  <th className="pb-4 text-center">Price</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-premium-50">
                {inventory.map((item) => (
                  <tr key={item._id} className="group hover:bg-premium-50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-premium-100 overflow-hidden">
                          <img src={item.image || (item.images && item.images[0])} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-center font-mono">{item.stock}</td>
                    <td className="py-5 text-center font-bold">${item.price}</td>
                    <td className="py-5 text-right">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
