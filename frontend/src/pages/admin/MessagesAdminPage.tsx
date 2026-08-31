import { useMemo, useState } from 'react';
import { CheckCheck, Clock, Inbox, Mail, Reply, RotateCcw, Search } from 'lucide-react';
import { useMessages, useUpdateMessageStatus } from '@/api/hooks';
import { MessageStatus, type ContactMessage } from '@/types';
import { formatContactSenderType } from '@/constants/contactSenderTypes';
import { AdminCard, AdminCardBody } from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { cn } from '@/utils/cn';

const statusMeta: Record<
  MessageStatus,
  { label: string; variant: 'warning' | 'accent' | 'success' }
> = {
  [MessageStatus.New]: { label: 'New', variant: 'warning' },
  [MessageStatus.InProgress]: { label: 'In progress', variant: 'accent' },
  [MessageStatus.Closed]: { label: 'Closed', variant: 'success' },
};

type FilterKey = 'all' | MessageStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: MessageStatus.New, label: 'New' },
  { key: MessageStatus.InProgress, label: 'In progress' },
  { key: MessageStatus.Closed, label: 'Closed' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MessagesAdminPage() {
  const { data: messages, isLoading } = useMessages();
  const updateStatus = useUpdateMessageStatus();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const counts = useMemo(() => {
    const list = messages ?? [];
    return {
      all: list.length,
      [MessageStatus.New]: list.filter((m) => m.status === MessageStatus.New).length,
      [MessageStatus.InProgress]: list.filter((m) => m.status === MessageStatus.InProgress).length,
      [MessageStatus.Closed]: list.filter((m) => m.status === MessageStatus.Closed).length,
    } as Record<FilterKey, number>;
  }, [messages]);

  const filtered = useMemo(() => {
    let list = [...(messages ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (filter !== 'all') list = list.filter((m) => m.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.companyName?.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.body?.toLowerCase().includes(q) ||
          formatContactSenderType(m.senderType).toLowerCase().includes(q),
      );
    }
    return list;
  }, [messages, filter, search]);

  if (isLoading) return <PageLoader />;

  const total = counts.all;
  const unread = counts[MessageStatus.New];

  const setStatus = (id: string, status: MessageStatus) => updateStatus.mutate({ id, status });

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    // Opening a "New" message marks it as being handled.
    if (msg.status === MessageStatus.New) setStatus(msg.id, MessageStatus.InProgress);
  };

  const replyHref = (msg: ContactMessage) =>
    `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || 'Your message'}`)}`;

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions from the public website."
        eyebrow="Engagement"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total messages" value={total} icon={Inbox} accent="navy" />
        <AdminStatCard label="Awaiting reply" value={unread} icon={Mail} accent="red" />
        <AdminStatCard
          label="In progress"
          value={counts[MessageStatus.InProgress]}
          icon={Clock}
          accent="gold"
        />
      </div>

      <AdminCard accent="gold">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={String(f.key)}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  filter === f.key
                    ? 'bg-primary-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search messages"
            />
          </div>
        </div>

        <AdminCardBody className="p-0 sm:p-0">
          {total === 0 ? (
            <AdminEmptyState
              icon={Mail}
              title="No messages yet"
              description="Contact form submissions will appear here."
            />
          ) : filtered.length === 0 ? (
            <AdminEmptyState
              title="No matching messages"
              description="Try a different search term or filter."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((msg) => {
                const meta = statusMeta[msg.status];
                const isNew = msg.status === MessageStatus.New;
                return (
                  <article
                    key={msg.id}
                    className="cursor-pointer px-4 py-3.5"
                    onClick={() => openMessage(msg)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={cn('truncate text-sm text-primary-900', isNew ? 'font-semibold' : 'font-medium')}>
                          {isNew && (
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-red-500 align-middle" />
                          )}
                          {msg.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">{msg.email}</p>
                        <p className="mt-1 truncate text-sm text-slate-600">{msg.subject || 'No subject'}</p>
                      </div>
                      <Badge variant={meta.variant} className="shrink-0">
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={replyHref(msg)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-primary-700"
                        >
                          <Reply className="h-3.5 w-3.5" />
                          Reply
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="hidden md:block">
            <Table className="rounded-none border-0 shadow-none">
              <THead>
                <TR>
                  <TH>From</TH>
                  <TH>Type</TH>
                  <TH>Subject</TH>
                  <TH>Status</TH>
                  <TH>Received</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((msg) => {
                  const meta = statusMeta[msg.status];
                  const isNew = msg.status === MessageStatus.New;
                  return (
                    <TR
                      key={msg.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() => openMessage(msg)}
                    >
                      <TD>
                        <div className="flex items-center gap-2">
                          {isNew && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-red-500" />
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                'truncate text-primary-900',
                                isNew ? 'font-semibold' : 'font-medium',
                              )}
                            >
                              {msg.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">{msg.email}</p>
                            {msg.companyName && (
                              <p className="truncate text-xs text-slate-500">{msg.companyName}</p>
                            )}
                          </div>
                        </div>
                      </TD>
                      <TD className="whitespace-nowrap text-slate-600">
                        {formatContactSenderType(msg.senderType)}
                      </TD>
                      <TD className="max-w-xs truncate">{msg.subject}</TD>
                      <TD>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TD>
                      <TD className="whitespace-nowrap text-slate-500">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </TD>
                      <TD onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <a
                            href={replyHref(msg)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-primary-700 transition-colors hover:border-brand-gold-500/40 hover:bg-brand-gold-500/5"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                          </a>
                          {msg.status !== MessageStatus.Closed ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(msg.id, MessageStatus.Closed)}
                            >
                              Close
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(msg.id, MessageStatus.InProgress)}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            </div>
            </>
          )}
        </AdminCardBody>
      </AdminCard>

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject || 'Message'}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-900">{selected.name}</p>
                <a
                  href={`mailto:${selected.email}`}
                  className="text-xs text-primary-600 hover:underline"
                >
                  {selected.email}
                </a>
                {selected.companyName && (
                  <p className="mt-1 text-xs font-medium text-primary-800">{selected.companyName}</p>
                )}
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {formatContactSenderType(selected.senderType)}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={statusMeta[selected.status].variant}>
                  {statusMeta[selected.status].label}
                </Badge>
                <p className="mt-1 text-xs text-slate-400">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <div className="whitespace-pre-wrap rounded-xl border border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-700">
              {selected.body || <span className="text-slate-400">No message body.</span>}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {selected.status !== MessageStatus.InProgress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus(selected.id, MessageStatus.InProgress);
                    setSelected({ ...selected, status: MessageStatus.InProgress });
                  }}
                >
                  <Clock className="h-4 w-4" />
                  Mark in progress
                </Button>
              )}
              {selected.status !== MessageStatus.Closed ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus(selected.id, MessageStatus.Closed);
                    setSelected({ ...selected, status: MessageStatus.Closed });
                  }}
                >
                  <CheckCheck className="h-4 w-4" />
                  Close
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatus(selected.id, MessageStatus.InProgress);
                    setSelected({ ...selected, status: MessageStatus.InProgress });
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reopen
                </Button>
              )}
              <a
                href={replyHref(selected)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
              >
                <Reply className="h-4 w-4" />
                Reply by email
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
