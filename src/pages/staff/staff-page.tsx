import { useState } from "react";
import { KeyRound, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useDeleteStaff, useStaffList, useUpdateStaffRole, type StaffMember } from "@/hooks/use-staff";
import { USER_ROLE_LABELS, VENUE_ROLES, type UserRole } from "@/entities";
import { emailToLogin } from "@/lib/login-id";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateStaffDialog } from "./create-staff-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";

function initials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]!.toUpperCase()).join("") || "?";
}

export function StaffPage() {
  const { profile } = useAuth();
  const { data: staff, isLoading } = useStaffList();
  const updateRole = useUpdateStaffRole();
  const deleteStaff = useDeleteStaff();

  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  async function handleRoleChange(member: StaffMember, role: UserRole) {
    try {
      await updateRole.mutateAsync({ id: member.id, role });
      toast.success("Rol yangilandi");
    } catch (error) {
      toast.error("Xatolik", { description: (error as Error).message });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteStaff.mutateAsync(deleteTarget.id);
      toast.success("Xodim o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik", { description: (error as Error).message });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Xodimlar"
        description="To'yxona xodimlariga login va parol shu yerda yaratasiz"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Yangi xodim
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : staff && staff.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Xodim</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">{initials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.full_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{emailToLogin(member.email)}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(member, value as UserRole)}
                      disabled={member.id === profile?.id}
                    >
                      <SelectTrigger size="sm" className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VENUE_ROLES.map((key) => (
                          <SelectItem key={key} value={key}>
                            {USER_ROLE_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Parolni tiklash"
                        onClick={() => setResetTarget(member)}
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        title="O'chirish"
                        disabled={member.id === profile?.id}
                        onClick={() => setDeleteTarget(member)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Hali xodim qo'shilmagan"
          description="Xodimlaringizga login va parol yaratib bering."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Yangi xodim
            </Button>
          }
        />
      )}

      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ResetPasswordDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)} staff={resetTarget} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xodimni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.full_name}" hisobini o'chirmoqchimisiz? Bu xodim endi tizimga kira olmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:brightness-105">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
