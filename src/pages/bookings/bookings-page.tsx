import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useHalls } from "@/hooks/use-halls";
import { useBookingsInRange, useBookingsRealtime, type BookingWithHall } from "@/hooks/use-bookings";
import { UZ_MONTHS } from "@/lib/uz-date";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "./calendar-grid";
import { NewBookingDialog } from "./new-booking-dialog";

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function BookingsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const navigate = useNavigate();

  const [view, setView] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [hallId, setHallId] = useState<string | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>(undefined);

  const { data: halls } = useHalls(venueId);

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [view, anchor]);

  const rangeStart = toKey(days[0]);
  const rangeEnd = toKey(days[days.length - 1]);

  const { data: bookings, isLoading } = useBookingsInRange(venueId, rangeStart, rangeEnd, hallId);
  useBookingsRealtime(venueId);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, BookingWithHall[]>();
    for (const booking of bookings ?? []) {
      const list = map.get(booking.event_date) ?? [];
      list.push(booking);
      map.set(booking.event_date, list);
    }
    return map;
  }, [bookings]);

  function goPrev() {
    setAnchor((current) => (view === "month" ? subMonths(current, 1) : subWeeks(current, 1)));
  }

  function goNext() {
    setAnchor((current) => (view === "month" ? addMonths(current, 1) : addWeeks(current, 1)));
  }

  function openCreateFor(date?: Date) {
    setCreateDate(date ? toKey(date) : undefined);
    setCreateOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Bandliklar"
        description="Bandlik kalendari — sanaga bosib yangi bandlik yarating yoki mavjudini ko'ring"
        action={
          <Button onClick={() => openCreateFor()}>
            <Plus /> Yangi bandlik
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <p className="w-40 text-center text-sm font-semibold">
            {UZ_MONTHS[anchor.getMonth()]} {anchor.getFullYear()}
          </p>
          <Button variant="outline" size="icon" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>
            Bugun
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {halls && halls.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant={!hallId ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setHallId(undefined)}
              >
                Barchasi
              </Button>
              {halls.map((hall) => (
                <Button
                  key={hall.id}
                  variant={hallId === hall.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setHallId(hall.id)}
                >
                  {hall.name}
                </Button>
              ))}
            </div>
          )}

          <Tabs value={view} onValueChange={(value) => setView(value as "month" | "week")}>
            <TabsList>
              <TabsTrigger value="month">Oy</TabsTrigger>
              <TabsTrigger value="week">Hafta</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <CalendarGrid
        days={days}
        monthAnchor={anchor}
        bookingsByDay={bookingsByDay}
        onDayClick={openCreateFor}
        onBookingClick={(booking) => navigate(`/bookings/${booking.id}`)}
        isLoading={isLoading}
        compact={view === "week"}
      />

      <NewBookingDialog open={createOpen} onOpenChange={setCreateOpen} venueId={venueId} defaultDate={createDate} />
    </div>
  );
}
