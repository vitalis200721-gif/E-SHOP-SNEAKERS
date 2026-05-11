'use client';

const Base = ({ className = '', rounded = 'rounded-2xl' }) => (
  <div className={`${rounded} bg-white/5 relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="relative">
    <Base className="aspect-[4/5] w-full" rounded="rounded-[2rem] md:rounded-[3rem]" />
    <div className="mt-6 md:mt-8 space-y-3 px-2 md:px-4">
      <Base className="h-3 w-16" rounded="rounded-md" />
      <Base className="h-5 w-3/4" rounded="rounded-md" />
      <div className="flex items-center gap-3 pt-1">
        <Base className="h-7 w-20" rounded="rounded-md" />
        <Base className="h-4 w-12" rounded="rounded-md" />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="bg-black text-white min-h-screen pt-32 md:pt-40">
    <div className="max-w-[1800px] mx-auto px-5 md:px-10 pb-40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-24 items-start">
        <div className="lg:col-span-8 flex gap-4 md:gap-8">
          <div className="hidden lg:flex flex-col gap-4 w-24">
            {Array.from({ length: 4 }).map((_, i) => (
              <Base key={i} className="aspect-square" />
            ))}
          </div>
          <Base className="flex-1 aspect-[4/5] w-full" rounded="rounded-[2rem] md:rounded-[4rem]" />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <Base className="h-4 w-32" rounded="rounded-md" />
          <Base className="h-16 md:h-24 w-full" rounded="rounded-md" />
          <Base className="h-12 w-1/2" rounded="rounded-md" />
          <Base className="h-24 w-full" rounded="rounded-2xl" />
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Base key={i} className="h-14 md:h-16" rounded="rounded-2xl" />
            ))}
          </div>
          <Base className="h-16 w-full" rounded="rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export const OrderRowSkeleton = () => (
  <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-5 md:p-6 flex items-center gap-4 md:gap-6">
    <Base className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" rounded="rounded-2xl" />
    <div className="flex-1 space-y-3">
      <Base className="h-3 w-24" rounded="rounded-md" />
      <Base className="h-4 w-2/3" rounded="rounded-md" />
      <Base className="h-3 w-1/3" rounded="rounded-md" />
    </div>
    <Base className="h-7 w-16 md:w-20" rounded="rounded-md" />
  </div>
);

export const TextSkeleton = ({ width = 'w-full', height = 'h-4' }) => (
  <Base className={`${width} ${height}`} rounded="rounded-md" />
);

export default Base;
