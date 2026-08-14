import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useVenuePayments } from "@/hooks/use-payments-list";
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/entities";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAYMENT_TYPE_BADGE: Record<PaymentType, "success" | "secondary" | "outline"> = {
  cash: "success",
  card: "secondary",
  transfer: "outline",
};

export function PaymentsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const navigate = useNavigate();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState<string>("all");

  const { data: payments, isLoading } = useVenuePayments(venueId, {
    start: start || undefined,
    end: end || undefined,
    type: type === "all" ? undefined : (type as PaymentType),
  });

  const total = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="To'lovlar"
        description={
          payments && payments.length > 0
            ? `${payments.length} ta to'lov · jami ${formatCurrency(total)} so'm`
            : "Barcha tadbirlar bo'yicha to'lovlar tarixi"
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sanadan</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sanagacha</Label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">To'lov turi</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              {(Object.keys(PAYMENT_TYPE_LABELS) as PaymentType[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PAYMENT_TYPE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : payments && payments.length > 0 ? (
        <div className="animate-slide-up overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Zal</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Summa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="cursor-pointer"
                  onClick={() => payment.booking && navigate(`/bookings/${payment.booking.id}`)}
                >
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.paid_at).toLocaleDateString("uz-UZ")}
                  </TableCell>
                  <TableCell className="font-medium">{payment.booking?.customer_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.booking?.halls?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={PAYMENT_TYPE_BADGE[payment.payment_type]}>
                      {PAYMENT_TYPE_LABELS[payment.payment_type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold tabular-nums">{formatCurrency(payment.amount)} so'm</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Wallet} title="To'lovlar topilmadi" description="Tanlangan filtrlar bo'yicha to'lovlar mavjud emas." />
      )}
    </div>
  );
}
