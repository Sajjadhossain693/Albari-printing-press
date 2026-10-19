import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductionStatus, PaymentStatus } from '../types';

interface StatusBadgeProps {
  type: 'production' | 'payment';
  status: ProductionStatus | PaymentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  const { t } = useTranslation();

  if (type === 'production') {
    const map: Record<string, { label: string; bg: string; text: string }> = {
      DRAFT: { label: t('orderStatus.DRAFT'), bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
      PENDING: { label: t('orderStatus.PENDING'), bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300' },
      CONFIRMED: { label: t('orderStatus.CONFIRMED'), bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300' },
      IN_PRODUCTION: { label: t('orderStatus.IN_PRODUCTION'), bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-300' },
      QUALITY_CHECK: { label: t('orderStatus.QUALITY_CHECK'), bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-800 dark:text-purple-300' },
      READY_FOR_DELIVERY: { label: t('orderStatus.READY_FOR_DELIVERY'), bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300' },
      DELIVERED: { label: t('orderStatus.DELIVERED'), bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300' },
      CANCELLED: { label: t('orderStatus.CANCELLED'), bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300' }
    };

    const config = map[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  // Payment Status
  const map: Record<string, { label: string; bg: string; text: string }> = {
    UNPAID: { label: t('paymentStatus.UNPAID'), bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400' },
    PARTIALLY_PAID: { label: t('paymentStatus.PARTIALLY_PAID'), bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400' },
    PAID: { label: t('paymentStatus.PAID'), bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400' },
    REFUNDED: { label: t('paymentStatus.REFUNDED'), bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
    PARTIALLY_REFUNDED: { label: t('paymentStatus.PARTIALLY_REFUNDED'), bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400' }
  };

  const config = map[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};
