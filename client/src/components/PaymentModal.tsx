import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Order } from '../types';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const [amount, setAmount] = useState<number>(order.amountDue);
  const [method, setMethod] = useState<string>('CASH');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0 || amount > order.amountDue + 0.01) {
      setError(`পরিশোধের পরিমাণ অবশ্যই ১ থেকে ${order.amountDue} টাকার মধ্যে হতে হবে`);
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          amount,
          method,
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined
        })
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'পেমেন্ট গ্রহণ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">{t('orders.addPayment')}</h3>
              <p className="text-xs text-slate-500 font-mono">{order.orderNumber} - {order.customer.fullName}</p>
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
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500">মোট বিল: </span>
              <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500">পূর্বে জমা: </span>
              <span className="font-bold text-emerald-600">{formatCurrency(order.amountPaid)}</span>
            </div>
            <div>
              <span className="text-slate-500">বর্তমান বাকী: </span>
              <span className="font-bold text-rose-600">{formatCurrency(order.amountDue)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">জমার পরিমাণ (টাকা) *</label>
            <input
              type="number"
              step="any"
              min="1"
              max={order.amountDue}
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-base font-bold p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">পেমেন্ট মেথড *</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="CASH">নগদ টাকা (Cash)</option>
              <option value="BKASH">বিকাশ (bKash)</option>
              <option value="NAGAD">নগদ (Nagad)</option>
              <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
              <option value="CHEQUE">চেক (Cheque)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">ট্রানজেকশন আইডি / রেফারেন্স নম্বর</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="যেমন: TrxID: BK789X10Q বা চেক নং"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">মন্তব্য / নোট</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="পেমেন্ট সংক্রান্ত বিশেষ কোনো তথ্য..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
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
              className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? t('app.loading') : 'পেমেন্ট সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
