import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200/80 bg-white shadow-sm [-webkit-overflow-scrolling:touch]',
        className,
      )}
    >
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-primary-50/30 text-[11px] uppercase tracking-wider text-slate-500">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLTableRowElement>) => void;
}) {
  return (
    <tr
      className={cn('transition-colors hover:bg-brand-gold-500/[0.03]', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('px-5 py-3.5 font-medium', className)}>{children}</th>;
}

export function TD({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLTableCellElement>) => void;
}) {
  return (
    <td className={cn('px-5 py-3.5 text-slate-700', className)} onClick={onClick}>
      {children}
    </td>
  );
}
