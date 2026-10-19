# Product Requirements Document (PRD)
## Complete Printing Press Management & AI Design Platform for Al-Bari Press (আল-বারী প্রেস এন্ড ডিজিটাল সাইন)

**Organization**: ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন  
**Location**: মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী।  
**Hotline**: 01618-182365  
**Email**: albariprintingpress@gmail.com  
**Version**: 1.0.0  
**Target Locale**: Bengali (বাংলা - Primary) and English (Secondary)  
**Currency**: Bangladeshi Taka (BDT, ৳)  
**Timezone**: Bangladesh Standard Time (Asia/Dhaka)  

---

## 1. Executive Summary

Al-Bari Press is an established commercial printing and digital signage enterprise operating in Maijdee, Noakhali, Bangladesh. This platform provides an end-to-end, production-ready enterprise management system coupled with an AI-assisted graphic design studio tailored specifically for Bangladeshi printing press operations.

The system replaces manual pen-and-paper cash memos and disorganized customer ledgers with automated billing, inventory/product cataloging, production job tracking, financial reporting (cash vs accrual), and an AI creative design suite.

---

## 2. Key Objectives & Scope

1. **Bilingual First-Class Localization**:
   - Default to Bengali across all interfaces, forms, validation messages, tables, printable cash memos, and reports.
   - Non-destructive language switcher allowing instant transition to English without data loss.
2. **Order Lifecycle & Tracking**:
   - Standardized order numbering (`PR-YYYY-XXXX`).
   - Line-item breakdown with custom dimensions, paper weights, finishing, and unit pricing.
   - Decoupled payment status (Unpaid, Partially Paid, Paid) and production status (Pending, In Production, Quality Check, Ready for Delivery, Delivered).
3. **Financial Accounting Integrity**:
   - Automatic calculation of subtotal, discount, delivery charges, paid amounts, and outstanding balances.
   - Multi-channel collection tracking: Cash, bKash, Nagad, Bank Transfer, and Cheques.
   - Operational expense tracking (paper, ink, machine maintenance, salaries, utilities) and gross/net profit reporting.
4. **AI Graphic Design Studio**:
   - Natural language graphic generation supporting prompts in Bengali and English.
   - Direct integration with high-resolution AI synthesis (Flux / Pollinations / OpenAI / Gemini) and local template fallbacks.
   - Revision management, canvas preview, and export to persistent design library.
5. **Authentic Printing Press Output**:
   - Printable traditional cash memos with Islamic Bismillah header, press branding, itemized tables, in-words amount, and authorized signatures.
6. **Public Storefront & Customer Portal**:
   - Showcase of real printed products (doctor prescription files, visiting cards, cash memos, wooden crests, flex banners, seals).
   - Secure order tracking via unique token or Order # + phone verification.

---

## 3. User Personas & Access Control

| Role | Bengali Title | Responsibilities | Access Scope |
|---|---|---|---|
| **Super Admin / Owner** | মালিক / প্রেস স্বত্বাধিকারী | Complete business administration, pricing, reports, staff access | Full unrestricted system access |
| **Manager** | ম্যানেজার | Order creation, customer management, recording payments and expenses | All operational modules, non-admin settings |
| **Designer** | গ্রাফিক্স ডিজাইনার | Artwork creation, AI studio generation, proof submission, revision handling | Design studio, library, assigned orders |
| **Production Staff** | প্রিন্টিং অপারেটর | Machine operation, prepress, stage updates, waste recording | Production job tracking, job notes |
| **Customer** | গ্রাহক / ক্লায়েন্ট | Online order request, tracking order status, viewing invoices | Public portal, personal order tracking |

---

## 4. Functional Modules

### 4.1 Dashboard
- **KPI Metrics**: Today's Sales, Month's Sales, Total Cash Collected, Outstanding Dues, Operational Expenses, Estimated Gross Profit.
- **Production Counters**: Orders Pending, In Production, Ready for Delivery, Delivered.
- **Visual Analytics**: Monthly Sales Bar Chart, Order Status Distribution Donut Chart.
- **Operational Feeds**: Recent Orders, Upcoming Delivery Deadlines, Top Ordered Products.

### 4.2 Order Management
- Order number format: `PR-2026-XXXX`.
- Dynamic multi-item entry with unit support: Piece (টি), Set (সেট), Copy (কপি/বই), Page (পাতা), Sqft (বর্গফুট), Dozen (ডজন).
- Customer instructions, priority flags (Low, Normal, High, Urgent), and internal production notes.

### 4.3 Customer Database
- Customer code: `CUST-XXXX`.
- Segregation: Individual, Business, School/College, University, Organization, Reseller.
- Aggregated ledger tracking: Total billed, total paid, current balance due.
- Export customer records to CSV.

### 4.4 Products & Services Catalog
- Categorized items with base pricing and media specs:
  - Doctor Prescription Files (ডাঃ ফাইল ও প্রেসক্রিপশন ফোল্ডার)
  - Smart Business Visiting Cards (স্মার্ট বিজনেস ভিজিটিং কার্ড)
  - Cash Memo & Voucher Pads (ক্যাশ মেমো ও ভাউচার বই)
  - Honorary Crests & Medals (উডেন ও গোল্ডেন মেটালিক ক্রেস্ট)
  - Automatic Self-Inking Flash Stamps (ফ্ল্যাশ ও অটোমেটিক রাবার সীল)
  - Islamic Waz Mahfil Posters (ওয়াজ মাহফিল ও ধর্মীয় কনফারেন্স পোস্টার)
  - Large Format PVC Flex Banners (ডিজিটাল পিভিসি ও প্যানাফ্লেক্স ব্যানার)
  - Restaurant Menu Cards & Food Brochures (রেস্টুরেন্ট মেনু কার্ড ও ফুড ব্রোশিউর)

### 4.5 AI Graphic Design Studio & Library
- Bengali & English prompt processing with printing-specific prompt enrichment (CMYK, 300 DPI, vector balance).
- Category templates, aspect ratio selection (1:1, 4:5, 16:9, 9:16), brand color palettes, and visual style presets.
- Iterative design revisions and variation generation.
- Searchable design asset library with revision history and high-resolution asset downloads.

### 4.6 Production Management
- 9-Stage production pipeline:
  1. Order Confirmed (অর্ডার নিশ্চিত)
  2. Design Preparation (ডিজাইন প্রস্তুতি)
  3. Customer Approval (গ্রাহক অনুমোদন)
  4. Prepress Preparation (প্রি-প্রেস প্লেট তৈরি)
  5. Printing (মেশিন প্রিন্টিং চলছে)
  6. Finishing (ল্যামিনেশন ও কাটিং/বাইন্ডিং)
  7. Quality Check (মান যাচাই)
  8. Ready for Delivery (ডেলিভারির জন্য প্রস্তুত)
  9. Delivered (ডেলিভারি সম্পন্ন)
- Waste / sheet rejection tracking, machine operator assignment, and production notes.

### 4.7 Cash Memos & Invoices
- Traditional Bangladeshi printing press cash memo layout matching original Al-Bari Press stationery.
- Real-time client printing (`window.print()`) with print CSS omitting UI chrome.

### 4.8 Expenses & Financial Reports
- Expense categories: Paper & Raw Materials, Ink & Toner, Production Costs, Electricity, Machine Maintenance, Staff Salary, Rent, Delivery, Packaging, Other.
- Authoritative cash flow and gross profit calculations.
