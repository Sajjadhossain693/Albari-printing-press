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
  AlertCircle,
  Truck,
  X
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

  // Delivery confirmation modal with payment collection
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryCollectDue, setDeliveryCollectDue] = useState(true);
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState('CASH');
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  // Quick Mark as Paid modal
  const [isQuickPayModalOpen, setIsQuickPayModalOpen] = useState(false);
  const [quickPayMethod, setQuickPayMethod] = useState('CASH');
  const [updatingQuickPay, setUpdatingQuickPay] = useState(false);

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

  const handleProductionStatusChange = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === 'DELIVERED' && order.amountDue > 0) {
      setIsDeliveryModalOpen(true);
      setDeliveryCollectDue(true);
      setDeliveryPaymentMethod('CASH');
      return;
    }
    try {
      await apiRequest(`/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeliveryConfirmSubmit = async () => {
    if (!order) return;
    setUpdatingDelivery(true);
    try {
      await apiRequest(`/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'DELIVERED',
          collectRemainingPayment: deliveryCollectDue,
          paymentMethod: deliveryPaymentMethod,
          paymentAmount: deliveryCollectDue ? order.amountDue : 0,
          notes: deliveryCollectDue
            ? `ডেলিভারির সময় বকেয়া ৳${order.amountDue} আদায় সম্পন্ন এবং আজকের হিসাবে যোগ করা হয়েছে`
            : 'ডেলিভারি সম্পন্ন (বকেয়া অপরিশোধিত)'
        })
      });
      setIsDeliveryModalOpen(false);
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || 'ডেলিভারি স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setUpdatingDelivery(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === 'PAID') {
      if (order.amountDue > 0) {
        setIsQuickPayModalOpen(true);
        setQuickPayMethod('CASH');
      } else {
        executePaymentStatusUpdate('PAID');
      }
    } else if (newStatus === 'PARTIALLY_PAID') {
      setIsPaymentModalOpen(true);
    } else if (newStatus === 'UNPAID') {
      if (window.confirm('অর্ডারটি অপরিশোধিত (UNPAID) করতে চান?')) {
        executePaymentStatusUpdate('UNPAID');
      }
    }
  };

  const executePaymentStatusUpdate = async (paymentStatus: string, method?: string) => {
    if (!order) return;
    try {
      await apiRequest(`/orders/${order.id}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus, method: method || 'CASH' })
      });
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || 'পেমেন্ট স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const handleQuickPaySubmit = async () => {
    if (!order) return;
    setUpdatingQuickPay(true);
    try {
      await apiRequest(`/orders/${order.id}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({
          paymentStatus: 'PAID',
          method: quickPayMethod,
          amount: order.amountDue
        })
      });
      setIsQuickPayModalOpen(false);
      fetchOrderDetail();
    } catch (err: any) {
      alert(err.message || 'পেমেন্ট স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setUpdatingQuickPay(false);
    }
  };

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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <StatusBadge type="production" status={order.productionStatus} />
                <select
                  value={order.productionStatus}
                  onChange={(e) => handleProductionStatusChange(e.target.value)}
                  className="text-xs p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                  title="উৎপাদন স্ট্যাটাস পরিবর্তন"
                >
                  <option value="PENDING">পেন্ডিং</option>
                  <option value="IN_PRODUCTION">উৎপাদন</option>
                  <option value="QUALITY_CHECK">মান যাচাই</option>
                  <option value="READY_FOR_DELIVERY">প্রস্তুত</option>
                  <option value="DELIVERED">ডেলিভার্ড</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <StatusBadge type="payment" status={order.paymentStatus} />
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  className="text-xs p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold cursor-pointer"
                  title="পেমেন্ট স্ট্যাটাস পরিবর্তন"
                >
                  <option value="UNPAID">অপরিশোধিত</option>
                  <option value="PARTIALLY_PAID">আংশিক</option>
                  <option value="PAID">পরিশোধিত</option>
                </select>
              </div>
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

      {/* Delivery & Today's Account Collection Modal */}
      {isDeliveryModalOpen && order && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">অর্ডার ডেলিভারি ও আজকের হিসাব</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">ডেলিভারি সম্পন্ন ও বকেয়া পাওনা আদায়</p>
                </div>
              </div>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">অর্ডার নম্বর:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-semibold">{order.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোট বিল:</span>
                  <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>বকেয়া টাকা:</span>
                  <span>{formatCurrency(order.amountDue)}</span>
                </div>
              </div>

              {/* Delivery Due Payment Option */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliveryCollectDue}
                    onChange={(e) => setDeliveryCollectDue(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      বকেয়া {formatCurrency(order.amountDue)} আদায় হয়েছে (আজকের হিসাবে যোগ করুন)
                    </span>
                    <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                      যেদিন ডেলিভারি সম্পন্ন হবে, ওই দিন প্রাপ্ত টাকা আজকের নগদ আদায়ে যোগ হয়ে ক্যাশ হিসাব হালনাগাদ হবে।
                    </span>
                  </div>
                </label>

                {deliveryCollectDue && (
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      পেমেন্ট মেথড নির্বাচন করুন:
                    </label>
                    <select
                      value={deliveryPaymentMethod}
                      onChange={(e) => setDeliveryPaymentMethod(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="CASH">নগদ (Cash)</option>
                      <option value="BKASH">বিকাশ (bKash)</option>
                      <option value="NAGAD">নগদ (Nagad)</option>
                      <option value="ROCKET">রকেট (Rocket)</option>
                      <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="button"
                  disabled={updatingDelivery}
                  onClick={handleDeliveryConfirmSubmit}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {updatingDelivery
                      ? t('app.loading')
                      : deliveryCollectDue
                      ? 'টাকা আদায় সহ ডেলিভারি সম্পন্ন করুন'
                      : 'বকেয়া রেখে ডেলিভারি করুন'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Mark As Paid Modal */}
      {isQuickPayModalOpen && order && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">সম্পূর্ণ পরিশোধিত চিহ্নিত করুন</h3>
                  <p className="text-xs text-slate-500">বকেয়া নিষ্পত্তি ও আজকের হিসাবে যোগ</p>
                </div>
              </div>
              <button onClick={() => setIsQuickPayModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1">
                <div className="flex justify-between font-mono font-bold text-blue-600 dark:text-blue-400">
                  <span>অর্ডার নং:</span>
                  <span>{order.orderNumber}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>বকেয়া নিষ্পত্তির পরিমাণ:</span>
                  <span className="text-emerald-600 text-sm">{formatCurrency(order.amountDue)}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  এই টাকা আজকের নগদ আদায়ের হিসাবে অবিলম্বে যুক্ত হবে।
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">পেমেন্ট মেথড *</label>
                <select
                  value={quickPayMethod}
                  onChange={(e) => setQuickPayMethod(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="CASH">নগদ (Cash)</option>
                  <option value="BKASH">বিকাশ (bKash)</option>
                  <option value="NAGAD">নগদ (Nagad)</option>
                  <option value="ROCKET">রকেট (Rocket)</option>
                  <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickPayModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="button"
                  disabled={updatingQuickPay}
                  onClick={handleQuickPaySubmit}
                  className="px-4 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 font-semibold shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{updatingQuickPay ? t('app.loading') : 'পরিশোধ সম্পন্ন করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
