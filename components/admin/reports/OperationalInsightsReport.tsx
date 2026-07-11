// components/admin/reports/OperationalInsightsReport.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, DoorOpen, Users, IndianRupee,
  Receipt, TrendingUp, TrendingDown, Loader2, Download, Printer, Heart,
} from "lucide-react";
import * as XLSX from "xlsx";

interface Property { id: string; name: string; }

interface OperationalInsightsReportProps {
  properties: Property[];
  data: any;
  loading: boolean;
  filters: { startDate: string; endDate: string; propertyId: string };
  orgLogo?: string;
  orgName?: string;
}

const PRINT_STYLE = `
  *{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;color:#111;font-size:12px;padding:32px;margin:0}
  .brand-header{display:grid;grid-template-columns:88px 1fr 88px;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #1B3FA0}
  .brand-logo{max-width:80px;max-height:80px;object-fit:contain}
  .brand-center{text-align:center}
  .brand-name{font-size:20px;font-weight:900;color:#0D2567}
  .brand-sub{font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;margin-top:3px}
  .report-title{font-size:18px;font-weight:900;margin-bottom:2px}
  .report-meta{font-size:11px;color:#6b7280;margin-bottom:20px;display:flex;gap:16px;flex-wrap:wrap}
  .report-meta span b{color:#1B3FA0}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .summary-card{background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px}
  .summary-card .lbl{font-size:9px;font-weight:800;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}
  .summary-card .val{font-size:18px;font-weight:900}
  h2{font-size:11px;font-weight:800;text-transform:uppercase;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:6px;margin:22px 0 10px}
  table{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:6px}
  thead tr{background:#f8fafc}
  th{text-align:left;font-size:9px;font-weight:800;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e5e7eb;padding:7px 9px}
  td{padding:6px 9px;border-bottom:1px solid #f3f4f6}
  tfoot td{font-weight:800;border-top:2px solid #e5e7eb;background:#f8fafc}
  .amt{color:#059669;font-weight:700}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:9.5px;color:#9ca3af;display:flex;justify-content:space-between}
  @page{margin:14mm;size:A4}
`;

function openPrintWindow(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

export default function OperationalInsightsReport({
  properties, data, loading, filters, orgLogo = "", orgName = "Roomac Co-Living",
}: OperationalInsightsReportProps) {

  const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const propertyName = filters.propertyId === "all"
    ? "All Properties"
    : properties.find(p => p.id === filters.propertyId)?.name || "Selected Property";

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.properties), "Properties");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.floors.flatMap((f: any) => f.rooms.map((r: any) => ({
        Property: f.property_name, Floor: f.floor, Room: r.room_number,
        Sharing: r.sharing_type, Total_Beds: r.total_bed, Occupied: r.occupied_beds,
        Available: r.available_beds, Rent: r.rent_per_bed, Status: r.status,
      })))
    ), "Rooms");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.couples), "Couples");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.new_tenants), "New Tenants");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.tenant_payments), "Tenant Payments");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      data.expenses_by_category.flatMap((c: any) => c.subcategories.map((s: any) => ({
        Category: c.category_name, Subcategory: s.name, Amount: s.amount, Count: s.count,
      })))
    ), "Expenses");
    XLSX.writeFile(wb, `operational-insights-${filters.startDate}-to-${filters.endDate}.xlsx`);
  };

  const handlePrint = () => {
    if (!data) return;
    const t = data.totals;
    const propRows = data.properties.map((p: any) => `
      <tr>
        <td>${p.name}</td><td>${p.total_rooms}</td><td>${p.occupied_beds}/${p.total_beds}</td>
        <td>${p.occupancy_rate}%</td><td class="amt">${fmt(p.rent_revenue)}</td>
        <td>${fmt(p.deposit_revenue)}</td><td>${fmt(p.total_expenses)}</td><td>${fmt(p.net)}</td>
      </tr>`).join("");

    const coupleRows = (data.couples || []).map((c: any) => `
      <tr><td>${c.salutation || ""} ${c.full_name}</td><td>${c.partner_full_name || "—"}</td>
      <td>${c.property_name} — Room ${c.room_number}, Bed ${c.bed_number}</td></tr>`).join("");

    const newTenantRows = (data.new_tenants || []).map((n: any) => `
      <tr><td>${n.salutation || ""} ${n.full_name}</td><td>${n.phone}</td>
      <td>${n.property_name || "—"} ${n.room_number ? `— Room ${n.room_number}` : ""}</td>
      <td>${n.check_in_date ? new Date(n.check_in_date).toLocaleDateString("en-IN") : "—"}</td></tr>`).join("");

    const expenseRows = (data.expenses_by_category || []).map((c: any) => `
      <tr><td>${c.category_name}</td><td>${c.count}</td><td>${fmt(c.total_amount)}</td>
      <td>${fmt(c.total_paid)}</td><td>${fmt(c.balance)}</td></tr>`).join("");

    const html = `<!DOCTYPE html><html><head><title>Operational Insights</title><style>${PRINT_STYLE}</style></head><body>
      <div class="brand-header">
        <div>${orgLogo ? `<img class="brand-logo" src="${orgLogo}" onerror="this.style.display='none'"/>` : ""}</div>
        <div class="brand-center"><div class="brand-name">${orgName}</div><div class="brand-sub">Operational Insights Report</div></div>
        <div></div>
      </div>
      <div class="report-title">Operational Insights</div>
      <div class="report-meta">
        <span>Property: <b>${propertyName}</b></span>
        <span>Period: <b>${filters.startDate} to ${filters.endDate}</b></span>
        <span>Generated: <b>${new Date().toLocaleString("en-IN")}</b></span>
      </div>
      <div class="summary-grid">
        <div class="summary-card"><div class="lbl">Occupancy</div><div class="val">${t.occupancy_rate}%</div></div>
        <div class="summary-card"><div class="lbl">Beds</div><div class="val">${t.occupied_beds}/${t.total_beds}</div></div>
        <div class="summary-card"><div class="lbl">Revenue</div><div class="val">${fmt(t.total_revenue)}</div></div>
        <div class="summary-card"><div class="lbl">Net Cashflow</div><div class="val">${fmt(t.net_cashflow)}</div></div>
      </div>
      <h2>Properties — Occupancy &amp; Revenue</h2>
      <table><thead><tr><th>Property</th><th>Rooms</th><th>Beds</th><th>Occ.</th><th>Rent Rev</th><th>Deposit Rev</th><th>Expenses</th><th>Net</th></tr></thead>
      <tbody>${propRows}</tbody></table>
      <h2>Couple Bookings (${(data.couples || []).length})</h2>
      <table><thead><tr><th>Primary Tenant</th><th>Partner</th><th>Property/Room</th></tr></thead>
      <tbody>${coupleRows || `<tr><td colspan="3" style="text-align:center;color:#9ca3af">None</td></tr>`}</tbody></table>
      <h2>New Tenants (${(data.new_tenants || []).length})</h2>
      <table><thead><tr><th>Name</th><th>Contact</th><th>Property/Room</th><th>Check-in</th></tr></thead>
      <tbody>${newTenantRows || `<tr><td colspan="4" style="text-align:center;color:#9ca3af">None</td></tr>`}</tbody></table>
      <h2>Expenses by Category</h2>
      <table><thead><tr><th>Category</th><th>Count</th><th>Amount</th><th>Paid</th><th>Balance</th></tr></thead>
      <tbody>${expenseRows}</tbody>
      <tfoot><tr><td>Total</td><td>${data.expense_totals.total_amount ? "" : ""}</td>
      <td class="amt">${fmt(data.expense_totals.total_amount)}</td><td>${fmt(data.expense_totals.total_paid)}</td>
      <td>${fmt(data.expense_totals.total_balance)}</td></tr></tfoot></table>
      <div class="footer"><span>Roomac Co-Living Management System</span><span>This is a system generated report</span></div>
    </body></html>`;

    openPrintWindow(html);
  };

  const StatCard = ({ label, value, icon, tone }: any) => (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-80">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );

  const SectionHeader = ({ title, icon }: any) => (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-gray-50">
      {icon}
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Report Actions — matches the pattern used by every other report tab */}
      <div className="flex justify-end gap-1.5 sm:gap-2 mb-1">
        <Button variant="outline" size="sm" onClick={exportExcel} disabled={!data} className="h-7 sm:h-8 text-xs">
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={!data} className="h-7 sm:h-8 text-xs">
          <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Print
        </Button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <StatCard label="Rooms" value={data.totals.total_rooms} icon={<DoorOpen className="h-3 w-3" />} tone="bg-blue-50 border-blue-100 text-blue-800" />
            <StatCard label="Beds" value={`${data.totals.occupied_beds}/${data.totals.total_beds}`} icon={<Building2 className="h-3 w-3" />} tone="bg-purple-50 border-purple-100 text-purple-800" />
            <StatCard label="Occupancy" value={`${data.totals.occupancy_rate}%`} icon={<TrendingUp className="h-3 w-3" />} tone="bg-cyan-50 border-cyan-100 text-cyan-800" />
            <StatCard label="Male / Female" value={`${data.demographics.male} / ${data.demographics.female}`} icon={<Users className="h-3 w-3" />} tone="bg-indigo-50 border-indigo-100 text-indigo-800" />
            <StatCard label="Couples" value={data.couples.length} icon={<Heart className="h-3 w-3" />} tone="bg-pink-50 border-pink-100 text-pink-800" />
            <StatCard label="Revenue" value={fmt(data.totals.total_revenue)} icon={<IndianRupee className="h-3 w-3" />} tone="bg-green-50 border-green-100 text-green-800" />
            <StatCard
              label="Net Cashflow"
              value={fmt(data.totals.net_cashflow)}
              icon={data.totals.net_cashflow >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              tone={data.totals.net_cashflow >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-800"}
            />
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title="Properties — Occupancy & Revenue" icon={<Building2 className="h-3.5 w-3.5 text-blue-600" />} />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Property</th>
                    <th className="px-3 py-2 text-center">Rooms</th>
                    <th className="px-3 py-2 text-center">Beds (Occ/Total)</th>
                    <th className="px-3 py-2 text-center">Occupancy</th>
                    <th className="px-3 py-2 text-right">Rent Revenue</th>
                    <th className="px-3 py-2 text-right">Deposit Revenue</th>
                    <th className="px-3 py-2 text-right">Expenses</th>
                    <th className="px-3 py-2 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.properties.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-center">{p.total_rooms}</td>
                      <td className="px-3 py-2 text-center">{p.occupied_beds}/{p.total_beds}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={p.occupancy_rate >= 80 ? "bg-green-100 text-green-700" : p.occupancy_rate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                          {p.occupancy_rate}%
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-green-600">{fmt(p.rent_revenue)}</td>
                      <td className="px-3 py-2 text-right">{fmt(p.deposit_revenue)}</td>
                      <td className="px-3 py-2 text-right text-red-600">{fmt(p.total_expenses)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${p.net >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(p.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-semibold">
                  <tr>
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-center">{data.totals.total_rooms}</td>
                    <td className="px-3 py-2 text-center">{data.totals.occupied_beds}/{data.totals.total_beds}</td>
                    <td className="px-3 py-2 text-center">{data.totals.occupancy_rate}%</td>
                    <td colSpan={2} className="px-3 py-2 text-right">{fmt(data.totals.total_revenue)}</td>
                    <td className="px-3 py-2 text-right">{fmt(data.totals.total_expenses)}</td>
                    <td className="px-3 py-2 text-right">{fmt(data.totals.net_cashflow)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title="Room Availability by Floor" icon={<DoorOpen className="h-3.5 w-3.5 text-purple-600" />} />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Property</th>
                    <th className="px-3 py-2 text-left">Floor</th>
                    <th className="px-3 py-2 text-center">Rooms</th>
                    <th className="px-3 py-2 text-center">Available</th>
                    <th className="px-3 py-2 text-center">Partial</th>
                    <th className="px-3 py-2 text-center">Fully Occupied</th>
                    <th className="px-3 py-2 text-center">Beds (Occ/Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.floors.map((f: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{f.property_name}</td>
                      <td className="px-3 py-2">Floor {f.floor}</td>
                      <td className="px-3 py-2 text-center">{f.total_rooms}</td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-green-100 text-green-700">{f.available_rooms}</Badge></td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-yellow-100 text-yellow-700">{f.partial_rooms}</Badge></td>
                      <td className="px-3 py-2 text-center"><Badge className="bg-gray-100 text-gray-700">{f.occupied_rooms}</Badge></td>
                      <td className="px-3 py-2 text-center">{f.occupied_beds}/{f.total_beds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title={`Couple Bookings (${data.couples.length})`} icon={<Heart className="h-3.5 w-3.5 text-pink-600" />} />
            {data.couples.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-4">No active couple bookings in this selection.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Primary Tenant</th>
                      <th className="px-3 py-2 text-left">Partner</th>
                      <th className="px-3 py-2 text-left">Relationship</th>
                      <th className="px-3 py-2 text-left">Property / Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.couples.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{c.salutation} {c.full_name} <span className="text-gray-400">({c.phone})</span></td>
                        <td className="px-3 py-2">{c.partner_full_name || "—"} {c.partner_phone && <span className="text-gray-400">({c.partner_phone})</span>}</td>
                        <td className="px-3 py-2">{c.partner_relationship || "—"}</td>
                        <td className="px-3 py-2">{c.property_name} — Room {c.room_number}, Bed {c.bed_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title={`New Tenants (${data.new_tenants.length})`} icon={<Users className="h-3.5 w-3.5 text-indigo-600" />} />
            {data.new_tenants.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-4">No new tenants checked in during this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Contact</th>
                      <th className="px-3 py-2 text-left">Property / Room</th>
                      <th className="px-3 py-2 text-left">Check-in Date</th>
                      <th className="px-3 py-2 text-center">Couple</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.new_tenants.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{t.salutation} {t.full_name}</td>
                        <td className="px-3 py-2">{t.phone}</td>
                        <td className="px-3 py-2">{t.property_name || "—"} {t.room_number && `— Room ${t.room_number}, Bed ${t.bed_number}`}</td>
                        <td className="px-3 py-2">{t.check_in_date ? new Date(t.check_in_date).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-3 py-2 text-center">
                          {t.is_couple_booking ? <Badge className="bg-pink-100 text-pink-700">{t.partner_full_name}</Badge> : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title="Tenant Payment Status" icon={<IndianRupee className="h-3.5 w-3.5 text-green-600" />} />
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Tenant</th>
                    <th className="px-3 py-2 text-left">Property / Room</th>
                    <th className="px-3 py-2 text-center">Payments Made</th>
                    <th className="px-3 py-2 text-right">Monthly Rent</th>
                    <th className="px-3 py-2 text-right">Expected</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                    <th className="px-3 py-2 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.tenant_payments.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{t.full_name}</td>
                      <td className="px-3 py-2">{t.property_name} — Room {t.room_number}, Bed {t.bed_number}</td>
                      <td className="px-3 py-2 text-center">{t.payment_count}</td>
                      <td className="px-3 py-2 text-right">{fmt(t.monthly_rent)}</td>
                      <td className="px-3 py-2 text-right">{fmt(t.expected_rent)}</td>
                      <td className="px-3 py-2 text-right text-green-600">{fmt(t.total_paid)}</td>
                      <td className="px-3 py-2 text-right">
                        {t.pending > 0 ? <span className="text-red-600 font-semibold">{fmt(t.pending)}</span> : <span className="text-green-600">Settled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title="Expenses by Category" icon={<Receipt className="h-3.5 w-3.5 text-red-600" />} />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Subcategory</th>
                    <th className="px-3 py-2 text-center">Count</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Paid</th>
                    <th className="px-3 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.expenses_by_category.map((cat: any) => (
                    <>
                      <tr key={cat.category_name} className="bg-gray-50/60 font-semibold">
                        <td className="px-3 py-1.5" colSpan={2}>{cat.category_name}</td>
                        <td className="px-3 py-1.5 text-center">{cat.count}</td>
                        <td className="px-3 py-1.5 text-right">{fmt(cat.total_amount)}</td>
                        <td className="px-3 py-1.5 text-right text-green-600">{fmt(cat.total_paid)}</td>
                        <td className="px-3 py-1.5 text-right text-amber-600">{fmt(cat.balance)}</td>
                      </tr>
                      {cat.subcategories.map((s: any, i: number) => (
                        <tr key={`${cat.category_name}-${i}`} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5"></td>
                          <td className="px-3 py-1.5 text-gray-500">{s.name}</td>
                          <td className="px-3 py-1.5 text-center text-gray-500">{s.count}</td>
                          <td className="px-3 py-1.5 text-right text-gray-600">{fmt(s.amount)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={3} className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{fmt(data.expense_totals.total_amount)}</td>
                    <td className="px-3 py-2 text-right text-green-700">{fmt(data.expense_totals.total_paid)}</td>
                    <td className="px-3 py-2 text-right text-amber-700">{fmt(data.expense_totals.total_balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionHeader title="Payments by Mode & Status" icon={<IndianRupee className="h-3.5 w-3.5 text-cyan-600" />} />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Mode</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-center">Count</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.payments_by_mode.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 capitalize">{(m.mode || "—").replace(/_/g, " ")}</td>
                      <td className="px-3 py-2">
                        <Badge className={m.status === "approved" || m.status === "paid" ? "bg-green-100 text-green-700" : m.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">{m.count}</td>
                      <td className="px-3 py-2 text-right">{fmt(m.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}