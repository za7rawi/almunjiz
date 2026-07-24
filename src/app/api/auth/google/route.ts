import { NextResponse } from 'next/server';

const googleUsers = new Map<string, { id: string; name: string; email: string; phone: string; role: string; avatar: string | null }>();

function generateUserId(): string {
  return `google_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function verifyGoogleToken(idToken: string): Promise<{ name: string; email: string; avatar: string | null } | null> {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload.email || payload.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
    return {
      name: payload.name || payload.given_name || 'مستخدم Google',
      email: payload.email,
      avatar: payload.picture || null,
    };
  } catch {
    return null;
  }
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

    // Try verifying against Google's servers
    const verified = await verifyGoogleToken(idToken);
    if (verified) {
      userData = verified;
    } else {
      // Fallback: try decoding JWT locally (for dev/demo tokens)
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
          return NextResponse.json(
            { success: false, message: 'رمز Google غير صالح' },
            { status: 401 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, message: 'رمز Google غير صالح' },
          { status: 401 }
        );
      }
    }

    if (!userData.email) {
      return NextResponse.json(
        { success: false, message: 'لم يتم الحصول على البريد الإلكتروني من Google' },
        { status: 401 }
      );
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
