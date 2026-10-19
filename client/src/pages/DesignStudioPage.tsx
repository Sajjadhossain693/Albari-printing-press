import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../services/api';
import {
  Sparkles,
  Download,
  Save,
  RotateCcw,
  Palette,
  Maximize2,
  Sliders,
  CheckCircle2,
  FileImage,
  Upload,
  AlertCircle
} from 'lucide-react';

export const DesignStudioPage: React.FC = () => {
  const { t } = useTranslation();

  const [prompt, setPrompt] = useState(
    'একটি আধুনিক স্কুলের ক্রেস্ট ডিজাইন করো। নীল ও সোনালি রং ব্যবহার করবে। মাঝখানে খোলা বই, উপরে স্কুলের নাম এবং নিচে প্রতিষ্ঠার সাল থাকবে। ডিজাইনটি পরিষ্কার, ভারসাম্যপূর্ণ এবং প্রিন্টিংয়ের উপযোগী হবে।'
  );
  const [category, setCategory] = useState('School or College Crest');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:5' | '9:16'>('1:1');
  const [colorPalette, setColorPalette] = useState('নীল ও উজ্জ্বল সোনালি (Navy & Gold)');
  const [style, setStyle] = useState('Modern Vector / Metallic Foil');
  const [revisionPrompt, setRevisionPrompt] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>({
    imageUrl: '/assets/crest-award-promo.jpg',
    promptUsed: 'Official Al-Bari Press Honorary School Crest Template',
    provider: 'local-press-engine'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'School or College Crest',
    'Logo',
    'Poster',
    'Banner',
    'Visiting Card',
    'Cash Memo & Pad',
    'Doctor File',
    'Seal & Stamp',
    'Restaurant Menu',
    'Certificate',
    'Custom Artwork'
  ];

  const presetPrompts: Record<string, string> = {
    'School or College Crest':
      'একটি আধুনিক স্কুলের ক্রেস্ট ডিজাইন করো। নীল ও সোনালি রং ব্যবহার করবে। মাঝখানে খোলা বই, উপরে স্কুলের নাম এবং নিচে প্রতিষ্ঠার সাল থাকবে। ডিজাইনটি পরিষ্কার, ভারসাম্যপূর্ণ এবং প্রিন্টিংয়ের উপযোগী হবে।',
    'Poster':
      'বার্ষিক নূরানী ওয়াজ মাহফিলের আকর্ষণীয় ৪-রঙা পোস্টার। গাঢ় সবুজ ও মেরুন রঙের কাজ, উপরে ইসলামিক আরবী ক্যালিগ্রাফি এবং সুসজ্জিত বক্তা তালিকা।',
    'Visiting Card':
      'ম্যানেজিং ডিরেক্টরের জন্য মিনিমালিস্ট লাক্সারি ভিজিটিং কার্ড। ম্যাট ব্ল্যাক ব্যাকগ্রাউন্ডে গোল্ডেন ফয়েল টেক্সট ও এমবসড কিউআর কোড।',
    'Doctor File':
      'মেডিকেল প্রেসক্রিপশন ফাইল ফোল্ডার, সাদা ও হালকা নীল ব্যাকগ্রাউন্ড, স্টেথোস্কোপ আইকন, ডাক্তারের নাম ও চেম্বার শিডিউল লেআউট।',
    'Banner':
      'পবিত্র ঈদ-উল-ফিতরের শুভেচ্ছা ডিজিটাল সাইন ব্যানার। লণ্ঠন, ঈদের চাঁদ ও আনন্দমুখর উৎসবের গ্রাফিক্সসহ হাই রেজ্যুলেশন প্রিন্ট উপযোগী।',
    'Seal & Stamp':
      'সার্কুলার অফিশিয়াল রাবার স্ট্যাম্প সিল, মাঝে মনোগ্রাম ও চারদিকে প্রতিষ্ঠানের নাম ও নোয়াখালী লেখা।'
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (presetPrompts[newCat]) {
      setPrompt(presetPrompts[newCat]);
    }
  };

  const handleGenerate = async (isRevision = false) => {
    setGenerating(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await apiRequest('/designs/ai-generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          category,
          aspectRatio,
          colorPalette,
          style,
          revisionPrompt: isRevision ? revisionPrompt : undefined
        })
      });

      if (res.success && res.data) {
        setGeneratedResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'ডিজাইন তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedResult?.imageUrl) return;
    try {
      await apiRequest('/designs', {
        method: 'POST',
        body: JSON.stringify({
          title: `${category} - AI Design`,
          titleBn: `${category} ডিজাইন`,
          category,
          prompt,
          artworkUrl: generatedResult.imageUrl,
          dimensions: aspectRatio === '1:1' ? '1024x1024' : 'A4',
          colorMode: 'CMYK',
          resolution: '300 DPI'
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span>{t('designStudio.title')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('designStudio.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompt & Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('designStudio.categoryLabel')}
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('designStudio.promptLabel')}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('designStudio.promptPlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:bg-white transition leading-relaxed font-bangla"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t('designStudio.aspectRatio')}
              </label>
              <select
                value={aspectRatio}
                onChange={(e: any) => setAspectRatio(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="1:1">১:১ (Square 1024x1024)</option>
                <option value="4:5">৪:৫ (Poster A4 Vertical)</option>
                <option value="16:9">১৬:৯ (Banner Horizontal)</option>
                <option value="9:16">৯:১৬ (Story / Standee)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {t('designStudio.styleLabel')}
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="Modern Vector / Metallic Foil">মর্ডান ভেক্টর ও মেটালিক ফয়েল</option>
                <option value="Traditional Islamic Dome Architecture">ইসলামিক ক্যালিগ্রাফি ও ডোম আর্চ</option>
                <option value="Minimal Clean Typography">মিনিমাল ক্লিন টাইপোগ্রাফি</option>
                <option value="Premium 3D Crest Shield Wood Base">থ্রিডি কাঠের বেস প্রিমিয়াম ক্রেস্ট</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t('designStudio.colorPalette')}
            </label>
            <input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              placeholder="যেমন: নীল ও গোল্ডেন, গাঢ় লাল ও সাদা"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <button
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{generating ? t('designStudio.generating') : t('designStudio.generateBtn')}</span>
          </button>

          {/* Revision Box */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('designStudio.revisionsTitle')}
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={revisionPrompt}
                onChange={(e) => setRevisionPrompt(e.target.value)}
                placeholder={t('designStudio.revisionPlaceholder')}
                className="flex-1 text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                onClick={() => handleGenerate(true)}
                disabled={generating || !revisionPrompt}
                className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition disabled:opacity-50 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>প্রয়োগ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Output Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('designStudio.previewTitle')}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                প্রোভাইডার: {generatedResult?.provider || 'Al-Bari Engine'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition"
              >
                <Save className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('designStudio.saveToLibrary')}</span>
              </button>

              <a
                href={generatedResult?.imageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('designStudio.downloadArtwork')}</span>
              </a>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-xs text-emerald-700 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>ডিজাইনটি সফলভাবে লাইব্রেরিতে সংরক্ষণ করা হয়েছে!</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Artwork Display Area */}
          <div className="p-4 rounded-xl bg-slate-950 flex items-center justify-center min-h-[420px] overflow-hidden border border-slate-800 relative group">
            {generating ? (
              <div className="text-center text-white space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-spin" />
                <p className="text-xs font-semibold">{t('designStudio.generating')}</p>
                <p className="text-[11px] text-slate-400">এআই ভেক্টর মডেল প্রসেসিং চলছে...</p>
              </div>
            ) : (
              <div className="relative max-w-full max-h-[500px]">
                <img
                  src={generatedResult?.imageUrl}
                  alt="Generated Artwork"
                  className="max-h-[480px] w-auto object-contain rounded-lg shadow-2xl transition group-hover:scale-[1.01]"
                />
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="font-semibold text-slate-700 dark:text-slate-300">প্রম্পট বিস্তারিত:</div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              {generatedResult?.promptUsed || prompt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
