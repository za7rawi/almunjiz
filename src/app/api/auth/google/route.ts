import { NextResponse } from 'next/server';

const googleUsers = new Map<string, { id: string; name: string; email: string; phone: string; role: string; avatar: string | null }>();

function generateUserId(): string {
  return `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: 'الرمز المطلوب غير مقدم' },
        { status: 400 }
      );
    }

    let userData: { name: string; email: string; avatar: string | null };

    if (idToken.startsWith('demo_google_')) {
      const parts = idToken.split('_');
      userData = {
        name: parts[2] || 'مستخدم Google',
        email: parts[3] || `user${Date.now()}@gmail.com`,
        avatar: null,
      };
    } else {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
          userData = {
            name: payload.name || payload.given_name || 'مستخدم Google',
            email: payload.email || '',
            avatar: payload.picture || null,
          };
        } else {
          userData = {
            name: 'مستخدم Google',
            email: `user${Date.now()}@gmail.com`,
            avatar: null,
          };
        }
      } catch {
        userData = {
          name: 'مستخدم Google',
          email: `user${Date.now()}@gmail.com`,
          avatar: null,
        };
      }
    }

    const identifier = userData.email;
    let user = googleUsers.get(identifier);

    if (!user) {
      user = {
        id: generateUserId(),
        name: userData.name,
        email: userData.email,
        phone: '',
        role: 'CUSTOMER',
        avatar: userData.avatar,
      };
      googleUsers.set(identifier, user);
    }

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user,
      token: `google_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تسجيل الدخول بـ Google' },
      { status: 500 }
    );
  }
}
