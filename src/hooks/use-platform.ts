import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callEdgeFunction } from "@/lib/edge-functions";

export type PlatformVenue = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  owner_name: string | null;
  owner_email: string | null;
  staff_count: number;
};

function callManagePlatform<T>(payload: Record<string, unknown>): Promise<T> {
  return callEdgeFunction<T>("manage-platform", payload);
}

const VENUES_KEY = ["platform-venues"];

export function useVenuesList() {
  return useQuery({
    queryKey: VENUES_KEY,
    queryFn: () => callManagePlatform<{ venues: PlatformVenue[] }>({ action: "list_venues" }).then((r) => r.venues),
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      venue_name: string;
      owner_full_name: string;
      owner_email: string;
      owner_password: string;
    }) => callManagePlatform<{ venue_id: string; owner_id: string }>({ action: "create_venue", ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VENUES_KEY });
    },
  });
}
