# User Guide (English)
## Al-Bari Press & Digital Sign Management Platform (Maijdee, Noakhali)

Welcome to the Al-Bari Press management system. This guide walks you through the core operational workflows of the platform.

---

### 1. Signing In & Role Credentials
Navigate to `http://localhost:5173/login`:
- **Owner / Super Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Graphic Designer**: `designer` / `designer123`
- **Production Staff**: `staff` / `staff123`
- **Customer (Demo)**: `01978100252` / `customer123`

You may also click the quick-demo account pills on the login page for instantaneous credential fill.

---

### 2. Language Switcher (Bengali / English)
- Use the **বাংলা / English** toggle in the top navbar.
- The interface updates in real-time without reloading the page or losing form progress.

---

### 3. Creating an Order & Collecting Advances
1. Click **"New Order"** from the Dashboard or Orders page.
2. Select an existing client from the dropdown or type in the name, phone number, and address of a new client.
3. Choose products from the catalog (e.g., Visiting Cards, Doctor Files, Waz Posters, Cash Memos, Crests).
4. Enter quantities and unit rates; subtotals and grand totals calculate automatically.
5. Apply discounts or delivery charges if applicable.
6. Enter the advance amount collected and select the payment channel (Cash, bKash, Nagad, Bank).
7. Click **"Confirm Order"**. The order is generated with a unique code (e.g. `PR-2026-0001`) and a linked production job.

---

### 4. Printing Cash Memos
1. Click the **Printer** icon next to any order record.
2. An authentic Bangladeshi cash memo preview opens, displaying the Islamic Bismillah invocation, press branding, itemized table, total, amount paid, balance due, and signature blocks.
3. Click **"Print"** to send directly to your connected printer.

---

### 5. AI Graphic Design Studio
1. Select **"AI Design Studio"** from the navigation sidebar.
2. Choose a category (e.g., School Crest, Poster, Banner, Visiting Card).
3. Enter your design instructions in Bengali or English.
   *Example*: "Design a modern gold and navy school crest with an open book in center, school name on top, and established year 1995 at bottom."
4. Click **"Generate AI Artwork"**.
5. Inspect the generated high-resolution preview.
6. Request adjustments in the revision box or save directly to the persistent **Design Library**.

---

### 6. Production Workflow & Waste Tracking
1. Navigate to **"Production Management"**.
2. Advance jobs through the 9 stages: Order Confirmed -> Design Prep -> Customer Approval -> Prepress Plates -> Machine Printing -> Finishing/Lamination -> Quality Check -> Ready for Delivery -> Delivered.
3. Record quantities produced alongside wasted/damaged sheets for accurate factory accounting.

---

### 7. Collecting Due Payments
1. In the Orders table, click the **Credit Card (Collect Payment)** icon for orders with outstanding balances.
2. Enter the collected sum and specify payment channel (Cash, bKash, Nagad, Bank). For mobile money, input the TrxID.
3. Save to update customer dues immediately and append the transaction to the payment ledger.

---

### 8. Logging Operational Expenses
1. Go to **"Expenses"** in the sidebar.
2. Click **"Add Expense"** to record purchases for paper stocks, toner/inks, utility bills, machine servicing, or staff payroll.

---

### 9. Public Storefront & Customer Order Tracking
- Clients can browse the public showcase at `http://localhost:5173/storefront` to view genuine samples and submit online order requests.
- Clients can track progress at `http://localhost:5173/track` using their order number and phone number.
