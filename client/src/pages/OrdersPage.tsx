import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { OrderFormModal } from '../components/OrderFormModal';
import { PaymentModal } from '../components/PaymentModal';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { Order } from '../types';
import {
  Search,
  Filter,
  Plus,
  Printer,
  CreditCard,
  Eye,
  CheckCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prodFilter, setProdFilter] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (prodFilter !== 'ALL') query.append('productionStatus', prodFilter);
      if (payFilter !== 'ALL') query.append('paymentStatus', payFilter);

      const res = await apiRequest<{ orders: Order[] }>(`/orders?${query.toString()}`);
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [prodFilter, payFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('orders.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('orders.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('orders.addNew')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অর্ডার নং, নাম বা মোবাইল..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">উৎপাদন:</span>
            <select
              value={prodFilter}
              onChange={(e) => setProdFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="ALL">সকল অবস্থা</option>
              <option value="PENDING">পেন্ডিং</option>
              <option value="CONFIRMED">নিশ্চিত</option>
              <option value="IN_PRODUCTION">উৎপাদন চলছে</option>
              <option value="QUALITY_CHECK">মান যাচাই</option>
              <option value="READY_FOR_DELIVERY">ডেলিভারির জন্য প্রস্তুত</option>
              <option value="DELIVERED">ডেলিভারি সম্পন্ন</option>
              <option value="CANCELLED">বাতিল</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">পেমেন্ট:</span>
            <select
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="ALL">সকল পেমেন্ট</option>
              <option value="UNPAID">অপরিশোধিত</option>
              <option value="PARTIALLY_PAID">আংশিক জমা</option>
              <option value="PAID">সম্পূর্ণ পরিশোধিত</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">অর্ডার নং</th>
                <th className="py-3 px-4 text-left font-semibold">গ্রাহক ও মোবাইল</th>
                <th className="py-3 px-4 text-left font-semibold">অর্ডারের তারিখ</th>
                <th className="py-3 px-4 text-left font-semibold">ডেলিভারি</th>
                <th className="py-3 px-4 text-left font-semibold">উৎপাদন স্ট্যাটাস</th>
                <th className="py-3 px-4 text-left font-semibold">পেমেন্ট স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right font-semibold">মোট বিল</th>
                <th className="py-3 px-4 text-right font-semibold">জমা</th>
                <th className="py-3 px-4 text-right font-semibold">বকেয়া</th>
                <th className="py-3 px-4 text-center font-semibold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    কোন অর্ডার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <Link to={`/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{order.customer.fullName}</div>
                      <div className="text-[11px] text-slate-500">{order.customer.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge type="production" status={order.productionStatus} />
                        {order.productionStatus !== 'DELIVERED' && (
                          <select
                            value={order.productionStatus}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="text-[10px] p-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="PENDING">পেন্ডিং</option>
                            <option value="IN_PRODUCTION">উৎপাদন</option>
                            <option value="QUALITY_CHECK">মান যাচাই</option>
                            <option value="READY_FOR_DELIVERY">প্রস্তুত</option>
                            <option value="DELIVERED">ডেলিভার্ড</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="payment" status={order.paymentStatus} />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(order.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {order.amountDue > 0 ? formatCurrency(order.amountDue) : '০.০০'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/orders/${order.id}`}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {order.amountDue > 0 && (
                          <button
                            onClick={() => setPaymentOrder(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition"
                            title="টাকা জমা নিন"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setPrintOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                          title="ক্যাশ মেমো প্রিন্ট"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={fetchOrders}
      />

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          isOpen={true}
          onClose={() => setPaymentOrder(null)}
          onSuccess={fetchOrders}
        />
      )}

      {printOrder && (
        <PrintableInvoice
          order={printOrder}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
};
