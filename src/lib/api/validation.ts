import { z } from "zod";
import { error } from "./response";

export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
      const messages = Object.entries(fieldErrors)
        .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
        .join("; ");

      return { error: error(messages || "بيانات غير صحيحة") };
    }

    return { data: result.data };
  } catch {
    return { error: error("البيانات المرسلة غير صحيحة") };
  }
}

export function validateSearchParams(
  url: string,
  defaults: Record<string, string>
): Record<string, string> {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  for (const [key, val] of Object.entries(defaults)) {
    params[key] = searchParams.get(key) ?? val;
  }
  return params;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?[0-9]{7,15}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  return phoneRegex.test(phone);
}
