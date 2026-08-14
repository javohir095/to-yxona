import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { EventType } from "@/entities";

export type ReportSummary = {
  total_revenue: number;
  total_bookings: number;
  avg_ticket: number;
  occupied_days: number;
  total_hall_days: number;
};

export function useReportSummary(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["report-summary", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_report_summary", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data[0] as ReportSummary;
    },
    enabled: !!venueId,
  });
}

export type HallRevenue = { hall_id: string; hall_name: string; bookings_count: number; revenue: number };

export function useHallRevenue(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["hall-revenue", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hall_revenue", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data as HallRevenue[];
    },
    enabled: !!venueId,
  });
}

export type EventTypeBreakdown = { event_type: EventType; bookings_count: number; revenue: number };

export function useEventTypeBreakdown(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["event-type-breakdown", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_event_type_breakdown", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data as EventTypeBreakdown[];
    },
    enabled: !!venueId,
  });
}
