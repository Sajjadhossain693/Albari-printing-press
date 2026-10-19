import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { ProductionJob } from '../types';
import {
  Cog,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ProductionPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatDate, formatNumber } = useLanguage();

  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);

  // Edit Job State
  const [stage, setStage] = useState('');
  const [quantityProduced, setQuantityProduced] = useState<string>('');
  const [quantityWasted, setQuantityWasted] = useState<string>('');
  const [machineNotes, setMachineNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const stagesList = [
    { key: 'ORDER_CONFIRMED', label: '১. অর্ডার নিশ্চিত' },
    { key: 'DESIGN_PREP', label: '২. ডিজাইন প্রস্তুতি' },
    { key: 'CUSTOMER_APPROVAL', label: '৩. গ্রাহক অনুমোদন' },
    { key: 'PREPRESS', label: '৪. প্রি-প্রেস প্লেট তৈরি' },
    { key: 'PRINTING', label: '৫. মেশিন প্রিন্টিং চলছে' },
    { key: 'FINISHING', label: '৬. ল্যামিনেশন ও কাটিং/বাইন্ডিং' },
    { key: 'QUALITY_CHECK', label: '৭. কোয়ালিটি চেক' },
    { key: 'READY_FOR_DELIVERY', label: '৮. ডেলিভারির জন্য প্রস্তুত' },
    { key: 'DELIVERED', label: '৯. ডেলিভারি সম্পন্ন' }
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ jobs: ProductionJob[] }>('/production');
      setJobs(res.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEditClick = (job: ProductionJob) => {
    setSelectedJob(job);
    setStage(job.stage);
    setQuantityProduced(String(job.quantityProduced));
    setQuantityWasted(String(job.quantityWasted));
    setMachineNotes(job.machineNotes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setUpdating(true);
    try {
      await apiRequest(`/production/${selectedJob.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          stage,
          quantityProduced: parseFloat(quantityProduced) || 0,
          quantityWasted: parseFloat(quantityWasted) || 0,
          machineNotes
        })
      });

      setSelectedJob(null);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Cog className="w-6 h-6 text-blue-600 animate-spin-slow" />
            <span>{t('nav.production')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            প্রেস মেশিন ও প্রি-প্রেস পর্যায়ভিত্তিক কাজের ট্র্যাকিং ও অপচয় হিসাব
          </p>
        </div>
      </div>

      {/* Production Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            লোড হচ্ছে...
          </div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            কোন সক্রিয় প্রোডাকশন জব পাওয়া যায়নি
          </div>
        ) : (
          jobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {job.jobCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {stagesList.find(s => s.key === job.stage)?.label || job.stage}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {job.order?.orderNumber} - {job.order?.customer?.fullName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {job.order?.items?.[0]?.productNameBn || job.order?.items?.[0]?.productName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">অর্ডার</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {formatNumber(job.quantityOrdered)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600">উৎপাদিত</div>
                    <div className="font-bold text-emerald-600">
                      {formatNumber(job.quantityProduced)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-500">অপচয়/বাতিল</div>
                    <div className="font-bold text-rose-600">
                      {formatNumber(job.quantityWasted)}
                    </div>
                  </div>
                </div>

                {job.machineNotes && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
                    "{job.machineNotes}"
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  অপারেটর: {job.assignedStaff?.fullName || 'রহিম মিয়া'}
                </span>
                <button
                  onClick={() => handleEditClick(job)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  স্টেজ আপডেট
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Job Stage Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{selectedJob.jobCode} - প্রোডাকশন স্টেজ</h3>
                <p className="text-xs text-slate-500">{selectedJob.order?.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1 rounded text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">উৎপাদন পর্যায় / স্টেজ *</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  {stagesList.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">উৎপাদিত পরিমাণ</label>
                  <input
                    type="number"
                    min="0"
                    value={quantityProduced}
                    onChange={(e) => setQuantityProduced(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">অপচয় / নষ্ট শিট</label>
                  <input
                    type="number"
                    min="0"
                    value={quantityWasted}
                    onChange={(e) => setQuantityWasted(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">মেশিন ও কাজের নোট</label>
                <textarea
                  rows={2}
                  value={machineNotes}
                  onChange={(e) => setMachineNotes(e.target.value)}
                  placeholder="যেমন: প্লেট রেডি, অফসেট মেশিন ২ এ কাজ চলছে..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
