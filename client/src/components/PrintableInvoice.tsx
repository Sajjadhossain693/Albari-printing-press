import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Printer, Download, X } from 'lucide-react';
import { Order, Invoice, BusinessSettings } from '../types';

interface PrintableInvoiceProps {
  order: Order;
  invoice?: Invoice | null;
  settings?: BusinessSettings | null;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
  order,
  invoice,
  settings,
  onClose
}) => {
  const { language, formatCurrency, formatDate, formatNumber } = useLanguage();
  const { t } = useTranslation();

  const handlePrint = () => {
    window.print();
  };

  const pressName = language === 'bn'
    ? (settings?.nameBn || 'ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন')
    : (settings?.name || 'Al-Bari Press & Digital Sign');

  const address = language === 'bn'
    ? (settings?.addressBn || 'মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী।')
    : (settings?.address || "Mohammadia Hotel Lane, Opposite Hawker's Market, Maijdee, Noakhali.");

  const phone = settings?.phone || '০১৬১৮-১৮২৩৬৫';
  const email = settings?.email || 'albariprintingpress@gmail.com';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="text-sm font-semibold flex items-center gap-2">
            <span>{t('orders.cashMemo')} / {t('orders.generateInvoice')}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{t('app.print')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Cash Memo / Invoice Area */}
        <div className="p-8 bg-white text-slate-900 print:p-0 print:m-0 font-bangla" id="printable-content">
          {/* Islamic Bismillah Header */}
          <div className="text-center text-xs text-slate-600 font-medium mb-1">
            বিসমিল্লাহির রাহমানির রাহীম
          </div>

          {/* Press Title & Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/assets/albari-logo.jpg"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  {pressName}
                </h1>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  কম্পিউটার গ্রাফিক্স ডিজাইন, উন্নতমানের অফসেট ও ডিজিটাল প্রিন্টিং
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {address}
            </p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">
              মোবাইল: {phone} | ইমেইল: {email}
            </p>

            <div className="inline-block px-4 py-1 mt-3 bg-slate-900 text-white font-bold text-sm tracking-wider uppercase rounded">
              {language === 'bn' ? 'ক্যাশ মেমো / চালান' : 'CASH MEMO / INVOICE'}
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 my-4 text-xs">
            <div className="space-y-1">
              <div><span className="font-bold text-slate-700">মেমো / অর্ডার নং:</span> <span className="font-mono font-bold">{order.orderNumber}</span></div>
              <div><span className="font-bold text-slate-700">ক্রেতার নাম:</span> <span className="font-semibold">{order.customer.fullName}</span></div>
              {order.customer.organizationName && (
                <div><span className="font-bold text-slate-700">প্রতিষ্ঠান:</span> <span>{order.customer.organizationName}</span></div>
              )}
              <div><span className="font-bold text-slate-700">মোবাইল:</span> <span>{order.customer.phone}</span></div>
              {order.customer.address && (
                <div><span className="font-bold text-slate-700">ঠিকানা:</span> <span>{order.customer.address}</span></div>
              )}
            </div>
            <div className="space-y-1 text-right">
              <div><span className="font-bold text-slate-700">অর্ডারের তারিখ:</span> <span>{formatDate(order.orderDate)}</span></div>
              {order.deliveryDate && (
                <div><span className="font-bold text-slate-700">ডেলিভারির তারিখ:</span> <span>{formatDate(order.deliveryDate)}</span></div>
              )}
              <div>
                <span className="font-bold text-slate-700">পেমেন্ট অবস্থা:</span>{' '}
                <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  {t(`paymentStatus.${order.paymentStatus}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs border-collapse border border-slate-900 my-4">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-900">
                <th className="border border-slate-900 px-3 py-2 text-center w-10">নং</th>
                <th className="border border-slate-900 px-3 py-2 text-left">মালের বিবরণ ও স্পেসিফিকেশন</th>
                <th className="border border-slate-900 px-3 py-2 text-center w-20">পরিমাণ</th>
                <th className="border border-slate-900 px-3 py-2 text-right w-24">দর (টাকা)</th>
                <th className="border border-slate-900 px-3 py-2 text-right w-28">মোট টাকা</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-900/60">
                  <td className="border border-slate-900 px-3 py-2 text-center">{formatNumber(idx + 1)}</td>
                  <td className="border border-slate-900 px-3 py-2">
                    <div className="font-bold text-slate-900">{item.productNameBn || item.productName}</div>
                    {item.specifications && (
                      <div className="text-[11px] text-slate-600 mt-0.5">{item.specifications}</div>
                    )}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-medium">
                    {formatNumber(item.quantity)} {item.unitBn || item.unit}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="border border-slate-900 px-3 py-2 text-right font-bold">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Calculation Summary */}
          <div className="flex justify-between items-start my-4 text-xs">
            <div className="w-1/2 pr-4 space-y-2">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] leading-relaxed">
                <div className="font-bold text-slate-800 mb-1">শর্তাবলী:</div>
                <div className="text-slate-600 whitespace-pre-line">
                  {settings?.termsBn || '১. মালামাল ডেলিভারির সময় ভালভাবে দেখে বুঝে নিন।\n২. ডেলিভারির পর কোন অভিযোগ গ্রহণযোগ্য নয়।\n৩. বাকী টাকা পরিশোধ সাপেক্ষে পণ্য হস্তান্তর করা হবে।'}
                </div>
              </div>
            </div>

            <div className="w-1/2 pl-4">
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-700 font-semibold">উপমোট (Subtotal):</td>
                    <td className="py-1 text-right font-bold">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td className="py-1 text-slate-700 font-semibold">বিশেষ ছাড় (Discount):</td>
                      <td className="py-1 text-right font-bold text-rose-600">- {formatCurrency(order.discount)}</td>
                    </tr>
                  )}
                  {order.deliveryCharge > 0 && (
                    <tr>
                      <td className="py-1 text-slate-700 font-semibold">ডেলিভারি চার্জ:</td>
                      <td className="py-1 text-right font-bold">+ {formatCurrency(order.deliveryCharge)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-b-2 border-slate-900 text-sm font-black">
                    <td className="py-1.5 text-slate-950">সর্বমোট বিল (Net Total):</td>
                    <td className="py-1.5 text-right text-slate-950">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-700 font-bold">জমা / পরিশোধিত (Paid):</td>
                    <td className="py-1 text-right font-bold text-emerald-700">{formatCurrency(order.amountPaid)}</td>
                  </tr>
                  <tr className="border-t border-slate-300">
                    <td className="py-1 text-rose-700 font-bold text-sm">বাকী / বকেয়া (Due):</td>
                    <td className="py-1 text-right font-black text-rose-700 text-sm">{formatCurrency(order.amountDue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature Area */}
          <div className="flex justify-between items-end pt-12 mt-8 text-xs font-bold text-slate-800 border-t border-dashed border-slate-300">
            <div className="text-center w-36 border-t border-slate-700 pt-1">
              ক্রেতার স্বাক্ষর
            </div>
            <div className="text-center text-[10px] text-slate-400">
              আল-বারী প্রেস ম্যানেজমেন্ট সিস্টেম দ্বারা প্রস্তুতকৃত
            </div>
            <div className="text-center w-40 border-t border-slate-700 pt-1">
              কর্তৃপক্ষের স্বাক্ষর
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
