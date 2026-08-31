import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-primary-800">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 sm:py-2 sm:text-sm',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
