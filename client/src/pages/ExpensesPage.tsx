import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { ExpenseModal } from '../components/ExpenseModal';
import { Expense } from '../types';
import {
  Receipt,
  Plus,
  Filter,
  Trash2,
  DollarSign
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLanguage();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (categoryFilter !== 'ALL') query.append('category', categoryFilter);

      const res = await apiRequest<{ expenses: Expense[]; totalAmount: number }>(`/expenses?${query.toString()}`);
      setExpenses(res.expenses || []);
      setTotalAmount(res.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই খরচটি মুছে ফেলতে চান?')) return;
    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            <span>{t('nav.expenses')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কাগজ, কালি, বিদ্যুৎ, স্টাফ বেতন ও প্রেস রক্ষণাবেক্ষণ খরচ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">
                মোট খরচ
              </div>
              <div className="text-xl font-black text-rose-900 dark:text-rose-200">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>খরচ যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">ব্যয়ের খাত:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="ALL">সকল খাত</option>
            <option value="PAPER_RAW_MATERIALS">কাগজ ও কাঁচামাল</option>
            <option value="INK_TONER">কালি ও টোনার</option>
            <option value="PRINTING_PRODUCTION">উৎপাদন খরচ</option>
            <option value="ELECTRICITY">বিদ্যুৎ বিল</option>
            <option value="MACHINE_MAINTENANCE">মেশিন মেরামত</option>
            <option value="STAFF_SALARY">স্টাফ বেতন</option>
            <option value="RENT">ভাড়া</option>
            <option value="OTHER">অন্যান্য</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">খরচ কোড</th>
                <th className="py-3 px-4 text-left font-semibold">তারিখ</th>
                <th className="py-3 px-4 text-left font-semibold">খাত / বিবরণ</th>
                <th className="py-3 px-4 text-left font-semibold">ভেন্ডর / দোকান</th>
                <th className="py-3 px-4 text-left font-semibold">মাধ্যম</th>
                <th className="py-3 px-4 text-left font-semibold">এন্ট্রি করেছেন</th>
                <th className="py-3 px-4 text-right font-semibold">টাকার পরিমাণ</th>
                <th className="py-3 px-4 text-center font-semibold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    কোন খরচ এন্ট্রি পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {t(`expenseCategories.${exp.category}`) || exp.category}
                      </div>
                      <div className="text-[11px] text-slate-500">{exp.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {exp.vendor || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {exp.createdBy?.fullName || 'এডমিন'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
};
