export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  SUPPORT = 'SUPPORT',
  ACCOUNTANT = 'ACCOUNTANT',
  CUSTOMER = 'CUSTOMER',
}

export enum ServiceCategory {
  VISAS = 'VISAS',
  CONTRACTS = 'CONTRACTS',
  VEHICLES = 'VEHICLES',
  TRAVEL = 'TRAVEL',
  HOTELS = 'HOTELS',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  ELECTRONIC = 'ELECTRONIC',
  UNIVERSITIES = 'UNIVERSITIES',
  CONSULTATIONS = 'CONSULTATIONS',
  OTHER = 'OTHER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  WAITING_CLIENT = 'WAITING_CLIENT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  MADA = 'MADA',
  APPLE_PAY = 'APPLE_PAY',
  STC_PAY = 'STC_PAY',
  VISA = 'VISA',
  MASTER_CARD = 'MASTER_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
}

export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
  SUPPORT = 'SUPPORT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  image: string;
  category: ServiceCategory;
  price: number;
  duration: string;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  status: OrderStatus;
  amount: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: OrderStatus;
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: InvoiceStatus;
  reference: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  serviceId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  image: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Offer {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  startDate: string;
  endDate: string;
  isActive: boolean;
  serviceIds: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: TicketMessage[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  isActive: boolean;
}

export interface News {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  image: string;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface Employee {
  id: string;
  userId: string;
  department: string;
  position: string;
  hireDate: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Settings {
  siteName: string;
  siteNameEn: string;
  logo: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  socialLinks: Record<string, string>;
  currency: string;
  taxRate: number;
  maintenanceMode: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
  error: string | null;
}
