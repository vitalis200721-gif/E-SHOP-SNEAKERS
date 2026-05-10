'use client';
import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center relative overflow-hidden px-6">
      {/* Background decor */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-accent/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-red-500/10 blur-[180px] rounded-full pointer-events-none" />

      {/* Background giant 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[40vw] font-black text-white/[0.02] tracking-tighter italic leading-none">404</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-3xl"
      >
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-black uppercase text-xs tracking-[0.5em] text-red-500">Lost In The Vault</span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>

        <h1 className="text-[20vw] md:text-[14rem] font-black tracking-tighter italic leading-[0.8] mb-12 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">
          404
        </h1>

        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
          This Drop Doesn't Exist
        </h2>
        <p className="text-white/40 text-lg max-w-md mx-auto mb-16 leading-relaxed">
          The pair you're chasing has either sold out, was relocated, or never made it past the design floor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/"
            className="btn-premium px-12 py-7 bg-white text-black hover:bg-accent hover:text-white flex items-center gap-3"
          >
            <Home size={18} /> Back Home
          </Link>
          <Link
            href="/shop"
            className="px-12 py-7 border-2 border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3 backdrop-blur-xl"
          >
            <Search size={18} /> Browse Vault <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
