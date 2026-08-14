import { useState } from "react";
import { MoreVertical, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import {
  useDeleteMenuItem,
  useDeleteMenuPackage,
  useMenuPackages,
  type MenuItemWithIngredients,
} from "@/hooks/use-menu-packages";
import type { MenuPackage } from "@/entities";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MenuPackageFormDialog } from "./menu-package-form-dialog";
import { MenuItemFormDialog } from "./menu-item-form-dialog";

export function MenusPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const canManage = profile?.role === "owner" || profile?.role === "manager";

  const { data: packages, isLoading } = useMenuPackages(venueId);
  const deletePackage = useDeleteMenuPackage(venueId);
  const deleteItem = useDeleteMenuItem(venueId);

  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MenuPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<MenuPackage | null>(null);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemWithIngredients | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItemWithIngredients | null>(null);

  function openCreatePackage() {
    setEditingPackage(null);
    setPackageFormOpen(true);
  }

  function openEditPackage(pkg: MenuPackage) {
    setEditingPackage(pkg);
    setPackageFormOpen(true);
  }

  function openCreateItem(packageId: string) {
    setActivePackageId(packageId);
    setEditingItem(null);
    setItemFormOpen(true);
  }

  function openEditItem(packageId: string, item: MenuItemWithIngredients) {
    setActivePackageId(packageId);
    setEditingItem(item);
    setItemFormOpen(true);
  }

  async function confirmDeletePackage() {
    if (!deletingPackage) return;
    try {
      await deletePackage.mutateAsync(deletingPackage.id);
      toast.success("Paket o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik", { description: (error as Error).message });
    } finally {
      setDeletingPackage(null);
    }
  }

  async function confirmDeleteItem() {
    if (!deletingItem) return;
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      toast.success("Taom o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik", { description: (error as Error).message });
    } finally {
      setDeletingItem(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Menyular"
        description="Menyu paketlari, taomlar va ularning ingredientlarini shu yerda boshqarasiz"
        action={
          canManage && (
            <Button onClick={openCreatePackage}>
              <Plus /> Yangi paket
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : packages && packages.length > 0 ? (
        <div className="animate-slide-up space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {pkg.description && <CardDescription className="mt-1">{pkg.description}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold tabular-nums whitespace-nowrap">
                      {formatCurrency(pkg.price_per_guest)} <span className="text-sm font-normal text-muted-foreground">so'm/kishi</span>
                    </p>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEditPackage(pkg)}>
                            <Pencil /> Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeletingPackage(pkg)}>
                            <Trash2 /> O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pkg.menu_items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Hali taom qo'shilmagan.</p>
                ) : (
                  <div className="space-y-2">
                    {pkg.menu_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="mr-1 text-sm font-medium">{item.name}</span>
                          {item.menu_item_ingredients.map((ing) => (
                            <Badge key={ing.id} variant="outline" className="font-normal text-muted-foreground">
                              {ing.ingredient_name} {ing.quantity_per_serving}
                              {ing.unit}
                            </Badge>
                          ))}
                        </div>
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => openEditItem(pkg.id, item)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {canManage && (
                  <Button variant="outline" size="sm" onClick={() => openCreateItem(pkg.id)}>
                    <Plus /> Taom qo'shish
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title="Hali menyu paketi qo'shilmagan"
          description="Bandliklarda tanlash uchun avval menyu paketlarini yarating."
          action={
            canManage && (
              <Button onClick={openCreatePackage}>
                <Plus /> Yangi paket
              </Button>
            )
          }
        />
      )}

      <MenuPackageFormDialog
        open={packageFormOpen}
        onOpenChange={setPackageFormOpen}
        menuPackage={editingPackage}
        venueId={venueId}
      />

      {activePackageId && (
        <MenuItemFormDialog
          open={itemFormOpen}
          onOpenChange={setItemFormOpen}
          packageId={activePackageId}
          item={editingItem}
          venueId={venueId}
        />
      )}

      <AlertDialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paketni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingPackage?.name}" paketini o'chirmoqchimisiz? Undagi barcha taomlar ham o'chadi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePackage} className="bg-destructive text-destructive-foreground hover:brightness-105">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Taomni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>"{deletingItem?.name}" taomini o'chirmoqchimisiz?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive text-destructive-foreground hover:brightness-105">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
