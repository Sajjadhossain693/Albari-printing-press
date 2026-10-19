import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sun, Moon, LogOut, User, Printer, Search, Store, Compass } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/assets/albari-logo.jpg"
            alt="Al-Bari Press Logo"
            className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-200 shadow-sm"
          />
          <div>
            <div className="font-bold text-base leading-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>আল-বারী প্রেস</span>
              <span className="hidden sm:inline-block text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                মাইজদী
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Al-Bari Press & Digital Sign
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Link to Public Storefront */}
        <Link
          to="/storefront"
          className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Store className="w-4 h-4 text-blue-600" />
          <span>{t('nav.storefront')}</span>
        </Link>

        {/* Link to Track Order */}
        <Link
          to="/track"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>{t('nav.trackOrder')}</span>
        </Link>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={theme === 'dark' ? t('app.light') : t('app.dark')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User profile / Login */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user.fullNameBn || user.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {t(`roles.${user.role}`)}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              title={t('app.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <User className="w-3.5 h-3.5" />
            <span>লগইন</span>
          </Link>
        )}
      </div>
    </header>
  );
};
