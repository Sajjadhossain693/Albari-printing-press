import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Layers,
  Sparkles,
  Image,
  Cog,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  Store,
  Compass
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';

  const navItems = [
    {
      to: '/',
      label: t('nav.dashboard'),
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'DESIGNER', 'STAFF']
    },
    {
      to: '/orders',
      label: t('nav.orders'),
      icon: <ShoppingCart className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'DESIGNER', 'STAFF', 'CUSTOMER']
    },
    {
      to: '/customers',
      label: t('nav.customers'),
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER']
    },
    {
      to: '/products',
      label: t('nav.products'),
      icon: <Layers className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF']
    },
    {
      to: '/design-studio',
      label: t('nav.designStudio'),
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      allowedRoles: ['OWNER', 'MANAGER', 'DESIGNER']
    },
    {
      to: '/design-library',
      label: t('nav.designLibrary'),
      icon: <Image className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'DESIGNER', 'CUSTOMER']
    },
    {
      to: '/production',
      label: t('nav.production'),
      icon: <Cog className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'DESIGNER', 'STAFF']
    },
    {
      to: '/payments',
      label: t('nav.payments'),
      icon: <CreditCard className="w-4 h-4 text-emerald-500" />,
      allowedRoles: ['OWNER', 'MANAGER']
    },
    {
      to: '/expenses',
      label: t('nav.expenses'),
      icon: <Receipt className="w-4 h-4 text-rose-500" />,
      allowedRoles: ['OWNER', 'MANAGER']
    },
    {
      to: '/invoices',
      label: t('nav.invoices'),
      icon: <FileSpreadsheet className="w-4 h-4" />,
      allowedRoles: ['OWNER', 'MANAGER', 'CUSTOMER']
    },
    {
      to: '/reports',
      label: t('nav.reports'),
      icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
      allowedRoles: ['OWNER', 'MANAGER']
    },
    {
      to: '/staff',
      label: t('nav.staff'),
      icon: <ShieldCheck className="w-4 h-4" />,
      allowedRoles: ['OWNER']
    },
    {
      to: '/settings',
      label: t('nav.settings'),
      icon: <Settings className="w-4 h-4" />,
      allowedRoles: ['OWNER']
    }
  ];

  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 md:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <img src="/assets/albari-logo.jpg" alt="Logo" className="w-6 h-6 rounded" />
            <span>আল-বারী প্রেস</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            ✕
          </button>
        </div>

        <div className="p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
            {t('dashboard.overview')}
          </div>
          <nav className="space-y-1">
            {filteredNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-2">
              পাবলিক সার্ভিসেস
            </div>
            <div className="space-y-1">
              <NavLink
                to="/storefront"
                onClick={() => onClose()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <Store className="w-4 h-4 text-emerald-500" />
                <span>{t('nav.storefront')}</span>
              </NavLink>
              <NavLink
                to="/track"
                onClick={() => onClose()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>{t('nav.trackOrder')}</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Press Hotline info */}
        <div className="p-3 m-3 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300">হটলাইন ও অর্ডার</div>
          <div className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">০১৬১৮-১৮২৩৬৫</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">মাইজদী, নোয়াখালী</div>
        </div>
      </aside>
    </>
  );
};
