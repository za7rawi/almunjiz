import { NextRequest } from "next/server";
import { users } from "@/lib/store";
import { success, error } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return error("البريد الإلكتروني وكلمة المرور مطلوبان");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error("البريد الإلكتروني غير صحيح");
    }

    if (password.length < 6) {
      return error("كلمة المرور غير صحيحة", 401);
    }

    const existing = users.get(email);

    const user = existing ?? {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: email.split("@")[0],
      email,
      phone: "",
      password,
      role: "CUSTOMER",
      avatar: null,
      createdAt: new Date(),
    };

    if (!existing) {
      users.set(email, user);
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return success({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch {
    return error("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
