'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/store/language-store';
import { useDirection } from '@/hooks/use-direction';
import { NAVIGATION_LINKS, CONTACT_INFO, APP_NAME } from '@/constants';
import { Logo } from '@/components/ui/logo';

interface SiteSettings {
  phone?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  addressEn?: string;
  workingHours?: string;
  workingHoursEn?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

const serviceLinks = [
  { label: 'التأشيرات', labelEn: 'Visas', href: '/services' },
  { label: 'العقود', labelEn: 'Contracts', href: '/services' },
  { label: 'المركبات', labelEn: 'Vehicles', href: '/services' },
  { label: 'السفر', labelEn: 'Travel', href: '/services' },
  { label: 'الخدمات الحكومية', labelEn: 'Government', href: '/services' },
  { label: 'الاستشارات', labelEn: 'Consulting', href: '/services' },
];

const quickLinks = [
  ...NAVIGATION_LINKS,
  { label: 'الأسئلة الشائعة', labelEn: 'FAQ', href: '/faq' },
  { label: 'سياسة الخصوصية', labelEn: 'Privacy', href: '/privacy' },
  { label: 'الشروط والأحكام', labelEn: 'Terms', href: '/terms' },
];

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export function Footer() {
  const { language } = useLanguageStore();
  const { dir, isRtl } = useDirection();
  const [subscribed, setSubscribed] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});

  useEffect(() => {
    fetch('/api/cms/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setSiteSettings({
            phone: json.data.phone || json.data.contact_phone,
            email: json.data.email || json.data.contact_email,
            whatsapp: json.data.whatsapp || json.data.contact_whatsapp,
            address: json.data.address || json.data.contact_address,
            addressEn: json.data.addressEn || json.data.contact_address_en,
            workingHours: json.data.workingHours,
            workingHoursEn: json.data.workingHoursEn,
            twitter: json.data.twitter,
            instagram: json.data.instagram,
            youtube: json.data.youtube,
          });
        }
      })
      .catch(() => {});
  }, []);

  const phone = siteSettings.phone || CONTACT_INFO.phone;
  const email = siteSettings.email || CONTACT_INFO.email;
  const whatsapp = siteSettings.whatsapp || CONTACT_INFO.whatsapp;
  const whatsappNum = whatsapp.replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(CONTACT_INFO.whatsappMessage);
  const address = language === 'ar' ? (siteSettings.address || CONTACT_INFO.address) : (siteSettings.addressEn || CONTACT_INFO.addressEn);

  const socialIcons = [
    { Icon: TwitterIcon, href: siteSettings.twitter || 'https://twitter.com/almunjiz', label: 'Twitter / X' },
    { Icon: InstagramIcon, href: siteSettings.instagram || 'https://instagram.com/almunjiz', label: 'Instagram' },
    { Icon: YoutubeIcon, href: siteSettings.youtube || 'https://youtube.com/@almunjiz', label: 'YouTube' },
    { Icon: MessageCircle, href: `https://wa.me/${whatsappNum}`, label: 'WhatsApp' },
  ];

  const handleNewsletter = () => {
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer dir={dir} className="relative bg-[#0f172a] text-white overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#2580eb] via-[#14b8a6] to-transparent opacity-50" />

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2580eb]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Logo + Description + Social */}
          <div className="space-y-5">
            <Logo size="md" showText white />
            <p className="text-slate-400 text-sm leading-relaxed">
              {language === 'ar'
                ? 'منصة المنجز الرائدة للخدمات الإلكترونية في المملكة العربية السعودية. نقدم حلولاً سريعة وموثوقة تلبي احتياجاتك.'
                : 'AL-MUNJIZ leading platform for electronic services in Saudi Arabia. Fast and reliable solutions for your needs.'}
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-xl',
                    'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
                    'transition-all duration-200'
                  )}
                  title={social.label}
                >
                  <social.Icon size={16} className="text-slate-400 group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-5">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-200 group"
                  >
                    <ChevronLeft
                      size={12}
                      className={cn(
                        'text-[#2580eb] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200',
                        isRtl && 'rotate-180'
                      )}
                    />
                    <span>{language === 'ar' ? link.label : link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-5">
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-200 group"
                  >
                    <ChevronLeft
                      size={12}
                      className={cn(
                        'text-[#14b8a6] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200',
                        isRtl && 'rotate-180'
                      )}
                    />
                    <span>{language === 'ar' ? link.label : link.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact + Newsletter */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-5">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-3.5">
              <ContactItem
                icon={<Phone size={15} />}
                text={phone}
                href={`tel:${phone}`}
                color="text-[#2580eb]"
              />
              <ContactItem
                icon={<Mail size={15} />}
                text={email}
                href={`mailto:${email}`}
                color="text-[#14b8a6]"
              />
              <ContactItem
                icon={<MessageCircle size={15} />}
                text="WhatsApp"
                href={`https://wa.me/${whatsappNum}?text=${whatsappMessage}`}
                color="text-[#25D366]"
                target="_blank"
              />
              <ContactItem
                icon={<MapPin size={15} />}
                text={address}
                color="text-[#7c3aed]"
              />
              <ContactItem
                icon={<Clock size={15} />}
                text={language === 'ar' ? '🟢 متاح 24 ساعة يوميًا' : '🟢 Available 24/7'}
                color="text-green-400"
              />
            </div>

            <div className="pt-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                {language === 'ar' ? 'النشرة البريدية' : 'Newsletter'}
              </h5>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className={cn(
                    'flex-1 px-3 py-2.5 text-sm rounded-xl',
                    'bg-white/5 border border-white/10 focus:border-[#2580eb]/50',
                    'text-white placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-[#2580eb]/30',
                    'transition-all duration-200'
                  )}
                />
                <motion.button
                  onClick={handleNewsletter}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'px-3 py-2.5 rounded-xl',
                    subscribed ? 'bg-green-500' : 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6]',
                    'text-white text-sm font-semibold',
                    'shadow-lg shadow-[#2580eb]/25',
                    'hover:shadow-xl hover:shadow-[#2580eb]/30',
                    'transition-all duration-200'
                  )}
                >
                  {subscribed ? <CheckCircle size={16} /> : <Send size={16} />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-start">
            © {new Date().getFullYear()} {APP_NAME} AL-MUNJIZ.{' '}
            {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="text-sm text-slate-500">
            <span>Powered by </span>
            <span className="font-bold bg-gradient-to-r from-[#2580eb] to-[#14b8a6] bg-clip-text text-transparent">Z7R Technologies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({
  icon,
  text,
  href,
  color,
  target,
}: {
  icon: React.ReactNode;
  text: string;
  href?: string;
  color: string;
  target?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors duration-200">
      <span className={cn('shrink-0', color)}>{icon}</span>
      <span>{text}</span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className="group block hover:translate-x-1 transition-transform duration-200"
      >
        {content}
      </a>
    );
  }

  return <div className="group">{content}</div>;
}
