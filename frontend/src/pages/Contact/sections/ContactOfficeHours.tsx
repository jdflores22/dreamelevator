import { Clock } from 'lucide-react';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { parseOfficeHoursLines } from '@/utils/media';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';

interface ContactOfficeHoursProps {
  isDark?: boolean;
}

export function ContactOfficeHours({ isDark = false }: ContactOfficeHoursProps) {
  const { get } = useSiteSettingsMap();
  const title = deecCopy(get('contact_office_hours_title'), 'Office hours');
  const rowsText = deecCopy(
    get('contact_office_hours'),
    'Mon–Fri|8:00 AM – 5:00 PM\nSat|8:00 AM – 12:00 NN\nSun|Closed',
  );
  const note = deecCopy(
    get('contact_office_hours_note'),
    'Visit is by appointment only. Trunkline is staffed 8:00 AM – 5:00 PM, Monday to Friday.',
  );

  const rows = parseOfficeHoursLines(rowsText);
  if (rows.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-xl border p-5',
        isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white',
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            isDark ? 'bg-brand-gold-500/15' : 'bg-brand-gold-500/10',
          )}
        >
          <Clock className="h-4 w-4 text-brand-gold-500" strokeWidth={1.5} />
        </div>
        <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-primary-900')}>{title}</p>
      </div>
      <ul className="space-y-2.5">
        {rows.map((row, index) => (
          <li
            key={`${row.label}-${row.hours}-${index}`}
            className={cn(
              'flex items-start justify-between gap-4 text-sm',
              isDark ? 'text-slate-200' : 'text-slate-700',
            )}
          >
            {row.label ? (
              <>
                <span className={cn('font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {row.label}
                </span>
                <span className="text-right font-medium">{row.hours}</span>
              </>
            ) : (
              <span className="font-medium">{row.hours}</span>
            )}
          </li>
        ))}
      </ul>
      {note && (
        <p className={cn('mt-4 text-xs leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {note}
        </p>
      )}
    </div>
  );
}
