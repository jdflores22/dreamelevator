import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = 'Content management',
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-gold-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 break-words text-xl font-medium tracking-tight text-primary-900 sm:text-3xl">
          {title}
        </h1>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-brand-red-500 via-brand-gold-500 to-primary-600 sm:mt-3" />
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:mt-3">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto [&_button]:flex-1 sm:[&_button]:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
