import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Compass, Search, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { formatDate, formatNumber } = useLanguage();
  const [searchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');

  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async () => {
    if (!token && (!orderNumber || !phone)) return;

    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (token) query.append('token', token);
      if (orderNumber) query.append('orderNumber', orderNumber);
      if (phone) query.append('phone', phone);

      const res = await apiRequest(`/orders/track?${query.toString()}`);
      if (res.success && res.tracking) {
        setTracking(res.tracking);
      }
    } catch (err: any) {
      setError(err.message || 'অর্ডারের তথ্য মেলেনি। অর্ডার নং ও মোবাইল নম্বর সঠিকভাবে চেক করুন।');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token || (orderNumber && phone)) {
      fetchTracking();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 font-bangla">
      <div className="text-center space-y-2">
        <div className="p-3 w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          অর্ডার ট্র্যাকিং সিস্টেম
        </h1>
        <p className="text-xs text-slate-500">
          আপনার অর্ডার নাম্বার ও মোবাইল নাম্বার দিয়ে কাজের বর্তমান অগ্রগতি জানুন
        </p>
      </div>

      <form onSubmit={handleSearch} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">অর্ডার নম্বর *</label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="যেমন: PR-2026-0001"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">অর্ডারকারী মোবাইল নম্বর *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="০১৭xxxxxxxx"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'অনুসন্ধান চলছে...' : 'অর্ডার ট্র্যাক করুন'}</span>
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tracking && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400">
                {tracking.orderNumber}
              </span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                অর্ডারের তারিখ: {formatDate(tracking.orderDate)}
              </div>
            </div>
            <StatusBadge type="production" status={tracking.productionStatus} />
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">পণ্যের বিবরণ:</h4>
            <div className="space-y-1.5">
              {tracking.items?.map((it: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between font-semibold">
                  <span>{it.productNameBn || it.productName}</span>
                  <span className="text-slate-500">{formatNumber(it.quantity)} {it.unitBn || 'টি'}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">কাজের অগ্রগতি টাইমলাইন:</h4>
            <div className="space-y-3 pl-2 border-l-2 border-blue-500">
              {tracking.statusHistory?.map((h: any, idx: number) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    <StatusBadge type="production" status={h.toStatus} />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(h.createdAt)} - {h.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
