// Convert English digits to Bengali digits
export function toBengaliNumerals(val: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
}

// Convert Bengali digits to English digits
export function toEnglishNumerals(val: string): string {
  const bnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return val.replace(/[০-৯]/g, (w) => bnMap[w] || w);
}

// Format currency as BDT (৳)
export function formatBDT(amount: number, locale: 'bn' | 'en' = 'bn'): string {
  const formatted = amount.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `৳${formatted}`;
}

// Generate human-readable serial codes (PR-2026-0001, PAY-2026-0001, etc.)
export function generateCode(prefix: string, sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(4, '0');
  return `${prefix}-${year}-${padded}`;
}

// Convert amount in numbers to words (Bengali and English)
export function amountInWordsBn(amount: number): string {
  // Simple representation for cash memo
  const num = Math.round(amount);
  return `${toBengaliNumerals(num)} টাকা মাত্র`;
}

export function amountInWordsEn(amount: number): string {
  const num = Math.round(amount);
  return `${num} Taka Only`;
}
