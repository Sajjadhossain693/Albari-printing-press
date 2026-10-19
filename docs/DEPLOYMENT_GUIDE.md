# Deployment & Operations Guide
## Al-Bari Press & Digital Sign Management System

### 1. Local Development Setup

#### Prerequisites
- Node.js (v18 or higher; tested on v26.12.0)
- npm (v9 or higher)

#### Quick Start
```bash
# Clone or navigate to the repository
cd /home/Siam/Downloads/Albari

# Install dependencies (root, server, client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Setup Database & Seed Initial Al-Bari Press Data
cd server
npx prisma db push
npm run seed
cd ..

# Run both Backend & Frontend concurrently
npm run dev
```

The application will be available at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`

---

### 2. Default Seeded Credentials

| Role | Username | Password | Full Name |
|---|---|---|---|
| **মালিক (Super Admin / Owner)** | `admin` | `admin123` | Al-Bari Press Owner |
| **ম্যানেজার (Manager)** | `manager` | `manager123` | Kabir Hossain |
| **ডিজাইনার (Graphic Designer)** | `designer` | `designer123` | Zahid Sir |
| **অপারেটর (Production Staff)** | `staff` | `staff123` | Rahim Mia |
| **গ্রাহক (Customer Demo)** | `01978100252` | `customer123` | Paramount Zone |

---

### 3. Production Deployment Architecture

#### Option A: Single VPS (Ubuntu / Debian) with Nginx & PM2
1. **Server Build**:
   ```bash
   cd server && npm run build
   ```
2. **Client Build**:
   ```bash
   cd client && npm run build
   ```
3. **Run Backend with PM2**:
   ```bash
   pm2 start dist/index.js --name albari-press-server
   ```
4. **Nginx Reverse Proxy**:
   Configure Nginx to serve `client/dist` statically and proxy `/api` and `/uploads` requests to `http://127.0.0.1:5000`.

#### Option B: PostgreSQL Database Switch
In `server/prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Set `DATABASE_URL="postgresql://user:password@localhost:5432/albari_db?schema=public"` in `server/.env`, then execute:
```bash
npx prisma db push
npm run seed
```

---

### 4. Backup & Disaster Recovery
- **SQLite Database**: Back up `server/dev.db` using a daily cron job:
  ```bash
  sqlite3 server/dev.db ".backup 'backups/albari_backup_$(date +%Y%m%d).db'"
  ```
- **Artwork & Uploads**: Synchronize `server/uploads/` to persistent cloud object storage (AWS S3, Cloudflare R2, or Wasabi).
