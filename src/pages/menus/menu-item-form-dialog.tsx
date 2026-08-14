import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSaveMenuItem } from "@/hooks/use-menu-packages";
import type { MenuItemWithIngredients } from "@/hooks/use-menu-packages";
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

const ingredientSchema = z.object({
  ingredient_name: z.string().min(1, "Nomi kerak"),
  quantity_per_serving: z.coerce.number().min(0, "Manfiy bo'lmasin"),
  unit: z.string().min(1, "Birlik kerak"),
});

const itemSchema = z.object({
  name: z.string().min(2, "Taom nomini kiriting"),
  ingredients: z.array(ingredientSchema),
});
type ItemValues = z.infer<typeof itemSchema>;

export function MenuItemFormDialog({
  open,
  onOpenChange,
  packageId,
  item,
  venueId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  item: MenuItemWithIngredients | null;
  venueId: string | undefined;
}) {
  const saveItem = useSaveMenuItem(venueId);
  const isEditing = !!item;

  const form = useForm<ItemValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", ingredients: [{ ingredient_name: "", quantity_per_serving: 0, unit: "g" }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "ingredients" });

  useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name ?? "",
        ingredients: item?.menu_item_ingredients.length
          ? item.menu_item_ingredients.map((ing) => ({
              ingredient_name: ing.ingredient_name,
              quantity_per_serving: ing.quantity_per_serving,
              unit: ing.unit,
            }))
          : [{ ingredient_name: "", quantity_per_serving: 0, unit: "g" }],
      });
    }
  }, [open, item, form]);

  async function onSubmit(values: ItemValues) {
    try {
      await saveItem.mutateAsync({
        id: item?.id,
        packageId,
        name: values.name,
        ingredients: values.ingredients.filter((ing) => ing.ingredient_name.trim().length > 0),
      });
      toast.success(isEditing ? "Taom yangilandi" : "Taom qo'shildi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Taomni tahrirlash" : "Yangi taom"}</DialogTitle>
          <DialogDescription>
            Taom nomi va 1 porsiyaga kerakli xom-ashyo miqdorini kiriting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taom nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Osh" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Ingredientlar (1 porsiyaga)</FormLabel>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.ingredient_name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Guruch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity_per_serving`}
                      render={({ field }) => (
                        <FormItem className="w-20">
                          <FormControl>
                            <Input type="number" min={0} placeholder="150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem className="w-16">
                          <FormControl>
                            <Input placeholder="g" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ingredient_name: "", quantity_per_serving: 0, unit: "g" })}
              >
                <Plus /> Ingredient qo'shish
              </Button>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saveItem.isPending}>
                {saveItem.isPending && <Loader2 className="animate-spin" />}
                {isEditing ? "Saqlash" : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
