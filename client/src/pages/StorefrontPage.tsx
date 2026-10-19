import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Product } from '../types';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  ShoppingBag,
  Compass,
  ArrowRight
} from 'lucide-react';

export const StorefrontPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [productName, setProductName] = useState('স্মার্ট বিজনেস ভিজিটিং কার্ড');
  const [quantity, setQuantity] = useState('1000');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderTrackingCode, setOrderTrackingCode] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ products: Product[] }>('/products?activeOnly=true')
      .then(res => setProducts(res.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOrderRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest('/public/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerNotes: notes,
          items: [
            {
              productName,
              quantity: parseFloat(quantity) || 1,
              unit: 'PIECE',
              unitPrice: 1.2
            }
          ]
        })
      });

      if (res.success && res.order) {
        setSubmitted(true);
        setOrderTrackingCode(res.order.orderNumber);
      }
    } catch (err: any) {
      alert(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-12 font-bangla">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/assets/shop-signboard-banner.jpg"
            alt="Al-Bari Press Shop Signboard"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative p-6 sm:p-12 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-sm text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>মাইজদী, নোয়াখালীর নির্ভরযোগ্য ছাপাখানা</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            ছাপাখানা আল-বারী প্রেস <br />
            <span className="text-amber-400 font-extrabold">& ডিজিটাল সাইন</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            কম্পিউটার গ্রাফিক্স ডিজাইন, ভিজিটিং কার্ড, ক্যাশ মেমো, ওয়াজ মাহফিলের পোস্টার, পিভিসি ডিজিটাল সাইন ব্যানার, প্রেসক্রিপশন ফাইল ফোল্ডার, রাবার সিল ও সম্মাননা ক্রেস্ট তৈরির বিশ্বস্ত প্রতিষ্ঠান।
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="#quote-section"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <span>অনলাইনে অর্ডার করুন</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/track"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-xs border border-white/20 transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>অর্ডারের অবস্থা ট্র্যাক করুন</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Press Services & Actual Photos Showcase */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            আমাদের সেবা ও প্রস্তুতকৃত পণ্যসমূহ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            উচ্চমানের অফসেট প্রিন্টিং ও জাপানিজ কালির নিখুঁত ডিজিটাল সাইন
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(p => (
            <div
              key={p.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition group"
            >
              <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={p.imageUrl || '/assets/digital-print-machine.jpg'}
                  alt={p.nameBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {p.nameBn}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {p.descriptionBn || p.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(p.basePrice)} <span className="text-[10px] text-slate-400 font-normal">/ {p.unitBn}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {p.leadTimeDays} দিন ডেলিভারি
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Request / Quotation Form */}
      <div id="quote-section" className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              অনলাইনে প্রিন্টিং কাজের অর্ডার বা কোটেশন পাঠান
            </h2>
            <p className="text-xs text-slate-500">
              আপনার তথ্য জমা দিন, আমাদের টিম আপনার সাথে যোগাযোগ করে কাজ শুরু করবে
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                আপনার অর্ডার রিকোয়েস্ট সফলভাবে জমা হয়েছে!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                আপনার অর্ডার রেফারেন্স নং: <span className="font-mono font-bold text-slate-900 dark:text-white">{orderTrackingCode}</span>
              </p>
              <Link
                to={`/track?orderNumber=${orderTrackingCode}&phone=${phone}`}
                className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                অর্ডারের বর্তমান অবস্থা ট্র্যাক করুন
              </Link>
            </div>
          ) : (
            <form onSubmit={handleOrderRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">পণ্যের ধরন</label>
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="স্মার্ট বিজনেস ভিজিটিং কার্ড">স্মার্ট বিজনেস ভিজিটিং কার্ড</option>
                    <option value="ডাঃ ফাইল ও প্রেসক্রিপশন ফোল্ডার">ডাঃ ফাইল ও প্রেসক্রিপশন ফোল্ডার</option>
                    <option value="ক্যাশ মেমো ও ভাউচার বই">ক্যাশ মেমো ও ভাউচার বই</option>
                    <option value="ওয়াজ মাহফিল ও ধর্মীয় কনফারেন্স পোস্টার">ওয়াজ মাহফিল পোস্টার</option>
                    <option value="ডিজিটাল পিভিসি ও প্যানাফ্লেক্স ব্যানার">ডিজিটাল সাইন ব্যানার</option>
                    <option value="উডেন ও গোল্ডেন মেটালিক ক্রেস্ট">সম্মাননা ক্রেস্ট</option>
                    <option value="ফ্ল্যাশ ও অটোমেটিক রাবার সীল">অটোমেটিক সীল ও স্ট্যাম্প</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">পরিমাণ (সংখ্যা / কপি)</label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="যেমন: ১০০০"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">কাজের বিবরণ বা সাইজের নির্দেশনা</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="আপনার কাঙ্ক্ষিত ডিজাইন, সাইজ ও ডেলিভারি সম্পর্কে লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'সাবমিট হচ্ছে...' : 'অর্ডার রিকোয়েস্ট পাঠান'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Press Contact & Address Footer */}
      <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-base text-slate-900 dark:text-white">
            ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>০১৬১৮-১৮২৩৬৫</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-rose-600" />
            <span>albariprintingpress@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
