import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { STATUS_DOT_CLASS } from "@/lib/booking-status";
import { UZ_WEEKDAYS } from "@/lib/uz-date";
import type { BookingWithHall } from "@/hooks/use-bookings";
import { Skeleton } from "@/components/ui/skeleton";

export function CalendarGrid({
  days,
  monthAnchor,
  bookingsByDay,
  onDayClick,
  onBookingClick,
  isLoading,
  compact = false,
}: {
  days: Date[];
  monthAnchor: Date;
  bookingsByDay: Map<string, BookingWithHall[]>;
  onDayClick: (date: Date) => void;
  onBookingClick: (booking: BookingWithHall) => void;
  isLoading: boolean;
  compact?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-[560px] w-full rounded-2xl" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {UZ_WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayBookings = bookingsByDay.get(key) ?? [];
          const inMonth = compact || isSameMonth(day, monthAnchor);
          const today = isToday(day);

          return (
            <div
              key={key}
              onClick={() => onDayClick(day)}
              className={cn(
                "flex cursor-pointer flex-col gap-1 border-b border-r border-border p-1.5 transition-colors hover:bg-muted/40",
                compact ? "min-h-40" : "min-h-28",
                !inMonth && "bg-muted/20",
              )}
            >
              <div className="flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    today
                      ? "bg-primary text-primary-foreground"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60",
                  )}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {dayBookings.map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onBookingClick(booking);
                    }}
                    className={cn(
                      "block w-full rounded-lg border border-border bg-card px-2 py-1 text-left shadow-sm transition-all hover:shadow-md",
                      booking.status === "cancelled" && "opacity-50",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[booking.status])} />
                      <span className="truncate text-[11px] font-medium">{booking.customer_name}</span>
                    </div>
                    <p className="truncate pl-3 text-[10px] text-muted-foreground">
                      {booking.halls?.name ?? "Zal"} · {booking.guest_count} kishi
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
