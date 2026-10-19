export type UserRole = 'OWNER' | 'MANAGER' | 'DESIGNER' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  fullNameBn?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  active: boolean;
  avatar?: string | null;
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  fullNameBn?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  addressBn?: string | null;
  customerType: string;
  organizationName?: string | null;
  notes?: string | null;
  totalOrders?: number;
  totalSpent?: number;
  totalPaid?: number;
  currentDue?: number;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon?: string | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number };
}

export interface Product {
  id: string;
  categoryId: string;
  category?: ProductCategory;
  name: string;
  nameBn: string;
  slug: string;
  description?: string | null;
  descriptionBn?: string | null;
  basePrice: number;
  unit: string;
  unitBn: string;
  availableSizes?: string | null;
  material?: string | null;
  materialBn?: string | null;
  printingOptions?: string | null;
  finishingOptions?: string | null;
  leadTimeDays: number;
  imageUrl?: string | null;
  active: boolean;
}

export type ProductionStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface OrderItem {
  id?: string;
  productId?: string | null;
  productName: string;
  productNameBn?: string | null;
  specifications?: string | null;
  quantity: number;
  unit: string;
  unitBn?: string | null;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  createdById: string;
  createdBy?: { id: string; fullName: string; role: string };
  assignedDesignerId?: string | null;
  assignedDesigner?: { id: string; fullName: string } | null;
  assignedStaffId?: string | null;
  assignedStaff?: { id: string; fullName: string } | null;
  orderDate: string;
  deliveryDate?: string | null;
  productionStatus: ProductionStatus;
  paymentStatus: PaymentStatus;
  priority: Priority;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  additionalCharges: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  customerNotes?: string | null;
  internalNotes?: string | null;
  trackingToken: string;
  designAttachment?: string | null;
  items: OrderItem[];
  payments?: Payment[];
  statusHistory?: any[];
  productionJobs?: ProductionJob[];
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  orderId: string;
  order?: { id: string; orderNumber: string; totalAmount: number };
  customerId: string;
  customer?: { id: string; fullName: string; phone: string };
  amount: number;
  method: string;
  referenceNumber?: string | null;
  paymentDate: string;
  receivedById: string;
  receivedBy?: { id: string; fullName: string };
  notes?: string | null;
  receiptNumber?: string | null;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: string;
  categoryBn?: string | null;
  amount: number;
  paymentMethod: string;
  vendor?: string | null;
  description: string;
  date: string;
  receiptAttachment?: string | null;
  createdById: string;
  createdBy?: { fullName: string };
  approved: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order: Order;
  customerId: string;
  customer: Customer;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  additionalCharges: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  termsConditions?: string | null;
  termsConditionsBn?: string | null;
}

export interface DesignAsset {
  id: string;
  designCode: string;
  title: string;
  titleBn?: string | null;
  category: string;
  customerId?: string | null;
  customer?: { id: string; fullName: string } | null;
  designerId?: string | null;
  designer?: { id: string; fullName: string } | null;
  prompt?: string | null;
  artworkUrl: string;
  revisionNumber: number;
  status: string;
  dimensions?: string | null;
  colorMode?: string | null;
  resolution?: string | null;
  printSpecs?: string | null;
  notes?: string | null;
  revisions?: any[];
  createdAt: string;
}

export interface ProductionJob {
  id: string;
  jobCode: string;
  orderId: string;
  order?: Order;
  assignedStaffId?: string | null;
  assignedStaff?: { id: string; fullName: string } | null;
  stage: string;
  stageBn?: string | null;
  quantityOrdered: number;
  quantityProduced: number;
  quantityWasted: number;
  machineNotes?: string | null;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface BusinessSettings {
  id: string;
  name: string;
  nameBn: string;
  address: string;
  addressBn: string;
  phone: string;
  email: string;
  logoUrl: string;
  currencySymbol: string;
  currencyCode: string;
  invoicePrefix: string;
  orderPrefix: string;
  defaultLanguage: string;
  timezone: string;
  aiProvider: string;
  termsBn?: string | null;
  termsEn?: string | null;
}
