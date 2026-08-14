import type { BookingStatus } from "@/entities";

export const STATUS_DOT_CLASS: Record<BookingStatus, string> = {
  booked: "bg-destructive",
  deposit_paid: "bg-warning",
  fully_paid: "bg-success",
  completed: "bg-success",
  cancelled: "bg-muted-foreground",
};

export const STATUS_BADGE_VARIANT: Record<
  BookingStatus,
  "destructive" | "warning" | "success" | "outline" | "secondary"
> = {
  booked: "destructive",
  deposit_paid: "warning",
  fully_paid: "success",
  completed: "secondary",
  cancelled: "outline",
};

export const STATUS_ORDER: BookingStatus[] = [
  "booked",
  "deposit_paid",
  "fully_paid",
  "completed",
  "cancelled",
];
