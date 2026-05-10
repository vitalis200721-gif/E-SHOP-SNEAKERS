'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Tag, TrendingDown } from 'lucide-react';

export default function SalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const { data } = await api.get('/products', {
          params: { onSale: 'true', sort: 'newest', limit: 48 }
        });
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, []);

  const biggestDiscount = products.reduce((max, p) => {
    if (!p.oldPrice) return max;
    const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
    return pct > max ? pct : max;
  }, 0);

  const totalSavings = products.reduce(
    (sum, p) => sum + (p.oldPrice ? p.oldPrice - p.price : 0),
    0
  );

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative pt-48 pb-24 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-1/4 w-[35vw] h-[35vw] bg-red-500/10 blur-[180px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[30vw] h-[30vw] bg-orange-500/10 blur-[180px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1800px] mx-auto px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] animate-pulse">
                <Flame size={24} className="text-white" />
              </div>
              <span className="font-black uppercase text-xs tracking-[0.5em] text-red-500">Limited Time</span>
              <div className="hidden md:flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-8">
                <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] font-black tracking-tighter uppercase leading-[0.75] italic">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500">Sale</span>
                  <br />Season
                </h1>
              </div>

              {/* Stats */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingDown size={16} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Biggest Cut</span>
                  </div>
                  <p className="text-5xl font-black tracking-tighter italic">-{biggestDiscount}%</p>
                </div>
                <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag size={16} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Items On Sale</span>
                  </div>
                  <p className="text-5xl font-black tracking-tighter italic">{products.length}</p>
                </div>
              </div>
            </div>

            <p className="text-white/40 text-lg max-w-2xl leading-relaxed mt-12">
              Hand-picked grails at unprecedented value. Authenticity guaranteed, prices reduced — these silhouettes won't last long.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Banner Strip */}
      <section className="border-y border-red-500/20 bg-red-500/5 py-6 overflow-hidden">
        <div className="flex whitespace-nowrap animate-infinite-scroll gap-12">
          {[...Array(2)].flatMap((_, copy) =>
            ['UP TO 50% OFF', 'AUTHENTICITY GUARANTEED', 'FREE INSURED SHIPPING', 'ENDS SOON', 'LIMITED PAIRS'].map((t, i) => (
              <span key={`${copy}-${i}`} className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-red-500/60">
                {t} <span className="text-red-500/30 mx-12">✦</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1800px] mx-auto px-10 py-32">
        <div className="flex items-end justify-between mb-20">
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">
            All<br />Reduced
          </h2>
          <Link href="/shop" className="hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white/40 hover:text-accent transition-colors">
            Browse Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white/5 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
              <Tag size={48} className="text-white/20" />
            </div>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">No Active Sales</h3>
            <p className="text-white/40 mb-10">Check back soon — drops happen weekly.</p>
            <Link href="/shop" className="btn-premium px-12 py-6 bg-white text-black hover:bg-accent hover:text-white inline-block">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
            {products.map((p, idx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
