export function success(data: unknown, message?: string) {
  return Response.json({ success: true, data, message });
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function unauthorized(message = "غير مصرح") {
  return error(message, 401);
}

export function notFound(message = "غير موجود") {
  return error(message, 404);
}

export function conflict(message = "تعارض في البيانات") {
  return error(message, 409);
}

export function rateLimited(message = "تم تجاوز الحد الأقصى. يرجى المحاولة لاحقاً") {
  return error(message, 429);
}

export function serverError(message = "حدث خطأ في الخادم") {
  return error(message, 500);
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function paginated<T>(items: T[], page: number, limit: number, total: number) {
  return success({
    data: items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
