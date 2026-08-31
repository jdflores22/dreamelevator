import { useState } from 'react';
import { Download, Mail } from 'lucide-react';
import { useDeleteSubscriber, useSubscribers, useUnsubscribe } from '@/api/hooks';
import { AdminCard, AdminCardBody } from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';

function exportCsv(rows: { email: string; subscribedAt: string; isActive: boolean }[]) {
  const header = 'email,subscribed_at,active\n';
  const body = rows
    .map((r) => `${r.email},${r.subscribedAt},${r.isActive}`)
    .join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SubscribersAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSubscribers(page, 50);
  const unsubscribe = useUnsubscribe();
  const remove = useDeleteSubscriber();
  const items = data?.items ?? [];
  const meta = data?.meta;

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Newsletter subscribers"
        description="Manage email subscribers from the footer and blog signup forms."
        eyebrow="Engagement"
        actions={
          items.length > 0 && (
            <Button type="button" variant="outline" onClick={() => exportCsv(items)}>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          )
        }
      />

      {items.length === 0 ? (
        <AdminEmptyState icon={Mail} title="No subscribers yet" description="Subscribers will appear when visitors sign up via the newsletter form." />
      ) : (
        <>
          <AdminCard>
            <AdminCardBody className="p-0">
              <div className="divide-y divide-slate-100 md:hidden">
                {items.map((sub) => (
                  <article key={sub.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 break-all text-sm font-medium text-primary-900">{sub.email}</p>
                      <Badge variant={sub.isActive ? 'success' : 'warning'}>
                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {sub.isActive && (
                        <Button type="button" size="sm" variant="outline" onClick={() => unsubscribe.mutate(sub.id)}>
                          Unsubscribe
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(`Remove ${sub.email}?`)) remove.mutate(sub.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
              <Table>
                <THead>
                  <TR>
                    <TH>Email</TH>
                    <TH>Subscribed</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {items.map((sub) => (
                    <TR key={sub.id}>
                      <TD className="font-medium text-primary-900">{sub.email}</TD>
                      <TD className="text-sm text-slate-500">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </TD>
                      <TD>
                        <Badge variant={sub.isActive ? 'success' : 'warning'}>
                          {sub.isActive ? 'Active' : 'Unsubscribed'}
                        </Badge>
                      </TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          {sub.isActive && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => unsubscribe.mutate(sub.id)}
                            >
                              Unsubscribe
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm(`Remove ${sub.email}?`)) remove.mutate(sub.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
              </div>
            </AdminCardBody>
          </AdminCard>
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>Page {meta.page} of {meta.totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
