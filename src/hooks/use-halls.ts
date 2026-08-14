import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Hall, HallUpdate } from "@/entities";

export function useHalls(venueId: string | undefined) {
  return useQuery({
    queryKey: ["halls", venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("halls")
        .select("*")
        .eq("venue_id", venueId!)
        .order("name");
      if (error) throw error;
      return data as Hall[];
    },
    enabled: !!venueId,
  });
}

export function useCreateHall(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; capacity: number }) => {
      const { error } = await supabase.from("halls").insert({ ...values, venue_id: venueId! });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["halls", venueId] });
    },
  });
}

export function useUpdateHall(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: HallUpdate & { id: string }) => {
      const { error } = await supabase.from("halls").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["halls", venueId] });
    },
  });
}

export function useDeleteHall(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("halls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["halls", venueId] });
    },
  });
}
