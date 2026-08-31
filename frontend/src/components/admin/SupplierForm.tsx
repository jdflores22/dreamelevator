import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { Supplier, UpsertSupplier } from '@/types';

export function SupplierForm({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
  defaultName = '',
}: {
  item?: Supplier | null;
  onSubmit: (data: UpsertSupplier) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultName?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UpsertSupplier>({
    defaultValues: item
      ? {
          name: item.name,
          contactPerson: item.contactPerson,
          email: item.email,
          phone: item.phone,
          country: item.country,
          address: item.address,
          notes: item.notes,
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
        }
      : {
          name: defaultName,
          contactPerson: '',
          email: '',
          phone: '',
          country: '',
          address: '',
          notes: '',
          sortOrder: 0,
          isPublished: true,
        },
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  return (
    <form
      onSubmit={handleSubmit((raw) =>
        onSubmit({
          name: raw.name.trim(),
          contactPerson: raw.contactPerson.trim(),
          email: raw.email.trim(),
          phone: raw.phone.trim(),
          country: raw.country.trim(),
          address: raw.address.trim(),
          notes: raw.notes.trim(),
          sortOrder: Number(raw.sortOrder) || 0,
          isPublished: raw.isPublished === true,
        }),
      )}
      className="space-y-4"
    >
      <Input label="Supplier name" {...register('name', { required: true })} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Contact person" {...register('contactPerson')} />
        <Input label="Country" {...register('country')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Phone" {...register('phone')} />
      </div>

      <Input label="Address" {...register('address')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isPublished')} />
        Active — show in register and stock-out pickers
      </label>

      {item && item.lineCount > 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Used by {item.lineCount} register line{item.lineCount === 1 ? '' : 's'}. Renaming updates
          those lines too.
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {item ? 'Save changes' : 'Add supplier'}
        </Button>
      </div>
    </form>
  );
}
