import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { ClipboardList, Printer } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useAggregateRequisition, useUpcomingRequisitions } from "@/hooks/use-requisitions";
import { useInventory } from "@/hooks/use-inventory";
import { formatUzDate } from "@/lib/uz-date";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function RequisitionsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;

  const [rangeStart, setRangeStart] = useState(todayStr());
  const [rangeEnd, setRangeEnd] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));

  const upcomingEnd = format(addDays(new Date(), 14), "yyyy-MM-dd");
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingRequisitions(venueId, todayStr(), upcomingEnd);
  const { data: aggregate, isLoading: aggregateLoading } = useAggregateRequisition(venueId, rangeStart, rangeEnd);
  const { data: inventory } = useInventory(venueId);

  const stockMap = useMemo(() => {
    const map = new Map<string, { quantity: number; unit: string }>();
    for (const item of inventory ?? []) {
      map.set(item.ingredient_name.trim().toLowerCase(), { quantity: item.quantity_in_stock, unit: item.unit });
    }
    return map;
  }, [inventory]);

  return (
    <div>
      <PageHeader
        title="Talabnoma"
        description="Tadbirlar bo'yicha va jamlangan oshxona talabnomalari"
        action={
          <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
            <Printer /> Chop etish
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList className="print:hidden">
          <TabsTrigger value="upcoming">Tadbir bo'yicha</TabsTrigger>
          <TabsTrigger value="aggregate">Jamlangan</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">Keyingi 14 kun ichidagi tadbirlar bo'yicha talabnoma</p>
          {upcomingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          ) : upcoming && upcoming.length > 0 ? (
            <div className="animate-slide-up space-y-4">
              {upcoming.map(({ booking, lines }) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">{booking.customer_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatUzDate(booking.event_date)} · {booking.halls?.name ?? "Zal"} · {booking.guest_count} kishi
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lines.length > 0 ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                        {lines.map((line) => (
                          <div key={line.ingredient_name} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{line.ingredient_name}</span>
                            <span className="tabular-nums font-medium">
                              {line.quantity} {line.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Ma'lumot yo'q.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Yaqinlashayotgan tadbir yo'q"
              description="Keyingi 14 kun ichida menyu tanlangan bandlik topilmadi."
            />
          )}
        </TabsContent>

        <TabsContent value="aggregate" className="mt-4">
          <div className="mb-4 flex flex-wrap items-end gap-3 print:hidden">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Boshlanish sanasi</Label>
              <Input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Tugash sanasi</Label>
              <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {formatUzDate(rangeStart)} — {formatUzDate(rangeEnd)} uchun jami kerakli mahsulotlar
          </p>

          {aggregateLoading ? (
            <Skeleton className="h-64 rounded-2xl" />
          ) : aggregate && aggregate.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead>Kerak</TableHead>
                    <TableHead>Omborda</TableHead>
                    <TableHead>Holat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregate.map((line) => {
                    const stock = stockMap.get(line.ingredient_name.trim().toLowerCase());
                    const tracked = !!stock;
                    const sufficient = tracked && stock.unit === line.unit && stock.quantity >= line.quantity;

                    return (
                      <TableRow key={line.ingredient_name}>
                        <TableCell className="font-medium">{line.ingredient_name}</TableCell>
                        <TableCell className="tabular-nums">
                          {line.quantity} {line.unit}
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {tracked ? `${stock.quantity} ${stock.unit}` : "—"}
                        </TableCell>
                        <TableCell>
                          {!tracked ? (
                            <Badge variant="outline">Kuzatilmayapti</Badge>
                          ) : sufficient ? (
                            <Badge variant="success">Yetarli</Badge>
                          ) : (
                            <Badge variant="destructive">Yetishmaydi</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Bu davrda tadbir topilmadi"
              description="Tanlangan sanalar oralig'ida menyu tanlangan bandlik mavjud emas."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
