import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../services/api';
import { User } from '../types';
import { ShieldCheck, UserPlus, Edit2, Trash2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

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

  // Edit Staff Modal
  const [editStaffMember, setEditStaffMember] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editFullNameBn, setEditFullNameBn] = useState('');
  const [editRole, setEditRole] = useState('STAFF');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEmailState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setFullNameBn('');
      setPhone('');
      setEmail('');
      setSuccessMsg('নতুন স্টাফ সফলভাবে তৈরি হয়েছে');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchStaff();
    } catch (err: any) {
      setError(err.message || 'স্টাফ যোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (member: User) => {
    setEditStaffMember(member);
    setEditFullName(member.fullName || '');
    setEditFullNameBn(member.fullNameBn || '');
    setEditRole(member.role);
    setEditPhone(member.phone || '');
    setEmailState(member.email || '');
    setNewPassword('');
    setEditActive(member.active ?? true);
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffMember) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      await apiRequest(`/auth/staff/${editStaffMember.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editFullName,
          fullNameBn: editFullNameBn,
          role: editRole,
          phone: editPhone,
          email: editEmail,
          password: newPassword ? newPassword : undefined,
          active: editActive
        })
      });

      setEditStaffMember(null);
      setSuccessMsg('স্টাফের তথ্য ও পাসওয়ার্ড সফলভাবে হালনাগাদ করা হয়েছে');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchStaff();
    } catch (err: any) {
      setEditError(err.message || 'আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteStaff = async (member: User) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${member.fullNameBn || member.fullName}' এর অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      const res = await apiRequest<{ message: string }>(`/auth/staff/${member.id}`, {
        method: 'DELETE'
      });
      setSuccessMsg(res.message || 'স্টাফ সফলভাবে মুছে ফেলা হয়েছে');
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'মুছতে ব্যর্থ হয়েছে');
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
            মালিক, ম্যানেজার, ডিজাইনার ও প্রোডাকশন অপারেটরদের অ্যাকাউন্ট, পাসওয়ার্ড ও রোল এক্সেস নিয়ন্ত্রণ
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

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            লোড হচ্ছে...
          </div>
        ) : (
          staff.map(s => {
            const isOwner = s.role === 'OWNER';
            return (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isOwner
                        ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}>
                      {t(`roles.${s.role}`)}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-rose-400'}`}
                      title={s.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.fullNameBn || s.fullName}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      ইউজার: <strong className="text-slate-800 dark:text-slate-200">{s.username}</strong>
                    </div>
                  </div>

                  {s.phone && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      মোবাইল: {s.phone}
                    </div>
                  )}

                  {s.email && (
                    <div className="text-[11px] text-slate-500 truncate">
                      ইমেইল: {s.email}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => openEditModal(s)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>এডিট / পাসওয়ার্ড</span>
                  </button>

                  {!isOwner && (
                    <button
                      onClick={() => handleDeleteStaff(s)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
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
                <label className="block font-semibold mb-1">পূর্ণ নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={fullNameBn}
                  onChange={(e) => setFullNameBn(e.target.value)}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম (English)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
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

              <div>
                <label className="block font-semibold mb-1">ইমেইল (ঐচ্ছিক)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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

      {/* Edit Staff & Reset Password Modal */}
      {editStaffMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>স্টাফ এডিট ও পাসওয়ার্ড পরিবর্তন ({editStaffMember.username})</span>
              </h3>
              <button onClick={() => setEditStaffMember(null)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {editError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-xs text-rose-700 border border-rose-200">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম (বাংলা)</label>
                <input
                  type="text"
                  value={editFullNameBn}
                  onChange={(e) => setEditFullNameBn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">পূর্ণ নাম (English)</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">রোল ও পদবী</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="OWNER">মালিক / এডমিন (Super Admin)</option>
                  <option value="MANAGER">ম্যানেজার (Manager)</option>
                  <option value="DESIGNER">ডিজাইনার (Graphic Designer)</option>
                  <option value="STAFF">প্রোডাকশন অপারেটর (Production Staff)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নতুন পাসওয়ার্ড (পরিবর্তন করতে চাইলে লিখুন)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="অপরিবর্তিত রাখতে খালি রাখুন"
                    className="w-full p-2.5 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-2.5 top-3" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeStatus"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="activeStatus" className="font-semibold cursor-pointer">
                  অ্যাকাউন্ট সক্রিয় (Active) রাখুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStaffMember(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {editSubmitting ? 'আপডেট হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
