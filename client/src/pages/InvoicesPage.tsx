import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { StatusBadge } from '../components/StatusBadge';
import { Invoice, Order } from '../types';
import { FileSpreadsheet, Printer, Search, Eye } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLanguage();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ invoices: Invoice[] }>('/invoices');
      setInvoices(res.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>{t('invoices.title')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ছাপাখানার অনুমোদিত ইনভয়েস ও মেমো কপি প্রিন্টিং
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">ইনভয়েস নং</th>
                <th className="py-3 px-4 text-left font-semibold">অর্ডার নং</th>
                <th className="py-3 px-4 text-left font-semibold">গ্রাহকের নাম ও ফোন</th>
                <th className="py-3 px-4 text-left font-semibold">তারিখ</th>
                <th className="py-3 px-4 text-left font-semibold">পেমেন্ট অবস্থা</th>
                <th className="py-3 px-4 text-right font-semibold">মোট বিল</th>
                <th className="py-3 px-4 text-right font-semibold">জমা</th>
                <th className="py-3 px-4 text-right font-semibold">বকেয়া</th>
                <th className="py-3 px-4 text-center font-semibold">ক্যাশ মেমো</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    কোন ইনভয়েস পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inv.order?.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.customer?.fullName}</div>
                      <div className="text-[11px] text-slate-500">{inv.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="payment" status={inv.paymentStatus} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600">
                      {inv.amountDue > 0 ? formatCurrency(inv.amountDue) : '০.০০'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setPrintOrder(inv.order)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 font-semibold inline-flex items-center gap-1 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>প্রিন্ট</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {printOrder && (
        <PrintableInvoice
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
};
