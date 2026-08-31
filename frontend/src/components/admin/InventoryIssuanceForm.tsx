import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type {
  Client,
  InventoryAvailablePart,
  InventoryEmployeeOption,
  InventoryIssuance,
  InventoryRecipientOption,
  UpsertInventoryIssuance,
} from '@/types';

function recipientModeOf(item?: InventoryIssuance | null): FormValues['recipientMode'] {
  if (!item) return 'employee';
  if (item.receivedByEmployeeId) return 'employee';
  return item.receivedByUserId ? 'user' : 'other';
}

function toDateInput(value?: string | null) {
  if (value) return value.slice(0, 10);
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type FormValues = {
  inventoryPartId: string;
  item: string;
  specification: string;
  quantity: string;
  issuedAt: string;
  recipientMode: 'employee' | 'user' | 'other';
  receivedByEmployeeId: string;
  receivedByUserId: string;
  receivedByName: string;
  clientId: string;
  projectBuilding: string;
  purpose: string;
  notes: string;
};

export function InventoryIssuanceForm({
  item,
  availableParts,
  recipients,
  employees,
  clients,
  onSubmit,
  onCancel,
  isSubmitting,
  defaultPartId,
}: {
  item?: InventoryIssuance | null;
  availableParts: InventoryAvailablePart[];
  recipients: InventoryRecipientOption[];
  employees: InventoryEmployeeOption[];
  clients: Client[];
  onSubmit: (data: UpsertInventoryIssuance) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  defaultPartId?: string;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: item
      ? {
          inventoryPartId: item.inventoryPartId ?? '',
          item: item.item,
          specification: item.specification,
          quantity: String(item.quantity ?? ''),
          issuedAt: toDateInput(item.issuedAt),
          recipientMode: recipientModeOf(item),
          receivedByEmployeeId: item.receivedByEmployeeId ?? '',
          receivedByUserId: item.receivedByUserId ?? '',
          receivedByName: item.receivedByName ?? '',
          clientId: item.clientId ?? '',
          projectBuilding: item.projectBuilding ?? '',
          purpose: item.purpose ?? '',
          notes: item.notes ?? '',
        }
      : {
          inventoryPartId: defaultPartId ?? '',
          item: '',
          specification: '',
          quantity: '',
          issuedAt: toDateInput(null),
          recipientMode: 'employee',
          receivedByEmployeeId: '',
          receivedByUserId: '',
          receivedByName: '',
          clientId: '',
          projectBuilding: '',
          purpose: '',
          notes: '',
        },
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  const partId = watch('inventoryPartId');
  const recipientMode = watch('recipientMode');
  const employeeId = watch('receivedByEmployeeId');

  // Old records still point at a login account; keep that choice visible only for them.
  const legacyUserMode = Boolean(item?.receivedByUserId);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId) ?? null,
    [employees, employeeId],
  );

  // Editing restores this issuance’s qty onto on-hand so the line stays selectable.
  const partOptions = useMemo(() => {
    const extra = item?.inventoryPartId ? item.quantity : 0;
    const mapped = availableParts.map((p) =>
      item?.inventoryPartId === p.id ? { ...p, onHand: p.onHand + extra } : p,
    );
    if (item?.inventoryPartId && !mapped.some((p) => p.id === item.inventoryPartId)) {
      mapped.unshift({
        id: item.inventoryPartId,
        item: item.item,
        specification: item.specification,
        supplier: '',
        projectBuilding: item.projectBuilding,
        purchasedAt: null,
        purchasedQuantity: item.quantity,
        issuedQuantity: 0,
        onHand: extra,
      } satisfies InventoryAvailablePart);
    }
    return mapped;
  }, [availableParts, item]);

  const selectedPart = useMemo(
    () => partOptions.find((p) => p.id === partId) ?? null,
    [partOptions, partId],
  );

  useEffect(() => {
    if (!selectedPart || item) return;
    setValue('item', selectedPart.item);
    setValue('specification', selectedPart.specification);
    if (!watch('projectBuilding')) {
      setValue('projectBuilding', selectedPart.projectBuilding || '');
    }
  }, [selectedPart, item, setValue, watch]);

  const onHandHint = selectedPart
    ? `On hand: ${selectedPart.onHand}${item?.inventoryPartId === selectedPart.id ? ' (current line available for edit)' : ''}`
    : null;

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        const qty = Number(raw.quantity);
        onSubmit({
          inventoryPartId: raw.inventoryPartId || null,
          item: raw.item.trim(),
          specification: raw.specification.trim(),
          quantity: Number.isFinite(qty) ? qty : 0,
          issuedAt: raw.issuedAt || null,
          receivedByEmployeeId:
            raw.recipientMode === 'employee' ? raw.receivedByEmployeeId || null : null,
          receivedByUserId: raw.recipientMode === 'user' ? raw.receivedByUserId || null : null,
          receivedByName: raw.recipientMode === 'other' ? raw.receivedByName.trim() : '',
          clientId: raw.clientId || null,
          clientName: '',
          projectBuilding: raw.projectBuilding.trim(),
          purpose: raw.purpose.trim(),
          notes: raw.notes.trim(),
          isPublished: true,
        });
      })}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <label htmlFor="inventoryPartId" className="block text-sm font-medium text-primary-800">
          Inventory line
        </label>
        <select
          id="inventoryPartId"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
          {...register('inventoryPartId', { required: true })}
        >
          <option value="">Select a part line with stock…</option>
          {partOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.item}
              {p.specification ? ` · ${p.specification}` : ''}
              {` · on hand ${p.onHand}`}
              {p.supplier ? ` · ${p.supplier}` : ''}
            </option>
          ))}
        </select>
        {onHandHint ? <p className="text-xs text-slate-500">{onHandHint}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Item" {...register('item', { required: true })} />
        <Input label="Date out" type="date" {...register('issuedAt')} />
      </div>
      <Input label="Specification" {...register('specification')} />
      <Input
        label="Quantity out"
        type="number"
        step="any"
        min="0"
        {...register('quantity', { required: true })}
      />

      <div className="rounded-xl border border-slate-200 p-3 space-y-3">
        <p className="text-sm font-medium text-primary-900">Received by</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="employee" {...register('recipientMode')} />
            Employee
          </label>
          {legacyUserMode ? (
            <label className="inline-flex items-center gap-2">
              <input type="radio" value="user" {...register('recipientMode')} />
              Team user (legacy)
            </label>
          ) : null}
          <label className="inline-flex items-center gap-2">
            <input type="radio" value="other" {...register('recipientMode')} />
            Other (type name)
          </label>
        </div>
        {recipientMode === 'employee' ? (
          <>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
              {...register('receivedByEmployeeId', { required: recipientMode === 'employee' })}
            >
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.position ? ` · ${e.position}` : ''}
                  {e.employeeCode ? ` · ${e.employeeCode}` : ''}
                </option>
              ))}
            </select>
            {selectedEmployee ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                {selectedEmployee.photoUrl ? (
                  <img
                    src={selectedEmployee.photoUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-900/10 text-xs font-semibold text-primary-900">
                    {selectedEmployee.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-900">{selectedEmployee.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[selectedEmployee.position, selectedEmployee.department, selectedEmployee.employeeCode]
                      .filter(Boolean)
                      .join(' · ') || 'No profile details yet'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Missing someone?{' '}
                <Link to="/admin/workspace/employees" className="font-semibold text-primary-800 hover:underline">
                  Manage employees
                </Link>
              </p>
            )}
          </>
        ) : recipientMode === 'user' ? (
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
            {...register('receivedByUserId', { required: recipientMode === 'user' })}
          >
            <option value="">Select team user…</option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.email ? ` · ${r.email}` : ''}
              </option>
            ))}
          </select>
        ) : (
          <Input
            label="Recipient name"
            placeholder="Full name of person who received the item"
            {...register('receivedByName', { required: recipientMode === 'other' })}
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="block text-sm font-medium text-primary-800">
            Company (client)
          </label>
          <select
            id="clientId"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
            {...register('clientId')}
          >
            <option value="">Select company…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.location ? ` · ${c.location}` : ''}
              </option>
            ))}
          </select>
        </div>
        <Input label="Project / building" {...register('projectBuilding')} />
      </div>

      <Input label="Purpose" placeholder="Installation, repair, delivery…" {...register('purpose')} />
      <Textarea label="Notes" rows={3} {...register('notes')} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {item ? 'Save changes' : 'Record stock out'}
        </Button>
      </div>
    </form>
  );
}
