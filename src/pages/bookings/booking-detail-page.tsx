import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import {
  useBooking,
  useBookingPaymentSummary,
  usePayments,
  useUpdateBooking,
} from "@/hooks/use-bookings";
import { useBookingRequisition } from "@/hooks/use-requisitions";
import { BOOKING_STATUS_LABELS, EVENT_TYPE_LABELS, PAYMENT_TYPE_LABELS, type BookingStatus } from "@/entities";
import { STATUS_BADGE_VARIANT, STATUS_ORDER } from "@/lib/booking-status";
import { formatCurrency } from "@/lib/format";
import { formatTime, formatUzDate } from "@/lib/uz-date";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditBookingDialog } from "./edit-booking-dialog";
import { AddPaymentDialog } from "./add-payment-dialog";

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const canManage = profile?.role === "owner" || profile?.role === "manager";

  const { data: booking, isLoading } = useBooking(id);
  const { data: summary } = useBookingPaymentSummary(id);
  const { data: payments } = usePayments(id);
  const { data: requisition } = useBookingRequisition(id);
  const updateBooking = useUpdateBooking();

  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  if (isLoading || !booking) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  async function handleStatusChange(status: BookingStatus) {
    try {
      await updateBooking.mutateAsync({ id: booking!.id, status });
      toast.success("Holat yangilandi");
    } catch (error) {
      toast.error("Xatolik", { description: (error as Error).message });
    }
  }

  const paid = summary?.paid_total ?? 0;
  const remaining = summary?.remaining_amount ?? booking.total_amount;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/bookings")}>
        <ArrowLeft /> Bandliklarga qaytish
      </Button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{booking.customer_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {EVENT_TYPE_LABELS[booking.event_type]} · {formatUzDate(booking.event_date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <Select value={booking.status} onValueChange={(value) => handleStatusChange(value as BookingStatus)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((status) => (
                  <SelectItem key={status} value={status}>
                    {BOOKING_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={STATUS_BADGE_VARIANT[booking.status]}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
          )}
          {canManage && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Tahrirlash
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tadbir tafsilotlari</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoField label="Telefon" value={booking.customer_phone} />
              <InfoField label="Zal" value={booking.halls?.name ?? "—"} />
              <InfoField label="Mehmonlar" value={`${booking.guest_count} kishi`} />
              <InfoField
                label="Vaqt"
                value={
                  booking.end_time
                    ? `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
                    : formatTime(booking.start_time)
                }
              />
              <InfoField label="Menyu paketi" value={booking.menu_packages?.name ?? "Tanlanmagan"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kerakli mahsulotlar</CardTitle>
            </CardHeader>
            <CardContent>
              {!booking.menu_package_id ? (
                <p className="text-sm text-muted-foreground">
                  Menyu paketi tanlanmagani uchun hisob-kitob mavjud emas.
                </p>
              ) : requisition && requisition.length > 0 ? (
                <div className="divide-y divide-border">
                  {requisition.map((line) => (
                    <div key={line.ingredient_name} className="flex items-center justify-between py-2 text-sm">
                      <span>{line.ingredient_name}</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Izohlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{booking.notes || "Izoh kiritilmagan."}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">To'lov holati</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Umumiy summa</span>
                <span className="font-semibold tabular-nums">{formatCurrency(booking.total_amount)} so'm</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To'langan</span>
                <span className="font-semibold tabular-nums text-success">{formatCurrency(paid)} so'm</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium">Qolgan qarz</span>
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    remaining > 0 ? "text-destructive" : "text-success",
                  )}
                >
                  {formatCurrency(remaining)} so'm
                </span>
              </div>
              {canManage && (
                <Button className="w-full" onClick={() => setPaymentOpen(true)}>
                  <Plus /> To'lov qo'shish
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">To'lovlar tarixi</CardTitle>
            </CardHeader>
            <CardContent>
              {payments && payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium tabular-nums">{formatCurrency(payment.amount)} so'm</p>
                        <p className="text-xs text-muted-foreground">
                          {PAYMENT_TYPE_LABELS[payment.payment_type]} ·{" "}
                          {new Date(payment.paid_at).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Hali to'lov qilinmagan.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditBookingDialog open={editOpen} onOpenChange={setEditOpen} booking={booking} venueId={venueId} />
      <AddPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        venueId={venueId}
        bookingId={booking.id}
        remaining={remaining}
      />
    </div>
  );
}
