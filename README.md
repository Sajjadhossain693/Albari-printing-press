# Complete Printing Press Management & AI Design Platform
## আল-বারী প্রেস এন্ড ডিজিটাল সাইন (Al-Bari Press & Digital Sign)

A complete, production-ready Printing Press Management Web Application designed specifically for **"ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন"** (Al-Bari Press & Digital Sign), located in **Maijdee, Noakhali, Bangladesh**.

---

## 🌟 Key Highlights & Capabilities

- **Bilingual Interface (বাংলা & English)**: Bengali is the primary and default interface language with real-time switching without page reloads or loss of form state.
- **Traditional Printing Press Cash Memos**: Authentic printable cash memos with Bismillah header, itemized tables, advance/due calculations, and signature blocks.
- **AI Graphic Design Studio**: AI-assisted design generator supporting prompts in Bengali and English for school/college crests, posters, banners, visiting cards, and doctor prescription files.
- **Authoritative Financial Accounting**: Accurate calculations for subtotal, volume discounts, delivery charges, advance collections, customer dues, and operational expenses.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Super Admin / Owner, Manager, Graphic Designer, Production Operator, and Customer.
- **9-Stage Production Tracking Board**: Tracks prepress, offset printing, lamination/finishing, and sheet waste independently of payment status.
- **Public Storefront & Secure Order Tracking**: Customer showcase featuring genuine Al-Bari Press products and privacy-preserving order tracking.
- **Genuine Printing Press Media**: Built-in integration with the real photos and assets of Al-Bari Press.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+; verified on v26.12.0)
- npm (v9+; verified on v12.2.1)

### 2. Installation
```bash
# Clone or navigate to the repository
cd /home/Siam/Downloads/Albari

# Install dependencies for root, server, and client
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Database Initialization & Seeding
```bash
cd server
# Push relational database schema to SQLite (dev.db)
npx prisma db push

# Seed authentic Al-Bari Press products, customers, orders, and ledger
npm run seed
cd ..
```

### 4. Run the Development Servers
```bash
# Starts both Express API server (port 5001) and Vite frontend (port 5173) concurrently
npm run dev
```

Visit the application in your browser:
- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Public Storefront**: [http://localhost:5173/storefront](http://localhost:5173/storefront)
- **Order Tracking**: [http://localhost:5173/track](http://localhost:5173/track)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🔑 Default Seeded Accounts

| Role | Username | Password | Full Name |
|---|---|---|---|
| **মালিক (Super Admin / Owner)** | `admin` | `admin123` | Al-Bari Press Owner |
| **ম্যানেজার (Manager)** | `manager` | `manager123` | Kabir Hossain |
| **ডিজাইনার (Graphic Designer)** | `designer` | `designer123` | Zahid Sir |
| **অপারেটর (Production Staff)** | `staff` | `staff123` | Rahim Mia |
| **গ্রাহক (Customer)** | `01978100252` | `customer123` | Paramount Zone |

*(Tip: You can click the one-click demo chips on the login page for instantaneous fill).*

---

## 🧪 Automated Testing

Automated unit and integration test suite authored in Vitest & Supertest:
```bash
cd server
npm run test
```
**Test Results**: All 9 automated tests passing:
- Subtotal, discount, delivery charge, and grand total calculations
- Non-negative boundary checks
- Payment status state machine (Unpaid -> Partially Paid -> Paid -> Refunded)
- Bengali numeral conversion
- API health, products, categories, login, and order tracking endpoints

---

## 📚 Complete Project Documentation

Detailed architecture and user guides are available in the [`docs/`](file:///home/Siam/Downloads/Albari/docs) directory:
- [**Product Requirements Document (PRD.md)**](file:///home/Siam/Downloads/Albari/docs/PRD.md)
- [**Technical Requirements Document (TRD.md)**](file:///home/Siam/Downloads/Albari/docs/TRD.md)
- [**Database Schema & ER Diagram (DATABASE_SCHEMA.md)**](file:///home/Siam/Downloads/Albari/docs/DATABASE_SCHEMA.md)
- [**REST API Documentation (API_DOCUMENTATION.md)**](file:///home/Siam/Downloads/Albari/docs/API_DOCUMENTATION.md)
- [**Security & Privacy Policy (SECURITY.md)**](file:///home/Siam/Downloads/Albari/docs/SECURITY.md)
- [**Deployment & Backup Guide (DEPLOYMENT_GUIDE.md)**](file:///home/Siam/Downloads/Albari/docs/DEPLOYMENT_GUIDE.md)
- [**Testing Guide (TESTING_GUIDE.md)**](file:///home/Siam/Downloads/Albari/docs/TESTING_GUIDE.md)
- [**বাংলা ব্যবহারকারী নির্দেশিকা (USER_GUIDE_BN.md)**](file:///home/Siam/Downloads/Albari/docs/USER_GUIDE_BN.md)
- [**English User Guide (USER_GUIDE_EN.md)**](file:///home/Siam/Downloads/Albari/docs/USER_GUIDE_EN.md)

---

## 🏢 Business Contact Information
**ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন**  
মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী।  
হটলাইন: **০১৬১৮-১৮২৩৬৫**  
ইমেইল: **albariprintingpress@gmail.com**
