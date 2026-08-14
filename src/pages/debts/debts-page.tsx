import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Search } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useHalls } from "@/hooks/use-halls";
import { useDebtors } from "@/hooks/use-debts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/format";
import { formatUzDate } from "@/lib/uz-date";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DebtsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [hallId, setHallId] = useState<string>("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const { data: halls } = useHalls(venueId);
  const { data: debtors, isLoading } = useDebtors(venueId, {
    search: debouncedSearch,
    hallId: hallId === "all" ? undefined : hallId,
    start: start || undefined,
    end: end || undefined,
  });

  const totalDebt = (debtors ?? []).reduce((sum, d) => sum + d.remaining_amount, 0);

  return (
    <div>
      <PageHeader
        title="Qarzlar"
        description={
          debtors && debtors.length > 0
            ? `${debtors.length} ta to'liq to'lanmagan bandlik · jami ${formatCurrency(totalDebt)} so'm qarz`
            : "To'liq to'lanmagan tadbirlar ro'yxati"
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Label className="mb-1.5 block text-xs text-muted-foreground">Qidirish</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mijoz ismi yoki telefon"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Zal</Label>
          <Select value={hallId} onValueChange={setHallId}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha zallar</SelectItem>
              {halls?.map((hall) => (
                <SelectItem key={hall.id} value={hall.id}>
                  {hall.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sanadan</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sanagacha</Label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : debtors && debtors.length > 0 ? (
        <div className="animate-slide-up space-y-2">
          {debtors.map((debtor) => {
            const ratio = debtor.total_amount > 0 ? debtor.remaining_amount / debtor.total_amount : 1;
            const severe = ratio >= 0.7;

            return (
              <button
                key={debtor.booking_id}
                onClick={() => navigate(`/bookings/${debtor.booking_id}`)}
                className={cn(
                  "flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 bg-card px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-md",
                  severe ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning/5",
                )}
              >
                <div>
                  <p className="font-medium">{debtor.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {debtor.customer_phone} · {debtor.hall_name} · {formatUzDate(debtor.event_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn("text-lg font-bold tabular-nums", severe ? "text-destructive" : "text-warning")}>
                    {formatCurrency(debtor.remaining_amount)} so'm
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(debtor.paid_total)} / {formatCurrency(debtor.total_amount)} to'langan
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={AlertTriangle} title="Qarzdorlik yo'q" description="Hozircha to'liq to'lanmagan bandliklar mavjud emas." />
      )}
    </div>
  );
}
