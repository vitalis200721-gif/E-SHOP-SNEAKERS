'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowUpRight, Heart } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set( (e.clientX - rect.left) / rect.width - 0.5 );
    y.set( (e.clientY - rect.top) / rect.height - 0.5 );
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="relative group cursor-pointer"
    >
      <Link href={`/product/${product._id}`}>
        <div className="relative aspect-[4/5] rounded-[3rem] bg-[#1a1a1a] overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.2)] border border-white/5">
          
          {/* Image Layer */}
          <div className="absolute inset-0 transition-opacity duration-700 opacity-100 group-hover:opacity-0">
            <img src={product.images[0]} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 transition-all duration-700 opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100">
            <img src={product.images[1] || product.images[0]} className="w-full h-full object-cover" />
          </div>

          {/* Badges */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            {product.oldPrice > product.price && (
              <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-red-500/20">Sale</span>
            )}
            {product.trending && (
              <span className="bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">Hot</span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter animate-pulse shadow-lg shadow-orange-500/20">Low Stock</span>
            )}
          </div>

          {/* Hover Overlay - Sutvarkytas kontrastas */}
          <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
             <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl flex justify-between items-center border border-white/10">
                <span className="text-white font-black text-[10px] uppercase tracking-widest">Discover Details</span>
                <ArrowUpRight size={18} className="text-accent" />
             </div>
          </div>
        </div>

        {/* Info Area - Geresnis įskaitomumas */}
        <div className="mt-8 space-y-3 px-4">
          <div className="flex justify-between items-end">
            <div className="flex-1">
              <p className="text-accent font-black text-[10px] uppercase tracking-[0.2em] mb-1">{product.brand}</p>
              <h3 className="font-bold text-lg text-white leading-tight group-hover:text-accent transition-colors truncate">{product.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-black text-white">{product.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">€{product.price}</span>
            {product.oldPrice && (
              <>
                <span className="text-sm text-white/30 line-through font-bold">€{product.oldPrice}</span>
                <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
