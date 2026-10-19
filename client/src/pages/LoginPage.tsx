import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Lock, User, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('albari');
  const [password, setPassword] = useState('taiyan26');
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

  const handleAdminSelect = () => {
    setUsername('albari');
    setPassword('taiyan26');
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
            মাইজদী, নোয়াখালী • Al-Bari Press & Digital Sign
          </p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-rose-50 text-xs text-rose-700 border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
              ইউজারনেম / ইমেইল / মোবাইল
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="যেমন: albari"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}</span>
          </button>

          {/* Admin Credentials Info & Staff Note */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={handleAdminSelect}
              className="w-full p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/50 transition flex items-center justify-between text-left"
            >
              <div>
                <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                  👑 এডমিন একাউন্ট (Admin)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  ইউজার: <strong className="text-blue-700 dark:text-blue-300">albari</strong> | পাসওয়ার্ড: <strong className="text-blue-700 dark:text-blue-300">taiyan26</strong>
                </span>
              </div>
              <span className="text-[10px] text-blue-600 font-semibold bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                অটো ফিল
              </span>
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              * অন্যান্য সকল স্টাফ (ম্যানেজার, ডিজাইনার, অপারেটর) অ্যাকাউন্ট এডমিন নিজে স্টাফ ও অনুমতি মেনু থেকে তৈরি ও পাসওয়ার্ড নির্ধারণ করবেন।
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
