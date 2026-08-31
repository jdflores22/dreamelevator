import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SettingsTab<T extends string = string> {
  id: T;
  label: string;
  hint?: string;
}

interface SettingsTabBarProps<T extends string> {
  tabs: SettingsTab<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function SettingsTabBar<T extends string>({
  tabs,
  active,
  onChange,
}: SettingsTabBarProps<T>) {
  return (
    <div className="flex gap-1 overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200 bg-white p-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'shrink-0 rounded-md px-3 py-2.5 text-left transition-colors sm:min-w-[6.5rem]',
            active === tab.id
              ? 'bg-primary-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-primary-900',
          )}
        >
          <span className="block text-sm font-medium">{tab.label}</span>
          {tab.hint && (
            <span
              className={cn(
                'mt-0.5 hidden text-[11px] sm:block',
                active === tab.id ? 'text-white/70' : 'text-slate-400',
              )}
            >
              {tab.hint}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface CompactSettingsSectionProps {
  title: string;
  description?: string;
  formId: string;
  isSaving?: boolean;
  saved?: boolean;
  saveLabel?: string;
  children: ReactNode;
}

export function CompactSettingsSection({
  title,
  description,
  formId,
  isSaving,
  saved,
  saveLabel = 'Save',
  children,
}: CompactSettingsSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-primary-900">{title}</h3>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="inline-flex h-8 items-center rounded-lg bg-primary-900 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : saveLabel}
          </button>
          {saved && !isSaving && (
            <span className="text-xs font-medium text-emerald-600">Saved</span>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
