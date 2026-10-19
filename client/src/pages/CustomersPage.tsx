import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Customer } from '../types';
import {
  Users,
  Search,
  Plus,
  Download,
  Phone,
  Mail,
  MapPin,
  Building2,
  X,
  CheckCircle2
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLanguage();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // New Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState('INDIVIDUAL');
  const [organizationName, setOrganizationName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (typeFilter !== 'ALL') query.append('type', typeFilter);

      const res = await apiRequest<{ customers: Customer[] }>(`/customers?${query.toString()}`);
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleExportCsv = () => {
    window.open('/api/customers/export', '_blank');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          fullNameBn,
          phone,
          email,
          address,
          customerType,
          organizationName,
          notes
        })
      });
      setIsAddModalOpen(false);
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setOrganizationName('');
      fetchCustomers();
    } catch (err: any) {
      setError(err.message || 'গ্রাহক যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('customers.title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('customers.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('app.export')}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('customers.addNew')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="গ্রাহকের নাম, প্রতিষ্ঠান বা ফোন..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">ধরন:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="ALL">সকল ধরন</option>
            <option value="INDIVIDUAL">ব্যক্তিগত</option>
            <option value="BUSINESS">ব্যবসা প্রতিষ্ঠান</option>
            <option value="SCHOOL_COLLEGE">স্কুল / কলেজ</option>
            <option value="UNIVERSITY">বিশ্ববিদ্যালয়</option>
            <option value="ORGANIZATION">সামাজিক / ধর্মীয় সংগঠন</option>
            <option value="RESELLER">পাইকারি / রিসেলার</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">গ্রাহক কোড</th>
                <th className="py-3 px-4 text-left font-semibold">নাম ও প্রতিষ্ঠান</th>
                <th className="py-3 px-4 text-left font-semibold">মোবাইল</th>
                <th className="py-3 px-4 text-left font-semibold">ঠিকানা</th>
                <th className="py-3 px-4 text-center font-semibold">মোট অর্ডার</th>
                <th className="py-3 px-4 text-right font-semibold">মোট বিল</th>
                <th className="py-3 px-4 text-right font-semibold">মোট জমা</th>
                <th className="py-3 px-4 text-right font-semibold">বর্তমান বাকী</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    কোন গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {c.customerCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.fullNameBn || c.fullName}
                      </div>
                      {c.organizationName && (
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          <span>{c.organizationName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                      {c.address || '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {c.totalOrders || 0} টি
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(c.totalSpent || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {formatCurrency(c.totalPaid || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600">
                      {(c.currentDue || 0) > 0 ? formatCurrency(c.currentDue || 0) : '০.০০'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{t('customers.addNew')}</h3>
                  <p className="text-xs text-slate-500">নিয়মিত বা কর্পোরেট ক্লায়েন্ট ডাটাবেজ</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">গ্রাহকের নাম (বাংলা বা ইংরেজি) *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: জাহিদ স্যার"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭xxxxxxxx"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">গ্রাহকের ধরন</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="INDIVIDUAL">ব্যক্তিগত</option>
                    <option value="BUSINESS">ব্যবসা প্রতিষ্ঠান</option>
                    <option value="SCHOOL_COLLEGE">স্কুল / কলেজ</option>
                    <option value="UNIVERSITY">বিশ্ববিদ্যালয়</option>
                    <option value="ORGANIZATION">মাদ্রাসা / সংগঠন</option>
                    <option value="RESELLER">রিসেলার</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">প্রতিষ্ঠান / একাডেমি / মাদ্রাসার নাম</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="যেমন: প্যারামাউন্ট জোন"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: মাইজদী, নোয়াখালী"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 transition"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? t('app.loading') : 'গ্রাহক সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
