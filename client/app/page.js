'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import VideoModal from '@/components/VideoModal';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Play } from 'lucide-react';

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bestRes, newRes] = await Promise.all([
          api.get('/products?sort=best-sellers&limit=4'),
          api.get('/products?limit=8')
        ]);
        // Kadangi dabar grąžiname { products, total, pages... }, turime paimti .products
        setBestSellers(bestRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-black text-white selection:bg-accent selection:text-white">
      <Hero />

      {/* Cinematic Category Banners */}
      <section className="px-6 py-32 space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/shop?sort=newest" className="relative h-[700px] rounded-[4rem] overflow-hidden group block">
               <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
               <div className="absolute bottom-16 left-16">
                  <p className="text-accent font-black text-xs uppercase tracking-[0.5em] mb-4">Performance Tech</p>
                  <h3 className="text-6xl font-black uppercase tracking-tighter mb-10 leading-none">Run The<br/>Future</h3>
                  <span className="btn-premium inline-block px-10 py-5 bg-white text-black group-hover:bg-accent group-hover:text-white text-[10px]">Explore Series</span>
               </div>
            </Link>
            <Link href="/brands" className="relative h-[700px] rounded-[4rem] overflow-hidden group block">
               <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
               <div className="absolute bottom-16 left-16">
                  <p className="text-accent font-black text-xs uppercase tracking-[0.5em] mb-4">Heritage & Street</p>
                  <h3 className="text-6xl font-black uppercase tracking-tighter mb-10 leading-none">Street<br/>Legends</h3>
                  <span className="btn-premium inline-block px-10 py-5 bg-white text-black group-hover:bg-accent group-hover:text-white text-[10px]">Explore Classics</span>
               </div>
            </Link>
         </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1440px] mx-auto px-10 py-32">
        <div className="flex justify-between items-end mb-24">
          <h2 className="text-8xl font-black tracking-tighter uppercase leading-[0.8]">The<br/>New Drops</h2>
          <Link href="/shop" className="flex items-center gap-4 font-black uppercase text-xs tracking-widest text-accent hover:text-white transition-all">See Full Shop <ArrowRight size={20} /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
          {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* Full-Width Cinematic Banner */}
      <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden my-40">
         <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-50" />
         <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" />
         <div className="relative z-10 text-center max-w-5xl px-6">
            <button
              onClick={() => setStoryOpen(true)}
              className="flex items-center justify-center gap-4 mb-12 mx-auto group cursor-pointer"
              aria-label="Play story video"
            >
               <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(255,255,255,0.3)] group-hover:bg-accent group-hover:text-white transition-colors"><Play size={28} fill="currentColor" /></div>
               <span className="font-black uppercase text-[10px] tracking-[0.4em] text-white/80 group-hover:text-accent transition-colors">Vault Exclusive Film</span>
            </button>
            <h2 className="text-8xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.75] mb-16 italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">Legacy<br/>By SoleVault</h2>
            <button
              onClick={() => setStoryOpen(true)}
              className="btn-premium inline-block px-20 py-8 bg-white text-black hover:bg-accent hover:text-white text-sm"
            >
              Watch Story
            </button>
         </div>
      </section>

      <VideoModal
        isOpen={storyOpen}
        onClose={() => setStoryOpen(false)}
        videoId="d2fkR29xOmE"
        title="Legacy By SoleVault"
      />

      {/* Best Sellers */}
      <section className="max-w-[1440px] mx-auto px-10 py-40">
        <div className="flex items-center gap-4 mb-20">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]"><TrendingUp size={24} className="text-white" /></div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Community Grail List</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
