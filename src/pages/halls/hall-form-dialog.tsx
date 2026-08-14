import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateHall, useUpdateHall } from "@/hooks/use-halls";
import type { Hall } from "@/entities";
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

const hallSchema = z.object({
  name: z.string().min(2, "Zal nomini kiriting"),
  capacity: z.coerce.number().int().min(1, "Sig'im 1 dan katta bo'lishi kerak"),
});
type HallValues = z.infer<typeof hallSchema>;

export function HallFormDialog({
  open,
  onOpenChange,
  hall,
  venueId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hall: Hall | null;
  venueId: string | undefined;
}) {
  const createHall = useCreateHall(venueId);
  const updateHall = useUpdateHall(venueId);
  const isEditing = !!hall;

  const form = useForm<HallValues>({
    resolver: zodResolver(hallSchema),
    defaultValues: { name: "", capacity: 100 },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: hall?.name ?? "", capacity: hall?.capacity ?? 100 });
    }
  }, [open, hall, form]);

  async function onSubmit(values: HallValues) {
    try {
      if (isEditing && hall) {
        await updateHall.mutateAsync({ id: hall.id, ...values });
        toast.success("Zal yangilandi");
      } else {
        await createHall.mutateAsync(values);
        toast.success("Zal qo'shildi");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  const submitting = createHall.isPending || updateHall.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Zalni tahrirlash" : "Yangi zal"}</DialogTitle>
          <DialogDescription>Zal nomi va maksimal mehmonlar sig'imini kiriting.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zal nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Katta zal" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sig'imi (mehmonlar soni)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
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
