import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { DesignAsset } from '../types';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

export const DesignLibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatDate } = useLanguage();

  const [designs, setDesigns] = useState<DesignAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [previewDesign, setPreviewDesign] = useState<DesignAsset | null>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (categoryFilter !== 'ALL') query.append('category', categoryFilter);

      const res = await apiRequest<{ designs: DesignAsset[] }>(`/designs?${query.toString()}`);
      setDesigns(res.designs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDesigns();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <span>{t('nav.designLibrary')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ছাপাখানার অনুমোদিত সকল আর্টওয়ার্ক, লোগো, পোস্টার, ব্যানার ও ক্রেস্ট ডিজাইন গ্যালারি
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ডিজাইন নাম বা কোড দিয়ে খুঁজুন..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">ক্যাটাগরি:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            <option value="Poster">পোস্টার (Poster)</option>
            <option value="Banner">ব্যানার (Banner)</option>
            <option value="Crest">ক্রেস্ট ও সম্মাননা (Crest)</option>
            <option value="Visiting Card">ভিজিটিং কার্ড</option>
            <option value="Logo">লোগো ডিজাইন</option>
          </select>
        </div>
      </div>

      {/* Design Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            লোড হচ্ছে...
          </div>
        ) : designs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            কোন ডিজাইন পাওয়া যায়নি
          </div>
        ) : (
          designs.map(design => (
            <div
              key={design.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition group"
            >
              <div>
                <div
                  onClick={() => setPreviewDesign(design)}
                  className="h-56 bg-slate-950 cursor-pointer overflow-hidden relative flex items-center justify-center p-2"
                >
                  <img
                    src={design.artworkUrl}
                    alt={design.title}
                    className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono">
                    {design.designCode}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {design.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {design.titleBn || design.title}
                  </h3>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {design.category}
                  </div>
                  {design.customer && (
                    <div className="text-[11px] text-slate-500">
                      ক্লায়েন্ট: {design.customer.fullName}
                    </div>
                  )}
                  {design.prompt && (
                    <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {design.prompt}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {formatDate(design.createdAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDesign(design)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
                    title="প্রিভিউ দেখুন"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={design.artworkUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 transition"
                    title="ডাউনলোড"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 my-auto overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{previewDesign.titleBn || previewDesign.title}</h3>
                <p className="text-xs text-slate-400 font-mono">{previewDesign.designCode} • {previewDesign.category}</p>
              </div>
              <button
                onClick={() => setPreviewDesign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-black rounded-xl flex items-center justify-center max-h-[500px]">
              <img
                src={previewDesign.artworkUrl}
                alt={previewDesign.title}
                className="max-h-[460px] max-w-full object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="text-slate-400">
                সাইজ: {previewDesign.dimensions || 'A4'} • রেজ্যুলেশন: {previewDesign.resolution || '300 DPI'}
              </div>
              <a
                href={previewDesign.artworkUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>হাই-রেজ্যুলেশন ফাইল ডাউনলোড</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
