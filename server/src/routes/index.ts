import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { login, registerCustomer, getMe, getStaffList, createStaff, updateStaff, deleteStaff } from '../controllers/authController.js';
import { getOrders, getOrderById, createOrder, updateProductionStatus, updatePaymentStatus, trackOrderPublic } from '../controllers/orderController.js';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, exportCustomersCsv } from '../controllers/customerController.js';
import { getProducts, getProductById, createProduct, updateProduct, getCategories } from '../controllers/productController.js';
import { getPayments, recordPayment, processRefund } from '../controllers/paymentController.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { getInvoices, getInvoiceByOrderId } from '../controllers/invoiceController.js';
import { generateAIDesign, getDesigns, saveDesign, updateDesignStatus } from '../controllers/designController.js';
import { getProductionJobs, updateProductionJob } from '../controllers/productionController.js';
import { getDashboardStats } from '../controllers/reportController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Configure Multer for File Uploads
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for heavy print files
});

// File Upload Endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// Auth Routes
router.post('/auth/login', login);
router.post('/auth/register', registerCustomer);
router.get('/auth/me', authenticate, getMe);
router.get('/auth/staff', authenticate, authorize('OWNER', 'MANAGER'), getStaffList);
router.post('/auth/staff', authenticate, authorize('OWNER'), createStaff);
router.put('/auth/staff/:id', authenticate, authorize('OWNER'), updateStaff);
router.delete('/auth/staff/:id', authenticate, authorize('OWNER'), deleteStaff);

// Public Order Tracking
router.get('/orders/track', trackOrderPublic);

// Orders Routes
router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrderById);
router.post('/orders', authenticate, createOrder);
router.patch('/orders/:id/status', authenticate, authorize('OWNER', 'MANAGER', 'STAFF'), updateProductionStatus);
router.patch('/orders/:id/payment-status', authenticate, authorize('OWNER', 'MANAGER'), updatePaymentStatus);

// Public Guest Order Submission (from website storefront)
router.post('/public/orders', createOrder);

// Customers Routes
router.get('/customers', authenticate, getCustomers);
router.get('/customers/export', authenticate, authorize('OWNER', 'MANAGER'), exportCustomersCsv);
router.get('/customers/:id', authenticate, getCustomerById);
router.post('/customers', authenticate, createCustomer);
router.put('/customers/:id', authenticate, updateCustomer);

// Products & Categories Routes (Public read for storefront, authenticated edit)
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authenticate, authorize('OWNER', 'MANAGER'), createProduct);
router.put('/products/:id', authenticate, authorize('OWNER', 'MANAGER'), updateProduct);

// Payments & Refunds
router.get('/payments', authenticate, getPayments);
router.post('/payments', authenticate, authorize('OWNER', 'MANAGER'), recordPayment);
router.post('/refunds', authenticate, authorize('OWNER'), processRefund);

// Expenses
router.get('/expenses', authenticate, getExpenses);
router.post('/expenses', authenticate, authorize('OWNER', 'MANAGER'), createExpense);
router.delete('/expenses/:id', authenticate, authorize('OWNER'), deleteExpense);

// Invoices
router.get('/invoices', authenticate, getInvoices);
router.get('/invoices/order/:orderId', authenticate, getInvoiceByOrderId);

// AI Design Studio & Library
router.post('/designs/ai-generate', authenticate, generateAIDesign);
router.get('/designs', authenticate, getDesigns);
router.post('/designs', authenticate, saveDesign);
router.patch('/designs/:id/status', authenticate, updateDesignStatus);

// Production Workflow
router.get('/production', authenticate, getProductionJobs);
router.patch('/production/:id', authenticate, authorize('OWNER', 'MANAGER', 'STAFF'), updateProductionJob);

// Dashboard & Analytics
router.get('/reports/dashboard', authenticate, getDashboardStats);

// Business Settings
router.get('/settings', getSettings);
router.put('/settings', authenticate, authorize('OWNER'), updateSettings);

export default router;
