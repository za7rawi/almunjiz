'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function useDragScroll(isRtl: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const moved = useRef(0);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    isDown.current = true;
    moved.current = 0;
    startX.current = e.clientX;
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !isDown.current) return;
    const dx = e.clientX - startX.current;
    moved.current = Math.max(moved.current, Math.abs(dx));
    el.scrollBy({ left: -dx });
    startX.current = e.clientX;
  };

  const endDrag = () => {
    isDown.current = false;
    ref.current?.classList.remove('dragging');
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    endDrag();
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (moved.current > 6) e.stopPropagation();
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = 0;
    }
  };

  const stepSize = () => {
    const el = ref.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>('[data-slide]');
    return card ? card.offsetWidth + 16 : Math.round(el.clientWidth * 0.8);
  };

  const goForward = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: isRtl ? -stepSize() : stepSize(), behavior: 'smooth' });
  };

  const goBack = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: isRtl ? stepSize() : -stepSize(), behavior: 'smooth' });
  };

  return { ref, canScroll, onPointerDown, onPointerMove, onPointerUp, onClickCapture, goForward, goBack };
}

interface HorizontalSliderProps {
  children: React.ReactNode;
  isRtl: boolean;
  nextLabel?: string;
  prevLabel?: string;
  className?: string;
}

export function HorizontalSlider({
  children,
  isRtl,
  nextLabel,
  prevLabel,
  className,
}: HorizontalSliderProps) {
  const { ref, canScroll, onPointerDown, onPointerMove, onPointerUp, onClickCapture, goForward, goBack } = useDragScroll(isRtl);
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const next = nextLabel ?? 'Next';
  const prev = prevLabel ?? 'Previous';

  return (
    <div className="relative">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
        className={cn('slider-grab flex gap-4 overflow-x-auto select-none touch-pan-y cursor-grab scroll-smooth scrollbar-hide', className)}
      >
        {children}
      </div>
      {canScroll && (
        <>
          <button
            type="button"
            onClick={goForward}
            aria-label={next}
            className={cn(
              'hidden sm:flex absolute top-1/2 -translate-y-1/2 end-0 z-10',
              'w-9 h-9 rounded-full items-center justify-center transition-colors shadow-lg',
              'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
            )}
          >
            <NextIcon size={18} />
          </button>
          <button
            type="button"
            onClick={goBack}
            aria-label={prev}
            className={cn(
              'hidden sm:flex absolute top-1/2 -translate-y-1/2 start-0 z-10',
              'w-9 h-9 rounded-full items-center justify-center transition-colors shadow-lg',
              'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
            )}
          >
            <PrevIcon size={18} />
          </button>
        </>
      )}
    </div>
  );
}