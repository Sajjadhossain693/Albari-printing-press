import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
      <Languages className="w-3.5 h-3.5 text-slate-500 ml-1" />
      <button
        onClick={() => setLanguage('bn')}
        className={`px-2.5 py-1 rounded transition-colors ${
          language === 'bn'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
        }`}
      >
        বাংলা
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
        }`}
      >
        English
      </button>
    </div>
  );
};
