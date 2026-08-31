import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployeeDepartments,
  useEmployees,
  useUpdateEmployee,
} from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { EmployeeForm } from '@/components/admin/EmployeeForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import type { Employee, UpsertEmployee } from '@/types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatQty(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '0';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

export function EmployeeAvatar({
  name,
  photoUrl,
  className = 'h-9 w-9',
}: {
  name: string;
  photoUrl?: string;
  className?: string;
}) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" className={`${className} rounded-full object-cover`} />;
  }
  return (
    <span
      className={`${className} flex items-center justify-center rounded-full bg-primary-900/10 text-xs font-semibold text-primary-900`}
    >
      {name.slice(0, 2).toUpperCase() || '??'}
    </span>
  );
}

export default function EmployeesAdminPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const params = useMemo(
    () => ({ search: search.trim() || undefined, department: department || undefined, pageSize: 200 }),
    [search, department],
  );
  const { data, isLoading } = useEmployees(params);
  const { data: departments = [] } = useEmployeeDepartments();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const items = data?.items ?? [];
  const activeCount = items.filter((e) => e.isPublished).length;

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = (payload: UpsertEmployee) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, { onSuccess: closeForm });
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm });
    }
  };

  return (
    <div>
      <AdminPageHeader
        className="mb-4 sm:mb-5"
        eyebrow="Operations"
        title="Employees"
        description="Staff profiles used when items are released. Every stock-out is tied to one of these people."
        actions={
          <Button className="min-h-11 w-full sm:w-auto" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Add employee
          </Button>
        }
      />

      <div className="mb-4 grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:grid-cols-3 sm:p-4">
        <Input
          placeholder="Search name, ID, position…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:min-h-0 sm:py-2 sm:text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="self-center text-sm text-slate-500 sm:text-right">
          {items.length} employee{items.length === 1 ? '' : 's'} · {activeCount} active
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          <UserRound className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No employees yet. Add one so stock-outs can be assigned to a profile.
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white md:hidden">
            {items.map((row) => (
              <article key={row.id} className="px-3 py-3.5 sm:px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <EmployeeAvatar name={row.fullName} photoUrl={row.photoUrl} />
                    <div className="min-w-0">
                      <Link
                        to={`/admin/workspace/employees/${row.id}`}
                        className="block truncate text-sm font-medium text-primary-900 hover:text-brand-gold-600 sm:text-base"
                      >
                        {row.fullName}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {row.position || 'No position'}
                        {row.department ? ` · ${row.department}` : ''}
                      </p>
                    </div>
                  </div>
                  {row.isPublished ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="default">Inactive</Badge>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Stock-outs
                    <span className="block text-sm text-primary-900">{row.issuanceCount}</span>
                  </div>
                  <div>
                    Qty received
                    <span className="block text-sm text-primary-900">
                      {formatQty(row.totalQuantityIssued)}
                    </span>
                  </div>
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="min-h-11" onClick={() => setEditing(row)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" className="min-h-11" onClick={() => setDeleting(row)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table className="min-w-0">
              <THead>
                <TR>
                  <TH>Employee</TH>
                  <TH>ID</TH>
                  <TH>Department</TH>
                  <TH>Contact</TH>
                  <TH>Stock-outs</TH>
                  <TH>Last out</TH>
                  <TH>Status</TH>
                  <TH className="w-24"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <EmployeeAvatar name={row.fullName} photoUrl={row.photoUrl} className="h-8 w-8" />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/workspace/employees/${row.id}`}
                            className="block font-medium text-primary-900 hover:text-brand-gold-600"
                          >
                            {row.fullName}
                          </Link>
                          {row.position ? (
                            <span className="block text-[11px] text-slate-500">{row.position}</span>
                          ) : null}
                        </div>
                      </div>
                    </TD>
                    <TD>{row.employeeCode || '—'}</TD>
                    <TD>{row.department || '—'}</TD>
                    <TD className="max-w-[12rem] truncate">{row.email || row.phone || '—'}</TD>
                    <TD className="tabular-nums">
                      {row.issuanceCount}
                      {row.totalQuantityIssued > 0 ? (
                        <span className="block text-[11px] text-slate-500">
                          {formatQty(row.totalQuantityIssued)} qty
                        </span>
                      ) : null}
                    </TD>
                    <TD className="whitespace-nowrap">{formatDate(row.lastIssuedAt)}</TD>
                    <TD>
                      {row.isPublished ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-primary-800"
                          onClick={() => setEditing(row)}
                          aria-label={`Edit ${row.fullName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-brand-red-50 hover:text-brand-red-600"
                          onClick={() => setDeleting(row)}
                          aria-label={`Remove ${row.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </>
      )}

      <Modal
        isOpen={creating || Boolean(editing)}
        onClose={closeForm}
        title={editing ? 'Edit employee' : 'Add employee'}
        size="lg"
      >
        <EmployeeForm
          key={editing?.id ?? 'new-employee'}
          item={editing}
          departments={departments}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={submit}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemName={deleting?.fullName}
        message={
          deleting && deleting.issuanceCount > 0
            ? `${deleting.issuanceCount} stock-out${deleting.issuanceCount === 1 ? '' : 's'} stay on record, but this profile will no longer be selectable.`
            : undefined
        }
        onConfirm={async () => {
          if (!deleting) return;
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
