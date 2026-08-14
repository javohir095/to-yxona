import { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useDeleteInventoryItem, useInventory, useUpdateInventoryItem } from "@/hooks/use-inventory";
import type { InventoryItem } from "@/entities";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItemFormDialog } from "./inventory-item-form-dialog";

function QuantityCell({
  item,
  venueId,
  canManage,
}: {
  item: InventoryItem;
  venueId: string | undefined;
  canManage: boolean;
}) {
  const updateItem = useUpdateInventoryItem(venueId);
  const [value, setValue] = useState(String(item.quantity_in_stock));

  async function commit() {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed === item.quantity_in_stock) {
      setValue(String(item.quantity_in_stock));
      return;
    }
    try {
      await updateItem.mutateAsync({ id: item.id, quantity_in_stock: parsed });
      toast.success("Qoldiq yangilandi");
    } catch (error) {
      toast.error("Xatolik", { description: (error as Error).message });
      setValue(String(item.quantity_in_stock));
    }
  }

  if (!canManage) {
    return <span className="tabular-nums">{item.quantity_in_stock}</span>;
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      className="h-8 w-24 tabular-nums"
    />
  );
}

export function InventoryPage() {
  const { profile } = useAuth();
  const venueId = profile?.venue_id ?? undefined;
  const canManage = profile?.role === "owner" || profile?.role === "manager";

  const { data: items, isLoading } = useInventory(venueId);
  const deleteItem = useDeleteInventoryItem(venueId);
  const [formOpen, setFormOpen] = useState(false);

  async function handleDelete(id: string) {
    try {
      await deleteItem.mutateAsync(id);
      toast.success("Mahsulot o'chirildi");
    } catch (error) {
      toast.error("Xatolik", { description: (error as Error).message });
    }
  }

  return (
    <div>
      <PageHeader
        title="Ombor"
        description="Omborda mavjud xom-ashyo qoldig'ini shu yerda kuzatasiz"
        action={
          canManage && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus /> Mahsulot qo'shish
            </Button>
          )
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : items && items.length > 0 ? (
        <div className="animate-slide-up overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Qoldiq</TableHead>
                <TableHead>Birlik</TableHead>
                {canManage && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                  <TableCell>
                    <QuantityCell item={item} venueId={venueId} canManage={canManage} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Ombor bo'sh"
          description="Talabnoma bilan solishtirish uchun xom-ashyo qoldiqlarini kiriting."
          action={
            canManage && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus /> Mahsulot qo'shish
              </Button>
            )
          }
        />
      )}

      <InventoryItemFormDialog open={formOpen} onOpenChange={setFormOpen} venueId={venueId} />
    </div>
  );
}
