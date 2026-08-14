import { useState } from "react";
import { DoorOpen, MoreVertical, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useDeleteHall, useHalls } from "@/hooks/use-halls";
import type { Hall } from "@/entities";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { HallFormDialog } from "./hall-form-dialog";

export function HallsPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const canManage = profile?.role === "owner" || profile?.role === "manager";

  const { data: halls, isLoading } = useHalls(venueId);
  const deleteHall = useDeleteHall(venueId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [deletingHall, setDeletingHall] = useState<Hall | null>(null);

  function openCreate() {
    setEditingHall(null);
    setFormOpen(true);
  }

  function openEdit(hall: Hall) {
    setEditingHall(hall);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingHall) return;
    try {
      await deleteHall.mutateAsync(deletingHall.id);
      toast.success("Zal o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik", { description: (error as Error).message });
    } finally {
      setDeletingHall(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Zallar"
        description="To'yxona zallari va ularning sig'imini shu yerda boshqarasiz"
        action={
          canManage && (
            <Button onClick={openCreate}>
              <Plus /> Yangi zal
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : halls && halls.length > 0 ? (
        <div className="grid animate-slide-up gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {halls.map((hall) => (
            <Card key={hall.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <DoorOpen className="size-5" />
                  </div>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(hall)}>
                          <Pencil /> Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeletingHall(hall)}>
                          <Trash2 /> O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{hall.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span className="tabular-nums">{hall.capacity}</span> mehmongacha
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={DoorOpen}
          title="Hali zal qo'shilmagan"
          description="Bandliklarni yaratish uchun avval to'yxonangizdagi zallarni qo'shing."
          action={
            canManage && (
              <Button onClick={openCreate}>
                <Plus /> Yangi zal
              </Button>
            )
          }
        />
      )}

      <HallFormDialog open={formOpen} onOpenChange={setFormOpen} hall={editingHall} venueId={venueId} />

      <AlertDialog open={!!deletingHall} onOpenChange={(open) => !open && setDeletingHall(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zalni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingHall?.name}" zalini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
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
