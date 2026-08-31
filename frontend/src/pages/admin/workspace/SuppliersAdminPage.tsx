import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from '@/api/hooks';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { SupplierForm } from '@/components/admin/SupplierForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import type { Supplier, UpsertSupplier } from '@/types';
import { inventorySupplierPath } from '@/utils/inventory';

export default function SuppliersAdminPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const params = useMemo(() => ({ search: search.trim() || undefined, pageSize: 200 }), [search]);
  const { data, isLoading } = useSuppliers(params);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const items = data?.items ?? [];
  const activeCount = items.filter((s) => s.isPublished).length;

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = (payload: UpsertSupplier) => {
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
        title="Suppliers"
        description="Master list of suppliers. New entries appear right away in the register and stock-out pickers."
        actions={
          <Button className="min-h-11 w-full sm:w-auto" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Add supplier
          </Button>
        }
      />

      <div className="mb-4 grid gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3 sm:grid-cols-2 sm:p-4">
        <Input
          placeholder="Search name, contact, country…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="self-center text-sm text-slate-500 sm:text-right">
          {items.length} supplier{items.length === 1 ? '' : 's'} · {activeCount} active
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          No suppliers yet. Add one to start using it in the register.
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white md:hidden">
            {items.map((row) => (
              <article key={row.id} className="px-3 py-3.5 sm:px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary-900 sm:text-base">{row.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {row.contactPerson || 'No contact person'}
                      {row.country ? ` · ${row.country}` : ''}
                    </p>
                  </div>
                  {row.isPublished ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="default">Inactive</Badge>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Register lines
                    <span className="block text-sm text-primary-900">{row.lineCount}</span>
                  </div>
                  <div>
                    Contact
                    <span className="block truncate text-sm text-primary-900">
                      {row.email || row.phone || '—'}
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
                  <TH>Supplier</TH>
                  <TH>Contact person</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Country</TH>
                  <TH>Lines</TH>
                  <TH>Status</TH>
                  <TH className="w-24"> </TH>
                </TR>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className="font-medium text-primary-900">
                      {row.lineCount > 0 ? (
                        <Link
                          to={inventorySupplierPath(row.name)}
                          className="hover:text-brand-gold-600"
                          title={`Open ${row.name} register`}
                        >
                          {row.name}
                        </Link>
                      ) : (
                        row.name
                      )}
                    </TD>
                    <TD>{row.contactPerson || '—'}</TD>
                    <TD className="max-w-[12rem] truncate">{row.email || '—'}</TD>
                    <TD>{row.phone || '—'}</TD>
                    <TD>{row.country || '—'}</TD>
                    <TD className="tabular-nums">{row.lineCount}</TD>
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
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-500 hover:bg-brand-red-50 hover:text-brand-red-600"
                          onClick={() => setDeleting(row)}
                          aria-label={`Delete ${row.name}`}
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
        title={editing ? 'Edit supplier' : 'Add supplier'}
        size="lg"
      >
        <SupplierForm
          key={editing?.id ?? 'new-supplier'}
          item={editing}
          onCancel={closeForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={submit}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemName={deleting?.name}
        message={
          deleting && deleting.lineCount > 0
            ? `${deleting.lineCount} register line${deleting.lineCount === 1 ? '' : 's'} keep this supplier name, but it will no longer be selectable.`
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
