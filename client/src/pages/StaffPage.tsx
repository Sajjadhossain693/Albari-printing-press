import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../services/api';
import { User } from '../types';
import { ShieldCheck, Plus, UserPlus, X, CheckCircle2 } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const { t } = useTranslation();

  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Staff Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [role, setRole] = useState('STAFF');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ staff: User[] }>('/auth/staff');
      setStaff(res.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest('/auth/staff', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          fullName,
          fullNameBn,
          role,
          phone,
          email
        })
      });

      setIsModalOpen(false);
      setUsername('');
      setPassword('');
      setFullName('');
      fetchStaff();
    } catch (err: any) {
      setError(err.message || 'স্টাফ যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>{t('nav.staff')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মালিক, ম্যানেজার, ডিজাইনার ও প্রোডাকশন অপারেটরদের অ্যাকাউন্ট ও রোল এক্সেস
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>নতুন স্টাফ যোগ করুন</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            লোড হচ্ছে...
          </div>
        ) : (
          staff.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {t(`roles.${s.role}`)}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="সক্রিয়" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {s.fullNameBn || s.fullName}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ইউজার: {s.username}
                </div>
              </div>

              {s.phone && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  মোবাইল: {s.phone}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold">নতুন স্টাফ অ্যাকাউন্ট তৈরি</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">ব্যবহারকারীর নাম (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="যেমন: designer2"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">রোল ও পদবী *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="MANAGER">ম্যানেজার (Manager)</option>
                  <option value="DESIGNER">ডিজাইনার (Graphic Designer)</option>
                  <option value="STAFF">প্রোডাকশন অপারেটর (Production Staff)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
