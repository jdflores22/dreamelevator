import { useState } from 'react';
import { History, Search } from 'lucide-react';
import { useActivityLogs } from '@/api/hooks';
import { AdminCard, AdminCardBody } from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';

const ACTION_VARIANT: Record<string, 'accent' | 'success' | 'warning' | 'danger'> = {
  POST: 'success',
  PUT: 'accent',
  PATCH: 'accent',
  DELETE: 'danger',
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ActivityLogAdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const pageSize = 25;

  const { data, isLoading } = useActivityLogs(page, pageSize, query);
  const items = data?.items ?? [];
  const meta = data?.meta;

  if (isLoading && !data) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Activity log"
        description="Audit trail of admin changes — who did what and when."
        eyebrow="System"
      />

      <AdminCard className="mb-6">
        <AdminCardBody>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(1);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, action, entity, or details…"
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
            {query && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setQuery('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </form>
        </AdminCardBody>
      </AdminCard>

      {items.length === 0 ? (
        <AdminEmptyState
          icon={History}
          title="No activity yet"
          description="Admin actions will appear here once content is created or updated."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <div className="divide-y divide-slate-100 md:hidden">
              {items.map((log) => (
                <article key={log.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary-900">{log.userName}</p>
                    <Badge variant={ACTION_VARIANT[log.action] ?? 'accent'}>{log.action}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    <span className="capitalize">{log.entity}</span>
                    {log.details ? ` · ${log.details}` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatTimestamp(log.timestamp)}</p>
                </article>
              ))}
            </div>
            <div className="hidden md:block">
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>User</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                  <TH>Details</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((log) => (
                  <TR key={log.id}>
                    <TD className="whitespace-nowrap text-xs text-slate-500">
                      {formatTimestamp(log.timestamp)}
                    </TD>
                    <TD className="text-sm font-medium text-primary-900">{log.userName}</TD>
                    <TD>
                      <Badge variant={ACTION_VARIANT[log.action] ?? 'accent'}>{log.action}</Badge>
                    </TD>
                    <TD className="text-sm text-slate-600">
                      <span className="font-medium capitalize">{log.entity}</span>
                      {log.entityId && (
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-400">
                          {log.entityId}
                        </span>
                      )}
                    </TD>
                    <TD className="max-w-md truncate text-xs text-slate-500">{log.details}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Page {meta.page} of {meta.totalPages} · {meta.total} entries
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
