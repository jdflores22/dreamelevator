import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  GripVertical,
  Inbox,
  ListOrdered,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  AdminCard,
  AdminCardBody,
  AdminCardToolbar,
} from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { cn } from '@/utils/cn';

export interface AdminColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  /** Enable clicking the header to sort by this column. Defaults to true. */
  sortable?: boolean;
  /** Custom comparable value; falls back to item[key]. */
  sortValue?: (item: T) => string | number;
}

export interface AdminCrudPageProps<T extends { id: string }> {
  title: string;
  description?: string;
  items: T[] | undefined;
  isLoading: boolean;
  columns: AdminColumn<T>[];
  formContent: (item: T | null, onClose: () => void) => ReactNode;
  onDelete: (id: string) => Promise<void> | void;
  createLabel?: string;
  searchPlaceholder?: string;
  deleteTitle?: string;
  getDeleteItemName?: (item: T) => string;
  /** Page size for the table. Defaults to 10. */
  pageSize?: number;
  /** When provided, enables a drag-to-reorder mode that persists via this handler. */
  onReorder?: (orderedItems: T[]) => Promise<void> | void;
  /** True while a reorder is being saved. */
  isReordering?: boolean;
  /** When provided with publishable items, enables bulk publish / unpublish. */
  onBulkSetPublished?: (ids: string[], isPublished: boolean) => Promise<void> | void;
  isBulkUpdating?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function isMediaKey(key: string) {
  return /url|image|json|logo|icon|avatar/i.test(key);
}

function columnContent<T extends { id: string }>(item: T, col?: AdminColumn<T>) {
  if (!col) return null;
  return col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '');
}

type StatusFilter = 'all' | 'published' | 'draft';
type SortDir = 'asc' | 'desc';

function itemMatchesSearch<T extends { id: string }>(
  item: T,
  columns: AdminColumn<T>[],
  query: string,
): boolean {
  const q = query.toLowerCase();
  return columns.some((col) => {
    const raw = (item as Record<string, unknown>)[col.key];
    if (raw == null) return false;
    return String(raw).toLowerCase().includes(q);
  });
}

function defaultDeleteItemName<T>(item: T, columns: AdminColumn<T>[]): string {
  for (const col of columns) {
    const raw = (item as Record<string, unknown>)[col.key];
    if (raw != null && String(raw).trim()) return String(raw);
  }
  return 'this record';
}

function comparableValue<T extends { id: string }>(item: T, col: AdminColumn<T>): string | number {
  if (col.sortValue) return col.sortValue(item);
  const raw = (item as Record<string, unknown>)[col.key];
  if (typeof raw === 'number') return raw;
  if (raw == null) return '';
  return String(raw).toLowerCase();
}

interface ReorderListProps<T extends { id: string }> {
  items: T[];
  columns: AdminColumn<T>[];
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (ordered: T[]) => void;
}

function ReorderList<T extends { id: string }>({
  items,
  columns,
  isSaving,
  onCancel,
  onSave,
}: ReorderListProps<T>) {
  const [order, setOrder] = useState<T[]>(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const textColumns = columns.filter((c) => !isMediaKey(c.key));
  const primary = textColumns[0] ?? columns[0];
  const secondary = textColumns.find((c) => c.key !== primary.key);

  const move = (from: number, to: number) => {
    if (from === to) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const label = (item: T, col?: AdminColumn<T>) => columnContent(item, col);

  return (
    <div className="p-4 sm:p-6">
      <p className="mb-4 text-sm text-slate-500">
        Drag rows to change their order, then save. Order controls how items appear on the site.
      </p>
      <ul className="space-y-2">
        {order.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnter={() => setOverIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              'flex cursor-grab items-center gap-3 rounded-lg border bg-white px-3 py-2.5 transition-all active:cursor-grabbing',
              dragIndex === index
                ? 'border-brand-gold-400 opacity-60 shadow-md'
                : overIndex === index
                  ? 'border-brand-gold-400/60 bg-brand-gold-500/5'
                  : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold tabular-nums text-slate-500">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-primary-900">
                {label(item, primary)}
              </span>
              {secondary && (
                <span className="block truncate text-xs text-slate-400">
                  {label(item, secondary)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(order)} isLoading={isSaving}>
          <Check className="h-4 w-4" />
          Save order
        </Button>
      </div>
    </div>
  );
}

function bySortOrder<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const av = Number((a as Record<string, unknown>).sortOrder ?? 0);
    const bv = Number((b as Record<string, unknown>).sortOrder ?? 0);
    return av - bv;
  });
}

export function AdminCrudPage<T extends { id: string }>({
  title,
  description,
  items,
  isLoading,
  columns,
  formContent,
  onDelete,
  createLabel = 'Add new',
  searchPlaceholder = 'Search records…',
  deleteTitle,
  getDeleteItemName,
  pageSize: initialPageSize = 10,
  onReorder,
  isReordering,
  onBulkSetPublished,
  isBulkUpdating,
}: AdminCrudPageProps<T>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [reorderMode, setReorderMode] = useState(false);

  const hasStatus = useMemo(
    () => (items?.length ? 'isPublished' in (items[0] as Record<string, unknown>) : false),
    [items],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const toggleSort = (col: AdminColumn<T>) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = items ?? [];
    if (statusFilter !== 'all') {
      const wantPublished = statusFilter === 'published';
      list = list.filter(
        (item) => Boolean((item as Record<string, unknown>).isPublished) === wantPublished,
      );
    }
    if (search.trim()) {
      list = list.filter((item) => itemMatchesSearch(item, columns, search));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        list = [...list].sort((a, b) => {
          const av = comparableValue(a, col);
          const bv = comparableValue(b, col);
          if (av < bv) return sortDir === 'asc' ? -1 : 1;
          if (av > bv) return sortDir === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return list;
  }, [items, columns, search, statusFilter, sortKey, sortDir]);

  // Reset to first page whenever the result set changes shape.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortKey, sortDir, pageSize]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [items, search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((item) => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulkPublish = async (isPublished: boolean) => {
    if (!onBulkSetPublished || selectedIds.size === 0) return;
    await onBulkSetPublished([...selectedIds], isPublished);
    setSelectedIds(new Set());
  };

  if (isLoading) return <PageLoader />;

  const count = items?.length ?? 0;
  const singular = title.replace(/s$/, '');

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            {onReorder && count > 1 && !reorderMode && (
              <Button variant="outline" onClick={() => setReorderMode(true)}>
                <ListOrdered className="h-4 w-4" />
                Reorder
              </Button>
            )}
            {!reorderMode && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            )}
          </>
        }
      />

      {reorderMode && onReorder ? (
        <AdminCard accent="gold">
          <ReorderList
            items={bySortOrder(items ?? [])}
            columns={columns}
            isSaving={isReordering}
            onCancel={() => setReorderMode(false)}
            onSave={async (ordered) => {
              await onReorder(ordered);
              setReorderMode(false);
            }}
          />
        </AdminCard>
      ) : (
      <AdminCard accent="navy">
        <AdminCardToolbar>
          <p className="text-sm text-slate-500">
            <span className="font-medium tabular-nums text-primary-900">{count}</span>{' '}
            {count === 1 ? 'record' : 'records'}
            {(search || statusFilter !== 'all') && (
              <span className="text-slate-400"> · {total} shown</span>
            )}
          </p>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {hasStatus && onBulkSetPublished && selectedIds.size > 0 && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  isLoading={isBulkUpdating}
                  onClick={() => void runBulkPublish(true)}
                >
                  Publish ({selectedIds.size})
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  isLoading={isBulkUpdating}
                  onClick={() => void runBulkPublish(false)}
                >
                  Unpublish ({selectedIds.size})
                </Button>
              </>
            )}
            {hasStatus && (
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            )}
            {count > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Search records"
                />
              </div>
            )}
          </div>
        </AdminCardToolbar>

        <AdminCardBody className="p-0 sm:p-0">
          {count === 0 ? (
            <AdminEmptyState
              icon={Inbox}
              title={`No ${title.toLowerCase()} yet`}
              description="Get started by creating your first entry."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  {createLabel}
                </Button>
              }
            />
          ) : total === 0 ? (
            <AdminEmptyState
              title="No matching records"
              description="Try a different search term or filter."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="divide-y divide-slate-100 md:hidden">
                {paged.map((item) => {
                  const textColumns = columns.filter((c) => !isMediaKey(c.key));
                  const primary = textColumns[0] ?? columns[0];
                  const rest = textColumns
                    .filter((c) => c.key !== primary?.key && c.key !== 'isPublished')
                    .slice(0, 3);
                  const published = (item as Record<string, unknown>).isPublished;
                  return (
                    <article key={item.id} className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        {hasStatus && onBulkSetPublished && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            aria-label={`Select ${singular}`}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-primary-900">
                              {columnContent(item, primary)}
                            </p>
                            {typeof published === 'boolean' && (
                              <span
                                className={cn(
                                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                  published
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-100 text-slate-500',
                                )}
                              >
                                {published ? 'Live' : 'Draft'}
                              </span>
                            )}
                          </div>
                          {rest.map((col) => (
                            <div key={col.key} className="mt-1 truncate text-xs text-slate-500">
                              <span className="text-slate-400">{col.label}: </span>
                              {columnContent(item, col)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(item)}
                          aria-label={`Edit ${singular}`}
                          className="min-h-10 text-primary-700 hover:bg-primary-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Delete ${singular}`}
                          className="min-h-10 hover:bg-brand-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 text-brand-red-500" />
                          Delete
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden md:block">
              <Table className="rounded-none border-0 shadow-none">
                <THead>
                  <TR>
                    {hasStatus && onBulkSetPublished && (
                      <TH className="w-10">
                        <input
                          type="checkbox"
                          checked={paged.length > 0 && selectedIds.size === paged.length}
                          onChange={toggleSelectAll}
                          aria-label="Select all on page"
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </TH>
                    )}
                    {columns.map((col) => {
                      const isSorted = sortKey === col.key;
                      const sortable = col.sortable !== false;
                      return (
                        <TH key={col.key}>
                          {sortable ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(col)}
                              className="group inline-flex items-center gap-1.5 transition-colors hover:text-primary-900"
                            >
                              {col.label}
                              {isSorted ? (
                                sortDir === 'asc' ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-primary-700" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-primary-700" />
                                )
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400" />
                              )}
                            </button>
                          ) : (
                            col.label
                          )}
                        </TH>
                      );
                    })}
                    <TH className="w-28 text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {paged.map((item) => (
                    <TR key={item.id}>
                      {hasStatus && onBulkSetPublished && (
                        <TD>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            aria-label={`Select ${singular}`}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </TD>
                      )}
                      {columns.map((col) => (
                        <TD key={col.key}>
                          {col.render
                            ? col.render(item)
                            : String((item as Record<string, unknown>)[col.key] ?? '')}
                        </TD>
                      ))}
                      <TD>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(item)}
                            aria-label={`Edit ${singular}`}
                            className="text-primary-700 hover:bg-primary-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Delete ${singular}`}
                            className="hover:bg-brand-red-500/10"
                          >
                            <Trash2 className="h-4 w-4 text-brand-red-500" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              </div>

              {total > pageSize && (
                <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
                  <p className="text-xs text-slate-500">
                    Showing{' '}
                    <span className="font-medium tabular-nums text-primary-900">{start + 1}</span>–
                    <span className="font-medium tabular-nums text-primary-900">
                      {Math.min(start + pageSize, total)}
                    </span>{' '}
                    of <span className="font-medium tabular-nums text-primary-900">{total}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-xs text-slate-600 focus:border-primary-500 focus:outline-none"
                        aria-label="Rows per page"
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size} / page
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-2 text-xs tabular-nums text-slate-500">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </AdminCardBody>
      </AdminCard>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit ${singular}` : `New ${singular}`}
        size="lg"
      >
        {formContent(editing, closeModal)}
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await onDelete(deleteTarget.id);
        }}
        title={deleteTitle ?? `Delete ${singular.toLowerCase()}?`}
        itemName={
          deleteTarget
            ? getDeleteItemName?.(deleteTarget) ?? defaultDeleteItemName(deleteTarget, columns)
            : undefined
        }
        successMessage={`${singular} deleted successfully.`}
      />
    </div>
  );
}
