'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, LogOut, Heart, Settings, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { cartItems } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-3 md:py-4' : 'py-5 md:py-10'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className={`bg-black/60 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] border border-white/10 px-5 md:px-10 py-4 md:py-5 flex items-center justify-between transition-all ${isScrolled ? 'shadow-2xl shadow-accent/10' : 'shadow-none'}`}>

            {/* Logo */}
            <Link href="/" className="text-xl md:text-3xl font-black tracking-tighter uppercase group text-white">
              SOLE<span className="text-accent group-hover:text-white transition-colors">VAULT</span>
            </Link>

            {/* Links */}
            <div className="hidden lg:flex items-center gap-12">
              {['Shop', 'New Arrivals', 'Brands', 'Sale'].map((link) => (
                <Link key={link} href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-xs font-black uppercase tracking-[0.2em] text-white hover:text-accent transition-colors">
                  {link}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 md:gap-6 text-white">
              <button className="hidden sm:block hover:text-accent transition-colors" aria-label="Search"><Search size={20} /></button>

              <Link href="/cart" className="relative group" aria-label="Cart">
                <ShoppingBag size={20} className="group-hover:text-accent transition-all" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2.5 -right-2.5 md:-top-3 md:-right-3 bg-accent text-white text-[10px] font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 border-black shadow-xl"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((o) => !o)}
                    className="hidden sm:flex items-center gap-3 hover:text-accent transition-colors group"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-accent transition-colors" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[11px] font-black tracking-widest text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        {initials}
                      </div>
                    )}
                    <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-4 w-72 bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                      >
                        <div className="p-6 bg-gradient-to-br from-accent/10 to-transparent border-b border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-2">Signed In</p>
                          <p className="font-black text-lg leading-tight truncate">{user?.name}</p>
                          <p className="text-white/40 text-xs truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-sm font-medium"
                          >
                            <User size={16} className="text-accent" /> My Profile
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-sm font-medium"
                          >
                            <Heart size={16} className="text-accent" /> Wishlist
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                              <Settings size={16} className="text-accent" /> Admin Panel
                            </Link>
                          )}
                          <div className="h-px bg-white/5 my-2" />
                          <button
                            onClick={() => { logout(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-medium"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="hidden sm:flex items-center gap-2 bg-white text-black hover:bg-accent hover:text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <User size={14} /> Sign In
                </button>
              )}

              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[200] bg-black p-6 md:p-12 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12 md:mb-20">
              <span className="text-xl md:text-2xl font-black text-white tracking-tighter">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu" className="w-11 h-11 md:w-12 md:h-12 bg-white/10 text-white rounded-full flex items-center justify-center">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-6 md:space-y-10 flex-1">
              {['Shop', 'New Arrivals', 'Brands', 'Sale'].map((link) => (
                <Link key={link} href={`/${link.toLowerCase().replace(' ', '-')}`} onClick={() => setIsMobileMenuOpen(false)} className="block text-3xl sm:text-4xl md:text-5xl font-black text-white hover:text-accent uppercase tracking-tighter">
                  {link}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block text-3xl sm:text-4xl md:text-5xl font-black text-white/60 hover:text-accent uppercase tracking-tighter">
                Cart {cartCount > 0 && <span className="text-base text-accent">({cartCount})</span>}
              </Link>
              {isAuthenticated && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-3xl sm:text-4xl md:text-5xl font-black text-white/60 hover:text-accent uppercase tracking-tighter">
                  Profile
                </Link>
              )}
            </div>
            <div className="pt-6 md:pt-8 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-3 md:space-y-4">
                  <p className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">Signed in as</p>
                  <p className="text-white font-bold truncate">{user?.name}</p>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="text-red-400 text-sm font-black uppercase tracking-widest"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
                  className="w-full btn-premium py-5 md:py-6 bg-white text-black hover:bg-accent hover:text-white"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
