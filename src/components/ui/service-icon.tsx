'use client';

import {
  Star,
  Globe,
  Plane,
  Car,
  FileText,
  FileBadge,
  FileCheck,
  Shield,
  ShieldCheck,
  ArrowRightLeft,
  ScrollText,
  HandCoins,
  Landmark,
  Building2,
  GraduationCap,
  MessageSquare,
  HeartPulse,
  Hammer,
  Scale,
  UserCheck,
  ClipboardCheck,
  Eye,
  Sparkles,
  Wrench,
  KeyRound,
  Home,
  Banknote,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Globe,
  Plane,
  Car,
  FileText,
  FileBadge,
  FileCheck,
  Shield,
  ShieldCheck,
  ArrowRightLeft,
  ScrollText,
  HandCoins,
  Landmark,
  Building2,
  GraduationCap,
  MessageSquare,
  HeartPulse,
  Hammer,
  Scale,
  UserCheck,
  ClipboardCheck,
  Eye,
  Sparkles,
  Wrench,
  KeyRound,
  Home,
  Banknote,
};

interface ServiceIconProps {
  name?: string | null;
  size?: number;
  className?: string;
}

export function ServiceIcon({ name, size = 24, className }: ServiceIconProps) {
  const Icon = (name && ICON_MAP[name]) || Star;
  return <Icon size={size} className={className} />;
}