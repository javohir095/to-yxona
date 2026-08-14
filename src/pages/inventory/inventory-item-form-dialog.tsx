import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateInventoryItem } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const itemSchema = z.object({
  ingredient_name: z.string().min(1, "Nomini kiriting"),
  unit: z.string().min(1, "Birlikni kiriting"),
  quantity_in_stock: z.coerce.number().min(0, "Manfiy bo'lmasin"),
});
type ItemValues = z.infer<typeof itemSchema>;

export function InventoryItemFormDialog({
  open,
  onOpenChange,
  venueId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string | undefined;
}) {
  const createItem = useCreateInventoryItem(venueId);
  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { ingredient_name: "", unit: "kg", quantity_in_stock: 0 },
  });

  useEffect(() => {
    if (open) form.reset({ ingredient_name: "", unit: "kg", quantity_in_stock: 0 });
  }, [open, form]);

  async function onSubmit(values: ItemValues) {
    try {
      await createItem.mutateAsync(values);
      toast.success("Mahsulot qo'shildi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Omborga mahsulot qo'shish</DialogTitle>
          <DialogDescription>Xom-ashyo nomi, birligi va joriy qoldig'ini kiriting.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ingredient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mahsulot nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Guruch" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quantity_in_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qoldiq</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birlik</FormLabel>
                    <FormControl>
                      <Input placeholder="kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createItem.isPending}>
                {createItem.isPending && <Loader2 className="animate-spin" />}
                Qo'shish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
