import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Product, ProductCategory } from '../types';
import {
  Layers,
  Search,
  Plus,
  Clock,
  Tag,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [unit, setUnit] = useState('PIECE');
  const [unitBn, setUnitBn] = useState('টি');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [materialBn, setMaterialBn] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState('3');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory !== 'ALL') query.append('category', selectedCategory);

      const [prodRes, catRes] = await Promise.all([
        apiRequest<{ products: Product[] }>(`/products?${query.toString()}`),
        apiRequest<{ categories: ProductCategory[] }>('/categories')
      ]);

      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      if (!categoryId && catRes.categories?.length > 0) {
        setCategoryId(catRes.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          nameBn,
          categoryId,
          basePrice: parseFloat(basePrice) || 0,
          unit,
          unitBn,
          descriptionBn,
          materialBn,
          leadTimeDays: parseInt(leadTimeDays, 10) || 3,
          imageUrl: imageUrl || undefined
        })
      });

      setIsAddModalOpen(false);
      // Reset form
      setName('');
      setNameBn('');
      setBasePrice('');
      setDescriptionBn('');
      setMaterialBn('');
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'পণ্য যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('products.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('products.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t('products.addNew')}</span>
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="পণ্যের নাম বা বিবরণ..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            সব ক্যাটাগরি
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.nameBn}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            লোড হচ্ছে...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            কোন পণ্য পাওয়া যায়নি
          </div>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Product Image */}
                <div className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img
                    src={product.imageUrl || '/assets/digital-print-machine.jpg'}
                    alt={product.nameBn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold">
                    {product.category?.nameBn || 'ছাপাখানা'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {product.nameBn}
                  </h3>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {product.descriptionBn || product.description}
                  </div>

                  {product.materialBn && (
                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-slate-400">মেটেরিয়াল: </span>{product.materialBn}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Lead Time Footer */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">মূল্য</div>
                  <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(product.basePrice)} <span className="text-[10px] font-normal text-slate-500">/ {product.unitBn}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{product.leadTimeDays} দিন</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{t('products.addNew')}</h3>
                  <p className="text-xs text-slate-500">নতুন প্রিন্টিং আইটেম ও দর নির্ধারণ</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="যেমন: স্মার্ট ভিজিটিং কার্ড"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">পণ্যের নাম (English) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Visiting Card"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ক্যাটাগরি *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">মূল্য (৳) ও একক *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="দর"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    />
                    <input
                      type="text"
                      value={unitBn}
                      onChange={(e) => setUnitBn(e.target.value)}
                      placeholder="টি"
                      className="w-20 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">কাগজ / মেটেরিয়াল স্পেসিফিকেশন</label>
                <input
                  type="text"
                  value={materialBn}
                  onChange={(e) => setMaterialBn(e.target.value)}
                  placeholder="যেমন: ৩০০ জিএসএম আর্ট কার্ড, ম্যাট ল্যামিনেশন"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ফটো / রেফারেন্স ইমেজ পাথ</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/assets/visiting-card-promo.jpg"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={descriptionBn}
                  onChange={(e) => setDescriptionBn(e.target.value)}
                  placeholder="পণ্য সম্পর্কে বিস্তারিত তথ্য..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? t('app.loading') : 'পণ্য যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
