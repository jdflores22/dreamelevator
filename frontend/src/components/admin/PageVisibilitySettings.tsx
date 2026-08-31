import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useCreateSeoSetting, useSeoSettings, useUpdateSeoSetting } from '@/api/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import type { SeoSetting } from '@/types';
import {
  PAGE_VISIBILITY_GROUPS,
  PAGE_VISIBILITY_LABELS,
  PAGE_VISIBILITY_ORDER,
} from '@/constants/pageVisibility';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { SectionToggleSwitch } from '@/components/admin/SectionToggleSwitch';
import { cn } from '@/utils/cn';

export function PageVisibilitySettings() {
  const { name: companyName } = useCompanyBrand();
  const { data: pages, isLoading } = useSeoSettings();
  const createMutation = useCreateSeoSetting();
  const updateMutation = useUpdateSeoSetting();
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [messagePageKey, setMessagePageKey] = useState<string | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (isLoading || !pages || syncingRef.current) return;

    const existing = new Set(pages.map((p) => p.pageKey));
    const missing = PAGE_VISIBILITY_ORDER.filter((key) => !existing.has(key));
    if (missing.length === 0) return;

    syncingRef.current = true;
    void Promise.all(
      missing.map((pageKey) => {
        const meta = PAGE_VISIBILITY_LABELS[pageKey];
        return createMutation.mutateAsync({
          pageKey,
          title: companyName ? `${meta.label} | ${companyName}` : meta.label,
          description: companyName ? `${meta.label} — ${companyName}` : meta.label,
          keywords: companyName ? `software development, ${companyName}` : 'software development',
          ogImage: '',
          isPublished: true,
          maintenanceMessage: '',
        });
      }),
    ).finally(() => {
      syncingRef.current = false;
    });
  }, [isLoading, pages, createMutation, companyName]);

  const pageByKey = useMemo(
    () => new Map((pages ?? []).map((p) => [p.pageKey, p])),
    [pages],
  );

  const extraPages = useMemo(
    () => (pages ?? []).filter((p) => !PAGE_VISIBILITY_ORDER.includes(p.pageKey as never)),
    [pages],
  );

  const stats = useMemo(() => {
    const all = pages ?? [];
    const live = all.filter((p) => p.isPublished).length;
    return { live, hidden: all.length - live };
  }, [pages]);

  const matchesSearch = (page: SeoSetting) => {
    const meta = PAGE_VISIBILITY_LABELS[page.pageKey] ?? { label: page.pageKey, path: `/${page.pageKey}` };
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      meta.label.toLowerCase().includes(q) ||
      meta.path.toLowerCase().includes(q) ||
      page.pageKey.toLowerCase().includes(q)
    );
  };

  const togglePublished = async (pageKey: string, isPublished: boolean) => {
    const page = pages?.find((p) => p.pageKey === pageKey);
    if (!page) return;

    setSavedKey(null);
    await updateMutation.mutateAsync({
      id: page.id,
      data: {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        ogImage: page.ogImage,
        isPublished,
        maintenanceMessage: messageDrafts[pageKey] ?? page.maintenanceMessage ?? '',
      },
    });
    setSavedKey(pageKey);
  };

  const saveMessage = async (pageKey: string) => {
    const page = pages?.find((p) => p.pageKey === pageKey);
    if (!page) return;

    setSavedKey(null);
    await updateMutation.mutateAsync({
      id: page.id,
      data: {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        ogImage: page.ogImage,
        isPublished: page.isPublished,
        maintenanceMessage: messageDrafts[pageKey] ?? page.maintenanceMessage ?? '',
      },
    });
    setSavedKey(`${pageKey}-msg`);
    setMessagePageKey(null);
  };

  const isSaving = updateMutation.isPending || createMutation.isPending;

  const messageMeta = messagePageKey
    ? PAGE_VISIBILITY_LABELS[messagePageKey] ?? { label: messagePageKey, path: `/${messagePageKey}` }
    : null;
  const messageValue = messagePageKey
    ? messageDrafts[messagePageKey] ??
      pages?.find((p) => p.pageKey === messagePageKey)?.maintenanceMessage ??
      ''
    : '';

  if (isLoading || (syncingRef.current && createMutation.isPending)) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const renderRow = (page: SeoSetting) => {
    const meta = PAGE_VISIBILITY_LABELS[page.pageKey] ?? { label: page.pageKey, path: `/${page.pageKey}` };

    return (
      <div
        key={page.id}
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-2',
          !page.isPublished && 'bg-amber-50/40',
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-primary-900">{meta.label}</span>
            {!page.isPublished && (
              <button
                type="button"
                onClick={() => setMessagePageKey(page.pageKey)}
                className="text-xs text-amber-800 underline-offset-2 hover:underline"
              >
                Edit message
              </button>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">{meta.path}</p>
        </div>
        <SectionToggleSwitch
          enabled={page.isPublished}
          disabled={isSaving}
          label={meta.label}
          size="sm"
          onToggle={() => void togglePublished(page.pageKey, !page.isPublished)}
        />
      </div>
    );
  };

  const visibleGroups = PAGE_VISIBILITY_GROUPS.map((group) => ({
    ...group,
    pages: group.keys
      .map((key) => pageByKey.get(key))
      .filter((p): p is SeoSetting => Boolean(p))
      .filter(matchesSearch),
  })).filter((g) => g.pages.length > 0);

  const visibleExtras = extraPages.filter(matchesSearch);
  const nothingVisible = visibleGroups.length === 0 && visibleExtras.length === 0;

  return (
    <>
      <SettingsPanel
        icon={Eye}
        title="Page visibility"
        description={`${stats.live} live · ${stats.hidden} hidden — toggle off to show a maintenance screen to visitors.`}
      >
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
            aria-label="Search pages"
          />
        </div>

        {nothingVisible ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            No pages match &ldquo;{search}&rdquo;.
            <button
              type="button"
              className="ml-2 text-primary-700 hover:underline"
              onClick={() => setSearch('')}
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {visibleGroups.map((group) => (
              <div key={group.id}>
                <div className="bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </div>
                <div className="divide-y divide-slate-100">{group.pages.map(renderRow)}</div>
              </div>
            ))}

            {visibleExtras.length > 0 && (
              <div>
                <div className="bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Other
                </div>
                <div className="divide-y divide-slate-100">{visibleExtras.map(renderRow)}</div>
              </div>
            )}
          </div>
        )}

        {savedKey && !savedKey.endsWith('-msg') && (
          <p className="mt-3 text-xs text-emerald-600">Saved.</p>
        )}
      </SettingsPanel>

      <Modal
        isOpen={!!messagePageKey}
        onClose={() => setMessagePageKey(null)}
        title={messageMeta ? `Maintenance — ${messageMeta.label}` : 'Maintenance message'}
        size="sm"
      >
        {messagePageKey && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Shown on <span className="font-mono text-slate-700">{messageMeta?.path}</span> while the page is hidden.
            </p>
            <Textarea
              label="Message"
              rows={3}
              value={messageValue}
              onChange={(e) =>
                setMessageDrafts((prev) => ({ ...prev, [messagePageKey]: e.target.value }))
              }
              placeholder="This page is temporarily unavailable."
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                isLoading={isSaving}
                onClick={() => void saveMessage(messagePageKey)}
              >
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setMessagePageKey(null)}>
                Cancel
              </Button>
              <SaveFeedback
                saved={savedKey === `${messagePageKey}-msg`}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
