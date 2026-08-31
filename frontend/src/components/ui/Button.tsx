import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-primary-900 text-white hover:bg-primary-800',
  secondary: 'bg-brand-gold-500 text-primary-950 hover:bg-brand-gold-400',
  gold: 'border border-brand-gold-500 bg-white text-primary-900 hover:bg-brand-gold-500/10',
  outline: 'border border-slate-300 bg-white text-primary-900 hover:border-primary-300 hover:bg-slate-50',
  ghost: 'text-primary-800 hover:bg-slate-100',
  danger: 'bg-brand-red-600 text-white hover:bg-brand-red-700',
} as const;

const sizes = {
  sm: 'px-3.5 py-2 text-xs rounded-sm',
  md: 'px-5 py-2.5 text-sm rounded-sm',
  lg: 'px-7 py-3.5 text-sm font-semibold rounded-sm',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-[background-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-400/60 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
