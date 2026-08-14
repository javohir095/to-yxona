import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type RequisitionLine = { ingredient_name: string; unit: string; quantity: number };

export type UpcomingRequisition = {
  booking: {
    id: string;
    customer_name: string;
    event_date: string;
    guest_count: number;
    halls: { name: string } | null;
  };
  lines: RequisitionLine[];
};

export function useUpcomingRequisitions(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["upcoming-requisitions", venueId, start, end],
    queryFn: async (): Promise<UpcomingRequisition[]> => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, customer_name, event_date, guest_count, halls(name)")
        .eq("venue_id", venueId!)
        .gte("event_date", start)
        .lte("event_date", end)
        .not("menu_package_id", "is", null)
        .neq("status", "cancelled")
        .order("event_date");
      if (error) throw error;

      const rows = (bookings ?? []) as unknown as UpcomingRequisition["booking"][];

      return Promise.all(
        rows.map(async (booking) => {
          const { data: lines, error: reqError } = await supabase.rpc("calculate_booking_requisition", {
            p_booking_id: booking.id,
          });
          if (reqError) throw reqError;
          return { booking, lines: (lines ?? []) as RequisitionLine[] };
        }),
      );
    },
    enabled: !!venueId,
  });
}

export function useBookingRequisition(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["booking-requisition", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calculate_booking_requisition", {
        p_booking_id: bookingId!,
      });
      if (error) throw error;
      return data as RequisitionLine[];
    },
    enabled: !!bookingId,
  });
}

export function useAggregateRequisition(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["aggregate-requisition", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("calculate_aggregate_requisition", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data as RequisitionLine[];
    },
    enabled: !!venueId,
  });
}
