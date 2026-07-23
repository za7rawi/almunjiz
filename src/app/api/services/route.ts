import { NextRequest } from "next/server";
import { services } from "@/lib/store";
import { success, error } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    let filtered = Array.from(services.values());

    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (isActive !== null) {
      filtered = filtered.filter((s) => s.isActive === (isActive === "true"));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.description.includes(q) ||
          s.descriptionEn.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return success({
      data: paged,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error("Error fetching services:", e);
    return error("حدث خطأ في جلب الخدمات", 500);
  }
}
