import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useSuppliers } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { InventoryPart, UpsertInventoryPart } from '@/types';

const NEW_SUPPLIER = '__new__';

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const emptyValues: UpsertInventoryPart = {
  purchasedAt: '',
  supplier: '',
  item: '',
  specification: '',
  quantity: null,
  unitPrice: null,
  totalPrice: null,
  amountInPeso: null,
  projectBuilding: '',
  lineKind: 'Part',
  currency: 'USD',
  notes: '',
  sortOrder: 0,
  isPublished: true,
};

export function InventoryPartForm({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
  defaultLineKind = 'Part',
  defaultSupplier = '',
}: {
  item?: InventoryPart | null;
  onSubmit: (data: UpsertInventoryPart) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultLineKind?: string;
  defaultSupplier?: string;
}) {
  const { data: supplierData } = useSuppliers({ activeOnly: true, pageSize: 200 });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<Record<string, unknown>>({
    defaultValues: item
      ? {
          ...item,
          purchasedAt: toDateInput(item.purchasedAt),
          quantity: item.quantity ?? '',
          unitPrice: item.unitPrice ?? '',
          totalPrice: item.totalPrice ?? '',
          amountInPeso: item.amountInPeso ?? '',
        }
      : { ...emptyValues, lineKind: defaultLineKind || 'Part', supplier: defaultSupplier },
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  const currentSupplier = item?.supplier ?? defaultSupplier;
  const supplierNames = useMemo(() => {
    const names = (supplierData?.items ?? []).map((s) => s.name);
    // Keep a legacy name selectable even if it is not in the master list yet.
    if (currentSupplier && !names.some((n) => n.toLowerCase() === currentSupplier.toLowerCase())) {
      return [currentSupplier, ...names];
    }
    return names;
  }, [supplierData, currentSupplier]);

  const [typingSupplier, setTypingSupplier] = useState(false);

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        const supplier = String(raw.supplier || '').trim();
        onSubmit({
          purchasedAt: String(raw.purchasedAt || '') || null,
          supplier: supplier === NEW_SUPPLIER ? '' : supplier,
          item: String(raw.item || '').trim(),
          specification: String(raw.specification || '').trim(),
          quantity: parseOptionalNumber(raw.quantity),
          unitPrice: parseOptionalNumber(raw.unitPrice),
          totalPrice: parseOptionalNumber(raw.totalPrice),
          amountInPeso: parseOptionalNumber(raw.amountInPeso),
          projectBuilding: String(raw.projectBuilding || '').trim(),
          lineKind: String(raw.lineKind || 'Part'),
          currency: 'USD',
          notes: String(raw.notes || '').trim(),
          sortOrder: Number(raw.sortOrder) || 0,
          isPublished: raw.isPublished === true,
        });
      })}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Date" type="date" {...register('purchasedAt')} />
        <div className="space-y-1.5">
          <label htmlFor="lineKind" className="block text-sm font-medium text-primary-800">
            Type
          </label>
          <select
            id="lineKind"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
            {...register('lineKind')}
          >
            <option value="Part">Part</option>
            <option value="Charge">Charge (freight, bank, ocean)</option>
            <option value="Note">Note</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="supplier" className="block text-sm font-medium text-primary-800">
            Supplier
          </label>
          <Link
            to="/admin/workspace/suppliers"
            className="text-xs font-semibold text-primary-800 hover:underline"
          >
            Manage suppliers
          </Link>
        </div>
        {typingSupplier ? (
          <>
            <input
              id="supplier"
              placeholder="Type the new supplier name"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
              {...register('supplier')}
            />
            <button
              type="button"
              className="text-xs font-medium text-slate-500 hover:text-primary-800"
              onClick={() => {
                setTypingSupplier(false);
                setValue('supplier', currentSupplier, { shouldDirty: true });
              }}
            >
              Pick from the list instead
            </button>
          </>
        ) : (
          <select
            id="supplier"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
            {...register('supplier', {
              onChange: (e) => {
                if (e.target.value !== NEW_SUPPLIER) return;
                setTypingSupplier(true);
                setValue('supplier', '', { shouldDirty: true });
              },
            })}
          >
            <option value="">No supplier</option>
            {supplierNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={NEW_SUPPLIER}>＋ New supplier…</option>
          </select>
        )}
      </div>
      <Input label="Item" {...register('item', { required: true })} />
      <Input label="Specification" {...register('specification')} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Quantity" type="number" step="any" {...register('quantity')} />
        <Input label="Unit price (USD)" type="number" step="any" {...register('unitPrice')} />
        <Input label="Total (USD)" type="number" step="any" {...register('totalPrice')} />
        <Input label="In peso (₱)" type="number" step="any" {...register('amountInPeso')} />
      </div>
      <p className="text-xs text-slate-500">
        Unit and total are USD from the foreign supplier. Fill In peso when you have the PHP amount;
        otherwise the dashboard estimates ₱ at ₱58 / $1.
      </p>

      <Input label="Project / building" {...register('projectBuilding')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isPublished')} />
        Include in dashboard totals
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {item ? 'Save changes' : 'Add line'}
        </Button>
      </div>
    </form>
  );
}
