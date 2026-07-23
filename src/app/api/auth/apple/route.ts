import { NextResponse } from 'next/server';

const appleUsers = new Map<string, { id: string; name: string; email: string; phone: string; role: string; avatar: string | null }>();

function generateUserId(): string {
  return `apple_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, user: appleUser } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'الرمز المطلوب غير مقدم' },
        { status: 400 }
      );
    }

    let userData: { name: string; email: string; avatar: string | null };

    if (idToken.startsWith('demo_apple_')) {
      userData = {
        name: appleUser?.name || 'مستخدم Apple',
        email: appleUser?.email || `user${Date.now()}@icloud.com`,
        avatar: null,
      };
    } else {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userData = {
            name: appleUser?.name || payload.name || 'مستخدم Apple',
            email: appleUser?.email || payload.email || '',
            avatar: null,
          };
        } else {
          userData = {
            name: appleUser?.name || 'مستخدم Apple',
            email: appleUser?.email || `user${Date.now()}@icloud.com`,
            avatar: null,
          };
        }
      } catch {
        userData = {
          name: appleUser?.name || 'مستخدم Apple',
          email: appleUser?.email || `user${Date.now()}@icloud.com`,
          avatar: null,
        };
      }
    }

    const identifier = userData.email;
    let user = appleUsers.get(identifier);

    if (!user) {
      user = {
        id: generateUserId(),
        name: userData.name,
        email: userData.email,
        phone: '',
        role: 'CUSTOMER',
        avatar: userData.avatar,
      };
      appleUsers.set(identifier, user);
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user,
      token: `apple_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تسجيل الدخول بـ Apple' },
      { status: 500 }
    );
  }
}
