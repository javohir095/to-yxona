import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PaymentType } from "@/entities";

export type VenuePayment = {
  id: string;
  amount: number;
  payment_type: PaymentType;
  paid_at: string;
  booking: {
    id: string;
    customer_name: string;
    event_date: string;
    halls: { name: string } | null;
  } | null;
};

export function useVenuePayments(
  venueId: string | undefined,
  filters: { start?: string; end?: string; type?: PaymentType },
) {
  return useQuery({
    queryKey: ["venue-payments", venueId, filters],
    queryFn: async () => {
      let query = supabase
        .from("payments")
        .select("id, amount, payment_type, paid_at, booking:bookings(id, customer_name, event_date, halls(name))")
        .eq("venue_id", venueId!)
        .order("paid_at", { ascending: false });

      if (filters.start) query = query.gte("paid_at", filters.start);
      if (filters.end) query = query.lte("paid_at", `${filters.end}T23:59:59`);
      if (filters.type) query = query.eq("payment_type", filters.type);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VenuePayment[];
    },
    enabled: !!venueId,
  });
}
