'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import api from '@/utils/api';
import { SlidersHorizontal, X, ChevronDown, ArrowLeft, ArrowRight, PackageX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State (initialized from URL params for deep links)
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  });

  // Sync filters when URL params change (e.g. clicking brand card from /brands)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      brand: searchParams.get('brand') || '',
      color: searchParams.get('color') || '',
      size: searchParams.get('size') || '',
      sort: searchParams.get('sort') || prev.sort,
    }));
    setCurrentPage(1);
  }, [searchParams]);

  const brands = ['Nike', 'Jordan', 'Adidas', 'Puma', 'New Balance', 'Reebok'];
  const colors = ['White', 'Black', 'Red', 'Blue', 'Grey', 'Green'];
  const sizes = [38, 39, 40, 41, 42, 43, 44, 45, 46];

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = ['brand', 'color', 'size', 'minPrice', 'maxPrice'].filter((k) => filters[k]).length;
  const clearAll = () => {
    setFilters({ brand: '', color: '', size: '', sort: 'newest', minPrice: '', maxPrice: '' });
    setCurrentPage(1);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { ...filters, page: currentPage, limit: 20 }
      });
      setProducts(data.products);
      setTotalProducts(data.total);
      setTotalPages(data.pages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const FilterPanel = (
    <>
      <div className="flex items-center justify-between border-b border-white/5 pb-6 md:pb-8">
        <h3 className="font-black uppercase text-xs tracking-[0.3em]">Vault Filters</h3>
        <button onClick={clearAll} className="text-[10px] font-bold text-accent uppercase hover:text-white transition-colors">Clear</button>
      </div>
      <div className="space-y-6 md:space-y-8">
        <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Brand</h4>
        <div className="grid grid-cols-2 gap-3">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => handleFilterChange('brand', filters.brand === b ? '' : b)}
              className={`px-4 py-3 md:py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all border ${filters.brand === b ? 'bg-accent border-accent text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 md:space-y-8">
        <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Colorway</h4>
        <div className="grid grid-cols-2 gap-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => handleFilterChange('color', filters.color === c ? '' : c)}
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-2xl text-[10px] font-bold uppercase transition-all border ${filters.color === c ? 'border-accent bg-accent/5' : 'border-white/5 hover:border-white/20'}`}
            >
              <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: c.toLowerCase(), boxShadow: `0 0 10px ${c.toLowerCase()}44` }} />
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 md:space-y-8">
        <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Size (EU)</h4>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange('size', filters.size === s ? '' : s)}
              className={`py-3 md:py-4 rounded-2xl text-[10px] font-black transition-all border ${filters.size == s ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 md:space-y-8">
        <h4 className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Investment</h4>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-[10px]">€</span>
            <input
              type="number"
              placeholder="MIN"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-8 pr-3 py-3 md:py-4 text-[10px] font-bold text-white outline-none focus:border-accent transition-all"
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-[10px]">€</span>
            <input
              type="number"
              placeholder="MAX"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-8 pr-3 py-3 md:py-4 text-[10px] font-bold text-white outline-none focus:border-accent transition-all"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="pt-32 md:pt-40 max-w-[1800px] mx-auto px-5 md:px-10 pb-40">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-10 mb-10 md:mb-24">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.75]">The<br/>Catalog</h1>
            <div className="flex items-center gap-3 md:gap-4">
               <div className="h-4 w-[2px] bg-accent" />
               <p className="text-white/40 font-black uppercase text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em]">{totalProducts} Authentic Pairs In Stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:border-accent transition-all"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">{activeFilterCount}</span>
              )}
            </button>
            <div className="relative group flex-1 md:flex-none">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full appearance-none bg-[#0d0d0d] border border-white/10 rounded-2xl px-5 md:px-10 py-4 md:py-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-accent transition-all cursor-pointer md:min-w-[240px]"
              >
                <option value="newest">Sort: Newest</option>
                <option value="popularity">Sort: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-accent transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          {/* Sidebar Filters (desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-12 lg:sticky lg:top-40 h-fit bg-[#0d0d0d]/80 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/5 shadow-2xl">
            {FilterPanel}
          </aside>

          {/* Sidebar Filters (mobile drawer) */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1500] bg-black/70 backdrop-blur-xl lg:hidden"
                onClick={() => setFiltersOpen(false)}
              >
                <motion.div
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-[#0d0d0d] overflow-y-auto p-8 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase text-sm tracking-[0.3em]">Filters</h3>
                    <button onClick={() => setFiltersOpen(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center"><X size={18} /></button>
                  </div>
                  {FilterPanel}
                  <button onClick={() => setFiltersOpen(false)} className="w-full btn-premium bg-accent text-white hover:bg-white hover:text-black py-5">
                    Show {totalProducts} Results
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 md:gap-x-12 md:gap-y-16">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 text-white/30">
                  <PackageX size={32} />
                </div>
                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-3 md:mb-4">No pairs match</h3>
                <p className="text-white/40 mb-6 md:mb-8 text-sm md:text-base">Try clearing filters or browse our full catalog.</p>
                <button onClick={clearAll} className="btn-premium bg-accent text-white hover:bg-white hover:text-black px-8 md:px-12 py-4 md:py-5">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 md:gap-x-12 md:gap-y-16">
                  {products.map((p, idx) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-20 md:mt-40 flex flex-col items-center gap-6 md:gap-10">
                     <div className="flex items-center justify-center gap-6 md:gap-12">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="w-14 h-14 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent border border-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          aria-label="Previous page"
                        >
                          <ArrowLeft size={22} className="md:hidden" />
                          <ArrowLeft size={28} className="hidden md:block group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex flex-col items-center">
                          <span className="font-black text-xl md:text-2xl tracking-tighter uppercase italic">{currentPage} / {totalPages}</span>
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-white/20 tracking-widest mt-1 md:mt-2">Current Tier</span>
                        </div>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="w-14 h-14 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent border border-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                          aria-label="Next page"
                        >
                          <ArrowRight size={22} className="md:hidden" />
                          <ArrowRight size={28} className="hidden md:block group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
