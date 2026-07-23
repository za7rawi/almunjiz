import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export class AuthService {
  static async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "SUPPORT" | "ACCOUNTANT" | "CUSTOMER";
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role ?? "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  static async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  static async updateProfile(
    id: string,
    data: { name?: string; email?: string; avatar?: string }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async verifyEmail(id: string) {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }

  static async verifyPhone(id: string) {
    return prisma.user.update({
      where: { id },
      data: { phoneVerified: true },
    });
  }
}
