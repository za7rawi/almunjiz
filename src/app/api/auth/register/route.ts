import { NextRequest } from "next/server";
import { users, generateId } from "@/lib/store";
import { success, error, conflict } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return error("جميع الحقول مطلوبة");
    }

    if (name.trim().length < 3) {
      return error("الاسم يجب أن يكون 3 أحرف على الأقل");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    if (password.length < 8) {
      return error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }

    if (phone && !/^(\+?966|0)?5[0-9]{8}$/.test(phone)) {
      return error("رقم الهاتف غير صحيح");
    }

    const existingEmail = Array.from(users.values()).find((u) => u.email === email);
    if (existingEmail) {
      return conflict("البريد الإلكتروني مستخدم بالفعل");
    }

    const user = {
      id: generateId("user"),
      name: name.trim(),
      email,
      phone: phone ?? "",
      password,
      role: "CUSTOMER",
      avatar: null,
      createdAt: new Date(),
    };

    users.set(email, user);

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
      "تم إنشاء الحساب بنجاح"
    );
  } catch {
    return error("حدث خطأ أثناء إنشاء الحساب", 500);
  }
}
