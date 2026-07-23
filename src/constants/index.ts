import {
  OrderStatus,
  ServiceCategory,
  PaymentMethod,
} from '../types';

export const APP_NAME = 'المنجز';
export const APP_NAME_EN = 'AL-MUNJIZ';
export const APP_DESCRIPTION = 'منصة المنجز للخدمات الإلكترونية - حلول سريعة وموثوقة لاحتياجاتك';
export const APP_DESCRIPTION_EN = 'AL-MUNJIZ Electronic Services Platform - Fast and reliable solutions for your needs';

export const CONTACT_INFO = {
  phone: '+962791038472',
  email: 'info@almunjiz.com',
  whatsapp: '+962791038472',
  whatsappUsername: '+962791038472',
  whatsappMessage: 'مرحباً، أريد الاستفسار عن خدمات المنجز',
  address: 'الرياض، المملكة العربية السعودية',
  addressEn: 'Riyadh, Saudi Arabia',
  workingHours: 'الأحد - الخميس: 9 صباحاً - 6 مساءً',
  workingHoursEn: 'Sunday - Thursday: 9 AM - 6 PM',
};

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/almunjiz',
  instagram: 'https://instagram.com/almunjiz',
  snapchat: 'https://snapchat.com/add/almunjiz',
  tiktok: 'https://tiktok.com/@almunjiz',
  youtube: 'https://youtube.com/@almunjiz',
};

export const NAVIGATION_LINKS = [
  { label: 'الرئيسية', labelEn: 'Home', href: '/' },
  { label: 'الخدمات', labelEn: 'Services', href: '/services' },
  { label: 'من نحن', labelEn: 'About', href: '/about' },
  { label: 'تتبع طلبك', labelEn: 'Track Order', href: '/track-order' },
  { label: 'تواصل معنا', labelEn: 'Contact', href: '/contact' },
] as const;

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; labelEn: string; color: string; bgColor: string }
> = {
  [OrderStatus.PENDING]: {
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  [OrderStatus.UNDER_REVIEW]: {
    label: 'قيد المراجعة',
    labelEn: 'Under Review',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  [OrderStatus.WAITING_CLIENT]: {
    label: 'بانتظار العميل',
    labelEn: 'Waiting for Client',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  [OrderStatus.IN_PROGRESS]: {
    label: 'قيد التنفيذ',
    labelEn: 'In Progress',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
  },
  [OrderStatus.COMPLETED]: {
    label: 'مكتمل',
    labelEn: 'Completed',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  [OrderStatus.DELIVERED]: {
    label: 'تم التسليم',
    labelEn: 'Delivered',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  [OrderStatus.CANCELLED]: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
};

export const SERVICE_CATEGORIES: Record<
  ServiceCategory,
  { icon: string; label: string; labelEn: string }
> = {
  [ServiceCategory.VISAS]: {
    icon: '🌍',
    label: 'التأشيرات',
    labelEn: 'Visas',
  },
  [ServiceCategory.CONTRACTS]: {
    icon: '📄',
    label: 'العقود',
    labelEn: 'Contracts',
  },
  [ServiceCategory.VEHICLES]: {
    icon: '🚗',
    label: 'المركبات',
    labelEn: 'Vehicles',
  },
  [ServiceCategory.TRAVEL]: {
    icon: '✈️',
    label: 'السفر',
    labelEn: 'Travel',
  },
  [ServiceCategory.HOTELS]: {
    icon: '🏨',
    label: 'الفنادق',
    labelEn: 'Hotels',
  },
  [ServiceCategory.BUSINESS]: {
    icon: '💼',
    label: 'الأعمال',
    labelEn: 'Business',
  },
  [ServiceCategory.GOVERNMENT]: {
    icon: '🏛️',
    label: 'الخدمات الحكومية',
    labelEn: 'Government',
  },
  [ServiceCategory.ELECTRONIC]: {
    icon: '💻',
    label: 'الخدمات الإلكترونية',
    labelEn: 'Electronic',
  },
  [ServiceCategory.UNIVERSITIES]: {
    icon: '🎓',
    label: 'الجامعات',
    labelEn: 'Universities',
  },
  [ServiceCategory.CONSULTATIONS]: {
    icon: '💡',
    label: 'الاستشارات',
    labelEn: 'Consultations',
  },
  [ServiceCategory.OTHER]: {
    icon: '📦',
    label: 'أخرى',
    labelEn: 'Other',
  },
};

export const PAYMENT_METHODS: Record<
  PaymentMethod,
  { label: string; labelEn: string; icon: string }
> = {
  [PaymentMethod.MADA]: {
    label: 'مدى',
    labelEn: 'Mada',
    icon: '💳',
  },
  [PaymentMethod.APPLE_PAY]: {
    label: 'آبل باي',
    labelEn: 'Apple Pay',
    icon: '🍎',
  },
  [PaymentMethod.STC_PAY]: {
    label: 'STC Pay',
    labelEn: 'STC Pay',
    icon: '📱',
  },
  [PaymentMethod.VISA]: {
    label: 'فيزا',
    labelEn: 'Visa',
    icon: '💳',
  },
  [PaymentMethod.MASTER_CARD]: {
    label: 'ماستركارد',
    labelEn: 'Master Card',
    icon: '💳',
  },
  [PaymentMethod.BANK_TRANSFER]: {
    label: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    icon: '🏦',
  },
  [PaymentMethod.WALLET]: {
    label: 'المحفظة',
    labelEn: 'Wallet',
    icon: '💰',
  },
};

export const SUPPORT_CHANNELS = {
  whatsapp: {
    label: 'واتساب',
    labelEn: 'WhatsApp',
    icon: '💬',
    url: `https://wa.me/962791038472?text=${encodeURIComponent(CONTACT_INFO.whatsappMessage)}`,
    username: CONTACT_INFO.whatsappUsername,
  },
  email: {
    label: 'البريد الإلكتروني',
    labelEn: 'Email',
    icon: '📧',
    url: `mailto:${CONTACT_INFO.email}`,
  },
  phone: {
    label: 'الهاتف',
    labelEn: 'Phone',
    icon: '📞',
    url: `tel:${CONTACT_INFO.phone}`,
  },
};

export const COLORS = {
  primary: '#1E3A5F',
  turquoise: '#2DD4BF',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};
