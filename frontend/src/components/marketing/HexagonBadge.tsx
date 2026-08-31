import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type HexagonBadgeProps = {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fillClassName?: string;
  stroke?: string;
  isDark?: boolean;
  showUnevenStroke?: boolean;
};

const sizeClass = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
} as const;

/** Architectural icon well — left rail instead of the old Trans-Net hexagon. */
export function HexagonBadge({
  children,
  className,
  size = 'md',
  fillClassName,
  isDark = false,
}: HexagonBadgeProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm',
        sizeClass[size],
        isDark ? 'bg-white/8' : 'bg-primary-50',
        fillClassName,
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] bg-brand-gold-500"
        aria-hidden
      />
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </div>
  );
}
