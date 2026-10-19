import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../services/api';
import { X, Receipt, CheckCircle2 } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();

  const [category, setCategory] = useState<string>('PAPER_RAW_MATERIALS');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [vendor, setVendor] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক খরচের পরিমাণ লিখুন');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          category,
          amount: numAmount,
          paymentMethod,
          vendor: vendor || undefined,
          description
        })
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'ব্যয় হিসাব সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-600 text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">নতুন খরচ অন্তর্ভুক্তি</h3>
              <p className="text-xs text-slate-500">ছাপাখানার দৈনিক ও মাসিক পরিচালন ব্যয়</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">ব্যয়ের খাত / ক্যাটাগরি *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="PAPER_RAW_MATERIALS">কাগজ ও কাঁচামাল (Paper & Materials)</option>
              <option value="INK_TONER">কালি ও টোনার (Ink & Toner)</option>
              <option value="PRINTING_PRODUCTION">ছাপাখানা উৎপাদন খরচ (Production)</option>
              <option value="ELECTRICITY">বিদ্যুৎ বিল (Electricity & Power)</option>
              <option value="MACHINE_MAINTENANCE">মেশিন মেরামত ও রক্ষণাবেক্ষণ</option>
              <option value="STAFF_SALARY">স্টাফদের বেতন (Staff Salary)</option>
              <option value="RENT">দোকান / কারখানা ভাড়া (Shop Rent)</option>
              <option value="DELIVERY">পরিবহন ও ডেলিভারি (Delivery)</option>
              <option value="PACKAGING">প্যাকেজিং ও কার্টন (Packaging)</option>
              <option value="OTHER">অন্যান্য আনুষঙ্গিক খরচ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">টাকার পরিমাণ (৳) *</label>
            <input
              type="number"
              step="any"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-base font-bold p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">পেমেন্ট মেথড</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="CASH">Cash</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="BANK_TRANSFER">Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">ভেন্ডর / দোকান / প্রাপক</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="যেমন: ঢাকা পেপার হাউস"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">খরচের বিস্তারিত বিবরণ *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="যেমন: আর্ট কার্ড ৩০০ জিএসএম ৪ প্যাকেট ক্রয়..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition"
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? t('app.loading') : 'ব্যয় যোগ করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
