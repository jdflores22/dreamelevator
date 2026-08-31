import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, PackageMinus, Phone } from 'lucide-react';
import { useEmployeeProfile } from '@/api/hooks';
import { AdminCard, AdminCardBody, AdminCardHeader } from '@/components/admin/AdminCard';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { EmployeeAvatar } from './EmployeesAdminPage';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatQty(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return '0';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-primary-900">{value}</p>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useEmployeeProfile(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
        Employee not found.
        <Link to="/admin/workspace/employees" className="ml-1 font-semibold text-primary-800 hover:underline">
          Back to employees
        </Link>
      </div>
    );
  }

  const { employee, issuances, topItems } = data;

  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        to="/admin/workspace/employees"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Employees
      </Link>

      <div className="rounded-2xl bg-primary-900 px-4 py-5 text-white sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <EmployeeAvatar
              name={employee.fullName}
              photoUrl={employee.photoUrl}
              className="h-14 w-14 sm:h-16 sm:w-16"
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{employee.fullName}</h1>
              <p className="mt-1 truncate text-sm text-white/70">
                {[employee.position, employee.department, employee.employeeCode]
                  .filter(Boolean)
                  .join(' · ') || 'No profile details yet'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            {employee.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {employee.email}
              </span>
            ) : null}
            {employee.phone ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {employee.phone}
              </span>
            ) : null}
            {employee.isPublished ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="default">Inactive</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Stat label="Stock-outs" value={String(employee.issuanceCount)} />
        <Stat label="Qty received" value={formatQty(employee.totalQuantityIssued)} />
        <Stat label="Last out" value={formatDate(employee.lastIssuedAt)} />
        <Stat label="Date hired" value={formatDate(employee.hiredAt)} />
      </div>

      {topItems.length > 0 ? (
        <AdminCard className="w-full max-w-full border-primary-900/10">
          <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
            <h2 className="text-sm font-semibold text-primary-900">Most received items</h2>
          </AdminCardHeader>
          <AdminCardBody className="p-0 sm:p-0">
            <ul className="divide-y divide-slate-100">
              {topItems.map((row) => (
                <li key={row.item} className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
                  <span className="min-w-0 truncate text-sm text-primary-900">{row.item}</span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">
                    {formatQty(row.quantity)} qty · {row.count}×
                  </span>
                </li>
              ))}
            </ul>
          </AdminCardBody>
        </AdminCard>
      ) : null}

      <AdminCard className="w-full max-w-full border-primary-900/10">
        <AdminCardHeader className="bg-white px-3 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-primary-900">Stock-out history</h2>
            <Link
              to={`/admin/workspace/inventory/out`}
              className="shrink-0 text-xs font-semibold text-primary-800 hover:underline"
            >
              Stock out page
            </Link>
          </div>
        </AdminCardHeader>
        <AdminCardBody className="p-0 sm:p-0">
          {issuances.length === 0 ? (
            <p className="px-3 py-10 text-center text-xs text-slate-500 sm:px-5">
              <PackageMinus className="mx-auto mb-2 h-7 w-7 text-slate-300" />
              This employee has not received any items yet.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 md:hidden">
                {issuances.map((row) => (
                  <li key={row.id} className="px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary-900">{row.item}</p>
                        <p className="truncate text-[11px] text-slate-500">
                          {formatDate(row.issuedAt)}
                          {row.clientName ? ` · ${row.clientName}` : ''}
                          {row.projectBuilding ? ` · ${row.projectBuilding}` : ''}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-primary-900">
                        −{formatQty(row.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden md:block">
                <Table className="min-w-0">
                  <THead>
                    <TR>
                      <TH>Date</TH>
                      <TH>Item</TH>
                      <TH>Qty</TH>
                      <TH>Company</TH>
                      <TH>Project</TH>
                      <TH>Purpose</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {issuances.map((row) => (
                      <TR key={row.id}>
                        <TD className="whitespace-nowrap">{formatDate(row.issuedAt)}</TD>
                        <TD>
                          <p className="font-medium text-primary-900">{row.item}</p>
                          {row.specification ? (
                            <p className="max-w-[14rem] truncate text-xs text-slate-500">
                              {row.specification}
                            </p>
                          ) : null}
                        </TD>
                        <TD className="tabular-nums font-medium text-primary-900">
                          {formatQty(row.quantity)}
                        </TD>
                        <TD className="max-w-[10rem] truncate">{row.clientName || '—'}</TD>
                        <TD className="max-w-[10rem] truncate">{row.projectBuilding || '—'}</TD>
                        <TD className="max-w-[10rem] truncate text-slate-500">{row.purpose || '—'}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  );
}
