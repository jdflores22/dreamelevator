import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import type { Employee, UpsertEmployee } from '@/types';

type FormValues = Omit<UpsertEmployee, 'hiredAt' | 'userId'> & { hiredAt: string };

export function EmployeeForm({
  item,
  departments,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  item?: Employee | null;
  departments: string[];
  onSubmit: (data: UpsertEmployee) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: item
      ? {
          employeeCode: item.employeeCode,
          firstName: item.firstName,
          lastName: item.lastName,
          position: item.position,
          department: item.department,
          email: item.email,
          phone: item.phone,
          photoUrl: item.photoUrl,
          hiredAt: item.hiredAt ? item.hiredAt.slice(0, 10) : '',
          notes: item.notes,
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
        }
      : {
          employeeCode: '',
          firstName: '',
          lastName: '',
          position: '',
          department: '',
          email: '',
          phone: '',
          photoUrl: '',
          hiredAt: '',
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
          employeeCode: raw.employeeCode.trim(),
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          position: raw.position.trim(),
          department: raw.department.trim(),
          email: raw.email.trim(),
          phone: raw.phone.trim(),
          photoUrl: raw.photoUrl.trim(),
          hiredAt: raw.hiredAt || null,
          notes: raw.notes.trim(),
          sortOrder: Number(raw.sortOrder) || 0,
          userId: item?.userId ?? null,
          isPublished: raw.isPublished === true,
        }),
      )}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" {...register('firstName', { required: true })} />
        <Input label="Last name" {...register('lastName')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Employee ID" placeholder="e.g. DE-014" {...register('employeeCode')} />
        <Input label="Position" placeholder="Technician, driver…" {...register('position')} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="department" className="block text-sm font-medium text-primary-800">
          Department
        </label>
        <input
          id="department"
          list="employee-departments"
          placeholder="Operations, Warehouse…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:py-2 sm:text-sm"
          {...register('department')}
        />
        <datalist id="employee-departments">
          {departments.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Phone" {...register('phone')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Date hired" type="date" {...register('hiredAt')} />
        <Input label="Photo URL" placeholder="https://…" {...register('photoUrl')} />
      </div>

      <Textarea label="Notes" rows={3} {...register('notes')} />

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('isPublished')} />
        Active — can receive stock-outs
      </label>

      {item && item.issuanceCount > 0 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Received {item.issuanceCount} stock-out{item.issuanceCount === 1 ? '' : 's'}. Renaming
          updates those slips too.
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {item ? 'Save changes' : 'Add employee'}
        </Button>
      </div>
    </form>
  );
}
