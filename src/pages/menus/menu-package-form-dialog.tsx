import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateMenuPackage, useUpdateMenuPackage } from "@/hooks/use-menu-packages";
import type { MenuPackage } from "@/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const packageSchema = z.object({
  name: z.string().min(2, "Paket nomini kiriting"),
  description: z.string().optional(),
  price_per_guest: z.coerce.number().min(0, "Narx manfiy bo'lmasligi kerak"),
});
type PackageValues = z.infer<typeof packageSchema>;

export function MenuPackageFormDialog({
  open,
  onOpenChange,
  menuPackage,
  venueId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuPackage: MenuPackage | null;
  venueId: string | undefined;
}) {
  const createPackage = useCreateMenuPackage(venueId);
  const updatePackage = useUpdateMenuPackage(venueId);
  const isEditing = !!menuPackage;

  const form = useForm<PackageValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: { name: "", description: "", price_per_guest: 0 },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: menuPackage?.name ?? "",
        description: menuPackage?.description ?? "",
        price_per_guest: menuPackage?.price_per_guest ?? 0,
      });
    }
  }, [open, menuPackage, form]);

  async function onSubmit(values: PackageValues) {
    try {
      const payload = { ...values, description: values.description || null };
      if (isEditing && menuPackage) {
        await updatePackage.mutateAsync({ id: menuPackage.id, ...payload });
        toast.success("Paket yangilandi");
      } else {
        await createPackage.mutateAsync(payload);
        toast.success("Paket qo'shildi");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  const submitting = createPackage.isPending || updatePackage.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Paketni tahrirlash" : "Yangi menyu paketi"}</DialogTitle>
          <DialogDescription>Paket nomi, 1 kishiga narx va izohni kiriting.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paket nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Premium" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_per_guest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1 kishiga narx (so'm)</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paket haqida qisqacha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {isEditing ? "Saqlash" : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
