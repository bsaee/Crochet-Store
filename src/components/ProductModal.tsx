import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { Product, Settings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  settings: Settings;
}

export default function ProductModal({ product, onClose, settings }: ProductModalProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  if (!product) return null;

  const nextImg = () => {
    setCurrentImgIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImg = () => {
    setCurrentImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const whatsappMsg = encodeURIComponent(
    `Hi Stuti! I'm interested in "${product.name}" (₹${product.price}) from your catalogue. 🌸`
  );
  
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${whatsappMsg}`;
  
  const whatsappIconPath = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full transition-colors text-text-dark shadow-sm"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 h-[400px] md:h-[600px] bg-pink-soft relative overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImgIdx}
                src={product.images[currentImgIdx] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80'} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {product.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentImgIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentImgIdx === i ? 'w-8 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="flex-1">
              <span className="inline-block px-4 py-1.5 bg-lilac-soft text-lilac-deep text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full mb-6">
                {product.category.replace('-', ' ')}
              </span>
              
              <h2 className="text-4xl font-serif font-semibold text-text-dark leading-tight mb-2">
                {product.name}
              </h2>
              
              <p className="text-2xl font-serif text-pink-deep mb-8">
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              <div className="space-y-6 mb-10">
                {product.size && (
                  <div className="flex items-center gap-4 py-3 border-y border-pink-soft/30">
                    <span className="text-[11px] uppercase tracking-widest text-text-mid font-semibold">Size</span>
                    <span className="text-sm text-text-dark">{product.size}</span>
                  </div>
                )}
                
                <div>
                  <h3 className="text-[11px] uppercase tracking-widest text-text-mid font-semibold mb-3">Description</h3>
                  <p className="text-text-mid leading-relaxed text-sm lg:text-base">
                    {product.description || "Every stitch is handcrafted with care, making each piece unique. This item combines texture and style to bring warmth to your collection."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-[1.25rem] font-semibold text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200 group"
              >
                <svg className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d={whatsappIconPath} />
                </svg>
                Inquire on WhatsApp
              </a>
              <p className="text-center text-[10px] text-text-mid italic">
                🌸 Remeber: All items are customizable in size & color.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
