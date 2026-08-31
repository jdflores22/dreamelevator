import type { InventoryPart } from '@/types';

const pesoExact = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pesoWhole = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdExact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const usdWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const DEFAULT_USD_PHP_RATE = 58;

export function formatPeso(value: number | null | undefined, compact = false): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `₱${(compact ? pesoWhole : pesoExact).format(value)}`;
}

export function formatUsd(value: number | null | undefined, compact = false): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return (compact ? usdWhole : usdExact).format(value);
}

export function hasEnteredPeso(row: Pick<InventoryPart, 'amountInPeso' | 'totalPrice'>): boolean {
  return row.amountInPeso != null && row.amountInPeso > 0 && row.amountInPeso !== row.totalPrice;
}

export function lineUsd(row: Pick<InventoryPart, 'totalPrice'>): number | null {
  return row.totalPrice ?? null;
}

export function linePeso(
  row: Pick<InventoryPart, 'amountInPeso' | 'totalPrice'>,
  rate = DEFAULT_USD_PHP_RATE,
): number | null {
  if (hasEnteredPeso(row)) return row.amountInPeso;
  if (row.totalPrice != null) return Math.round(row.totalPrice * rate * 100) / 100;
  return row.amountInPeso ?? null;
}
