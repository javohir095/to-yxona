import { useMemo, useState } from "react";
import {
  addMonths,
  addQuarters,
  addYears,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  getQuarter,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import { CalendarCheck2, ChevronLeft, ChevronRight, Percent, Printer, Receipt, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { useAuth } from "@/providers/auth-provider";
import { useMounted } from "@/hooks/use-mounted";
import { useEventTypeBreakdown, useHallRevenue, useReportSummary } from "@/hooks/use-reports";
import { EVENT_TYPE_LABELS, type EventType } from "@/entities";
import { formatCurrency } from "@/lib/format";
import { UZ_MONTHS } from "@/lib/uz-date";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

type Period = "month" | "quarter" | "year";

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getRange(period: Period, anchor: Date) {
  switch (period) {
    case "month":
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
    case "quarter":
      return { start: startOfQuarter(anchor), end: endOfQuarter(anchor) };
    case "year":
      return { start: startOfYear(anchor), end: endOfYear(anchor) };
  }
}

function getLabel(period: Period, anchor: Date) {
  if (period === "month") return `${UZ_MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
  if (period === "quarter") return `${getQuarter(anchor)}-chorak ${anchor.getFullYear()}`;
  return `${anchor.getFullYear()}`;
}

export function ReportsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;

  const mounted = useMounted();
  const [period, setPeriod] = useState<Period>("month");
  const [anchor, setAnchor] = useState(() => new Date());

  const { start, end } = useMemo(() => getRange(period, anchor), [period, anchor]);
  const rangeStart = toKey(start);
  const rangeEnd = toKey(end);

  const { data: summary, isLoading: summaryLoading } = useReportSummary(venueId, rangeStart, rangeEnd);
  const { data: hallRevenue, isLoading: hallLoading } = useHallRevenue(venueId, rangeStart, rangeEnd);
  const { data: breakdown, isLoading: breakdownLoading } = useEventTypeBreakdown(venueId, rangeStart, rangeEnd);

  function goPrev() {
    setAnchor((current) =>
      period === "month" ? subMonths(current, 1) : period === "quarter" ? subQuarters(current, 1) : subYears(current, 1),
    );
  }

  function goNext() {
    setAnchor((current) =>
      period === "month" ? addMonths(current, 1) : period === "quarter" ? addQuarters(current, 1) : addYears(current, 1),
    );
  }

  const occupancyPercent =
    summary && summary.total_hall_days > 0 ? Math.round((summary.occupied_days / summary.total_hall_days) * 100) : 0;

  const pieData = (breakdown ?? [])
    .filter((row) => row.revenue > 0)
    .map((row) => ({ name: EVENT_TYPE_LABELS[row.event_type as EventType], value: row.revenue }));

  return (
    <div>
      <PageHeader
        title="Hisobotlar"
        description="Davr bo'yicha to'yxona ko'rsatkichlari"
        action={
          <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
            <Printer /> Chop etish
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="w-40 text-center text-sm font-semibold">{getLabel(period, anchor)}</p>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="month">Oy</TabsTrigger>
            <TabsTrigger value="quarter">Chorak</TabsTrigger>
            <TabsTrigger value="year">Yil</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <p className="mb-4 hidden text-sm text-muted-foreground print:block">{getLabel(period, anchor)}</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Jami tushum" value={`${formatCurrency(summary?.total_revenue ?? 0)} so'm`} icon={Wallet} accent="primary" />
            <StatCard label="Jami tadbirlar" value={summary?.total_bookings ?? 0} icon={CalendarCheck2} accent="secondary" />
            <StatCard label="O'rtacha chek" value={`${formatCurrency(summary?.avg_ticket ?? 0)} so'm`} icon={Receipt} accent="success" />
            <StatCard label="Band kunlar foizi" value={`${occupancyPercent}%`} icon={Percent} accent="warning" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zal bo'yicha taqqoslash</CardTitle>
          </CardHeader>
          <CardContent>
            {hallLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : hallRevenue && hallRevenue.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zal</TableHead>
                      <TableHead>Tadbirlar</TableHead>
                      <TableHead>Tushum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hallRevenue.map((hall) => (
                      <TableRow key={hall.hall_id}>
                        <TableCell className="font-medium">{hall.hall_name}</TableCell>
                        <TableCell className="tabular-nums">{hall.bookings_count}</TableCell>
                        <TableCell className="tabular-nums">{formatCurrency(hall.revenue)} so'm</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tadbir turi bo'yicha taqsimot</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownLoading || !mounted ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : pieData.length > 0 ? (
              <>
                <div className="flex h-56 w-full items-center justify-center">
                  <PieChart width={224} height={224}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--popover)",
                        color: "var(--popover-foreground)",
                        fontSize: 13,
                      }}
                      formatter={(value) => [`${formatCurrency(Number(value))} so'm`, "Tushum"]}
                    />
                  </PieChart>
                </div>
                <div className="mt-2 divide-y divide-border text-sm">
                  {(breakdown ?? []).map((row, index) => (
                    <div key={row.event_type} className="flex items-center justify-between py-1.5">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        {EVENT_TYPE_LABELS[row.event_type as EventType]}
                      </span>
                      <span className="tabular-nums">
                        {row.bookings_count} ta · {formatCurrency(row.revenue)} so'm
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Ma'lumot yo'q.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
