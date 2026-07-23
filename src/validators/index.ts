import { z } from "zod";

export const LoginSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب / Phone is required")
    .regex(/^(\+?966|0)?5[0-9]{8}$/, "رقم الهاتف غير صحيح / Invalid phone number"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة / Password is required")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters"),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "الاسم مطلوب / Name is required")
      .min(2, "الاسم يجب أن يكون حرفين على الأقل / Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب / Email is required")
      .email("البريد الإلكتروني غير صحيح / Invalid email"),
    phone: z
      .string()
      .min(1, "رقم الهاتف مطلوب / Phone is required")
      .regex(/^(\+?966|0)?5[0-9]{8}$/, "رقم الهاتف غير صحيح / Invalid phone number"),
    password: z
      .string()
      .min(1, "كلمة المرور مطلوبة / Password is required")
      .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب / Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين / Passwords do not match",
    path: ["confirmPassword"],
  });

export const OTPSchema = z.object({
  otp: z
    .string()
    .length(6, "الرمز يجب أن يكون 6 أرقام / OTP must be 6 digits")
    .regex(/^\d+$/, "الرمز يجب أن يحتوي على أرقام فقط / OTP must contain only digits"),
});

export const OrderSchema = z.object({
  serviceId: z.string().min(1, "الخدمة مطلوبة / Service is required"),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب / Name is required"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب / Email is required")
    .email("البريد الإلكتروني غير صحيح / Invalid email"),
  phone: z.string().regex(/^(\+?966|0)?5[0-9]{8}$/, "رقم الهاتف غير صحيح / Invalid phone number").optional().or(z.literal("")),
  subject: z.string().min(1, "الموضوع مطلوب / Subject is required"),
  message: z
    .string()
    .min(1, "الرسالة مطلوبة / Message is required")
    .min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل / Message must be at least 10 characters"),
});

export const ReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "التقييم مطلوب / Rating is required")
    .max(5, "التقييم يجب أن يكون من 1 إلى 5 / Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export const ServiceSchema = z.object({
  name: z.string().min(1, "الاسم بالعربية مطلوب / Arabic name is required"),
  nameEn: z.string().min(1, "الاسم بالإنجليزية مطلوب / English name is required"),
  description: z.string().min(1, "الوصف بالعربية مطلوب / Arabic description is required"),
  descriptionEn: z.string().min(1, "الوصف بالإنجليزية مطلوب / English description is required"),
  slug: z.string().min(1, "الرابط المختصر مطلوب / Slug is required"),
  icon: z.string().min(1, "الأيقونة مطلوبة / Icon is required"),
  image: z.string().optional(),
  category: z.enum([
    "VISAS",
    "CONTRACTS",
    "VEHICLES",
    "TRAVEL",
    "HOTELS",
    "BUSINESS",
    "GOVERNMENT",
    "ELECTRONIC",
    "UNIVERSITIES",
    "CONSULTATIONS",
    "OTHER",
  ]),
  price: z.number().min(0, "السعر يجب أن يكون صفر على الأقل / Price must be at least 0"),
  duration: z.string().optional(),
  durationUnit: z.string().optional(),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
});

export const PaymentSchema = z.object({
  invoiceId: z.string().min(1, "الفاتورة مطلوبة / Invoice is required"),
  amount: z.number().positive("المبلغ يجب أن يكون موجباً / Amount must be positive"),
  method: z.enum([
    "MADA",
    "APPLE_PAY",
    "STC_PAY",
    "VISA",
    "MASTER_CARD",
    "BANK_TRANSFER",
    "WALLET",
  ]),
  reference: z.string().optional(),
});

export const NotificationSchema = z.object({
  userId: z.string().min(1, "المستخدم مطلوب / User is required"),
  title: z.string().min(1, "العنوان مطلوب / Title is required"),
  titleEn: z.string().min(1, "العنوان بالإنجليزية مطلوب / English title is required"),
  message: z.string().min(1, "الرسالة مطلوبة / Message is required"),
  messageEn: z.string().min(1, "الرسالة بالإنجليزية مطلوبة / English message is required"),
  type: z.enum(["ORDER", "PAYMENT", "SYSTEM", "PROMOTION", "SUPPORT"]).default("SYSTEM"),
  link: z.string().optional(),
});
