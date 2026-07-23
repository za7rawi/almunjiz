export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  avatar: string | null;
  createdAt: Date;
}

export interface InMemoryService {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  slug: string;
  icon: string;
  image: string | null;
  category: string;
  price: number;
  duration: string | null;
  durationUnit: string | null;
  isActive: boolean;
  features: string[];
  requirements: string[];
  sortOrder: number;
  reviews: unknown[];
  createdAt: Date;
}

export interface InMemoryOrder {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  status: string;
  amount: number;
  notes: string | null;
  attachments: string[];
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryPayment {
  id: string;
  invoiceId: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  createdAt: Date;
}

export interface InMemoryContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}

export const users = new Map<string, InMemoryUser>();
export const services = new Map<string, InMemoryService>();
export const orders = new Map<string, InMemoryOrder>();
export const payments = new Map<string, InMemoryPayment>();
export const contacts = new Map<string, InMemoryContact>();

function seedServices() {
  const seedData: Omit<InMemoryService, "reviews" | "createdAt">[] = [
    {
      id: "svc-1",
      name: "تأشيرة سياحية",
      nameEn: "Tourist Visa",
      description: "خدمة استخراج التأشيرة السياحية للسعوديين والسياح الأجانب",
      descriptionEn: "Tourist visa issuance for Saudis and foreign tourists",
      slug: "tourist-visa",
      icon: "Globe",
      image: null,
      category: "VISAS",
      price: 250,
      duration: "3-5 أيام عمل",
      durationUnit: "days",
      isActive: true,
      features: ["استخراج سريع وموثوق", "متابعة مستمرة"],
      requirements: ["جواز سفر ساري المفعول", "صور شخصية"],
      sortOrder: 1,
    },
    {
      id: "svc-2",
      name: "تأشيرة عمل",
      nameEn: "Business Visa",
      description: "استخراج تأشيرة العمل للمقيمين والزوار",
      descriptionEn: "Business visa issuance for residents and visitors",
      slug: "business-visa",
      icon: "Briefcase",
      image: null,
      category: "VISAS",
      price: 500,
      duration: "5-7 أيام عمل",
      durationUnit: "days",
      isActive: true,
      features: ["استشارة مجانية أولية", "تجهيز كامل للمستندات"],
      requirements: ["جواز سفر ساري المفعول", "خطاب رسمي من الشركة"],
      sortOrder: 2,
    },
    {
      id: "svc-3",
      name: "نقل ملكية المركبات",
      nameEn: "Vehicle Ownership Transfer",
      description: "إنجاز إجراءات نقل ملكية المركبات بين الأفراد",
      descriptionEn: "Complete vehicle ownership transfer procedures",
      slug: "vehicle-transfer",
      icon: "Car",
      image: null,
      category: "VEHICLES",
      price: 400,
      duration: "1-2 أيام عمل",
      durationUnit: "days",
      isActive: true,
      features: ["إنجاز جميع الإجراءات", "تجديد التأمين"],
      requirements: ["هوية البائع والمشتري", "شهادة فحص المركبة"],
      sortOrder: 3,
    },
    {
      id: "svc-4",
      name: "الاستشارات الإلكترونية",
      nameEn: "E-Consulting",
      description: "استشارات متخصصة في المعاملات الإلكترونية والرقمية",
      descriptionEn: "Specialized consulting on electronic and digital transactions",
      slug: "e-consulting",
      icon: "MessageSquare",
      image: null,
      category: "CONSULTATIONS",
      price: 150,
      duration: "حسب الطلب",
      durationUnit: null,
      isActive: true,
      features: ["خبراء معتمدون", "استشارة عبر الإنترنت"],
      requirements: ["وصف واضح للمشكلة"],
      sortOrder: 4,
    },
  ];

  for (const s of seedData) {
    services.set(s.id, { ...s, reviews: [], createdAt: new Date() });
  }
}

seedServices();

let orderCounter = 1000;

export function generateOrderNumber(): string {
  orderCounter++;
  return `ORD-${orderCounter}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
