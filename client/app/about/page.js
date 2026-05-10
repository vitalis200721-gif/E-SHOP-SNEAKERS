export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="pt-32 max-w-4xl mx-auto px-4 pb-20">
        <h1 className="text-5xl font-black tracking-tighter mb-12">OUR STORY</h1>
        
        <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12">
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1200" 
            alt="Sneaker workshop" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-premium-600 dark:text-premium-400">
          <p className="text-xl font-medium text-black dark:text-white leading-relaxed">
            Founded in 2026, SOLEVAULT was born out of a simple obsession: the perfect pair of sneakers. 
            We believe that footwear is more than just an accessory—it's a statement of identity.
          </p>
          
          <p>
            Our journey started in a small garage with a curated collection of rare finds. Today, we stand as a 
            global destination for sneaker enthusiasts, athletes, and style icons. We bridge the gap between 
            high-performance sports gear and high-end street fashion.
          </p>

          <div className="grid grid-cols-2 gap-8 py-12 border-y border-premium-100 dark:border-premium-900 my-12">
            <div>
              <h3 className="text-black dark:text-white font-bold text-lg mb-2">Authenticity Guaranteed</h3>
              <p className="text-sm">Every item in our vault is verified by our expert team. No fakes, no compromises. Ever.</p>
            </div>
            <div>
              <h3 className="text-black dark:text-white font-bold text-lg mb-2">Global Community</h3>
              <p className="text-sm">We ship to over 150 countries, bringing exclusive drops to every corner of the world.</p>
            </div>
          </div>

          <h2 className="text-3xl font-black text-black dark:text-white mt-16">THE VISION</h2>
          <p>
            To redefine the retail experience through technology and design. Our platform is built using the latest 
            web technologies to ensure a seamless, secure, and premium shopping experience for our users.
          </p>
        </div>
      </div>
    </div>
  );
}
