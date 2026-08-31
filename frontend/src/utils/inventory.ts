export function slugifySupplier(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'supplier';
}

export function inventorySupplierPath(name: string) {
  return `/admin/workspace/inventory/${encodeURIComponent(slugifySupplier(name))}`;
}

export function formatInventoryQty(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

export function resolveSupplierName(slug: string | undefined, suppliers: string[]) {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase();
  return (
    suppliers.find((name) => slugifySupplier(name) === decoded) ||
    suppliers.find((name) => name.toLowerCase() === decoded) ||
    null
  );
}
