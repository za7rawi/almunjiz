import { NextRequest } from "next/server";
import { services } from "@/lib/store";
import { success, error, notFound } from "@/lib/api/response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = services.get(id);

    if (!service) {
      return notFound("الخدمة غير موجودة");
    }

    return success(service);
  } catch (e) {
    console.error("Error fetching service:", e);
    return error("حدث خطأ في جلب الخدمة", 500);
  }
}
