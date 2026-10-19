import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;
  formatCurrency: (amount: number, useBengaliDigits?: boolean) => string;
  formatNumber: (num: number | string, useBengaliDigits?: boolean) => string;
  formatDate: (dateString: string | Date | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  formatCurrency: () => '',
  formatNumber: () => '',
  formatDate: () => ''
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLangState] = useState<'bn' | 'en'>(
    (localStorage.getItem('i18nextLng') as 'bn' | 'en') || 'bn'
  );

  const setLanguage = (lang: 'bn' | 'en') => {
    setLangState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toBnDigits = (val: string | number) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(val).replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
  };

  const formatNumber = (num: number | string, useBengaliDigits = language === 'bn') => {
    if (num === undefined || num === null) return '';
    const formatted = typeof num === 'number' ? num.toLocaleString('en-US') : num;
    return useBengaliDigits ? toBnDigits(formatted) : String(formatted);
  };

  const formatCurrency = (amount: number, useBengaliDigits = language === 'bn') => {
    const fixed = Math.round(amount).toLocaleString('en-US');
    return useBengaliDigits ? `৳${toBnDigits(fixed)}` : `৳${fixed}`;
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, formatCurrency, formatNumber, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
