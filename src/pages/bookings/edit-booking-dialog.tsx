import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateBooking, type BookingWithRelations } from "@/hooks/use-bookings";
import { useHalls } from "@/hooks/use-halls";
import { useMenuPackages } from "@/hooks/use-menu-packages";
import { EVENT_TYPE_LABELS, type EventType } from "@/entities";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const editSchema = z.object({
  customer_name: z.string().min(2, "Mijoz ismini kiriting"),
  customer_phone: z.string().min(5, "Telefon raqamini kiriting"),
  event_type: z.enum(["wedding", "circumcision", "celebration", "corporate", "other"]),
  event_date: z.string().min(1, "Sanani tanlang"),
  start_time: z.string().min(1, "Boshlanish vaqtini kiriting"),
  end_time: z.string().optional(),
  hall_id: z.string().min(1, "Zalni tanlang"),
  menu_package_id: z.string().optional(),
  guest_count: z.coerce.number().int().min(1, "Mehmonlar sonini kiriting"),
  total_amount: z.coerce.number().min(0),
  notes: z.string().optional(),
});
type EditValues = z.infer<typeof editSchema>;

export function EditBookingDialog({
  open,
  onOpenChange,
  booking,
  venueId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingWithRelations;
  venueId: string | undefined;
}) {
  const { data: halls } = useHalls(venueId);
  const { data: menuPackages } = useMenuPackages(venueId);
  const updateBooking = useUpdateBooking();

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      event_type: booking.event_type,
      event_date: booking.event_date,
      start_time: booking.start_time.slice(0, 5),
      end_time: booking.end_time?.slice(0, 5) ?? "",
      hall_id: booking.hall_id,
      menu_package_id: booking.menu_package_id ?? "",
      guest_count: booking.guest_count,
      total_amount: booking.total_amount,
      notes: booking.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        event_type: booking.event_type,
        event_date: booking.event_date,
        start_time: booking.start_time.slice(0, 5),
        end_time: booking.end_time?.slice(0, 5) ?? "",
        hall_id: booking.hall_id,
        menu_package_id: booking.menu_package_id ?? "",
        guest_count: booking.guest_count,
        total_amount: booking.total_amount,
        notes: booking.notes ?? "",
      });
    }
  }, [open, booking, form]);

  async function onSubmit(values: EditValues) {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        event_type: values.event_type,
        event_date: values.event_date,
        start_time: values.start_time,
        end_time: values.end_time || null,
        hall_id: values.hall_id,
        menu_package_id: values.menu_package_id || null,
        guest_count: values.guest_count,
        total_amount: values.total_amount,
        notes: values.notes || null,
      });
      toast.success("Bandlik yangilandi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bandlikni tahrirlash</DialogTitle>
          <DialogDescription>Mijoz va tadbir ma'lumotlarini yangilang.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Mijoz ismi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Telefon raqami</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Tadbir turi</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {EVENT_TYPE_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hall_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Zal</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Zalni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {halls?.map((hall) => (
                          <SelectItem key={hall.id} value={hall.id}>
                            {hall.name} ({hall.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sana</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boshlanish</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tugash (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guest_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mehmonlar soni</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="menu_package_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Menyu paketi</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Paketni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {menuPackages?.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Umumiy summa</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Izoh (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={updateBooking.isPending}>
                {updateBooking.isPending && <Loader2 className="animate-spin" />}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
