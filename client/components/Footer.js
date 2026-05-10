'use client';
import Link from 'next/link';
import { Instagram, Twitter, Disc as Discord, Youtube, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-40 pb-20 border-t border-white/5 relative overflow-hidden">
      {/* Background Decorative Text */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[20vw] font-black text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
        Sneakers
      </div>

      <div className="max-w-[1440px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Brand & Description */}
          <div className="lg:col-span-5 space-y-10">
            <Link href="/" className="text-4xl font-black tracking-tighter uppercase group">
              SOLE<span className="text-accent group-hover:text-white transition-colors">VAULT</span>
            </Link>
            <p className="text-lg text-white/40 leading-relaxed max-w-md font-medium">
              Elevating sneaker culture through curated authenticity. From iconic grails to the latest tech-wear performance, we provide the ultimate vault for your collection. Every pair tells a story, every drop is a legacy.
            </p>
            <div className="flex gap-6">
              {[Instagram, Twitter, Discord, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center hover:bg-accent hover:border-accent transition-all group">
                  <Icon size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Collections</h4>
              <ul className="space-y-4 text-white/40 font-black uppercase text-[10px] tracking-widest">
                <li><Link href="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Limited Drops</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Performance</Link></li>
              </ul>
            </div>
            
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Support</h4>
              <ul className="space-y-4 text-white/40 font-black uppercase text-[10px] tracking-widest">
                <li><Link href="#" className="hover:text-white transition-colors">Order Status</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Authenticity</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1 space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Newsletter</h4>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="w-full bg-[#0d0d0d] border border-white/5 rounded-2xl p-6 text-[10px] font-black outline-none focus:border-accent transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black p-3 rounded-xl hover:bg-accent hover:text-white transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Join the vault for exclusive drop alerts.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            © 2026 SOLEVAULT INC. DEPLOYED BY ANTIGRAVITY.
          </p>
          <div className="flex gap-10 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
