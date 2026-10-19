# Testing Guide & Verification Report
## Al-Bari Press & Digital Sign Management System

### 1. Test Suite Overview

Automated tests are authored using Vitest and Supertest covering:
- Mathematical correctness of order calculations, discounts, delivery fees, and grand totals.
- Authoritative payment status state machine (Unpaid -> Partially Paid -> Paid -> Refunded).
- Bengali numeral conversions.
- HTTP API endpoints (Health check, categories, products, authentication, order tracking).

---

### 2. Running Automated Tests

To run the complete automated test suite:

```bash
cd server
npm run test
```

### 3. Test Cases Verified

1. **`calculateOrderTotals`**:
   - Accurately sums item quantities multiplied by unit prices.
   - Accurately deducts discounts and applies delivery/additional charges.
   - Prevents negative total billing if discount exceeds subtotal.
2. **`determinePaymentStatus`**:
   - Asserts `UNPAID` when zero payment is recorded.
   - Asserts `PARTIALLY_PAID` when advance is less than total amount.
   - Asserts `PAID` when net payments equal or exceed total amount.
   - Asserts `REFUNDED` / `PARTIALLY_REFUNDED` when refunds are allocated.
3. **`toBengaliNumerals` & `toEnglishNumerals`**:
   - Correctly transforms numerals: `123450` <-> `১২৩৪৫০`.
4. **`GET /health`**:
   - Returns HTTP 200 with `{ status: "online", app: "Al-Bari Press..." }`.
5. **`GET /api/categories` & `GET /api/products`**:
   - Returns valid JSON arrays of printing items.
6. **`POST /api/auth/login`**:
   - Validates admin credentials and issues valid signed JWT.
7. **`GET /api/orders/track`**:
   - Verifies secure tracking via token without revealing sensitive customer profile data.

---

### 4. Manual Verification Checklist

- [x] Bengali is the default language on first load.
- [x] English toggle operates instantaneously without reloading the window.
- [x] Currency is consistently displayed with Bangladeshi Taka (৳).
- [x] Dates format according to Bangladesh Standard Time (Asia/Dhaka).
- [x] Printable cash memo reflects authentic Al-Bari Press stationery and formats cleanly for A4/Letter thermal printing.
- [x] Design Studio AI generation accepts Bengali prompts and renders artwork with high resolution.
- [x] Production workflow tracks stage progress from prepress to delivery.
