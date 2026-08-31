import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useToastStore, type Toast, type ToastVariant } from '@/store/toastStore';
import { cn } from '@/utils/cn';

const variantStyles: Record<
  ToastVariant,
  { icon: LucideIcon; iconClass: string; accent: string }
> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-500', accent: 'border-l-emerald-500' },
  error: { icon: XCircle, iconClass: 'text-brand-red-500', accent: 'border-l-brand-red-500' },
  warning: { icon: AlertTriangle, iconClass: 'text-brand-gold-500', accent: 'border-l-brand-gold-500' },
  info: { icon: Info, iconClass: 'text-primary-600', accent: 'border-l-primary-600' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { icon: Icon, iconClass, accent } = variantStyles[toast.variant];

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-[min(20rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-l-4 border-slate-200 bg-white px-4 py-3 shadow-lg',
        'animate-[toast-in_0.2s_ease-out]',
        accent,
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
