'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  notes: string;
  dueDate: string;
  date: string;
  status: InvoiceStatus;
}

export type ReviewStatus = 'approved' | 'pending' | 'rejected';

export interface Review {
  id: string;
  customerName: string;
  service: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  date: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Offer {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  discount: number;
  discountType: DiscountType;
  code: string;
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationTarget = 'all' | 'customers' | 'employees' | 'managers';

export interface Notification {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: NotificationType;
  target: NotificationTarget;
  isRead: boolean;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  content: string;
  contentEn: string;
  image: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerPosition = 'hero' | 'sidebar' | 'footer';

export interface Banner {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  image: string;
  link: string;
  position: BannerPosition;
  isActive: boolean;
  order: number;
}

export interface StaticPage {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  content: string;
  contentEn: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  role: string;
  roleEn: string;
  dashboard: boolean;
  services: boolean;
  orders: boolean;
  customers: boolean;
  employees: boolean;
  invoices: boolean;
  payments: boolean;
  notifications: boolean;
  reviews: boolean;
  news: boolean;
  pages: boolean;
  banners: boolean;
  offers: boolean;
  coupons: boolean;
  permissions: boolean;
  reports: boolean;
  settings: boolean;
}

interface AdminDataState {
  invoices: Invoice[];
  reviews: Review[];
  notifications: Notification[];
  news: NewsArticle[];
  banners: Banner[];
  offers: Offer[];
  pages: StaticPage[];
  permissions: Permission[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  reorderBanners: (fromIndex: number, toIndex: number) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  approveReview: (id: string) => void;
  rejectReview: (id: string) => void;
  deleteReview: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNews: (article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNews: (id: string, updates: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;
  addOffer: (offer: Omit<Offer, 'id' | 'usedCount' | 'createdAt'>) => void;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  toggleOfferActive: (id: string) => void;
  addPage: (page: Omit<StaticPage, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, updates: Partial<StaticPage>) => void;
  deletePage: (id: string) => void;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
}

const defaultInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2026-001', customer: 'محمد أحمد', email: 'mohammed@email.com', service: 'تأشيرة سياحية', amount: 250, tax: 0, total: 250, notes: '', dueDate: '2026-08-01', date: '2026-07-01', status: 'paid' },
  { id: '2', invoiceNumber: 'INV-2026-002', customer: 'خالد سعيد', email: 'khalid@email.com', service: 'تسجيل مركبة', amount: 300, tax: 0, total: 300, notes: '', dueDate: '2026-08-10', date: '2026-07-10', status: 'pending' },
  { id: '3', invoiceNumber: 'INV-2026-003', customer: 'فهد العلي', email: 'fahad@email.com', service: 'عقد إيجار', amount: 200, tax: 0, total: 200, notes: 'تم التحويل بنجاح', dueDate: '2026-07-15', date: '2026-07-01', status: 'overdue' },
  { id: '4', invoiceNumber: 'INV-2026-004', customer: 'أحمد الشمري', email: 'ahmed@email.com', service: 'تأشيرة عمل', amount: 450, tax: 0, total: 450, notes: '', dueDate: '2026-09-01', date: '2026-07-15', status: 'paid' },
  { id: '5', invoiceNumber: 'INV-2026-005', customer: 'سعد الدوسري', email: 'saad@email.com', service: 'ترجمة وثائق', amount: 180, tax: 0, total: 180, notes: '', dueDate: '2026-08-20', date: '2026-07-20', status: 'pending' },
  { id: '6', invoiceNumber: 'INV-2026-006', customer: 'عبدالله القحطاني', email: 'abdullah@email.com', service: 'تأمين مركبة', amount: 350, tax: 0, total: 350, notes: '', dueDate: '2026-07-25', date: '2026-07-10', status: 'cancelled' },
  { id: '7', invoiceNumber: 'INV-2026-007', customer: 'يوسف العتيبي', email: 'yousef@email.com', service: 'تجديد إقامة', amount: 400, tax: 0, total: 400, notes: 'بانتظار الموافقة', dueDate: '2026-08-05', date: '2026-07-05', status: 'overdue' },
  { id: '8', invoiceNumber: 'INV-2026-008', customer: 'سلطان المطيري', email: 'sultan@email.com', service: 'استخراج شهادة', amount: 150, tax: 0, total: 150, notes: '', dueDate: '2026-09-15', date: '2026-07-22', status: 'paid' },
];

let invoiceCounter = 9;

const defaultReviews: Review[] = [
  { id: '1', customerName: 'محمد أحمد العتيبي', service: 'تأشيرة سياحية', rating: 5, comment: 'خدمة ممتازة وسريعة، تم إنجاز التأشيرة في الوقت المحدد. أنصح بالتعامل معهم بشدة.', status: 'approved', date: '2026-07-20' },
  { id: '2', customerName: 'خالد سعيد الدوسري', service: 'تسجيل مركبة', rating: 4, comment: 'تجربة جيدة بشكل عام، الموظفون متعاونون والعملية سهلة.', status: 'approved', date: '2026-07-19' },
  { id: '3', customerName: 'فهد العلي القحطاني', service: 'عقد إيجار', rating: 3, comment: 'الخدمة مقبولة لكن قد تأخروا قليلاً في الرد على الاستفسارات.', status: 'pending', date: '2026-07-18' },
  { id: '4', customerName: 'أحمد الشمري', service: 'تأشيرة عمل', rating: 5, comment: 'أفضل منصة خدمات تعاملت معها. احترافية عالية وخدمة عملاء ممتازة.', status: 'approved', date: '2026-07-17' },
  { id: '5', customerName: 'سعد الدوسري', service: 'ترجمة وثائق', rating: 2, comment: 'لم أكن راضياً عن سرعة الترجمة، كان التأخير كبيراً.', status: 'rejected', date: '2026-07-16' },
  { id: '6', customerName: 'عبدالله القحطاني', service: 'تأمين مركبة', rating: 4, comment: 'خدمة جيدة والأسعار معقولة. التأمين كان جاهز بسرعة.', status: 'approved', date: '2026-07-15' },
  { id: '7', customerName: 'يوسف العتيبي', service: 'تجديد إقامة', rating: 5, comment: 'عملية تجديد الإقامة كانت سلسة جداً. شكراً لكم.', status: 'pending', date: '2026-07-14' },
  { id: '8', customerName: 'سلطان المطيري', service: 'استخراج شهادة', rating: 1, comment: 'خدمة سيئة جداً، لم يتم إنجاز العمل في الوقت المحدد.', status: 'pending', date: '2026-07-13' },
  { id: '9', customerName: 'عمر الحربي', service: 'تأشيرة سياحية', rating: 4, comment: 'تجربة إيجابية، المعرفة والخبرة واضحة في التعامل.', status: 'approved', date: '2026-07-12' },
  { id: '10', customerName: 'راشد السبيعي', service: 'عقد إيجار', rating: 5, comment: 'خدمة احترافية ومتميزة. سأتعامل معهم مجدداً بالتأكيد.', status: 'approved', date: '2026-07-11' },
];

const defaultNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'إطلاق خدمة التأشيرات الجديدة',
    titleEn: 'Launching New Visa Service',
    summary: 'يسرنا الإعلان عن إطلاق خدمة التأشيرات الإلكترونية الجديدة',
    summaryEn: 'We are pleased to announce the launch of our new electronic visa service',
    content: 'يسرنا الإعلان عن إطلاق خدمة التأشيرات الإلكترونية الجديدة التي تتيح للمستخدمين تقديم طلبات التأشيرة عبر الإنترنت بشكل سريع وسهل.',
    contentEn: 'We are pleased to announce the launch of our new electronic visa service that allows users to apply for visas online quickly and easily.',
    image: '',
    category: 'خدمات',
    isPublished: true,
    createdAt: '2026-07-23T08:00:00Z',
    updatedAt: '2026-07-23T08:00:00Z',
  },
  {
    id: 'news-2',
    title: 'عرض الصيف - خصم 25%',
    titleEn: 'Summer Offer - 25% Discount',
    summary: 'استمتع بخصم 25% على جميع خدماتنا خلال فترة الصيف',
    summaryEn: 'Enjoy a 25% discount on all our services during the summer period',
    content: 'استمتع بخصم 25% على جميع خدماتنا خلال فترة الصيف! العرض ساري من 1 يوليو حتى 31 أغسطس 2026.',
    contentEn: 'Enjoy a 25% discount on all our services during the summer period! The offer is valid from July 1 to August 31, 2026.',
    image: '',
    category: 'عروض',
    isPublished: true,
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-15T10:30:00Z',
  },
];

const defaultNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'طلب جديد #1234',
    titleEn: 'New Order #1234',
    message: 'تم استلام طلب جديد من العميل أحمد محمد',
    messageEn: 'A new order has been received from customer Ahmed Mohammed',
    type: 'info',
    target: 'all',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'n2',
    title: 'تم الدفع بنجاح',
    titleEn: 'Payment Successful',
    message: 'تم استلام دفعة بقيمة 1,500 ر.س',
    messageEn: 'A payment of 1,500 SAR has been received',
    type: 'success',
    target: 'managers',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'n3',
    title: 'تنبيه: مخزون منخفض',
    titleEn: 'Warning: Low Stock',
    message: 'المنتج "خدمة التوصيل السريع" على وشك النفاد',
    messageEn: 'Product "Express Delivery Service" is running low',
    type: 'warning',
    target: 'employees',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'n4',
    title: 'خطأ في الاتصال',
    titleEn: 'Connection Error',
    message: 'حدث خطأ أثناء الاتصال بخدمة الدفع',
    messageEn: 'An error occurred while connecting to the payment service',
    type: 'error',
    target: 'all',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'n5',
    title: 'عميل جديد مسجل',
    titleEn: 'New Customer Registered',
    message: 'سجّل العميل سعيد أحمد حساباً جديداً',
    messageEn: 'Customer Saeed Ahmed has registered a new account',
    type: 'info',
    target: 'managers',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

let newsCounter = 3;

const defaultBanners: Banner[] = [
  {
    id: 'b1',
    title: 'عرض التأشيرات الجديد',
    titleEn: 'New Visa Offers',
    subtitle: 'خصم يصل إلى 30% على جميع التأشيرات',
    subtitleEn: 'Up to 30% discount on all visas',
    image: '',
    link: '/services',
    position: 'hero',
    isActive: true,
    order: 1,
  },
  {
    id: 'b2',
    title: 'خدمات التأمين',
    titleEn: 'Insurance Services',
    subtitle: 'تأمين شامل لسيارتك بأفضل الأسعار',
    subtitleEn: 'Comprehensive car insurance at the best prices',
    image: '',
    link: '/services/insurance',
    position: 'sidebar',
    isActive: true,
    order: 2,
  },
  {
    id: 'b3',
    title: 'تواصل معنا',
    titleEn: 'Contact Us',
    subtitle: 'فريق خدمة العملاء جاهز لمساعدتك',
    subtitleEn: 'Our customer service team is ready to help',
    image: '',
    link: '/contact',
    position: 'footer',
    isActive: false,
    order: 3,
  },
];

let bannerCounter = 4;

const defaultOffers: Offer[] = [
  {
    id: 'o1',
    title: 'عرض الصيف - خصم 25%',
    titleEn: 'Summer Offer - 25% Discount',
    description: 'خصم 25% على جميع خدمات التأشيرات خلال فترة الصيف',
    descriptionEn: '25% discount on all visa services during the summer period',
    discount: 25,
    discountType: 'percentage',
    code: 'SUMMER25',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    maxUses: 100,
    usedCount: 45,
    isActive: true,
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'o2',
    title: 'خصم 50 ر.س',
    titleEn: 'Fixed 50 SAR Discount',
    description: 'خصم ثابت 50 ريال على أي خدمة بقيمة 200 ريال أو أكثر',
    descriptionEn: 'Fixed 50 SAR discount on any service worth 200 SAR or more',
    discount: 50,
    discountType: 'fixed',
    code: 'SAVE50',
    startDate: '2026-07-15',
    endDate: '2026-09-15',
    maxUses: 200,
    usedCount: 120,
    isActive: true,
    createdAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'o3',
    title: 'عرض العملاء الجدد',
    titleEn: 'New Customers Offer',
    description: 'خصم 15% للعملاء الجدد على أول طلب',
    descriptionEn: '15% discount for new customers on first order',
    discount: 15,
    discountType: 'percentage',
    code: 'WELCOME15',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    maxUses: 500,
    usedCount: 89,
    isActive: false,
    createdAt: '2026-06-01T08:00:00Z',
  },
];

let offerCounter = 4;

const defaultPages: StaticPage[] = [
  { id: 'p1', title: 'من نحن', titleEn: 'About Us', slug: 'about', content: 'المنجز هو منصة الخدمات المتكاملة التي تقدم حلولاً شاملة للتأشيرات والعقود والمركبات والمزيد.', contentEn: 'Al-Munjiz is an integrated services platform that provides comprehensive solutions for visas, contracts, vehicles, and more.', isPublished: true, createdAt: '2026-07-01T08:00:00Z', updatedAt: '2026-07-01T08:00:00Z' },
  { id: 'p2', title: 'سياسة الخصوصية', titleEn: 'Privacy Policy', slug: 'privacy', content: 'نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.', contentEn: 'We respect your privacy and are committed to protecting your personal data.', isPublished: true, createdAt: '2026-07-01T08:00:00Z', updatedAt: '2026-07-01T08:00:00Z' },
  { id: 'p3', title: 'الشروط والأحكام', titleEn: 'Terms & Conditions', slug: 'terms', content: 'باستخدامك لمنصة المنجز، أنت توافق على الشروط والأحكام التالية.', contentEn: 'By using the Al-Munjiz platform, you agree to the following terms and conditions.', isPublished: true, createdAt: '2026-07-01T08:00:00Z', updatedAt: '2026-07-01T08:00:00Z' },
];
let pageCounter = 4;

const defaultPermissions: Permission[] = [
  { id: 'perm1', role: 'مدير النظام', roleEn: 'Admin', dashboard: true, services: true, orders: true, customers: true, employees: true, invoices: true, payments: true, notifications: true, reviews: true, news: true, pages: true, banners: true, offers: true, coupons: true, permissions: true, reports: true, settings: true },
  { id: 'perm2', role: 'مدير قسم', roleEn: 'Manager', dashboard: true, services: true, orders: true, customers: true, employees: false, invoices: true, payments: true, notifications: true, reviews: true, news: true, pages: false, banners: false, offers: true, coupons: true, permissions: false, reports: true, settings: false },
  { id: 'perm3', role: 'موظف', roleEn: 'Employee', dashboard: true, services: true, orders: true, customers: false, employees: false, invoices: false, payments: false, notifications: true, reviews: false, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
  { id: 'perm4', role: 'دعم فني', roleEn: 'Support', dashboard: true, services: false, orders: true, customers: true, employees: false, invoices: false, payments: false, notifications: true, reviews: true, news: false, pages: false, banners: false, offers: false, coupons: false, permissions: false, reports: false, settings: false },
];

export const useAdminDataStore = create<AdminDataState>()(
  persist(
    (set) => ({
      invoices: defaultInvoices,
      reviews: defaultReviews,
      notifications: defaultNotifications,
      news: defaultNews,
      banners: defaultBanners,
      offers: defaultOffers,
      pages: defaultPages,
      permissions: defaultPermissions,

      addBanner: (banner) =>
        set((state) => ({
          banners: [
            ...state.banners,
            { ...banner, id: `b${bannerCounter++}` },
          ].sort((a, b) => a.order - b.order),
        })),

      updateBanner: (id, updates) =>
        set((state) => ({
          banners: state.banners.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ).sort((a, b) => a.order - b.order),
        })),

      deleteBanner: (id) =>
        set((state) => ({
          banners: state.banners.filter((b) => b.id !== id),
        })),

      reorderBanners: (fromIndex, toIndex) =>
        set((state) => {
          const sorted = [...state.banners].sort((a, b) => a.order - b.order);
          const [moved] = sorted.splice(fromIndex, 1);
          sorted.splice(toIndex, 0, moved);
          return {
            banners: sorted.map((b, i) => ({ ...b, order: i + 1 })),
          };
        }),

      addInvoice: (invoice) =>
        set((state) => {
          const newId = String(invoiceCounter++);
          const num = state.invoices.length + 1;
          return {
            invoices: [
              ...state.invoices,
              {
                ...invoice,
                id: newId,
                invoiceNumber: `INV-2026-${String(num).padStart(3, '0')}`,
              },
            ],
          };
        }),

      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updates } : inv
          ),
        })),

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      approveReview: (id) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, status: 'approved' as ReviewStatus } : r
          ),
        })),

      rejectReview: (id) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id ? { ...r, status: 'rejected' as ReviewStatus } : r
          ),
        })),

      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((r) => r.id !== id),
        })),

      addNews: (article) =>
        set((state) => {
          const newId = `news-${newsCounter++}`;
          return {
            news: [
              ...state.news,
              {
                ...article,
                id: newId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      updateNews: (id, updates) =>
        set((state) => ({
          news: state.news.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),

      deleteNews: (id) =>
        set((state) => ({
          news: state.news.filter((a) => a.id !== id),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `n${Date.now()}`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      addOffer: (offer) =>
        set((state) => ({
          offers: [
            ...state.offers,
            {
              ...offer,
              id: `o${offerCounter++}`,
              usedCount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateOffer: (id, updates) =>
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        })),

      deleteOffer: (id) =>
        set((state) => ({
          offers: state.offers.filter((o) => o.id !== id),
        })),

      toggleOfferActive: (id) =>
        set((state) => ({
          offers: state.offers.map((o) =>
            o.id === id ? { ...o, isActive: !o.isActive } : o
          ),
        })),

      addPage: (page) =>
        set((state) => ({
          pages: [
            ...state.pages,
            {
              ...page,
              id: `p${pageCounter++}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        })),

      updatePermission: (id, updates) =>
        set((state) => ({
          permissions: state.permissions.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
    }),
    {
      name: 'almunjiz-admin-data',
    }
  )
);
