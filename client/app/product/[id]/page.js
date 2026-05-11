'use client';
import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductDetailSkeleton, ProductCardSkeleton } from '@/components/Skeleton';
import { ShoppingBag, Star, Maximize2, X, ChevronLeft, ChevronRight, Share2, ShieldCheck, Truck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailPage({ params }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const [addedFlash, setAddedFlash] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${params.id}`);
        setProduct(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    const fetchRecs = async () => {
      try {
        const recsRes = await api.get(`/products/${params.id}/recommendations`);
        setRecommendations(Array.isArray(recsRes.data) ? recsRes.data : []);
      } catch (err) { /* silent */ } finally { setRecsLoading(false); }
    };
    fetchProduct();
    fetchRecs();
  }, [params.id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast('Please select a size first.', 'info');
      return;
    }
    if (product.stock <= 0) {
      toast('This drop is sold out.', 'error');
      return;
    }
    addToCart(product, selectedSize);
    toast(`${product.name} (EU ${selectedSize}) added to bag.`, 'success');
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 1500);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Drop not found</h1>
      <p className="text-white/40 mb-8">This product may have been removed or never existed.</p>
      <a href="/shop" className="btn-premium bg-white text-black hover:bg-accent hover:text-white px-10 py-5">Back to Shop</a>
    </div>
  );

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

      <div className="pt-32 md:pt-40 max-w-[1800px] mx-auto px-5 md:px-10 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24 items-start">

          {/* LEFT: GALLERY ENGINE */}
          <div className="lg:col-span-8 flex gap-4 md:gap-8">
            {/* Vertical Thumbnail Strip - desktop only */}
            <div className="hidden lg:flex flex-col gap-4 w-24">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setActiveImage(idx)}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-accent scale-105' : 'border-white/5 opacity-40 hover:opacity-100'}`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-4">
              {/* Main Stage with Lens Zoom (desktop) */}
              <div className="relative group cursor-zoom-in rounded-[2rem] md:rounded-[4rem] overflow-hidden bg-[#0d0d0d] border border-white/5 aspect-[4/5]"
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
                    alt={product.name}
                 />

                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl">
                       <Maximize2 size={16} /> Inspect Detail
                    </div>
                 </div>

                 <div className="absolute top-5 md:top-10 right-5 md:right-10 flex gap-3 md:gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                        } else if (navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          toast('Link copied to clipboard.', 'success');
                        }
                      }}
                      aria-label="Share"
                      className="bg-black/60 backdrop-blur-xl p-3 md:p-4 rounded-full hover:bg-accent transition-all"
                    >
                      <Share2 size={18} />
                    </button>
                 </div>
              </div>

              {/* Horizontal Thumbnail Strip - mobile only */}
              <div className="lg:hidden flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-accent' : 'border-white/10 opacity-50'}`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PREMIUM INFO PANEL */}
          <div className="lg:col-span-4 lg:sticky lg:top-40">
             <div className="space-y-8 md:space-y-12">
                <div className="space-y-4">
                   <div className="flex items-center flex-wrap gap-3 md:gap-4">
                      <span className="text-accent font-black text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em]">{product.brand}</span>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className={`${product.stock < 10 ? 'text-orange-500' : 'text-white/40'} text-[10px] font-black uppercase tracking-widest`}>
                        {product.stock <= 0
                          ? 'Sold Out'
                          : product.stock < 10
                            ? `Only ${product.stock} Left`
                            : `In Stock: ${product.stock} Units`}
                      </span>
                   </div>
                   <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tighter uppercase leading-[0.85]">{product.name}</h1>

                   <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/10">
                      <div className="w-9 h-9 md:w-10 md:h-10 bg-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                         <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                        <span className="text-white">{product.salesCount || 12} fans</span> secured this drop
                      </p>
                   </div>

                   <div className="flex items-center flex-wrap gap-4 md:gap-8 pt-4 md:pt-6">
                      <span className="text-4xl md:text-6xl font-black italic tracking-tighter">€{product.price}</span>
                      {product.oldPrice && (
                        <div className="flex flex-col">
                          <span className="text-lg md:text-2xl text-white/20 line-through font-bold">€{product.oldPrice}</span>
                          <span className="text-[10px] md:text-xs font-black text-red-500 uppercase">Save {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl border border-white/10 ml-auto">
                         <Star size={16} className="fill-accent text-accent" />
                         <span className="font-black text-base md:text-lg">{product.rating}</span>
                      </div>
                   </div>

                   <p className="text-white/60 leading-relaxed text-sm font-medium pt-3 md:pt-4">
                     {product.description || "The ultimate intersection of heritage and innovation. This limited edition release brings together premium materials and avant-garde design aesthetics to redefine your rotation."}
                   </p>
                </div>

                <div className="space-y-6 md:space-y-8">
                   <div>
                      <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-white/40">Select Your Size (EU)</h3>
                        <span className="text-[9px] font-bold text-accent uppercase">Size Guide</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 md:gap-4">
                         {product.sizes.map(size => (
                           <button
                             key={size}
                             onClick={() => setSelectedSize(size)}
                             className={`py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-sm md:text-base transition-all border ${selectedSize === size ? 'bg-accent border-accent text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-105' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                           >
                             {size}
                           </button>
                         ))}
                      </div>
                   </div>

                   <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="hidden lg:flex w-full btn-premium bg-white text-black hover:bg-accent hover:text-white py-8 md:py-10 text-lg md:text-xl tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed items-center justify-center gap-3"
                   >
                      {addedFlash ? <><Check size={20} /> ADDED TO BAG</> : product.stock <= 0 ? 'SOLD OUT' : 'SECURE THIS DROP'}
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-6 md:gap-10 pt-8 md:pt-12 border-t border-white/5">
                   <div className="flex gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-accent flex-shrink-0"><Truck size={26} /></div>
                      <div><p className="font-black text-[11px] md:text-xs uppercase tracking-tighter">Global Hub</p><p className="text-[10px] text-white/30 uppercase">Tracked Delivery</p></div>
                   </div>
                   <div className="flex gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-accent flex-shrink-0"><ShieldCheck size={26} /></div>
                      <div><p className="font-black text-[11px] md:text-xs uppercase tracking-tighter">Verified</p><p className="text-[10px] text-white/30 uppercase">SoleVault Expert</p></div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Recommendations */}
        <section className="mt-20 md:mt-32 pb-24 lg:pb-0">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">You Might Also Like</h2>
              <p className="text-white/40 mt-2 text-xs md:text-sm">Curated picks based on this drop.</p>
            </div>
          </div>
          {recsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-white/30 text-sm">No similar drops right now.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
              {recommendations.slice(0, 4).map((rec) => (
                <ProductCard key={rec._id} product={rec} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sticky mobile add-to-cart bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[800] bg-black/90 backdrop-blur-2xl border-t border-white/10 px-5 py-4 pb-safe">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter">€{product.price}</span>
            {selectedSize ? (
              <span className="text-[10px] text-accent font-black uppercase tracking-widest">EU {selectedSize}</span>
            ) : (
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Select size</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex-1 btn-premium bg-accent text-white hover:bg-white hover:text-black py-5 text-sm flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addedFlash ? <><Check size={18} /> ADDED</> : product.stock <= 0 ? 'SOLD OUT' : <><ShoppingBag size={16} /> ADD TO BAG</>}
          </button>
        </div>
      </div>
    </div>
  );
}
