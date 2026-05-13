import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Edit2, Lock, Save, Download, FileJson } from 'lucide-react';
import { Product, Category, Settings } from '../types';
import { uploadToCloudinary } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  setProducts,
  settings,
  setSettings,
}: AdminPanelProps) {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'settings'>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCat, setFormCat] = useState<Category>(Category.NEWLY_LAUNCHED);
  const [formSize, setFormSize] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [pendingImages, setPendingImages] = useState<(File | string)[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = () => {
    if (password === settings.adminPassword) {
      setIsAdminAuthed(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormCat(Category.NEWLY_LAUNCHED);
    setFormSize('');
    setFormDesc('');
    setPendingImages([]);
    setPreviewImages([]);
    setEditingProduct(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.slice(0, 5 - pendingImages.length);
      
      setPendingImages([...pendingImages, ...newFiles]);
      
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviewImages(prev => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePendingImage = (idx: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== idx));
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const saveProduct = async () => {
    if (!formName || !formPrice) return;
    setLoading(true);
    try {
      let finalImages: string[] = [];
      
      if (pendingImages.length > 0) {
        finalImages = await Promise.all(
          pendingImages.map(async (item) => {
            if (typeof item === 'string' && item.startsWith('http')) return item;
            
            // Convert File to base64 for backend
            let payload = item;
            if (item instanceof File) {
               payload = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(item);
              });
            }
            
            return await uploadToCloudinary(payload as string, settings.adminPassword);
          })
        );
      }

      const productData: Product = {
        id: editingProduct ? editingProduct.id : Date.now().toString(),
        name: formName,
        price: parseFloat(formPrice),
        category: formCat,
        description: formDesc,
        size: formSize,
        images: finalImages,
        createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
      };

      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? productData : p));
      } else {
        setProducts([productData, ...products]);
      }
      
      resetForm();
      setActiveTab('manage');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };


  const editProduct = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(p.price.toString());
    setFormCat(p.category);
    setFormSize(p.size);
    setFormDesc(p.description);
    setPreviewImages(p.images);
    setPendingImages(p.images);
    setActiveTab('add');
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const syncWithGitHub = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/sync-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          products, 
          password: settings.adminPassword 
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'GitHub sync failed');
      }

      alert('Successfully synced with GitHub! Your website will update in a minute. 🌸');
    } catch (err: any) {
      setError(err.message || 'Failed to sync with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = JSON.stringify({ products, settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crochet_catalogue_backup.json';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
      >
        {!isAdminAuthed ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-pink-soft rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-pink-deep" size={24} />
            </div>
            <h2 className="text-3xl font-serif font-semibold text-text-dark mb-2">Owner Login</h2>
            <p className="text-text-mid mb-8">Enter your admin password to manage your catalogue</p>
            
            <div className="max-w-xs mx-auto">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Admin Password"
                className="w-full bg-cream border border-pink-soft rounded-2xl px-6 py-4 text-center focus:outline-none focus:border-pink-mid mb-4"
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button 
                onClick={handleAuth}
                className="w-full bg-text-dark text-white rounded-2xl py-4 font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter Admin Panel
              </button>
            </div>
            <button 
              onClick={onClose}
              className="mt-8 text-text-mid text-sm hover:underline"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[80vh]">
            <div className="p-6 border-b border-pink-soft flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold text-text-dark">Admin Panel</h2>
              <button onClick={onClose} className="p-2 hover:bg-cream rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex p-2 gap-2 bg-cream m-4 rounded-2xl">
              {(['add', 'manage', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-text-dark shadow-sm' 
                      : 'text-text-mid hover:bg-white/50'
                  }`}
                >
                  {tab === 'add' ? (editingProduct ? 'Edit Product' : 'Add Product') : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-0">
              {activeTab === 'add' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Product Name</label>
                      <input 
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Pastel Bow Scrunchie"
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Price (₹)</label>
                      <input 
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Category</label>
                      <select 
                        value={formCat}
                        onChange={(e) => setFormCat(e.target.value as Category)}
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat.replace('-', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Size / Dimensions</label>
                      <input 
                        value={formSize}
                        onChange={(e) => setFormSize(e.target.value)}
                        placeholder="e.g. 10cm or One size"
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Description</label>
                    <textarea 
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={3}
                      placeholder="Tell customers about the materials, texture, etc."
                      className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Images (max 5)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-pink-mid rounded-2xl p-8 text-center cursor-pointer hover:bg-pink-soft/20 transition-colors"
                    >
                      <Upload className="mx-auto text-pink-mid mb-2" size={32} />
                      <p className="text-sm text-text-mid">Click to upload or drag & drop</p>
                    </div>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-4 mt-4">
                      {previewImages.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-pink-soft shadow-sm group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removePendingImage(i)}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {editingProduct && (
                      <button 
                        onClick={resetForm}
                        className="flex-1 border border-pink-soft text-text-mid py-4 rounded-2xl font-medium"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button 
                      disabled={loading || !formName || !formPrice}
                      onClick={saveProduct}
                      className="flex-[2] bg-text-dark text-white py-4 rounded-2xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Saving...' : (
                        <>
                          <Save size={18} />
                          {editingProduct ? 'Update Product' : 'Save Product'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'manage' && (
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-12 text-text-mid">No products in your catalogue yet.</div>
                  ) : (
                    products.map(p => (
                      <div key={p.id} className="flex items-center gap-4 bg-cream p-4 rounded-2xl border border-pink-soft">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-pink-soft shrink-0">
                          {p.images[0] && <img src={p.images[0]} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-dark truncate">{p.name}</h4>
                          <p className="text-xs text-text-mid">₹{p.price} • {p.category.replace('-', ' ')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(p)} className="p-2 hover:bg-white rounded-full text-text-mid transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-text-dark flex items-center gap-2">
                      <Save size={18} /> Admin Settings
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">WhatsApp Number (with country code)</label>
                      <input 
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-pink-deep uppercase tracking-wider">Admin Password</label>
                      <input 
                        type="password"
                        value={settings.adminPassword}
                        onChange={(e) => setSettings({...settings, adminPassword: e.target.value})}
                        placeholder="New Password"
                        className="w-full bg-cream border border-pink-soft rounded-xl px-4 py-3 focus:outline-none focus:border-pink-mid"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-pink-soft">
                    <h3 className="text-lg font-medium text-text-dark flex items-center gap-2">
                      <Download size={18} /> Backup & Restore
                    </h3>
                    <div className="bg-cream p-4 rounded-xl text-xs text-text-mid mb-4">
                      Download your products as JSON. Replace <code>public/products.json</code> in your code to update the catalogue for everyone.
                    </div>
                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={syncWithGitHub}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-text-dark text-white py-4 rounded-2xl font-medium hover:bg-pink-deep transition-all disabled:opacity-50"
                      >
                        {loading ? 'Syncing...' : '🚀 Push Changes to Live Website (GitHub)'}
                      </button>
                      <button 
                        onClick={exportData}
                        className="flex-1 flex items-center justify-center gap-2 border border-pink-soft text-text-mid py-3 rounded-2xl hover:bg-cream transition-colors"
                      >
                        <FileJson size={18} /> Download products.json Backup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
