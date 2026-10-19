import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Payment } from '../types';
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLanguage();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (methodFilter !== 'ALL') query.append('method', methodFilter);

      const res = await apiRequest<{ payments: Payment[] }>(`/payments?${query.toString()}`);
      setPayments(res.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>{t('nav.payments')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ক্যাশ কাউন্টার, বিকাশ ও নগদ লেনদেনের সম্পূর্ণ আর্থিক লেজার
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600 text-white">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
              মোট আদায়কৃত টাকা
            </div>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">
              {formatCurrency(totalCollected)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">পেমেন্ট মেথড:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="ALL">সকল মাধ্যম</option>
            <option value="CASH">ক্যাশ (Cash)</option>
            <option value="BKASH">বিকাশ (bKash)</option>
            <option value="NAGAD">নগদ (Nagad)</option>
            <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">রসিদ নং</th>
                <th className="py-3 px-4 text-left font-semibold">অর্ডার নং</th>
                <th className="py-3 px-4 text-left font-semibold">গ্রাহকের নাম ও ফোন</th>
                <th className="py-3 px-4 text-left font-semibold">তারিখ</th>
                <th className="py-3 px-4 text-left font-semibold">মাধ্যম</th>
                <th className="py-3 px-4 text-left font-semibold">রেফারেন্স / TrxID</th>
                <th className="py-3 px-4 text-left font-semibold">গ্রহণকারী</th>
                <th className="py-3 px-4 text-right font-semibold">জমা টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    কোন পেমেন্ট লেনদেন পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {p.receiptNumber || p.paymentNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {p.order?.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.customer?.fullName}</div>
                      <div className="text-[11px] text-slate-500">{p.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {p.referenceNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {p.receivedBy?.fullName || 'ক্যাশিয়ার'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
