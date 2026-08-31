import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  Building2,
  DollarSign,
  Package,
  PackageMinus,
  PhilippinePeso,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useInventoryDashboard } from '@/api/hooks';
import { AdminCard, AdminCardBody, AdminCardHeader } from '@/components/admin/AdminCard';
import {
  DualCurrencyLegend,
  MonthlySpendChart,
  QuantityChart,
  SupplierSpendChart,
} from '@/components/admin/InventoryCharts';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatPeso, formatUsd, linePeso, lineUsd } from '@/utils/money';
import { inventorySupplierPath } from '@/utils/inventory';
import { cn } from '@/utils/cn';
import type { InventoryIssuance, InventoryPart } from '@/types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatQty(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

function kindBadge(kind: string) {
  if (kind === 'Charge') return <Badge variant="warning">Charge</Badge>;
  if (kind === 'Note') return <Badge>Note</Badge>;
  return <Badge variant="success">Part</Badge>;
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  emphasize,
  horizontal,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  href?: string;
  emphasize?: boolean;
  horizontal?: boolean;
}) {
  const body = (
    <div
      className={cn(
        'flex h-full w-full min-w-0 flex-col rounded-xl border bg-white shadow-sm transition-all',
        horizontal ? 'p-3.5' : 'min-h-[4.75rem] p-3 sm:min-h-[5.75rem] sm:p-4',
        emphasize
          ? 'border-primary-900/15 ring-1 ring-primary-900/5'
          : 'border-slate-200/90 hover:border-primary-900/20',
        href && 'hover:shadow-md',
      )}
    >
      <div className={cn('flex min-w-0 items-start justify-between gap-3', horizontal && 'items-center')}>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-900/45 sm:text-[11px]">
            {label}
          </p>
          <p
            className={cn(
              'mt-1 break-words font-semibold tabular-nums tracking-tight text-primary-900',
              emphasize ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-[10px] leading-snug text-slate-500 sm:text-[11px]">{hint}</p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg',
            horizontal || emphasize ? 'h-9 w-9' : 'h-8 w-8 sm:h-9 sm:w-9',
            emphasize ? 'bg-primary-900 text-white' : 'bg-primary-50 text-primary-800',
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full min-w-0">
        {body}
      </Link>
    );
  }

  return body;
}

export default function WorkspaceHomePage() {
  const { data, isLoading } = useInventoryDashboard();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const rate = data.usdToPhpRate || 58;
  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-full space-y-3 overflow-x-hidden sm:space-y-5">
      <section className="w-full max-w-full overflow-hidden rounded-xl border border-primary-900/20 bg-primary-900 text-white shadow-sm sm:rounded-2xl">
        <div className="relative px-4 py-5 sm:px-7 sm:py-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 sm:text-[11px]">
                Operations · {today}
              </p>
              <h1 className="mt-1.5 text-xl font-semibold tracking-tight sm:mt-2 sm:text-3xl">
                Parts inventory
              </h1>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70 sm:mt-2 sm:text-sm">
                Purchases in, stock out, and on-hand from the supplier register.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                to="/admin/workspace/inventory"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-slate-100"
              >
                Open register
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/workspace/inventory/out"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Stock out
                <ArrowUpFromLine className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width spend cards on phones so ₱1.3M amounts never clip */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        <MetricCard
          emphasize
          horizontal
          label="Spend · USD"
          value={formatUsd(data.totalSpendUsd, true)}
          hint={data.averageUnitPriceUsd ? `Avg ${formatUsd(data.averageUnitPriceUsd)}` : undefined}
          icon={DollarSign}
        />
        <MetricCard
          emphasize
          horizontal
          label="Spend · PHP"
          value={formatPeso(data.totalSpendPhp, true)}
          hint={
            data.phpEstimatedCount > 0
              ? `${data.phpEstimatedCount} est. @ ₱${rate.toFixed(0)} / $1`
              : data.averageUnitPricePhp
                ? `Avg ${formatPeso(data.averageUnitPricePhp)}`
                : 'Entered peso'
          }
          icon={PhilippinePeso}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <MetricCard
          label="Part lines"
          value={data.partCount}
          icon={Package}
          href="/admin/workspace/inventory"
        />
        <MetricCard label="Purchased" value={data.totalQuantity} icon={Boxes} hint="Register in qty" />
        <MetricCard
          label="Suppliers"
          value={data.supplierCount}
          icon={Truck}
          href="/admin/workspace/inventory"
        />
        <MetricCard
          label="No project"
          value={data.unassignedProjectCount}
          icon={Building2}
          hint={data.unassignedProjectCount > 0 ? 'Needs project' : 'All assigned'}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <MetricCard
          label="Issued qty"
          value={formatQty(data.totalIssuedQuantity)}
          icon={PackageMinus}
          href="/admin/workspace/inventory/out"
        />
        <MetricCard
          label="On hand"
          value={formatQty(data.totalOnHandQuantity)}
          icon={Boxes}
          hint="Purchased minus issued"
        />
        <MetricCard
          label="Stock-outs"
          value={data.issuanceCount ?? 0}
          icon={ArrowUpFromLine}
          href="/admin/workspace/inventory/out"
        />
        <MetricCard
          label="Zero stock"
          value={data.zeroStockCount ?? 0}
          icon={AlertTriangle}
          hint={data.zeroStockCount > 0 ? 'Part lines fully issued' : 'All parts have stock'}
          href="/admin/workspace/inventory"
        />
      </div>

      {data.missingPriceCount > 0 && (
        <div className="flex w-full max-w-full flex-col gap-2 rounded-xl border border-primary-900/15 bg-white px-3 py-3 text-xs text-primary-900 shadow-sm sm:flex-row sm:items-center sm:px-4">
          <div className="flex min-w-0 items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-800" />
            <span className="min-w-0">
              {data.missingPriceCount} part line{data.missingPriceCount === 1 ? '' : 's'} missing a
              price.
            </span>
          </div>
          <Link
            to="/admin/workspace/inventory"
            className="font-semibold text-primary-800 underline-offset-2 hover:underline sm:ml-auto"
          >
            Fix in register
          </Link>
        </div>
      )}

      <AdminCard accent="navy" className="w-full max-w-full border-primary-900/10">
        <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-primary-900">Monthly spend</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">USD bars · PHP trend</p>
            </div>
            <DualCurrencyLegend />
          </div>
        </AdminCardHeader>
        <AdminCardBody className="overflow-hidden p-3 sm:p-5">
          <MonthlySpendChart items={data.spendByMonth} />
        </AdminCardBody>
      </AdminCard>

      <div className="grid w-full max-w-full gap-3 sm:gap-4 xl:grid-cols-5">
        <AdminCard accent="navy" className="w-full max-w-full border-primary-900/10 xl:col-span-3">
          <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-primary-900">Spend by supplier</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Tap a supplier to open its register</p>
              </div>
              <DualCurrencyLegend />
            </div>
          </AdminCardHeader>
          <AdminCardBody className="p-3 sm:p-5">
            <SupplierSpendChart items={data.spendBySupplier} />
          </AdminCardBody>
        </AdminCard>

        <div className="flex w-full max-w-full flex-col gap-3 xl:col-span-2">
        <AdminCard className="w-full max-w-full border-primary-900/10">
          <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-primary-900">Recent lines</h2>
              <Link
                to="/admin/workspace/inventory"
                className="shrink-0 text-xs font-semibold text-primary-800 hover:underline"
              >
                View all
              </Link>
            </div>
          </AdminCardHeader>
          <AdminCardBody className="p-0 sm:p-0">
            <ul className="divide-y divide-slate-100">
              {data.recent.slice(0, 6).map((row: InventoryPart) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary-900">{row.item}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {formatDate(row.purchasedAt)}
                      {row.supplier ? (
                        <>
                          {' · '}
                          <Link
                            to={inventorySupplierPath(row.supplier)}
                            className="font-medium text-primary-800 hover:underline"
                          >
                            {row.supplier}
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {kindBadge(row.lineKind)}
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-primary-900">
                      {formatUsd(lineUsd(row))}
                    </p>
                    <p className="text-[11px] tabular-nums text-primary-700/80">
                      {formatPeso(linePeso(row, rate))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </AdminCardBody>
        </AdminCard>

        <AdminCard className="w-full max-w-full border-primary-900/10">
          <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-primary-900">Recent stock-outs</h2>
              <Link
                to="/admin/workspace/inventory/out"
                className="shrink-0 text-xs font-semibold text-primary-800 hover:underline"
              >
                View all
              </Link>
            </div>
          </AdminCardHeader>
          <AdminCardBody className="p-0 sm:p-0">
            {(data.recentIssuances ?? []).length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-slate-500 sm:px-5">
                No stock-outs recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(data.recentIssuances ?? []).slice(0, 6).map((row: InventoryIssuance) => (
                  <li
                    key={row.id}
                    className="flex items-start justify-between gap-3 px-3 py-3 sm:items-center sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-primary-900">{row.item}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {formatDate(row.issuedAt)}
                        {row.receivedByName ? ` · ${row.receivedByName}` : ''}
                        {row.clientName ? ` · ${row.clientName}` : ''}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold tabular-nums text-primary-900">
                      −{formatQty(row.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminCardBody>
        </AdminCard>
        </div>
      </div>

      <AdminCard className="w-full max-w-full border-primary-900/10">
        <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-primary-900">Top items by quantity</h2>
        </AdminCardHeader>
        <AdminCardBody className="overflow-hidden p-3 sm:p-5">
          <QuantityChart items={data.topItems.slice(0, 8)} />
        </AdminCardBody>
      </AdminCard>
    </div>
  );
}
