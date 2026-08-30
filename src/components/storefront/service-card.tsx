'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { ServiceIcon } from '@/components/ui/service-icon';

export interface ServiceCardData {
  id: string;
  slug?: string;
  name: string;
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string | null;
  category: string;
  categoryAr?: string;
  price: number;
  priceNote?: string;
  priceNoteEn?: string;
  duration?: string;
  durationEn?: string;
  isPopular?: boolean;
  gradient?: string;
}

interface ServiceCardProps {
  service: ServiceCardData;
  isAr: boolean;
  index?: number;
  showDescription?: boolean;
}

export function ServiceCard({ service, isAr, index = 0, showDescription = true }: ServiceCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const grad = service.gradient || 'from-[#2580eb] via-[#2580eb] to-[#14b8a6]';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      serviceId: service.id,
      slug: service.slug || service.id,
      nameAr: service.name,
      nameEn: service.nameEn || service.name,
      price: service.price,
      duration: service.duration,
      durationEn: service.durationEn || service.duration,
      icon: service.icon,
      image: service.image,
      categoryAr: service.categoryAr || service.category,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      data-slide
      className="w-[240px] sm:w-[264px] shrink-0"
    >
      <Link
        href={`/services/${service.id}`}
        className="group h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-900/10 hover:border-transparent transition-all duration-300"
      >
        <div className="relative h-32 overflow-hidden">
          {service.image ? (
            <Image
              src={service.image}
              alt={isAr ? service.name : service.nameEn}
              fill
              sizes="280px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', grad)}>
              <ServiceIcon name={service.icon} size={40} className="text-white/90" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {service.isPopular && (
            <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-bold shadow-lg">
              <Star size={11} className="fill-white" />
              {isAr ? 'الأكثر طلباً' : 'Most Popular'}
            </span>
          )}
          <span className="absolute bottom-2.5 start-3 text-white text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
            {ServiceCategoryLabel(service, isAr)}
          </span>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#2580eb] transition-colors">
            {isAr ? service.name : service.nameEn}
          </h3>
          {showDescription && (service.description || service.descriptionEn) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 flex-1">
              {isAr ? service.description : service.descriptionEn}
            </p>
          )}

          {(service.duration || service.durationEn) && (
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400">
              <Clock size={12} />
              {isAr ? service.duration : service.durationEn}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 leading-none">
                {isAr ? service.priceNote || 'يبدأ من' : service.priceNoteEn || 'Starting from'}
              </div>
              <div className="text-base font-extrabold text-[#2580eb] leading-tight mt-0.5">
                {service.price.toFixed(2)} <span className="text-xs font-semibold text-slate-400">{isAr ? 'ر.س' : 'SAR'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={isAr ? 'أضف إلى السلة' : 'Add to cart'}
              title={isAr ? 'أضف إلى السلة' : 'Add to cart'}
              className="p-2 rounded-xl bg-[#2580eb]/10 text-[#2580eb] hover:bg-[#2580eb] hover:text-white transition-colors duration-200 shrink-0"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ServiceCategoryLabel(service: ServiceCardData, isAr: boolean): string {
  if (isAr) return service.categoryAr || service.category;
  return service.category;
}