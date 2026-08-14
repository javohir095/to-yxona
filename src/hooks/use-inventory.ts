import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/entities";

const KEY = "inventory";

export function useInventory(venueId: string | undefined) {
  return useQuery({
    queryKey: [KEY, venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("venue_id", venueId!)
        .order("ingredient_name");
      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!venueId,
  });
}

export function useCreateInventoryItem(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { ingredient_name: string; unit: string; quantity_in_stock: number }) => {
      const { error } = await supabase.from("inventory_items").insert({ ...values, venue_id: venueId! });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [KEY, venueId] });
    },
  });
}

export function useUpdateInventoryItem(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: { id: string; quantity_in_stock?: number; unit?: string; ingredient_name?: string }) => {
      const { error } = await supabase.from("inventory_items").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [KEY, venueId] });
    },
  });
}

export function useDeleteInventoryItem(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [KEY, venueId] });
    },
  });
}
