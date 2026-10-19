import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { OrderFormModal } from '../components/OrderFormModal';
import { PaymentModal } from '../components/PaymentModal';
import { ExpenseModal } from '../components/ExpenseModal';
import { PrintableInvoice } from '../components/PrintableInvoice';
import { Order } from '../types';
import {
  ShoppingCart,
  Clock,
  Cog,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Plus,
  CreditCard,
  Sparkles,
  ArrowRight,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate, formatNumber } = useLanguage();

  const [timeRange, setTimeRange] = useState('thisMonth');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  const fetchStats = async () => {
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
    fetchStats();
  }, [timeRange]);

  const stats = data?.stats || {};
  const recentOrders: Order[] = data?.recentOrders || [];
  const upcomingDeadlines: Order[] = data?.upcomingDeadlines || [];
  const topProducts = data?.topProducts || [];
  const monthlyChart = data?.monthlyChart || [];
  const statusDistribution = data?.statusDistribution || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t('dashboard.title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              লাইভ ডাটা
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            আল-বারী প্রেসের সার্বিক উৎপাদন, বিক্রয়, বকেয়া ও হিসাবের চিত্র
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs">
            {[
              { id: 'today', label: t('dashboard.filterToday') },
              { id: 'last7Days', label: t('dashboard.filter7Days') },
              { id: 'thisMonth', label: t('dashboard.filterThisMonth') },
              { id: 'all', label: t('dashboard.filterAll') }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeRange === tab.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('orders.addNew')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t('dashboard.todaySales')}
          value={formatCurrency(stats.todaySales || 0)}
          subtitle={`মোট বিক্রয়: ${formatCurrency(stats.totalSales || 0)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title={t('dashboard.totalPayments')}
          value={formatCurrency(stats.totalPaymentsReceived || 0)}
          subtitle="আদায়কৃত নগদ ক্যাশ ও ডিজিটাল পেমেন্ট"
          icon={<CreditCard className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title={t('dashboard.totalDues')}
          value={formatCurrency(stats.totalOutstandingDue || 0)}
          subtitle="গ্রাহকদের কাছে মোট বাকী পাওনা"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title={t('dashboard.estimatedProfit')}
          value={formatCurrency(stats.estimatedGrossProfit || 0)}
          subtitle={`মোট ব্যয়: ${formatCurrency(stats.totalExpenses || 0)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="indigo"
        />
      </div>

      {/* Production Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-900 dark:text-amber-200">{formatNumber(stats.pendingOrders || 0)}</div>
            <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400">{t('dashboard.pendingOrders')}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            <Cog className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-black text-blue-900 dark:text-blue-200">{formatNumber(stats.inProduction || 0)}</div>
            <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-400">{t('dashboard.inProduction')}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-black text-teal-900 dark:text-teal-200">{formatNumber(stats.readyForDelivery || 0)}</div>
            <div className="text-[11px] font-semibold text-teal-800 dark:text-teal-400">{t('dashboard.readyForDelivery')}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">{formatNumber(stats.deliveredOrders || 0)}</div>
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">{t('dashboard.deliveredOrders')}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.monthlySalesChart')}
              </h3>
              <p className="text-xs text-slate-500">বিক্রয়ের মাসিক গতিধারা (টাকা)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`৳${val.toLocaleString()}`, 'বিক্রয়']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t('dashboard.orderStatusChart')}
          </h3>
          <p className="text-xs text-slate-500 mb-4">অর্ডারের অবস্থান অনুযায়ী অনুপাত</p>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} টি অর্ডার`, 'সংখ্যা']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {statusDistribution.map((s: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{s.name}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Orders & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('dashboard.recentOrders')}
              </h3>
              <p className="text-xs text-slate-500">সর্বশেষ প্রাপ্ত অর্ডারসমূহের তালিকা</p>
            </div>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>নতুন অর্ডার</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 text-left font-semibold">অর্ডার নং</th>
                  <th className="py-2.5 px-4 text-left font-semibold">গ্রাহক</th>
                  <th className="py-2.5 px-4 text-left font-semibold">উৎপাদন স্ট্যাটাস</th>
                  <th className="py-2.5 px-4 text-left font-semibold">পেমেন্ট</th>
                  <th className="py-2.5 px-4 text-right font-semibold">মোট বিল</th>
                  <th className="py-2.5 px-4 text-right font-semibold">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      কোন সাম্প্রতিক অর্ডার পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{order.customer.fullName}</div>
                        <div className="text-[11px] text-slate-500">{order.customer.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="production" status={order.productionStatus} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="payment" status={order.paymentStatus} />
                        {order.amountDue > 0 && (
                          <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                            বাকী: {formatCurrency(order.amountDue)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.amountDue > 0 && (
                            <button
                              onClick={() => setSelectedOrderForPayment(order)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition"
                              title="টাকা জমা নিন"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForPrint(order)}
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

        {/* Upcoming Deadlines & Top Products (1 column) */}
        <div className="space-y-6">
          {/* Upcoming Delivery Deadlines */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('dashboard.upcomingDeadlines')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">জরুরি ডেলিভারির তারিখসমূহ</p>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">কোন আসন্ন ডেডলাইন নেই</div>
              ) : (
                upcomingDeadlines.map(order => (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {order.customer.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {order.orderNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-600 dark:text-rose-400">
                        {formatDate(order.deliveryDate)}
                      </div>
                      <StatusBadge type="production" status={order.productionStatus} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('dashboard.topProducts')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">চলতি মাসে বিক্রয়ে শীর্ষে থাকা পণ্য</p>
            <div className="space-y-3">
              {topProducts.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {p.nameBn || p.name}
                  </div>
                  <div className="text-right font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSuccess={fetchStats}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchStats}
      />

      {selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          isOpen={true}
          onClose={() => setSelectedOrderForPayment(null)}
          onSuccess={fetchStats}
        />
      )}

      {selectedOrderForPrint && (
        <PrintableInvoice
          order={selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </div>
  );
};
