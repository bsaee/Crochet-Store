import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './lib/utils';
import { Product, Category, Settings } from './types';
import AdminPanel from './components/AdminPanel';
import ProductModal from './components/ProductModal';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

const INITIAL_SETTINGS: Settings = {
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
};

export default function App() {
  const [localProducts, setLocalProducts] = useLocalStorage<Product[]>('crochet_products_v2', []);
  const [settings, setSettings] = useLocalStorage<Settings>('crochet_settings', INITIAL_SETTINGS);
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar visibility
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load public products
  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => setLiveProducts(data))
      .catch(() => console.log('No public products found yet'));
  }, []);

  // Merge products: public first, then local (local overrides if user is adding)
  const allProducts = useMemo(() => {
    const combined = [...liveProducts];
    localProducts.forEach(lp => {
      if (!combined.find(p => p.id === lp.id)) {
        combined.push(lp);
      }
    });
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [liveProducts, localProducts]);

  const filteredProducts = useMemo(() => {
    return activeFilter === 'all' 
      ? allProducts 
      : allProducts.filter(p => p.category === activeFilter);
  }, [allProducts, activeFilter]);

  const whatsappIconPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

  return (
    <div className="min-h-screen selection:bg-pink-mid selection:text-white">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-soft/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lilac-soft/40 blur-[120px]" />
      </div>

      {/* Navbar - Sticky & Scroll Triggered */}
      <AnimatePresence>
        {scrolled && (
          <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-40 bg-cream/80 backdrop-blur-xl border-b border-pink-soft/30 px-6 sm:px-12 py-4 flex items-center justify-between shadow-sm"
          >
            <div 
              className="flex items-center gap-2 cursor-pointer group mx-auto"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onDoubleClick={() => setIsAdminOpen(true)}
            >
              <span className="font-serif text-xl font-semibold tracking-tight">
                Crochet Art <span className="italic text-pink-deep">by Stuti</span>
              </span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-4 pb-12 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Updated Hero Section */}
        <header className="mb-32 text-center relative">
          {/* Floating Decorative Elements restricted to Hero */}
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -top-4 left-[10%] text-4xl opacity-40">🎀</motion.div>
          <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-[30%] right-[-5%] text-5xl opacity-40">🌸</motion.div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-[-10%] left-[5%] text-3xl opacity-30">🧶</motion.div>
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-2 right-[15%] text-2xl opacity-20">🧸</motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <p className="inline-block bg-pink-deep text-pink-soft text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-10 -mt-4 shadow-sm">Crafted with love</p>
            <h1 className="text-7xl sm:text-9xl font-serif font-semibold text-text-dark leading-[1] relative inline-block">
              Crochet Art <br />
              <span className="italic text-pink-deep relative inline-block">
                by Stuti
                <svg className="absolute -bottom-3 sm:-bottom-5 left-0 w-full h-4 sm:h-8 text-pink-soft/80 -z-10" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 15C50 5 150 25 195 10" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto text-text-mid text-2xl font-serif italic mb-14"
          >
           "Cute, cozy and handmade."
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              onClick={() => document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' })}
              className="group bg-text-dark text-white px-12 py-5 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-pink-mid/40 transition-all hover:scale-[1.05] active:scale-[0.98] flex items-center gap-3 mx-auto"
            >
              Browse Catalogue <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>

          {/* Random floating emojis for flair */}
          <div className="absolute top-0 right-0 text-3xl animate-bounce duration-[3000ms] hidden md:block">🧸</div>
          <div className="absolute bottom-0 left-0 text-3xl animate-pulse duration-[4000ms] hidden md:block">🧶</div>
        </header>

        {/* Categories / Filter */}
        <section id="catalogue" className="mb-24 pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-pink-soft/30 pb-12">
            <div>
              <h2 className="text-5xl font-serif font-semibold text-text-dark tracking-tight">Our Collection</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-7 py-3 rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'all' 
                    ? 'bg-text-dark text-white shadow-xl scale-105' 
                    : 'bg-white text-text-mid border border-pink-soft/30 hover:border-pink-mid'
                }`}
              >
                All Items
              </button>
              {Object.values(Category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-7 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === cat 
                      ? 'bg-text-dark text-white shadow-xl scale-105' 
                      : 'bg-white text-text-mid border border-pink-soft/30 hover:border-pink-mid'
                  }`}
                >
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-pink-soft rounded-[3rem] overflow-hidden mb-6 relative shadow-sm group-hover:shadow-2xl group-hover:shadow-pink-mid/20 transition-all duration-500">
                    <img 
                      src={product.images[0] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                     <span className="absolute top-5 left-5 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-bold text-pink-deep shadow-sm">
                        {product.category.replace('-', ' ')}
                      </span>
                  </div>
                  <div className="px-2 text-center group-hover:-translate-y-1 transition-transform duration-300">
                    <h3 className="text-2xl font-serif font-semibold text-text-dark mb-1">{product.name}</h3>
                    <p className="text-pink-deep font-serif text-lg">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-40 bg-white/30 rounded-[4rem] border border-dashed border-pink-mid/30">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-8">🧶</motion.div>
              <h3 className="text-3xl font-serif text-text-dark font-medium mb-3">Fetching more yarn...</h3>
              <p className="text-text-mid italic">The stitches are in progress. Check back soon for new magic!</p>
            </div>
          )}
        </section>
      </main>

      {/* Integrated Footer */}
      <footer id="footer" className="bg-text-dark text-white pt-12">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
            <motion.div 
               animate={{ scale: [1, 1.1, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="mb-8"
            >
              <Heart className="mx-auto text-pink-mid" size={44} fill="#F4A7B9" />
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-serif font-semibold mb-8">Your Vision, <br /> <span className="italic text-pink-soft">Our Stitch.</span></h2>
            
            <p className="max-w-2xl mx-auto text-xl text-pink-soft/70 mb-14 leading-relaxed font-serif italic">
                "All items are fully customizable. Whether it's your favorite color or a brand new design idea, let's bring it to life with love."
            </p>
            
            <a 
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=Hi Stuti! I'd like to discuss a crochet order 🌸`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-[#25D366] text-white px-14 py-6 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all hover:scale-[1.05] active:scale-[0.98] group"
              >
                <svg className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d={whatsappIconPath} />
                </svg>
                WhatsApp Us
            </a>

            <div className="mt-32 pt-12 border-t border-white/10 flex flex-col items-center gap-10">
                <div className="flex items-center gap-4 cursor-pointer group" onDoubleClick={() => setIsAdminOpen(true)}>
                  <div className="w-10 h-10 bg-pink-deep/20 rounded-full flex items-center justify-center border border-pink-deep/30">
                    <Heart fill="#E07A98" size={16} />
                  </div>
                  <span className="font-serif text-3xl font-semibold tracking-tight">Stuti Art</span>
                </div>

                <div className="text-[10px] uppercase tracking-[0.4em] text-pink-soft/20 font-bold">
                    © 2026 Crochet Art by Stuti. Designed with Love 🤍
                </div>
            </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            settings={settings}
          />
        )}
      </AnimatePresence>

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
        products={localProducts}
        setProducts={setLocalProducts}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}


