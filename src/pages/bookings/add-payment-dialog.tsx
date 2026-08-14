import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAddPayment } from "@/hooks/use-bookings";
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/entities";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Summani kiriting"),
  payment_type: z.enum(["cash", "card", "transfer"]),
});
type PaymentValues = z.infer<typeof paymentSchema>;

export function AddPaymentDialog({
  open,
  onOpenChange,
  venueId,
  bookingId,
  remaining,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string | undefined;
  bookingId: string;
  remaining: number;
}) {
  const addPayment = useAddPayment(venueId, bookingId);
  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, payment_type: "cash" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ amount: Math.max(remaining, 0), payment_type: "cash" });
    }
  }, [open, remaining, form]);

  async function onSubmit(values: PaymentValues) {
    try {
      await addPayment.mutateAsync(values);
      toast.success("To'lov qo'shildi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>To'lov qo'shish</DialogTitle>
          <DialogDescription>To'lov summasi va turini kiriting.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summa (so'm)</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To'lov turi</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(PAYMENT_TYPE_LABELS) as PaymentType[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {PAYMENT_TYPE_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={addPayment.isPending}>
                {addPayment.isPending && <Loader2 className="animate-spin" />}
                Qo'shish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
