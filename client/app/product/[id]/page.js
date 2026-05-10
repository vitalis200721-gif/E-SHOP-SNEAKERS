'use client';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { ShoppingBag, Star, Maximize2, X, ChevronLeft, ChevronRight, Share2, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({ params }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${params.id}`);
        setProduct(data);
        const recsRes = await api.get(`/products/${params.id}/recommendations`);
        setRecommendations(recsRes.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProduct();
  }, [params.id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-accent animate-pulse uppercase font-black tracking-widest">Hydrating Experience...</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      
      {/* FULLSCREEN MODAL GALLERY */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-10"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 hover:bg-white/10 rounded-full transition-all text-white z-[2010]">
              <X size={32} />
            </button>
            <div className="flex gap-10 items-center w-full h-full max-w-[1600px]">
               <button onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : product.images.length - 1))} className="p-6 hover:bg-white/10 rounded-full text-white transition-all"><ChevronLeft size={64} /></button>
               <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                    src={product.images[activeImage]} 
                    className="max-h-full max-w-full object-contain shadow-[0_0_100px_rgba(255,255,255,0.05)]" 
                  />
               </div>
               <button onClick={() => setActiveImage(prev => (prev < product.images.length - 1 ? prev + 1 : 0))} className="p-6 hover:bg-white/10 rounded-full text-white transition-all"><ChevronRight size={64} /></button>
            </div>
            {/* Modal Mini Thumbnails */}
            <div className="absolute bottom-10 flex gap-4 overflow-x-auto px-10 max-w-full no-scrollbar">
               {product.images.map((img, idx) => (
                 <button key={idx} onClick={() => setActiveImage(idx)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? 'border-accent shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-40 max-w-[1800px] mx-auto px-10 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          
          {/* LEFT: GALLERY ENGINE */}
          <div className="lg:col-span-8 flex gap-8">
            {/* Vertical Thumbnail Strip */}
            <div className="hidden lg:flex flex-col gap-4 w-24">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onMouseEnter={() => setActiveImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-accent scale-105' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Stage with Advanced Lens Zoom */}
            <div className="flex-1 relative group cursor-zoom-in rounded-[4rem] overflow-hidden bg-[#0d0d0d] border border-white/5 aspect-[4/5]"
                 onMouseMove={handleMouseMove}
                 onMouseLeave={() => setZoomPos({ ...zoomPos, show: false })}
                 onClick={() => setIsModalOpen(true)}
            >
               <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  src={product.images[activeImage]} 
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={zoomPos.show ? { transform: 'scale(2.2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
               />
               
               {/* Visual Overlays */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  <div className="bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                     <Maximize2 size={16} /> Inspect Detail
                  </div>
               </div>

               <div className="absolute top-10 right-10 flex gap-4">
                  <button className="bg-black/50 backdrop-blur-xl p-4 rounded-full hover:bg-accent transition-all"><Share2 size={20} /></button>
               </div>
            </div>
          </div>

          {/* RIGHT: PREMIUM INFO PANEL */}
          <div className="lg:col-span-4 lg:sticky lg:top-40">
             <div className="space-y-12">
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <span className="text-accent font-black text-xs uppercase tracking-[0.5em]">{product.brand}</span>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className={`${product.stock < 10 ? 'text-orange-500' : 'text-white/40'} text-[10px] font-black uppercase tracking-widest`}>
                        {product.stock < 10 ? `Extremely Limited: ${product.stock} Left` : `In Stock: ${product.stock} Units`}
                      </span>
                   </div>
                   <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8]">{product.name}</h1>
                   
                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                      <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center">
                         <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                        <span className="text-white">{product.salesCount || 12} fans</span> secured this drop today
                      </p>
                   </div>

                   <div className="flex items-center gap-8 pt-6">
                      <span className="text-6xl font-black italic tracking-tighter">€{product.price}</span>
                      {product.oldPrice && (
                        <div className="flex flex-col">
                          <span className="text-2xl text-white/20 line-through font-bold">€{product.oldPrice}</span>
                          <span className="text-xs font-black text-red-500 uppercase">Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 ml-auto">
                         <Star size={18} className="fill-accent text-accent" />
                         <span className="font-black text-lg">{product.rating}</span>
                      </div>
                   </div>

                   <p className="text-white/60 leading-relaxed text-sm font-medium pt-4">
                     {product.description || "The ultimate intersection of heritage and innovation. This limited edition release brings together premium materials and avant-garde design aesthetics to redefine your rotation."}
                   </p>
                </div>

                <div className="space-y-8">
                   <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-white/40">Select Your Size (EU)</h3>
                        <span className="text-[9px] font-bold text-accent uppercase underline cursor-pointer">Size Guide</span>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                         {product.sizes.map(size => (
                           <button 
                             key={size} 
                             onClick={() => setSelectedSize(size)} 
                             className={`py-6 rounded-3xl font-black transition-all border ${selectedSize === size ? 'bg-accent border-accent text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-105' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                           >
                             {size}
                           </button>
                         ))}
                      </div>
                   </div>

                   <button 
                    onClick={() => selectedSize ? addToCart(product, selectedSize) : alert('Define your size')}
                    className="w-full btn-premium bg-white text-black hover:bg-accent hover:text-white py-10 text-xl tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                   >
                      SECURE THIS DROP
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-10 pt-12 border-t border-white/5">
                   <div className="flex gap-4">
                      <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-accent"><Truck size={32} /></div>
                      <div><p className="font-black text-xs uppercase tracking-tighter">Global Hub</p><p className="text-[10px] text-white/30 uppercase">Tracked Delivery</p></div>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-accent"><ShieldCheck size={32} /></div>
                      <div><p className="font-black text-xs uppercase tracking-tighter">Verified</p><p className="text-[10px] text-white/30 uppercase">SoleVault Expert</p></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
