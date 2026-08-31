import { useState } from 'react';
import { Briefcase, ExternalLink } from 'lucide-react';
import { useJobApplications, useUpdateJobApplicationStatus } from '@/api/hooks';
import { ApplicationStatus } from '@/types';
import { AdminCard, AdminCardBody } from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { resolveMediaUrl } from '@/utils/media';
import type { JobApplication } from '@/types';

const STATUS_OPTIONS = [
  { value: ApplicationStatus.Pending, label: 'Pending', variant: 'warning' as const },
  { value: ApplicationStatus.Reviewing, label: 'Reviewing', variant: 'accent' as const },
  { value: ApplicationStatus.Accepted, label: 'Accepted', variant: 'success' as const },
  { value: ApplicationStatus.Rejected, label: 'Rejected', variant: 'danger' as const },
];

export default function JobApplicationsAdminPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const { data, isLoading } = useJobApplications(page, 25);
  const updateStatus = useUpdateJobApplicationStatus();
  const items = data?.items ?? [];
  const meta = data?.meta;

  if (isLoading) return <PageLoader />;

  const statusBadge = (status: number) => {
    const meta = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
  };

  return (
    <div>
      <AdminPageHeader
        title="Job applications"
        description="Review career applications and update their status."
        eyebrow="Engagement"
      />

      {items.length === 0 ? (
        <AdminEmptyState icon={Briefcase} title="No applications yet" description="Applications submitted from the careers page will appear here." />
      ) : (
        <>
          <AdminCard>
            <AdminCardBody className="p-0">
              <div className="divide-y divide-slate-100 md:hidden">
                {items.map((app) => (
                  <article key={app.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary-900">{app.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{app.email}</p>
                        <p className="mt-1 text-xs text-slate-600">{app.careerTitle || '—'}</p>
                      </div>
                      {statusBadge(app.status)}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(app)}>
                        View
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block">
              <Table>
                <THead>
                  <TR>
                    <TH>Applicant</TH>
                    <TH>Role</TH>
                    <TH>Date</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {items.map((app) => (
                    <TR key={app.id}>
                      <TD>
                        <p className="font-medium text-primary-900">{app.fullName}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </TD>
                      <TD className="text-sm text-slate-600">{app.careerTitle || '—'}</TD>
                      <TD className="text-sm text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </TD>
                      <TD>{statusBadge(app.status)}</TD>
                      <TD className="text-right">
                        <Button type="button" size="sm" variant="outline" onClick={() => setSelected(app)}>
                          View
                        </Button>
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Application details" size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-slate-500">Name</p><p className="font-medium">{selected.fullName}</p></div>
              <div><p className="text-slate-500">Email</p><p className="font-medium">{selected.email}</p></div>
              <div><p className="text-slate-500">Phone</p><p className="font-medium">{selected.phone || '—'}</p></div>
              <div><p className="text-slate-500">Role</p><p className="font-medium">{selected.careerTitle || '—'}</p></div>
            </div>
            {selected.coverLetter && (
              <div>
                <p className="text-slate-500">Cover letter</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700">{selected.coverLetter}</p>
              </div>
            )}
            {selected.resumeUrl && (
              <a
                href={resolveMediaUrl(selected.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-700 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Download resume
              </a>
            )}
            <div>
              <p className="mb-2 text-slate-500">Update status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    size="sm"
                    variant={selected.status === opt.value ? 'primary' : 'outline'}
                    onClick={() =>
                      updateStatus.mutate(
                        { id: selected.id, status: opt.value },
                        { onSuccess: (updated) => setSelected(updated) },
                      )
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
