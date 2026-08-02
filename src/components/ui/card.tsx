'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  glass?: boolean;
  gradientBorder?: boolean;
  padding?: CardPadding;
  border?: boolean;
  children?: React.ReactNode;
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const paddingMap: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const Card = ({
  glass = false,
  gradientBorder = false,
  padding = 'md',
  border = true,
  className,
  children,
  ...props
}: CardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm transition-shadow duration-300',
        'hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30',
        border && !gradientBorder && 'border border-slate-200 dark:border-white/10',
        glass &&
          'bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl shadow-black/5',
        gradientBorder &&
          'relative p-[1px] bg-gradient-to-br from-[#2580eb] via-[#14b8a6] to-[#7c3aed]',
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {gradientBorder ? (
        <div className="rounded-[calc(1rem-1px)] bg-white dark:bg-slate-900/90 h-full">
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};

const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn('pb-4 border-b border-slate-100 dark:border-white/5', className)} {...props} />
);

const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn('pt-4', className)} {...props} />
);

const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn('pt-4 border-t border-slate-100 dark:border-white/5', className)} {...props} />
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter, type CardProps };
