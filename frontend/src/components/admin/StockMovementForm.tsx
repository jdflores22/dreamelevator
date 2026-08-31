import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type {
  InventoryAvailablePart,
  InventoryEmployeeOption,
  StockMovementType,
  UpsertStockMovement,
} from '@/types';

const TYPE_LABELS: Record<StockMovementType, string> = {
  Return: 'Return to stock',
  Damage: 'Damaged',
  Loss: 'Lost / missing',
  Adjustment: 'Count adjustment',
};

const TYPE_HINTS: Record<StockMovementType, string> = {
  Return: 'Unused parts coming back from the field. Adds stock back.',
  Damage: 'Broken or unusable parts written off. Deducts stock.',
  Loss: 'Missing or unaccounted parts. Deducts stock.',
  Adjustment: 'Correction after a physical count. Can add or deduct.',
};

function todayInput() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

type FormValues = {
  inventoryPartId: string;
  movementType: StockMovementType;
  quantity: string;
  damagedQuantity: string;
  direction: 'increase' | 'decrease';
  occurredAt: string;
  employeeId: string;
  employeeName: string;
  reason: string;
  notes: string;
};

/** The stock-out a return is being posted against, which caps what can come back. */
export type ReturnSource = {
  issuanceId: string;
  item: string;
  issuedQuantity: number;
  returnedQuantity: number;
  returnableQuantity: number;
  receivedByName: string;
  issuedAt: string | null;
};

export function StockMovementForm({
  parts,
  employees,
  defaults,
  returnSource,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  /** Every part line, including zero stock, since returns put stock back. */
  parts: Pick<InventoryAvailablePart, 'id' | 'item' | 'specification' | 'onHand'>[];
  employees: InventoryEmployeeOption[];
  defaults?: Partial<FormValues> & { sourceIssuanceId?: string | null };
  returnSource?: ReturnSource | null;
  onSubmit: (data: UpsertStockMovement) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      inventoryPartId: defaults?.inventoryPartId ?? '',
      movementType: returnSource ? 'Return' : defaults?.movementType ?? 'Return',
      quantity: defaults?.quantity ?? (returnSource ? String(returnSource.returnableQuantity) : ''),
      damagedQuantity: '',
      direction: defaults?.direction ?? 'decrease',
      occurredAt: defaults?.occurredAt ?? todayInput(),
      employeeId: defaults?.employeeId ?? '',
      employeeName: defaults?.employeeName ?? '',
      reason: defaults?.reason ?? '',
      notes: defaults?.notes ?? '',
    },
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  const movementType = watch('movementType');
  const partId = watch('inventoryPartId');
  const quantity = Number(watch('quantity')) || 0;
  const selectedPart = useMemo(() => parts.find((p) => p.id === partId) ?? null, [parts, partId]);

  const isReturn = movementType === 'Return';
  const isAdjustment = movementType === 'Adjustment';
  const maxReturn = returnSource?.returnableQuantity ?? null;

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        const qty = Number(raw.quantity);
        const damaged = Number(raw.damagedQuantity);
        onSubmit({
          inventoryPartId: raw.inventoryPartId,
          movementType: raw.movementType,
          quantity: Number.isFinite(qty) ? qty : 0,
          damagedQuantity: raw.movementType === 'Return' && Number.isFinite(damaged) ? damaged : 0,
          increase: raw.movementType === 'Adjustment' ? raw.direction === 'increase' : false,
          occurredAt: raw.occurredAt || null,
          sourceIssuanceId: defaults?.sourceIssuanceId ?? null,
          employeeId: raw.employeeId || null,
          employeeName: raw.employeeId ? '' : raw.employeeName.trim(),
          reason: raw.reason.trim(),
          notes: raw.notes.trim(),
        });
      })}
      className="space-y-4"
    >
      {returnSource ? (
        <div className="rounded-xl border border-emerald-600/20 bg-emerald-50/60 px-3 py-2.5">
          <p className="text-sm font-medium text-primary-900">Settling a stock-out</p>
          <p className="mt-0.5 text-xs text-slate-600">
            {returnSource.item} · issued {returnSource.issuedQuantity}
            {returnSource.receivedByName ? ` to ${returnSource.receivedByName}` : ''}
            {returnSource.returnedQuantity > 0 ? ` · ${returnSource.returnedQuantity} already settled` : ''}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            Up to {returnSource.returnableQuantity} can still be accounted for.
          </p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="movementType" className="block text-sm font-medium text-primary-800">
          Movement type
        </label>
        <select
          id="movementType"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
          {...register('movementType')}
        >
          {(Object.keys(TYPE_LABELS) as StockMovementType[])
            // A count fix corrects the shelf, so it never belongs to one stock-out.
            .filter((type) => !returnSource || type !== 'Adjustment')
            .map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
        </select>
        <p className="text-xs text-slate-500">
          {returnSource && !isReturn
            ? 'These pieces already left stock on the stock-out, so this only writes them off — it will not deduct again.'
            : TYPE_HINTS[movementType]}
        </p>
      </div>

      <div className={returnSource ? 'hidden' : 'space-y-1.5'}>
        <label htmlFor="inventoryPartId" className="block text-sm font-medium text-primary-800">
          Inventory line
        </label>
        <select
          id="inventoryPartId"
          disabled={Boolean(defaults?.inventoryPartId)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 disabled:bg-slate-50 sm:py-2 sm:text-sm"
          {...register('inventoryPartId', { required: true })}
        >
          <option value="">Select a part line…</option>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.item}
              {p.specification ? ` · ${p.specification}` : ''}
              {` · on hand ${p.onHand}`}
            </option>
          ))}
        </select>
        {selectedPart ? (
          <p className="text-xs text-slate-500">On hand now: {selectedPart.onHand}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={returnSource ? (isReturn ? 'Quantity returned' : `Quantity ${TYPE_LABELS[movementType].toLowerCase()}`) : 'Quantity'}
          type="number"
          step="any"
          min="0"
          max={maxReturn ?? undefined}
          error={
            maxReturn != null && quantity > maxReturn
              ? `Only ${maxReturn} left to settle on this stock-out`
              : undefined
          }
          {...register('quantity', {
            required: true,
            validate: (value) =>
              maxReturn == null ||
              Number(value) <= maxReturn ||
              `Only ${maxReturn} left to settle on this stock-out`,
          })}
        />
        <Input label="Date" type="date" {...register('occurredAt')} />
      </div>

      {isReturn ? (
        <div className="space-y-1.5">
          <Input
          label="Of those, how many are damaged?"
          type="number"
          step="any"
          min="0"
          max={quantity || undefined}
          error={
            Number(watch('damagedQuantity')) > quantity
              ? 'Damaged cannot be more than the returned quantity'
              : undefined
          }
            {...register('damagedQuantity', {
              validate: (value) =>
                !value ||
                Number(value) <= quantity ||
                'Damaged cannot be more than the returned quantity',
            })}
          />
          <p className="text-xs text-slate-500">
            Damaged pieces are written off, not added back to usable stock. Leave blank if
            everything came back in good condition.
          </p>
        </div>
      ) : null}

      {isAdjustment ? (
        <div className="rounded-xl border border-slate-200 p-3 space-y-2">
          <p className="text-sm font-medium text-primary-900">Direction</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="decrease" {...register('direction')} />
              Deduct (count is lower)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="increase" {...register('direction')} />
              Add (count is higher)
            </label>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 p-3 space-y-3">
        <p className="text-sm font-medium text-primary-900">
          {isReturn ? 'Returned by' : 'Responsible person'}
          <span className="ml-1 font-normal text-slate-500">(optional)</span>
        </p>
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
          {...register('employeeId')}
        >
          <option value="">Not tied to an employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.position ? ` · ${e.position}` : ''}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Reason"
        placeholder={isReturn ? 'Job finished, extra parts' : 'Dropped during install, count variance…'}
        {...register('reason')}
      />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Record movement
        </Button>
      </div>
    </form>
  );
}
