import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
  successMessage?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete record?',
  message,
  itemName,
  successMessage = 'Deleted successfully.',
}: DeleteConfirmModalProps) {
  const [status, setStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!isOpen) setStatus('idle');
  }, [isOpen]);

  const handleClose = () => {
    if (status === 'deleting') return;
    onClose();
  };

  const handleConfirm = async () => {
    setStatus('deleting');
    try {
      await onConfirm();
      setStatus('success');
      window.setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    } catch {
      setStatus('error');
    }
  };

  const displayMessage =
    message ??
    (itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : 'Are you sure you want to delete this record? This action cannot be undone.');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary-700" strokeWidth={1.5} />
          <p className="text-sm font-medium text-primary-900">{successMessage}</p>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-slate-600">{displayMessage}</p>
          {status === 'error' && (
            <p className="mt-3 text-sm text-brand-red-600">
              Delete failed. Please try again.
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={status === 'deleting'} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void handleConfirm()}
              disabled={status === 'deleting'}
              className="w-full sm:w-auto"
            >
              {status === 'deleting' ? (
                <>
                  <Spinner size="sm" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
