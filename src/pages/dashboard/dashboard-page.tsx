import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, endOfMonth, format, startOfMonth } from "date-fns";
import { AlertTriangle, CalendarDays, Plus, Users, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/providers/auth-provider";
import { useMounted } from "@/hooks/use-mounted";
import {
  useDashboardSummary,
  useHallOccupancy,
  useMonthlyRevenue,
  useUpcomingEvents,
} from "@/hooks/use-dashboard";
import { STATUS_DOT_CLASS } from "@/lib/booking-status";
import { formatCurrency } from "@/lib/format";
import { formatUzDate, UZ_MONTHS_SHORT } from "@/lib/uz-date";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { NewBookingDialog } from "@/pages/bookings/new-booking-dialog";

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DashboardPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const canManage = profile?.role === "owner" || profile?.role === "manager";
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const mounted = useMounted();

  const today = new Date();
  const monthStart = toKey(startOfMonth(today));
  const monthEnd = toKey(endOfMonth(today));
  const weekEnd = toKey(addDays(today, 6));

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(venueId, monthStart, monthEnd);
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingEvents(venueId, toKey(today), weekEnd);
  const { data: revenueTrend, isLoading: revenueLoading } = useMonthlyRevenue(venueId, 6);
  const { data: occupancy, isLoading: occupancyLoading } = useHallOccupancy(venueId, monthStart, monthEnd);

  const chartData = (revenueTrend ?? []).map((point) => {
    const date = new Date(`${point.month_start}T00:00:00`);
    return { label: UZ_MONTHS_SHORT[date.getMonth()], revenue: point.revenue };
  });

  return (
    <div>
      <PageHeader
        title={profile?.venue?.name ?? "Panel"}
        description={format(today, "yyyy-MM-dd")}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Yangi bandlik
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              label="Bu oyda band kunlar"
              value={summary?.booked_days ?? 0}
              icon={CalendarDays}
              accent="primary"
            />
            <StatCard label="Jami mehmonlar" value={summary?.total_guests ?? 0} icon={Users} accent="secondary" />
            {canManage && (
              <StatCard
                label="Bu oygi tushum"
                value={`${formatCurrency(summary?.revenue ?? 0)} so'm`}
                icon={Wallet}
                accent="success"
              />
            )}
            {canManage && (
              <StatCard
                label="Umumiy qarzdorlik"
                value={`${formatCurrency(summary?.total_debt ?? 0)} so'm`}
                icon={AlertTriangle}
                accent="destructive"
              />
            )}
          </>
        )}
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yaqinlashayotgan tadbirlar (7 kun)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            ) : upcoming && upcoming.length > 0 ? (
              <div className="animate-slide-up divide-y divide-border">
                {upcoming.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/bookings/${event.id}`)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left first:pt-0 last:pb-0 hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("size-2 shrink-0 rounded-full", STATUS_DOT_CLASS[event.status])} />
                      <div>
                        <p className="text-sm font-medium">{event.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatUzDate(event.event_date, { withYear: false })} · {event.halls?.name ?? "Zal"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm tabular-nums text-muted-foreground">{event.guest_count} kishi</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Keyingi 7 kun ichida tadbir rejalashtirilmagan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {canManage && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Oylik tushum</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading || !mounted ? (
                <Skeleton className="h-56 w-full rounded-xl" />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        tickFormatter={(v: number) => (v >= 1_000_000 ? `${Math.round(v / 1_000_000)}M` : `${v}`)}
                      />
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
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#revenueFill)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={canManage ? undefined : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle className="text-base">Zallar bandligi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {occupancyLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : occupancy && occupancy.length > 0 ? (
              occupancy.map((hall) => {
                const percent = hall.total_days > 0 ? Math.round((hall.booked_days / hall.total_days) * 100) : 0;
                return (
                  <div key={hall.hall_id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{hall.hall_name}</span>
                      <span className="tabular-nums text-muted-foreground">{percent}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>
                );
              })
            ) : (
              <EmptyState icon={CalendarDays} title="Zal yo'q" description="Avval zallarni qo'shing." />
            )}
          </CardContent>
        </Card>
      </div>

      <NewBookingDialog open={createOpen} onOpenChange={setCreateOpen} venueId={venueId} />
    </div>
  );
}
