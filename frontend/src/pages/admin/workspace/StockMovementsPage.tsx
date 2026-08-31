import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Repeat2, Trash2 } from 'lucide-react';
import {
  useAdminInventory,
  useCreateStockMovement,
  useDeleteStockMovement,
  useInventoryIssuance,
  useInventoryIssuanceOptions,
  useStockMovements,
} from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { StockMovementForm } from '@/components/admin/StockMovementForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import type { StockMovement, StockMovementType, UpsertStockMovement } from '@/types';

const TYPES: StockMovementType[] = ['Return', 'Damage', 'Loss', 'Adjustment'];

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

function signedQty(delta: number) {
  return `${delta > 0 ? '+' : '−'}${formatQty(Math.abs(delta))}`;
}

function typeBadge(type: string) {
  if (type === 'Return') return <Badge variant="success">Return</Badge>;
  if (type === 'Adjustment') return <Badge variant="default">Adjustment</Badge>;
  return <Badge variant="danger">{type}</Badge>;
}

export default function StockMovementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const partIdFromQuery = searchParams.get('partId') ?? '';
  const issuanceIdFromQuery = searchParams.get('issuanceId') ?? '';
  const typeFromQuery = (searchParams.get('type') as StockMovementType | null) ?? null;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [creating, setCreating] = useState(Boolean(partIdFromQuery));
  const [deleting, setDeleting] = useState<StockMovement | null>(null);

  useEffect(() => {
    if (partIdFromQuery) setCreating(true);
  }, [partIdFromQuery]);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      movementType: movementType || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize: 25,
    }),
    [search, movementType, from, to, page],
  );

  const { data, isLoading } = useStockMovements(params);
  const { data: options } = useInventoryIssuanceOptions();
  // Returns can target a line that is already at zero, so pull every Part row.
  const { data: partData } = useAdminInventory({ lineKind: 'Part', pageSize: 500 });
  const { data: sourceIssuance } = useInventoryIssuance(issuanceIdFromQuery || undefined);
  const createMutation = useCreateStockMovement();
  const deleteMutation = useDeleteStockMovement();

  const items = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const employees = options?.employees ?? [];

  const parts = useMemo(
    () =>
      (partData?.items ?? []).map((p) => ({
        id: p.id,
        item: p.item,
        specification: p.specification,
        onHand: p.onHand,
      })),
    [partData],
  );

  const closeForm = () => {
    setCreating(false);
    if (partIdFromQuery || issuanceIdFromQuery || typeFromQuery) {
      searchParams.delete('partId');
      searchParams.delete('issuanceId');
      searchParams.delete('type');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const submit = (payload: UpsertStockMovement) => {
    createMutation.mutate(payload, { onSuccess: closeForm });
  };

  return (
    <div>
      <AdminPageHeader
        className="mb-4 sm:mb-5"
        eyebrow="Operations"
        title="Stock movements"
        description="Returns from the field, damaged and lost parts, and physical-count corrections."
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
              Record movement
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-4">
        <Input
          placeholder="Search item, person, reason…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:min-h-0 sm:py-2 sm:text-sm"
          value={movementType}
          onChange={(e) => {
            setMovementType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All movement types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
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
          <Repeat2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No movements recorded yet. Use this page for returns, damage, loss, and count fixes.
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
                      {formatDate(row.occurredAt)}
                      {row.employeeName ? ` · ${row.employeeName}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      row.delta > 0 ? 'text-emerald-600' : 'text-brand-red-600'
                    }`}
                  >
                    {signedQty(row.delta)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {typeBadge(row.movementType)}
                  {row.damagedQuantity > 0 ? (
                    <span className="text-xs text-brand-red-600">
                      {formatQty(row.damagedQuantity)} damaged
                    </span>
                  ) : null}
                  <span className="text-xs text-slate-500">on hand {formatQty(row.onHandAfter)}</span>
                </div>
                {row.reason ? <p className="mt-2 text-sm text-slate-600">{row.reason}</p> : null}
                <div className="mt-3">
                  <Button size="sm" variant="danger" className="min-h-11 w-full" onClick={() => setDeleting(row)}>
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
                  <TH>Type</TH>
                  <TH>Item</TH>
                  <TH>Change</TH>
                  <TH>On hand</TH>
                  <TH>Person</TH>
                  <TH>Reason</TH>
                  <TH>Recorded by</TH>
                  <TH className="w-16"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className="whitespace-nowrap">{formatDate(row.occurredAt)}</TD>
                    <TD>
                      {typeBadge(row.movementType)}
                      {row.damagedQuantity > 0 ? (
                        <span className="mt-1 block text-[11px] text-brand-red-600">
                          {formatQty(row.damagedQuantity)} damaged
                        </span>
                      ) : null}
                    </TD>
                    <TD>
                      <p className="font-medium text-primary-900">{row.item}</p>
                      {row.specification ? (
                        <p className="max-w-[14rem] truncate text-xs text-slate-500">{row.specification}</p>
                      ) : null}
                    </TD>
                    <TD
                      className={`tabular-nums font-medium ${
                        row.delta > 0 ? 'text-emerald-600' : 'text-brand-red-600'
                      }`}
                    >
                      {signedQty(row.delta)}
                    </TD>
                    <TD className="tabular-nums">{formatQty(row.onHandAfter)}</TD>
                    <TD className="max-w-[10rem] truncate">{row.employeeName || '—'}</TD>
                    <TD className="max-w-[12rem] truncate">{row.reason || '—'}</TD>
                    <TD className="text-slate-500">{row.recordedByName || '—'}</TD>
                    <TD>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-brand-red-50 hover:text-brand-red-600"
                          onClick={() => setDeleting(row)}
                          aria-label={`Delete movement for ${row.item}`}
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
                {meta?.total ?? 0} movement{(meta?.total ?? 0) === 1 ? '' : 's'} · page {page}/{totalPages}
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

      <Modal isOpen={creating} onClose={closeForm} title="Record stock movement" size="lg">
        <StockMovementForm
          key={`${partIdFromQuery}-${issuanceIdFromQuery}-${typeFromQuery ?? ''}-${sourceIssuance?.id ?? ''}`}
          parts={parts}
          employees={employees}
          returnSource={
            sourceIssuance
              ? {
                  issuanceId: sourceIssuance.id,
                  item: sourceIssuance.item,
                  issuedQuantity: sourceIssuance.quantity,
                  returnedQuantity: sourceIssuance.returnedQuantity,
                  returnableQuantity: sourceIssuance.returnableQuantity,
                  receivedByName: sourceIssuance.receivedByName,
                  issuedAt: sourceIssuance.issuedAt,
                }
              : null
          }
          defaults={{
            inventoryPartId: partIdFromQuery || undefined,
            movementType: typeFromQuery ?? undefined,
            sourceIssuanceId: issuanceIdFromQuery || null,
            employeeId: searchParams.get('employeeId') ?? undefined,
          }}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending}
          onSubmit={submit}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemName={deleting?.item}
        message="Deleting this movement puts the stock back the way it was before."
        onConfirm={async () => {
          if (!deleting) return;
          await deleteMutation.mutateAsync(deleting.id);
        }}
      />
    </div>
  );
}
