import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PaymentModal } from '../components/PaymentModal';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { Order } from '../types';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  User,
  Calendar,
  Clock,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { formatCurrency, formatDate, formatNumber } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ order: Order }>(`/orders/${id}`);
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'অর্ডার লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>;
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-rose-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error || 'অর্ডার পাওয়া যায়নি'}</p>
        <Link to="/orders" className="mt-4 inline-block text-xs text-blue-600 underline">
          অর্ডার তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <StatusBadge type="production" status={order.productionStatus} />
              <StatusBadge type="payment" status={order.paymentStatus} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              অর্ডারের তারিখ: {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.amountDue > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('orders.addPayment')}</span>
            </button>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t('orders.cashMemo')}</span>
          </button>
        </div>
      </div>

      {/* 3 Column Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Info Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <User className="w-4 h-4 text-blue-600" />
            <span>গ্রাহকের তথ্য</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {order.customer.fullName}
          </div>
          {order.customer.organizationName && (
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {order.customer.organizationName}
            </div>
          )}
          <div className="text-xs text-slate-600 dark:text-slate-300">
            মোবাইল: {order.customer.phone}
          </div>
          {order.customer.address && (
            <div className="text-xs text-slate-500">
              ঠিকানা: {order.customer.address}
            </div>
          )}
        </div>

        {/* Schedule & Staff Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>সময়সূচী ও দায়িত্বপ্রাপ্ত</span>
          </div>
          <div className="text-xs flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">ডেলিভারি তারিখ:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {order.deliveryDate ? formatDate(order.deliveryDate) : 'জরুরি'}
            </span>
          </div>
          <div className="text-xs flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">ডিজাইনার:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {order.assignedDesigner?.fullName || 'জাহিদ স্যার'}
            </span>
          </div>
          <div className="text-xs flex justify-between py-0.5">
            <span className="text-slate-500">প্রোডাকশন অপারেটর:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {order.assignedStaff?.fullName || 'রহিম মিয়া'}
            </span>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>বিল ও হিসাবের সারসংক্ষেপ</span>
          </div>
          <div className="text-xs flex justify-between py-0.5">
            <span className="text-slate-500">মোট বিল:</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="text-xs flex justify-between py-0.5 text-emerald-600">
            <span className="font-semibold">পরিশোধিত:</span>
            <span className="font-bold">{formatCurrency(order.amountPaid)}</span>
          </div>
          <div className="text-xs flex justify-between py-1 border-t border-slate-200 dark:border-slate-800 text-rose-600 font-bold text-sm">
            <span>অবশিষ্ট বকেয়া:</span>
            <span>{formatCurrency(order.amountDue)}</span>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('orders.itemDetails')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">পণ্য ও কাজের বিবরণ</th>
                <th className="py-2.5 px-4 text-left font-semibold">স্পেসিফিকেশন ও মেটেরিয়াল</th>
                <th className="py-2.5 px-4 text-center font-semibold">পরিমাণ</th>
                <th className="py-2.5 px-4 text-right font-semibold">দর</th>
                <th className="py-2.5 px-4 text-right font-semibold">উপমোট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {it.productNameBn || it.productName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {it.specifications || '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">
                    {formatNumber(it.quantity)} {it.unitBn || it.unit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(it.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(it.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments History Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              পেমেন্ট লেজার ও রসিদ
            </h3>
            <p className="text-xs text-slate-500">এই অর্ডারে জমাকৃত সকল লেনদেনের হিসাব</p>
          </div>
          {order.amountDue > 0 && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>টাকা জমা নিন</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">রসিদ / ট্রানজেকশন নং</th>
                <th className="py-2.5 px-4 text-left font-semibold">তারিখ</th>
                <th className="py-2.5 px-4 text-left font-semibold">মাধ্যম</th>
                <th className="py-2.5 px-4 text-left font-semibold">রেফারেন্স</th>
                <th className="py-2.5 px-4 text-left font-semibold">গ্রহণকারী</th>
                <th className="py-2.5 px-4 text-right font-semibold">টাকার পরিমাণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!order.payments || order.payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    এখনও কোন পেমেন্ট জমা হয়নি
                  </td>
                </tr>
              ) : (
                order.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      {p.receiptNumber || p.paymentNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {p.referenceNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {p.receivedBy?.fullName || 'ক্যাশ কাউন্টার'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isPaymentModalOpen && (
        <PaymentModal
          order={order}
          isOpen={true}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={fetchOrderDetail}
        />
      )}

      {isPrintModalOpen && (
        <PrintableInvoice
          order={order}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
