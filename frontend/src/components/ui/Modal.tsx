import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center p-0 sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative z-10 flex h-full w-full max-h-none flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-200/50',
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          'sm:h-auto sm:max-h-[min(90dvh,calc(100vh-2rem))] sm:rounded-2xl',
          sizes[size],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-primary-50/40 px-4 py-3 sm:px-6 sm:py-4">
            <h2 id="modal-title" className="pr-3 text-base font-medium text-primary-900 sm:text-lg">
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="min-h-11 min-w-11">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
