import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { callEdgeFunction } from "@/lib/edge-functions";
import type { UserRole } from "@/entities";

export type StaffMember = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  email: string | null;
};

function callManageStaff<T>(payload: Record<string, unknown>): Promise<T> {
  return callEdgeFunction<T>("manage-staff", payload);
}

const STAFF_KEY = ["staff"];

export function useStaffList() {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: () => callManageStaff<{ profiles: StaffMember[] }>({ action: "list" }).then((r) => r.profiles),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; full_name: string; role: UserRole }) =>
      callManageStaff<{ id: string }>({ action: "create", ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => callManageStaff<{ success: boolean }>({ action: "delete", user_id: userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: (input: { userId: string; password: string }) =>
      callManageStaff<{ success: boolean }>({
        action: "reset_password",
        user_id: input.userId,
        password: input.password,
      }),
  });
}
