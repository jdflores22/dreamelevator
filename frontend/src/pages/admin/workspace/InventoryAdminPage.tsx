import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpFromLine, FileText, Package, Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import {
  useAdminInventory,
  useCreateInventoryPart,
  useDeleteInventoryPart,
  useInventoryDashboard,
  useInventoryFilters,
  useUpdateInventoryPart,
} from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { InventoryPartForm } from '@/components/admin/InventoryPartForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import type { InventoryPart, UpsertInventoryPart } from '@/types';
import { inventorySupplierPath, resolveSupplierName, formatInventoryQty } from '@/utils/inventory';
import { formatPeso, formatUsd, linePeso, lineUsd } from '@/utils/money';

type RegisterTab = 'all' | 'Part' | 'Charge' | 'Note';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function qtyCell(row: InventoryPart) {
  if (row.lineKind !== 'Part') {
    return <span className="tabular-nums">{formatInventoryQty(row.quantity)}</span>;
  }
  const purchased = row.quantity ?? 0;
  const issued = row.issuedQuantity ?? 0;
  const onHand = row.onHand ?? purchased - issued + row.returnedQuantity + row.adjustedQuantity;
  return (
    <span>
      <span className="font-medium tabular-nums text-primary-900">{formatInventoryQty(onHand)}</span>
      <span className="mt-0.5 block text-[11px] text-slate-500">
        {formatInventoryQty(purchased)} in
        {issued > 0 ? ` · ${formatInventoryQty(issued)} out` : ''}
        {row.returnedQuantity > 0 ? ` · ${formatInventoryQty(row.returnedQuantity)} back` : ''}
        {row.adjustedQuantity !== 0 ? ` · ${formatInventoryQty(row.adjustedQuantity)} adj` : ''}
      </span>
    </span>
  );
}

function kindBadge(kind: string) {
  if (kind === 'Charge') return <Badge variant="warning">Charge</Badge>;
  if (kind === 'Note') return <Badge variant="default">Note</Badge>;
  return <Badge variant="success">Part</Badge>;
}

export default function InventoryAdminPage() {
  const { supplier: supplierSlug } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegisterTab>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editing, setEditing] = useState<InventoryPart | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<InventoryPart | null>(null);

  const { data: filters, isFetched: filtersFetched } = useInventoryFilters();
  const supplierName = resolveSupplierName(supplierSlug, filters?.suppliers ?? []);
  const supplierMissing = Boolean(supplierSlug) && filtersFetched && !supplierName;

  const lineKind = tab === 'all' ? '' : tab;
  const defaultLineKind = tab === 'all' ? 'Part' : tab;

  useEffect(() => {
    setPage(1);
    setSearch('');
    setTab('all');
  }, [supplierSlug]);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      supplier: supplierName || undefined,
      lineKind: lineKind || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize: 25,
    }),
    [search, supplierName, lineKind, from, to, page],
  );

  const { data, isLoading } = useAdminInventory(params, {
    enabled: !supplierSlug || Boolean(supplierName),
  });
  const { data: dashboard } = useInventoryDashboard();
  const createMutation = useCreateInventoryPart();
  const updateMutation = useUpdateInventoryPart();
  const deleteMutation = useDeleteInventoryPart();

  const items = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const noteCount = Math.max(
    0,
    (dashboard?.totalLines ?? 0) - (dashboard?.partCount ?? 0) - (dashboard?.chargeCount ?? 0),
  );

  const supplierSpend = dashboard?.spendBySupplier.find(
    (row) => row.name.toLowerCase() === (supplierName ?? '').toLowerCase(),
  );

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = (payload: UpsertInventoryPart) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, { onSuccess: closeForm });
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm });
    }
  };

  const changeTab = (next: RegisterTab) => {
    setTab(next);
    setPage(1);
  };

  if (supplierMissing) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-primary-900">Supplier not found</p>
        <p className="mt-1 text-sm text-slate-500">This slug does not match a register supplier.</p>
        <Link
          to="/admin/workspace/inventory"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:text-brand-gold-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to register
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        className="mb-4 sm:mb-5"
        eyebrow={supplierName ? 'Supplier' : 'Operations'}
        title={supplierName || 'Parts register'}
        description={
          supplierName
            ? supplierSpend
              ? `${supplierSpend.count} lines · ${formatUsd(supplierSpend.totalUsd)} · ${formatPeso(supplierSpend.totalPhp)}`
              : 'Lines purchased from this supplier.'
            : 'Foreign-supplier lines by type: parts, charges, and notes.'
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {supplierName ? (
              <Link
                to="/admin/workspace/inventory"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-primary-900/20"
              >
                <ArrowLeft className="h-4 w-4" />
                All suppliers
              </Link>
            ) : null}
            <Link
              to="/admin/workspace/inventory/out"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-primary-900/20"
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Stock out
            </Link>
            <Button className="min-h-11 w-full sm:w-auto" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Add line
            </Button>
          </div>
        }
      />

      <AdminTabs
        className="mb-3 w-full sm:mb-4 sm:w-auto"
        active={tab}
        onChange={changeTab}
        tabs={[
          { id: 'all', label: 'All', count: supplierName ? undefined : dashboard?.totalLines },
          { id: 'Part', label: 'Parts', icon: Package, count: supplierName ? undefined : dashboard?.partCount },
          { id: 'Charge', label: 'Charges', icon: Receipt, count: supplierName ? undefined : dashboard?.chargeCount },
          { id: 'Note', label: 'Notes', icon: FileText, count: supplierName ? undefined : noteCount },
        ]}
      />

      <div className="mb-4 grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:grid-cols-2 sm:gap-3 sm:p-4 lg:grid-cols-4">
        <Input
          placeholder="Search item, spec…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 sm:min-h-0 sm:py-2 sm:text-sm"
          value={supplierName ?? ''}
          onChange={(e) => {
            const next = e.target.value;
            navigate(next ? inventorySupplierPath(next) : '/admin/workspace/inventory');
          }}
        >
          <option value="">All suppliers</option>
          {(filters?.suppliers ?? []).map((name) => (
            <option key={name} value={name}>
              {name}
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

      {Boolean(supplierSlug) && !filtersFetched || isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          No inventory lines match this tab.
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
                      {formatDate(row.purchasedAt)}
                      {row.supplier && !supplierName ? (
                        <>
                          {' · '}
                          <Link
                            to={inventorySupplierPath(row.supplier)}
                            className="font-medium text-primary-800 hover:underline"
                          >
                            {row.supplier}
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {tab === 'all' ? kindBadge(row.lineKind) : null}
                </div>
                {row.specification ? (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{row.specification}</p>
                ) : null}
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    {row.lineKind === 'Part' ? 'On hand' : 'Qty'}
                    <span className="block text-sm text-primary-900">
                      {row.lineKind === 'Part'
                        ? formatInventoryQty(row.onHand ?? (row.quantity ?? 0) - (row.issuedQuantity ?? 0))
                        : formatInventoryQty(row.quantity)}
                    </span>
                    {row.lineKind === 'Part' ? (
                      <span className="block text-[11px] text-slate-500">
                        {formatInventoryQty(row.quantity)} in
                        {(row.issuedQuantity ?? 0) > 0
                          ? ` · ${formatInventoryQty(row.issuedQuantity)} out`
                          : ''}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    Total
                    <span className="block text-sm text-primary-900">{formatUsd(lineUsd(row))}</span>
                    <span className="block text-xs text-primary-700/80">{formatPeso(linePeso(row))}</span>
                  </div>
                </dl>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {row.lineKind === 'Part' ? (
                    <Link
                      to={`/admin/workspace/inventory/out?partId=${row.id}`}
                      className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-primary-800 hover:border-primary-900/20"
                    >
                      <ArrowUpFromLine className="h-3.5 w-3.5" />
                      Issue…
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
                  {supplierName ? null : <TH>Supplier</TH>}
                  <TH>Item</TH>
                  <TH>Spec</TH>
                  <TH>On hand</TH>
                  <TH>Unit (USD)</TH>
                  <TH>Total (USD)</TH>
                  <TH>Peso (₱)</TH>
                  <TH>Project</TH>
                  {tab === 'all' ? <TH>Type</TH> : null}
                  <TH className="w-24"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className="whitespace-nowrap">{formatDate(row.purchasedAt)}</TD>
                    {supplierName ? null : (
                      <TD className="max-w-[12rem] truncate">
                        {row.supplier ? (
                          <Link
                            to={inventorySupplierPath(row.supplier)}
                            className="font-medium text-primary-800 hover:text-brand-gold-600"
                            title={row.supplier}
                          >
                            {row.supplier}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TD>
                    )}
                    <TD className="font-medium text-primary-900">{row.item}</TD>
                    <TD className="max-w-[10rem] truncate text-slate-500">
                      <span title={row.specification}>{row.specification || '—'}</span>
                    </TD>
                    <TD>{qtyCell(row)}</TD>
                    <TD className="tabular-nums">{formatUsd(row.unitPrice)}</TD>
                    <TD className="tabular-nums font-medium text-primary-900">{formatUsd(lineUsd(row))}</TD>
                    <TD className="tabular-nums text-brand-gold-600">{formatPeso(linePeso(row))}</TD>
                    <TD className="max-w-[8rem] truncate">{row.projectBuilding || '—'}</TD>
                    {tab === 'all' ? <TD>{kindBadge(row.lineKind)}</TD> : null}
                    <TD>
                      <div className="flex justify-end gap-1">
                        {row.lineKind === 'Part' ? (
                          <Link
                            to={`/admin/workspace/inventory/out?partId=${row.id}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-primary-800"
                            aria-label={`Issue ${row.item}`}
                            title="Issue…"
                          >
                            <ArrowUpFromLine className="h-4 w-4" />
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
                {meta?.total ?? 0} line{(meta?.total ?? 0) === 1 ? '' : 's'} · page {page}/{totalPages}
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
        title={editing ? 'Edit inventory line' : 'Add inventory line'}
        size="lg"
      >
        <InventoryPartForm
          key={editing?.id ?? `new-${defaultLineKind}-${supplierName ?? 'all'}`}
          item={editing}
          defaultLineKind={defaultLineKind}
          defaultSupplier={supplierName ?? ''}
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
