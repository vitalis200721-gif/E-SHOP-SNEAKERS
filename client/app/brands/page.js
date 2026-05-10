'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import { ArrowUpRight, Award } from 'lucide-react';

const BRANDS = [
  {
    name: 'Nike',
    tagline: 'Just Do It',
    description: 'Pioneering sport and street culture since 1964. From Air Max to Vaporfly — the benchmark of innovation.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-orange-500/30 to-red-500/10',
  },
  {
    name: 'Jordan',
    tagline: 'Above The Rim',
    description: 'A legacy carved on hardwood. Every Jordan silhouette is a chapter in basketball history.',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-red-500/30 to-black/10',
  },
  {
    name: 'Adidas',
    tagline: 'Impossible Is Nothing',
    description: 'Three stripes, infinite stories. Engineering performance and elevating heritage simultaneously.',
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-blue-500/30 to-white/10',
  },
  {
    name: 'Puma',
    tagline: 'Forever Faster',
    description: 'Precision, speed, and unmistakable Euro flair — sport-luxe at its peak.',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-yellow-500/30 to-black/10',
  },
  {
    name: 'New Balance',
    tagline: 'Worn By The Wise',
    description: 'Quietly crafted in the USA & UK. The connoisseur\'s choice — comfort, dad-shoe royalty.',
    image: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-gray-500/30 to-white/10',
  },
  {
    name: 'Reebok',
    tagline: 'Be More Human',
    description: 'A reborn icon merging fitness pedigree with bold streetwear DNA.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1500',
    accent: 'from-red-600/30 to-blue-500/10',
  },
];

export default function BrandsPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const results = await Promise.all(
          BRANDS.map((b) =>
            api.get('/products', { params: { brand: b.name, limit: 1 } }).then((r) => [b.name, r.data.total || 0])
          )
        );
        setCounts(Object.fromEntries(results));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="relative pt-48 pb-24 max-w-[1800px] mx-auto px-10">
        <div className="absolute top-32 right-0 w-[40vw] h-[40vw] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
              <Award size={24} className="text-white" />
            </div>
            <span className="font-black uppercase text-xs tracking-[0.5em] text-accent">The Houses</span>
          </div>
          <h1 className="text-[10vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.75] italic">
            Brand<br />Universe
          </h1>
          <p className="text-white/40 text-lg max-w-2xl leading-relaxed">
            Six legendary houses. One unified vault. Explore the makers shaping global sneaker culture — from heritage runners to performance grails.
          </p>
        </motion.div>
      </section>

      {/* Brand Grid */}
      <section className="max-w-[1800px] mx-auto px-10 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {BRANDS.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.6 }}
            >
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                className="group relative block aspect-[4/3] rounded-[4rem] overflow-hidden border border-white/5 hover:border-accent/40 transition-all"
              >
                {/* Background image */}
                <img
                  src={brand.image}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 grayscale group-hover:grayscale-0"
                  alt={brand.name}
                />

                {/* Color overlay */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${brand.accent} mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

                {/* Content */}
                <div className="absolute inset-0 p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-accent font-black text-[10px] uppercase tracking-[0.4em] bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                      {loading ? '—' : `${counts[brand.name] || 0} Pairs`}
                    </span>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-accent group-hover:border-accent transition-all">
                      <ArrowUpRight size={22} className="group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.4em]">{brand.tagline}</p>
                    <h3 className="text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none italic group-hover:text-accent transition-colors duration-500">
                      {brand.name}
                    </h3>
                    <p className="text-white/60 text-sm max-w-md leading-relaxed font-medium opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-700">
                      {brand.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
