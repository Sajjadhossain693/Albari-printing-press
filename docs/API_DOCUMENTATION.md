# REST API Documentation
## Al-Bari Press & Digital Sign Management System

Base URL: `http://localhost:5000/api`

---

### 1. Authentication Endpoints

#### `POST /auth/login`
Authenticates a user and issues a signed JWT token.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "fullName": "Al-Bari Press Owner",
      "role": "OWNER"
    }
  }
  ```

#### `POST /auth/register`
Self-service customer registration or portal onboarding.
- **Request Body**: `fullName`, `phone`, `password`, `email`, `address`, `organizationName`

#### `GET /auth/me`
Fetches current logged in user profile (Requires `Bearer <token>`).

#### `GET /auth/staff`
Lists press team members (Requires `OWNER` or `MANAGER` role).

#### `POST /auth/staff`
Creates staff credentials for Designer, Manager, or Operator (Requires `OWNER` role).

---

### 2. Orders Endpoints

#### `GET /orders`
Retrieves paginated orders with filters.
- **Query Parameters**:
  - `search`: Case-insensitive search across order number, customer name, phone.
  - `productionStatus`: `ALL`, `PENDING`, `CONFIRMED`, `IN_PRODUCTION`, `QUALITY_CHECK`, `READY_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`
  - `paymentStatus`: `ALL`, `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`
  - `startDate`, `endDate`: ISO Date strings
  - `page`, `limit`: Pagination parameters

#### `GET /orders/:id`
Retrieves detailed order record including items, payment ledger, production jobs, and status history.

#### `POST /orders`
Creates a new order with authoritative server calculations and initial advance payment handling.
- **Request Body**:
  ```json
  {
    "customerId": "uuid",
    "customerName": "জাহিদ স্যার",
    "customerPhone": "01978100252",
    "deliveryDate": "2026-10-25T00:00:00Z",
    "priority": "HIGH",
    "items": [
      {
        "productId": "uuid",
        "productName": "স্পোকেন ইংলিশ পোস্টার",
        "quantity": 1000,
        "unit": "COPY",
        "unitBn": "কপি",
        "unitPrice": 6.5
      }
    ],
    "discount": 200,
    "deliveryCharge": 100,
    "advancePayment": 3000,
    "paymentMethod": "BKASH"
  }
  ```

#### `PATCH /orders/:id/status`
Updates production lifecycle state with audit notes.

#### `GET /orders/track`
Public tracking endpoint (zero customer sensitive data exposed).
- **Query Parameters**:
  - `token`: 32-character tracking token, OR
  - `orderNumber` AND `phone`: Dual-factor verification.

---

### 3. Payments & Receipts

#### `GET /payments`
Returns payment ledger with filter by payment method.

#### `POST /payments`
Records advance or due collection for an order.
- **Request Body**:
  ```json
  {
    "orderId": "uuid",
    "amount": 3300,
    "method": "BKASH",
    "referenceNumber": "TrxID: BK789X10Q",
    "notes": "Due clearance"
  }
  ```

#### `POST /refunds`
Processes audited refund and adjusts order amount due and payment status.

---

### 4. AI Graphic Design Studio

#### `POST /designs/ai-generate`
Generates high-resolution artwork from natural language prompts.
- **Request Body**:
  ```json
  {
    "prompt": "একটি আধুনিক স্কুলের ক্রেস্ট ডিজাইন করো। নীল ও সোনালি রং ব্যবহার করবে। মাঝখানে খোলা বই...",
    "category": "School or College Crest",
    "aspectRatio": "1:1",
    "colorPalette": "Navy & Gold",
    "style": "Modern Vector / Metallic Foil",
    "revisionPrompt": "Add school establishment year 1995"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "imageUrl": "https://image.pollinations.ai/prompt/...",
      "promptUsed": "...",
      "provider": "pollinations (Flux)",
      "metadata": { "width": 1024, "height": 1024 }
    }
  }
  ```

#### `GET /designs`
Retrieves searchable design assets.

#### `POST /designs`
Saves generated or uploaded artwork to the persistent design library.

---

### 5. Invoices & Expenses

#### `GET /invoices`
Lists generated invoices.

#### `GET /invoices/order/:orderId`
Fetches or auto-generates invoice data formatted for printing.

#### `GET /expenses`
Lists expenses with aggregated total amount sum.

#### `POST /expenses`
Creates operational expense record.

#### `GET /reports/dashboard`
Returns live financial KPIs, recent feeds, top products, and Recharts graph datasets.

#### `GET /settings` and `PUT /settings`
Reads and updates business settings.
