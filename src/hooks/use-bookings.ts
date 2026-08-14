import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingPaymentSummary, BookingStatus, Payment } from "@/entities";

export type BookingWithHall = Booking & { halls: { name: string } | null };
export type BookingWithRelations = Booking & {
  halls: { name: string; capacity: number } | null;
  menu_packages: { name: string; price_per_guest: number } | null;
};

export function useBookingsInRange(
  venueId: string | undefined,
  start: string,
  end: string,
  hallId?: string,
) {
  return useQuery({
    queryKey: ["bookings", "range", venueId, start, end, hallId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select("*, halls(name)")
        .eq("venue_id", venueId!)
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date")
        .order("start_time");
      if (hallId) query = query.eq("hall_id", hallId);
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as BookingWithHall[];
    },
    enabled: !!venueId,
  });
}

export function useBookingsRealtime(venueId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!venueId) return;

    const channel = supabase
      .channel(`bookings-realtime-${venueId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `venue_id=eq.${venueId}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["bookings"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [venueId, queryClient]);
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["bookings", "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, halls(name, capacity), menu_packages(name, price_per_guest)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as BookingWithRelations;
    },
    enabled: !!id,
  });
}

export type CreateBookingInput = {
  customer_name: string;
  customer_phone: string;
  event_type: Booking["event_type"];
  event_date: string;
  start_time: string;
  end_time: string | null;
  hall_id: string;
  menu_package_id: string | null;
  guest_count: number;
  total_amount: number;
  notes: string | null;
  deposit_amount: number;
};

export function useCreateBooking(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const { deposit_amount, ...bookingFields } = input;
      const status: BookingStatus = deposit_amount > 0 ? "deposit_paid" : "booked";

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({ ...bookingFields, venue_id: venueId!, status })
        .select("id")
        .single();
      if (error) throw error;

      if (deposit_amount > 0) {
        const { error: paymentError } = await supabase.from("payments").insert({
          venue_id: venueId!,
          booking_id: booking.id,
          amount: deposit_amount,
          payment_type: "cash",
        });
        if (paymentError) throw paymentError;
      }

      return booking.id as string;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Booking> & { id: string }) => {
      const { error } = await supabase.from("bookings").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings", "detail", variables.id] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function usePayments(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["payments", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId!)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!bookingId,
  });
}

export function useBookingPaymentSummary(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["booking-payment-summary", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_payment_summary")
        .select("*")
        .eq("booking_id", bookingId!)
        .single();
      if (error) throw error;
      return data as BookingPaymentSummary;
    },
    enabled: !!bookingId,
  });
}

export function useAddPayment(venueId: string | undefined, bookingId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { amount: number; payment_type: Payment["payment_type"] }) => {
      const { error } = await supabase.from("payments").insert({
        ...values,
        venue_id: venueId!,
        booking_id: bookingId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments", bookingId] });
      void queryClient.invalidateQueries({ queryKey: ["booking-payment-summary", bookingId] });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings", "detail", bookingId] });
    },
  });
}
