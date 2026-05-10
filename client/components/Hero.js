'use client';
import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import VideoModal from '@/components/VideoModal';

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const textY = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [filmOpen, setFilmOpen] = useState(false);

  const brands = ['NIKE', 'JORDAN', 'ADIDAS', 'PUMA', 'NEW BALANCE', 'REEBOK', 'YEEZY', 'ASICS'];

  return (
    <section className="relative h-[115vh] w-full overflow-hidden bg-black">
      {/* Cinematic Background Image */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-60 scale-110 grayscale group-hover:grayscale-0 transition-all duration-1000"
          alt="Cinematic Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      </motion.div>

      <div className="relative z-10 h-full max-w-[1800px] mx-auto px-10 flex flex-col justify-end pb-48">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <div className="flex items-center gap-6 mb-12">
             <div className="w-20 h-[3px] bg-accent" />
             <span className="font-black uppercase text-sm tracking-[0.8em] text-accent">Defining The Culture</span>
          </div>
          
          <h2 className="text-[12vw] font-black text-white tracking-tighter uppercase leading-[0.7] mb-16 italic">
            Beyond<br/>The Vault.
          </h2>
          
          <div className="flex gap-10">
             <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="btn-premium bg-white text-black hover:bg-accent hover:text-white px-20 py-10 text-lg shadow-[0_20px_60px_rgba(255,255,255,0.1)]">Explore Drops</button>
             <button
                onClick={() => setFilmOpen(true)}
                className="px-20 py-10 border-2 border-white/10 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all backdrop-blur-xl group flex items-center gap-4"
             >
                Watch Film <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
             </button>
          </div>
        </motion.div>
      </div>

      {/* Brand Ticker Layer */}
      <div className="absolute bottom-0 w-full bg-white/5 backdrop-blur-2xl border-t border-white/10 py-12 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-infinite-scroll">
          {[...brands, ...brands].map((brand, idx) => (
            <span key={idx} className="text-4xl md:text-6xl font-black mx-12 text-white/10 hover:text-accent transition-colors cursor-default tracking-tighter">
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Depth Decor */}
      <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      <VideoModal
        isOpen={filmOpen}
        onClose={() => setFilmOpen(false)}
        videoId="J9PuGEbYABc"
        title="Beyond The Vault — Film"
      />
    </section>
  );
};

export default Hero;
