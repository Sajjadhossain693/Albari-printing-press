import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Receipt,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const [timeRange, setTimeRange] = useState('thisMonth');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/reports/dashboard?timeRange=${timeRange}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const stats = data?.stats || {};
  const monthlyChart = data?.monthlyChart || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>{t('nav.reports')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            প্রেসের লাভ-ক্ষতি, নগদ প্রবাহ, আদায় এবং বিক্রয়ের সামগ্রিক আর্থিক বিবরণী
          </p>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs">
          {[
            { id: 'thisMonth', label: t('dashboard.filterThisMonth') },
            { id: 'lastMonth', label: t('dashboard.filterLastMonth') },
            { id: 'all', label: t('dashboard.filterAll') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3 py-1.5 rounded transition ${
                timeRange === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accounting Method Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
        <span className="font-bold">হিসাবরক্ষণ পদ্ধতি (Cash & Accrual Distinction): </span>
        এই প্রতিবেদনে মোট অর্ডারের বিলকৃত মূল্য (Revenue), প্রকৃতপক্ষে আদায়কৃত নগদ টাকা (Cash Collected), গ্রাহকদের কাছে বকেয়া (Receivables) এবং প্রেসের পরিচালন ব্যয় (Expenses) আলাদাভাবে প্রদর্শন করা হয়েছে।
      </div>

      {/* Summary Financial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">মোট বিক্রয় (Order Value)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(stats.totalSales || 0)}
          </div>
          <span className="text-[11px] text-slate-400">অর্ডারের মোট ধার্যকৃত মূল্য</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-emerald-600">আদায়কৃত ক্যাশ (Cash Collected)</span>
          <div className="text-2xl font-black text-emerald-600">
            {formatCurrency(stats.totalPaymentsReceived || 0)}
          </div>
          <span className="text-[11px] text-slate-400">ক্যাশ কাউন্টার ও ডিজিটাল পেমেন্ট</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-rose-600">মোট ব্যয় (Total Expenses)</span>
          <div className="text-2xl font-black text-rose-600">
            {formatCurrency(stats.totalExpenses || 0)}
          </div>
          <span className="text-[11px] text-slate-400">কাগজ, কালি, বিদ্যুৎ ও বেতন</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-indigo-600">আনুমানিক মোট লাভ (Gross Profit)</span>
          <div className="text-2xl font-black text-indigo-600">
            {formatCurrency(stats.estimatedGrossProfit || 0)}
          </div>
          <span className="text-[11px] text-slate-400">বিক্রয় বিয়োগ পরিচালন ব্যয়</span>
        </div>
      </div>

      {/* Financial Comparison Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          {t('dashboard.revenueVsExpenseChart')}
        </h3>
        <p className="text-xs text-slate-500 mb-6">মাসিক বিক্রয় ও খরচের তুলনামূলক গ্রাফ</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChart}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                formatter={(val: any) => [`৳${val.toLocaleString()}`, 'পরিমাণ']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }}
              />
              <Legend />
              <Bar dataKey="sales" name="বিক্রয় (Sales)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="ব্যয় (Expenses)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
