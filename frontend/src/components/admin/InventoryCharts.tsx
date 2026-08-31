import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { inventorySupplierPath } from '@/utils/inventory';
import { formatPeso, formatUsd } from '@/utils/money';
import type { InventoryNamedTotal } from '@/types';

const NAVY = '#0A3144';
const ACCENT = '#047CAE';
const GRID = '#E2E8F0';

function formatMonthLabel(value: string, short = false) {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  const label = new Date(year, month - 1, 1).toLocaleDateString('en-PH', {
    month: short ? 'narrow' : 'short',
  });
  return label;
}

function niceMax(value: number) {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function ticks(max: number, count = 4) {
  return Array.from({ length: count + 1 }, (_, i) => (max / count) * i);
}

function useNarrow(maxWidth = 640) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [maxWidth]);

  return narrow;
}

export function DualCurrencyLegend() {
  return (
    <div className="flex shrink-0 items-center gap-3 text-[10px] font-medium text-slate-500">
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm bg-primary-900" />
        USD
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-[#047CAE]" />
        PHP
      </span>
    </div>
  );
}

function compactUsd(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return formatUsd(value, true).replace('.00', '');
}

function compactPeso(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `₱${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return formatPeso(value, true);
}

export function MonthlySpendChart({ items }: { items: InventoryNamedTotal[] }) {
  const [active, setActive] = useState<number | null>(null);
  const narrow = useNarrow();

  const width = narrow ? 360 : 760;
  const height = narrow ? 176 : 220;
  const pad = narrow
    ? { top: 10, right: 34, bottom: 26, left: 34 }
    : { top: 14, right: 52, bottom: 32, left: 48 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const usdMax = niceMax(Math.max(...items.map((i) => i.totalUsd), 0));
  const phpMax = niceMax(Math.max(...items.map((i) => i.totalPhp), 0));
  const usdTicks = ticks(usdMax, narrow ? 3 : 4);
  const phpTicks = ticks(phpMax, narrow ? 3 : 4);
  const gap = innerW / Math.max(items.length, 1);
  const barW = Math.min(narrow ? 14 : 22, gap * (narrow ? 0.45 : 0.4));

  const usdY = (v: number) => pad.top + innerH - (v / usdMax) * innerH;
  const phpY = (v: number) => pad.top + innerH - (v / phpMax) * innerH;
  const xAt = (i: number) => pad.left + gap * i + gap / 2;

  const line = items
    .map((item, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${phpY(item.totalPhp)}`)
    .join(' ');
  const area =
    items.length > 0
      ? `${line} L ${xAt(items.length - 1)} ${pad.top + innerH} L ${xAt(0)} ${pad.top + innerH} Z`
      : '';
  const hover = active == null ? null : items[active];

  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-500">No dated purchases yet.</p>;
  }

  return (
    <div className="relative w-full max-w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-w-full"
        role="img"
        aria-label="Monthly spend in USD and PHP"
      >
        {usdTicks.map((tick, i) => {
          const y = usdY(tick);
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                stroke={GRID}
                strokeDasharray={i === 0 ? undefined : '4 4'}
              />
              <text x={pad.left - 6} y={y + 3} textAnchor="end" className="fill-slate-400" fontSize={narrow ? 8 : 10}>
                {tick === 0 ? '0' : compactUsd(tick)}
              </text>
              <text
                x={width - pad.right + 6}
                y={y + 3}
                textAnchor="start"
                className="fill-[#047CAE]"
                fontSize={narrow ? 8 : 10}
              >
                {tick === 0 ? '0' : compactPeso(phpTicks[i])}
              </text>
            </g>
          );
        })}

        {items.map((item, i) => {
          const x = xAt(i) - barW / 2;
          const y = usdY(item.totalUsd);
          const h = Math.max(2, pad.top + innerH - y);
          return (
            <rect
              key={`${item.name}-bar`}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="2"
              fill={NAVY}
              opacity={active == null || active === i ? 1 : 0.35}
            />
          );
        })}

        <path d={area} fill={ACCENT} opacity="0.12" />
        <path d={line} fill="none" stroke={ACCENT} strokeWidth={narrow ? 1.75 : 2} strokeLinejoin="round" strokeLinecap="round" />

        {items.map((item, i) => (
          <circle
            key={`${item.name}-dot`}
            cx={xAt(i)}
            cy={phpY(item.totalPhp)}
            r={active === i ? 3.5 : narrow ? 2.25 : 2.75}
            fill="#fff"
            stroke={ACCENT}
            strokeWidth="2"
          />
        ))}

        {items.map((item, i) => (
          <g key={`${item.name}-hit`}>
            <rect
              x={xAt(i) - gap / 2}
              y={pad.top}
              width={gap}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onTouchStart={() => setActive(i)}
            />
            <text
              x={xAt(i)}
              y={height - (narrow ? 8 : 12)}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize={narrow ? 8 : 10}
              fontWeight={active === i ? 600 : 400}
            >
              {formatMonthLabel(item.name, narrow)}
            </text>
          </g>
        ))}
      </svg>

      {hover ? (
        <div className="pointer-events-none absolute left-1/2 top-1 z-10 w-[min(11rem,calc(100%-1rem))] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
          <p className="font-semibold text-primary-900">
            {formatMonthLabel(hover.name)} {hover.name.slice(0, 4)}
          </p>
          <p className="mt-1 tabular-nums text-primary-900">{formatUsd(hover.totalUsd)}</p>
          <p className="tabular-nums text-[#047CAE]">{formatPeso(hover.totalPhp)}</p>
        </div>
      ) : null}
    </div>
  );
}

export function SupplierSpendChart({ items }: { items: InventoryNamedTotal[] }) {
  const max = Math.max(...items.map((i) => i.totalUsd), 1);
  const totalUsd = items.reduce((sum, i) => sum + i.totalUsd, 0) || 1;

  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-500">No supplier spend yet.</p>;
  }

  return (
    <ul className="space-y-2.5 sm:space-y-3">
      {items.map((item) => {
        const share = (item.totalUsd / totalUsd) * 100;
        return (
          <li key={item.name} className="min-w-0">
            <Link
              to={inventorySupplierPath(item.name)}
              className="block rounded-lg px-1 py-1.5 hover:bg-slate-50 active:bg-slate-100"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium text-primary-900 underline-offset-2 hover:underline"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {share.toFixed(0)}% · {item.count} lines
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold tabular-nums text-primary-900">
                    {formatUsd(item.totalUsd)}
                  </p>
                  <p className="text-[10px] font-medium tabular-nums text-[#047CAE]">
                    {formatPeso(item.totalPhp)}
                  </p>
                </div>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary-900"
                  style={{ width: `${Math.max(4, (item.totalUsd / max) * 100)}%` }}
                />
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full bg-[#047CAE]/70')}
                  style={{
                    width: `${Math.max(3, (item.totalPhp / Math.max(...items.map((i) => i.totalPhp), 1)) * 100)}%`,
                    opacity: 0.35,
                  }}
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function QuantityChart({ items }: { items: InventoryNamedTotal[] }) {
  const max = Math.max(...items.map((i) => i.quantity), 1);
  const narrow = useNarrow();
  const visible = narrow ? items.slice(0, 5) : items;

  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-500">No parts recorded yet.</p>;
  }

  return (
    <div className="w-full max-w-full">
      <div className="flex h-36 w-full items-end gap-1.5 sm:h-40 sm:gap-2">
        {visible.map((item) => {
          const h = Math.max(8, (item.quantity / max) * 100);
          return (
            <div key={item.name} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold tabular-nums text-primary-900">{item.quantity}</span>
              <div className="flex h-24 w-full items-end justify-center sm:h-28">
                <div
                  className="w-full max-w-7 rounded-t-sm bg-gradient-to-t from-primary-900 to-[#047CAE]"
                  style={{ height: `${h}%` }}
                  title={`${item.name} · qty ${item.quantity} · ${formatUsd(item.totalUsd)} / ${formatPeso(item.totalPhp)}`}
                />
              </div>
              <p className="w-full truncate text-center text-[10px] leading-tight text-slate-500" title={item.name}>
                {item.name}
              </p>
            </div>
          );
        })}
      </div>
      {narrow && items.length > 5 ? (
        <p className="mt-2 text-center text-[10px] text-slate-400">Showing top 5 on mobile</p>
      ) : null}
    </div>
  );
}
