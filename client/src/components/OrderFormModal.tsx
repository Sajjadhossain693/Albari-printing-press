import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../services/api';
import { Product, Customer } from '../types';
import { X, Plus, Trash2, Calculator, CheckCircle2 } from 'lucide-react';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useLanguage();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [customerNotes, setCustomerNotes] = useState('');

  const [items, setItems] = useState<any[]>([
    {
      productId: '',
      productName: '',
      productNameBn: '',
      specifications: '',
      quantity: 1,
      unit: 'PIECE',
      unitBn: 'টি',
      unitPrice: 0,
      subtotal: 0
    }
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [custRes, prodRes] = await Promise.all([
        apiRequest<{ customers: Customer[] }>('/customers?limit=100'),
        apiRequest<{ products: Product[] }>('/products?activeOnly=true')
      ]);
      setCustomers(custRes.customers || []);
      setProducts(prodRes.products || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find(c => c.id === id);
    if (found) {
      setCustomerName(found.fullName);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    const updated = [...items];
    if (prod) {
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        productName: prod.name,
        productNameBn: prod.nameBn,
        unit: prod.unit,
        unitBn: prod.unitBn,
        unitPrice: prod.basePrice,
        specifications: prod.materialBn || prod.material || '',
        subtotal: updated[index].quantity * prod.basePrice
      };
    } else {
      updated[index].productId = '';
    }
    setItems(updated);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Math.max(0, parseFloat(updated[index].quantity) || 0);
      const p = Math.max(0, parseFloat(updated[index].unitPrice) || 0);
      updated[index].subtotal = Math.round(q * p * 100) / 100;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productId: '',
        productName: '',
        productNameBn: '',
        specifications: '',
        quantity: 1,
        unit: 'PIECE',
        unitBn: 'টি',
        unitPrice: 0,
        subtotal: 0
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0);
  const totalAmount = Math.max(0, subtotal - discount + deliveryCharge + additionalCharges);
  const dueAmount = Math.max(0, totalAmount - advancePayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId && (!customerName || !customerPhone)) {
      setError('গ্রাহকের নাম ও মোবাইল নম্বর আবশ্যক');
      return;
    }

    if (items.some(it => !it.productName || it.quantity <= 0)) {
      setError('প্রতিটি পণ্যের নাম ও সঠিক পরিমাণ আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId || undefined,
          customerName,
          customerPhone,
          customerAddress,
          deliveryDate: deliveryDate || undefined,
          priority,
          items,
          discount,
          deliveryCharge,
          additionalCharges,
          advancePayment,
          paymentMethod,
          customerNotes
        })
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'অর্ডার তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{t('orders.addNew')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">নতুন ছাপাখানা অর্ডার তথ্য ও বিলিং</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Customer Selection / Entry */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              গ্রাহকের তথ্য
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">পূর্বের গ্রাহক বেছে নিন</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">-- নতুন গ্রাহক --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: জাহিদ স্যার"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">ঠিকানা / প্রতিষ্ঠান</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="যেমন: মাইজদী, নোয়াখালী"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ডেলিভারি তারিখ</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                পণ্যের তালিকা ও স্পেসিফিকেশন
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 text-blue-600 bg-blue-50 dark:bg-blue-950/50 rounded-lg hover:bg-blue-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>আইটেম যোগ করুন</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">পণ্য সিলেক্ট করুন</label>
                    <select
                      value={it.productId}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="">-- কাস্টম পণ্য --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.nameBn} (৳{p.basePrice})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">পণ্যের নাম *</label>
                    <input
                      type="text"
                      required
                      value={it.productNameBn || it.productName}
                      onChange={(e) => handleItemChange(idx, 'productNameBn', e.target.value)}
                      placeholder="বিবরণ"
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">পরিমাণ ও একক</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                      />
                      <input
                        type="text"
                        value={it.unitBn}
                        onChange={(e) => handleItemChange(idx, 'unitBn', e.target.value)}
                        placeholder="টি"
                        className="w-12 text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">দর (৳)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={it.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-bold"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">মোট</label>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ৳{it.subtotal}
                    </span>
                  </div>

                  <div className="sm:col-span-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Advance Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <label className="block text-xs font-semibold">গ্রাহকের বিশেষ নির্দেশনা বা সাইজ নোট</label>
              <textarea
                rows={3}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="ডিজাইন বা প্রিন্টিং সম্পর্কে বিশেষ নির্দেশনা..."
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span>উপমোট (Subtotal):</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>ছাড় (Discount):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 text-right p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div className="flex justify-between items-center py-1">
                <span>ডেলিভারি চার্জ:</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 text-right p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-b border-slate-300 dark:border-slate-700 font-bold text-sm">
                <span>সর্বমোট বিল (Total):</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-emerald-600">অগ্রিম জমা (Advance):</span>
                <div className="flex items-center gap-1">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="p-1 text-[11px] rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK_TRANSFER">Bank</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 text-right p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center py-1 text-rose-600 font-bold">
                <span>অবশিষ্ট বকেয়া (Due):</span>
                <span>{formatCurrency(dueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? t('app.loading') : 'অর্ডার নিশ্চিত করুন'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
