'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar } from 'lucide-react';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products', {
          params: { sort: 'newest', limit: 24 }
        });
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const featured = products[0];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-black to-black" />
        <img
          src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=2000"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 h-full max-w-[1800px] mx-auto px-10 flex flex-col justify-end pb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                <Sparkles size={24} className="text-white" />
              </div>
              <span className="font-black uppercase text-xs tracking-[0.5em] text-accent">Just Dropped</span>
            </div>
            <h1 className="text-[10vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.75] italic mb-8">
              New<br />Arrivals
            </h1>
            <div className="flex items-center gap-6 text-white/40">
              <div className="flex items-center gap-3">
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Updated Daily</span>
              </div>
              <div className="h-4 w-[2px] bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">{products.length} Fresh Drops</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Drop */}
      {featured && (
        <section className="max-w-[1800px] mx-auto px-10 -mt-20 relative z-20">
          <Link href={`/product/${featured._id}`}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[4rem] overflow-hidden bg-[#0d0d0d] border border-white/10 hover:border-accent/50 transition-all group"
            >
              <div className="aspect-square lg:aspect-auto bg-black overflow-hidden">
                <img
                  src={featured.images[0]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt={featured.name}
                />
              </div>
              <div className="p-16 flex flex-col justify-center space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-accent font-black text-[10px] uppercase tracking-[0.5em]">Featured Drop</span>
                </div>
                <p className="text-accent font-black text-xs uppercase tracking-[0.4em]">{featured.brand}</p>
                <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.85]">{featured.name}</h2>
                <p className="text-white/40 text-sm leading-relaxed line-clamp-3">{featured.description}</p>
                <div className="flex items-center gap-8 pt-4">
                  <span className="text-5xl font-black italic tracking-tighter">€{featured.price}</span>
                  <span className="flex items-center gap-3 text-accent font-black text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                    Discover <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="max-w-[1800px] mx-auto px-10 py-32">
        <div className="flex items-end justify-between mb-20">
          <div>
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">All<br />New Drops</h2>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white/40 hover:text-accent transition-colors">
            View Full Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white/5 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
            {products.slice(1).map((p, idx) => (
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
