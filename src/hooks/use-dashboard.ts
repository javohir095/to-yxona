import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BookingStatus } from "@/entities";

export type DashboardSummary = {
  booked_days: number;
  total_guests: number;
  revenue: number;
  total_debt: number;
};

export function useDashboardSummary(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["dashboard-summary", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_summary", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data[0] as DashboardSummary;
    },
    enabled: !!venueId,
  });
}

export type MonthlyRevenuePoint = { month_start: string; revenue: number };

export function useMonthlyRevenue(venueId: string | undefined, months = 6) {
  return useQuery({
    queryKey: ["monthly-revenue", venueId, months],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_monthly_revenue", {
        p_venue_id: venueId!,
        p_months: months,
      });
      if (error) throw error;
      return data as MonthlyRevenuePoint[];
    },
    enabled: !!venueId,
  });
}

export type HallOccupancy = { hall_id: string; hall_name: string; booked_days: number; total_days: number };

export function useHallOccupancy(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["hall-occupancy", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hall_occupancy", {
        p_venue_id: venueId!,
        p_start: start,
        p_end: end,
      });
      if (error) throw error;
      return data as HallOccupancy[];
    },
    enabled: !!venueId,
  });
}

export type UpcomingEvent = {
  id: string;
  customer_name: string;
  event_date: string;
  guest_count: number;
  status: BookingStatus;
  halls: { name: string } | null;
};

export function useUpcomingEvents(venueId: string | undefined, start: string, end: string) {
  return useQuery({
    queryKey: ["upcoming-events", venueId, start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, customer_name, event_date, guest_count, status, halls(name)")
        .eq("venue_id", venueId!)
        .gte("event_date", start)
        .lte("event_date", end)
        .neq("status", "cancelled")
        .order("event_date")
        .order("start_time");
      if (error) throw error;
      return data as unknown as UpcomingEvent[];
    },
    enabled: !!venueId,
  });
}
