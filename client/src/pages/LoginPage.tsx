import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Lock, User, Key, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (res.success && res.token) {
        login(res.token, res.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-bangla">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 text-center space-y-2 border-b border-slate-100 dark:border-slate-800">
          <img
            src="/assets/albari-logo.jpg"
            alt="Al-Bari Logo"
            className="w-16 h-16 rounded-2xl mx-auto object-contain border border-slate-200 p-1 shadow-sm"
          />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            আল-বারী প্রেস ম্যানেজমেন্ট
          </h2>
          <p className="text-xs text-slate-500">
            মাইজদী, নোয়াখালী • সুরক্ষিত লগইন পোর্টাল
          </p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              ইউজারনেম / মোবাইল নম্বর
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ইউজারনেম বা মোবাইল নম্বর লিখুন"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
