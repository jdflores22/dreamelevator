import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, PackageMinus, Pencil, Plus, Trash2, Undo2 } from 'lucide-react';
import {
  useAdminInventoryIssuances,
  useClients,
  useCreateInventoryIssuance,
  useDeleteInventoryIssuance,
  useInventoryIssuanceOptions,
  useUpdateInventoryIssuance,
} from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { InventoryIssuanceForm } from '@/components/admin/InventoryIssuanceForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import type { InventoryIssuance, UpsertInventoryIssuance } from '@/types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatQty(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

export default function InventoryStockOutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const partIdFromQuery = searchParams.get('partId') ?? '';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [creating, setCreating] = useState(Boolean(partIdFromQuery));
  const [editing, setEditing] = useState<InventoryIssuance | null>(null);
  const [deleting, setDeleting] = useState<InventoryIssuance | null>(null);

  useEffect(() => {
    if (partIdFromQuery) setCreating(true);
  }, [partIdFromQuery]);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      clientId: clientId || undefined,
      employeeId: employeeId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize: 25,
    }),
    [search, clientId, employeeId, from, to, page],
  );

  const { data, isLoading } = useAdminInventoryIssuances(params);
  const { data: options } = useInventoryIssuanceOptions();
  const { data: clients = [] } = useClients({ pageSize: 100 });
  const createMutation = useCreateInventoryIssuance();
  const updateMutation = useUpdateInventoryIssuance();
  const deleteMutation = useDeleteInventoryIssuance();

  const items = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const availableParts = options?.availableParts ?? [];
  const recipients = options?.recipients ?? [];
  const employees = options?.employees ?? [];

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    if (partIdFromQuery) {
      searchParams.delete('partId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const submit = (payload: UpsertInventoryIssuance) => {
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
        title="Stock out"
        description="Issue parts to an employee, and record the destination company and project."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/admin/workspace/inventory"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-primary-900/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Register
            </Link>
            <Button className="min-h-11 w-full sm:w-auto" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Record stock out
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-5">
        <Input
          placeholder="Search item, recipient, project…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:min-h-0 sm:py-2 sm:text-sm"
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All companies</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:min-h-0 sm:py-2 sm:text-sm"
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.position ? ` · ${e.position}` : ''}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          <PackageMinus className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No stock-out records match these filters.
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white md:hidden">
            {items.map((row) => (
              <article key={row.id} className="px-3 py-3.5 sm:px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900 sm:text-base">{row.item}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {formatDate(row.issuedAt)}
                      {row.receivedByName ? ` · ${row.receivedByName}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-primary-900">
                    −{formatQty(row.quantity)}
                    {row.returnedQuantity > 0 ? (
                      <span className="block text-[11px] font-normal text-emerald-700">
                        {formatQty(row.returnedQuantity)} settled
                      </span>
                    ) : null}
                  </span>
                </div>
                {row.specification ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{row.specification}</p>
                ) : null}
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Company
                    <span className="block text-sm text-primary-900">{row.clientName || '—'}</span>
                  </div>
                  <div>
                    Project
                    <span className="block text-sm text-primary-900">{row.projectBuilding || '—'}</span>
                  </div>
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {row.inventoryPartId && row.returnableQuantity > 0 ? (
                    <Link
                      to={`/admin/workspace/inventory/movements?partId=${row.inventoryPartId}&issuanceId=${row.id}&type=Return${
                        row.receivedByEmployeeId ? `&employeeId=${row.receivedByEmployeeId}` : ''
                      }`}
                      className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-emerald-700 hover:border-emerald-600/30"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      Return or write off {formatQty(row.returnableQuantity)}
                    </Link>
                  ) : null}
                  <Button size="sm" variant="outline" className="min-h-11" onClick={() => setEditing(row)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" className="min-h-11" onClick={() => setDeleting(row)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table className="min-w-0">
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Item</TH>
                  <TH>Qty</TH>
                  <TH>Received by</TH>
                  <TH>Company</TH>
                  <TH>Project</TH>
                  <TH>Recorded by</TH>
                  <TH className="w-24"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className="whitespace-nowrap">{formatDate(row.issuedAt)}</TD>
                    <TD>
                      <p className="font-medium text-primary-900">{row.item}</p>
                      {row.specification ? (
                        <p className="max-w-[14rem] truncate text-xs text-slate-500" title={row.specification}>
                          {row.specification}
                        </p>
                      ) : null}
                    </TD>
                    <TD className="tabular-nums font-medium text-primary-900">
                      {formatQty(row.quantity)}
                      {row.returnedQuantity > 0 ? (
                        <span className="mt-0.5 block text-[11px] font-normal text-emerald-700">
                          {formatQty(row.returnedQuantity)} settled
                        </span>
                      ) : null}
                    </TD>
                    <TD>
                      {row.receivedByEmployeeId ? (
                        <Link
                          to={`/admin/workspace/employees/${row.receivedByEmployeeId}`}
                          className="font-medium text-primary-800 hover:underline"
                        >
                          {row.receivedByName}
                        </Link>
                      ) : (
                        row.receivedByName || '—'
                      )}
                      {row.receivedByPosition ? (
                        <span className="block text-[11px] text-slate-500">{row.receivedByPosition}</span>
                      ) : null}
                    </TD>
                    <TD className="max-w-[10rem] truncate">{row.clientName || '—'}</TD>
                    <TD className="max-w-[10rem] truncate">{row.projectBuilding || '—'}</TD>
                    <TD className="text-slate-500">{row.issuedByName || '—'}</TD>
                    <TD>
                      <div className="flex justify-end gap-1">
                        {row.inventoryPartId && row.returnableQuantity > 0 ? (
                          <Link
                            to={`/admin/workspace/inventory/movements?partId=${row.inventoryPartId}&issuanceId=${row.id}&type=Return${
                              row.receivedByEmployeeId ? `&employeeId=${row.receivedByEmployeeId}` : ''
                            }`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
                            aria-label={`Return or write off ${row.item}`}
                            title="Return to stock, or write off as damaged or lost"
                          >
                            <Undo2 className="h-4 w-4" />
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-primary-800"
                          onClick={() => setEditing(row)}
                          aria-label={`Edit ${row.item}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-brand-red-50 hover:text-brand-red-600"
                          onClick={() => setDeleting(row)}
                          aria-label={`Delete ${row.item}`}
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

          {totalPages > 1 && (
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                {meta?.total ?? 0} stock-out{(meta?.total ?? 0) === 1 ? '' : 's'} · page {page}/{totalPages}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 sm:min-h-0"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11 sm:min-h-0"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={creating || Boolean(editing)}
        onClose={closeForm}
        title={editing ? 'Edit stock out' : 'Record stock out'}
        size="lg"
      >
        <InventoryIssuanceForm
          key={editing?.id ?? `new-${partIdFromQuery || 'blank'}`}
          item={editing}
          defaultPartId={editing ? undefined : partIdFromQuery || undefined}
          availableParts={availableParts}
          recipients={recipients}
          employees={employees}
          clients={clients}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={submit}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemName={deleting?.item}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
