import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BookingStatus } from "@/entities";

export type Debtor = {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  event_date: string;
  hall_id: string;
  hall_name: string;
  total_amount: number;
  paid_total: number;
  remaining_amount: number;
  status: BookingStatus;
};

export function useDebtors(
  venueId: string | undefined,
  filters: { search?: string; hallId?: string; start?: string; end?: string },
) {
  return useQuery({
    queryKey: ["debtors", venueId, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_debtors", {
        p_venue_id: venueId!,
        p_search: filters.search || undefined,
        p_hall_id: filters.hallId || undefined,
        p_start: filters.start || undefined,
        p_end: filters.end || undefined,
      });
      if (error) throw error;
      return data as Debtor[];
    },
    enabled: !!venueId,
  });
}
