import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../services/api';
import { BusinessSettings } from '../types';
import { Settings, Save, CheckCircle2, Building, Phone, Mail, MapPin } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [nameBn, setNameBn] = useState('');
  const [name, setName] = useState('');
  const [addressBn, setAddressBn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [defaultLanguage, setDefaultLanguage] = useState('bn');
  const [aiProvider, setAiProvider] = useState('pollinations');
  const [termsBn, setTermsBn] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ settings: BusinessSettings }>('/settings');
      if (res.settings) {
        setSettings(res.settings);
        setNameBn(res.settings.nameBn);
        setName(res.settings.name);
        setAddressBn(res.settings.addressBn);
        setPhone(res.settings.phone);
        setEmail(res.settings.email);
        setCurrencySymbol(res.settings.currencySymbol || '৳');
        setDefaultLanguage(res.settings.defaultLanguage || 'bn');
        setAiProvider(res.settings.aiProvider || 'pollinations');
        setTermsBn(res.settings.termsBn || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          nameBn,
          name,
          addressBn,
          phone,
          email,
          currencySymbol,
          defaultLanguage,
          aiProvider,
          termsBn
        })
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 text-xs text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">{t('settings.pressName')} *</label>
            <input
              type="text"
              required
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{t('settings.pressNameEn')} *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">{t('settings.address')} *</label>
          <input
            type="text"
            required
            value={addressBn}
            onChange={(e) => setAddressBn(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold mb-1">{t('settings.phone')} *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{t('settings.email')} *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">{t('settings.currency')} *</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">{t('settings.defaultLanguage')}</label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="bn">বাংলা (Bengali - Default)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">{t('settings.aiProvider')}</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="pollinations">Pollinations AI (Flux Model - Fast/Free)</option>
              <option value="openai">OpenAI (DALL-E 3)</option>
              <option value="gemini">Google Gemini (Imagen 3)</option>
              <option value="local">Local Al-Bari Press Asset Engine</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">{t('settings.terms')}</label>
          <textarea
            rows={3}
            value={termsBn}
            onChange={(e) => setTermsBn(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bangla"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : t('app.save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
