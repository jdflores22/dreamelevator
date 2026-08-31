import { cn } from '@/utils/cn';

type EquipmentKind = 'elevator' | 'escalator' | 'service';

export function EquipmentGlyph({
  kind,
  className,
}: {
  kind: EquipmentKind;
  className?: string;
}) {
  const cls = cn('h-10 w-10 text-primary-800', className);

  if (kind === 'escalator') {
    return (
      <svg viewBox="0 0 40 40" fill="none" className={cls} aria-hidden>
        <path
          d="M6 30h10l14-16h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M16 30V22h8" stroke="currentColor" strokeWidth="1.75" />
        <path d="M24 22V14h8" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 30v-4h8" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="32" cy="12" r="1.6" fill="#f7971f" />
      </svg>
    );
  }

  if (kind === 'service') {
    return (
      <svg viewBox="0 0 40 40" fill="none" className={cls} aria-hidden>
        <rect x="12" y="6" width="16" height="28" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 14h16M12 26h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 10h4M18 30h4" stroke="#f7971f" strokeWidth="1.75" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 40 40" fill="none" className={cls} aria-hidden>
      <rect x="11" y="4" width="18" height="32" stroke="currentColor" strokeWidth="1.75" />
      <path d="M11 20h18" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="8" width="12" height="10" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="22" width="12" height="10" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="13" r="1.2" fill="#f7971f" />
    </svg>
  );
}

export function equipmentKindFromTitle(title: string): EquipmentKind {
  const t = title.toLowerCase();
  if (t.includes('escalat') || t.includes('walk')) return 'escalator';
  if (
    t.includes('modern') ||
    t.includes('service') ||
    t.includes('maintain') ||
    t.includes('consult') ||
    t.includes('parts') ||
    t.includes('structural')
  ) {
    return 'service';
  }
  return 'elevator';
}
