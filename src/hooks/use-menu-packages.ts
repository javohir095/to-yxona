import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MenuItem, MenuItemIngredient, MenuPackage, MenuPackageUpdate } from "@/entities";

export type MenuItemWithIngredients = MenuItem & { menu_item_ingredients: MenuItemIngredient[] };
export type MenuPackageWithItems = MenuPackage & { menu_items: MenuItemWithIngredients[] };

const PACKAGES_KEY = "menu-packages";

export function useMenuPackages(venueId: string | undefined) {
  return useQuery({
    queryKey: [PACKAGES_KEY, venueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_packages")
        .select("*, menu_items(*, menu_item_ingredients(*))")
        .eq("venue_id", venueId!)
        .order("price_per_guest");
      if (error) throw error;
      return data as unknown as MenuPackageWithItems[];
    },
    enabled: !!venueId,
  });
}

export function useCreateMenuPackage(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; description: string | null; price_per_guest: number }) => {
      const { error } = await supabase.from("menu_packages").insert({ ...values, venue_id: venueId! });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY, venueId] });
    },
  });
}

export function useUpdateMenuPackage(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: MenuPackageUpdate & { id: string }) => {
      const { error } = await supabase.from("menu_packages").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY, venueId] });
    },
  });
}

export function useDeleteMenuPackage(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY, venueId] });
    },
  });
}

export type IngredientInput = { ingredient_name: string; quantity_per_serving: number; unit: string };

export function useSaveMenuItem(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      packageId: string;
      name: string;
      ingredients: IngredientInput[];
    }) => {
      let itemId = input.id;

      if (itemId) {
        const { error } = await supabase.from("menu_items").update({ name: input.name }).eq("id", itemId);
        if (error) throw error;
        const { error: deleteError } = await supabase
          .from("menu_item_ingredients")
          .delete()
          .eq("menu_item_id", itemId);
        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase
          .from("menu_items")
          .insert({ name: input.name, package_id: input.packageId, venue_id: venueId! })
          .select("id")
          .single();
        if (error) throw error;
        itemId = data.id;
      }

      if (input.ingredients.length > 0) {
        const { error } = await supabase.from("menu_item_ingredients").insert(
          input.ingredients.map((ing) => ({ ...ing, menu_item_id: itemId!, venue_id: venueId! })),
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY, venueId] });
    },
  });
}

export function useDeleteMenuItem(venueId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [PACKAGES_KEY, venueId] });
    },
  });
}
