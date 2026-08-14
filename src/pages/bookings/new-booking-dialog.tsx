import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useHalls } from "@/hooks/use-halls";
import { useMenuPackages } from "@/hooks/use-menu-packages";
import { EVENT_TYPE_LABELS, type EventType } from "@/entities";
import { formatCurrency } from "@/lib/format";
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

const bookingSchema = z.object({
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
  deposit_amount: z.coerce.number().min(0),
  notes: z.string().optional(),
});
type BookingValues = z.infer<typeof bookingSchema>;

export function NewBookingDialog({
  open,
  onOpenChange,
  venueId,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string | undefined;
  defaultDate?: string;
}) {
  const { data: halls } = useHalls(venueId);
  const { data: menuPackages } = useMenuPackages(venueId);
  const createBooking = useCreateBooking(venueId);
  const [totalTouched, setTotalTouched] = useState(false);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      event_type: "wedding",
      event_date: defaultDate ?? format(new Date(), "yyyy-MM-dd"),
      start_time: "18:00",
      end_time: "",
      hall_id: "",
      menu_package_id: "",
      guest_count: 100,
      total_amount: 0,
      deposit_amount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      setTotalTouched(false);
      form.reset({
        customer_name: "",
        customer_phone: "",
        event_type: "wedding",
        event_date: defaultDate ?? format(new Date(), "yyyy-MM-dd"),
        start_time: "18:00",
        end_time: "",
        hall_id: "",
        menu_package_id: "",
        guest_count: 100,
        total_amount: 0,
        deposit_amount: 0,
        notes: "",
      });
    }
  }, [open, defaultDate, form]);

  const guestCount = form.watch("guest_count");
  const menuPackageId = form.watch("menu_package_id");

  useEffect(() => {
    if (totalTouched) return;
    const selected = menuPackages?.find((p) => p.id === menuPackageId);
    if (selected && guestCount > 0) {
      form.setValue("total_amount", guestCount * selected.price_per_guest);
    }
  }, [guestCount, menuPackageId, menuPackages, totalTouched, form]);

  async function onSubmit(values: BookingValues) {
    try {
      await createBooking.mutateAsync({
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
        deposit_amount: values.deposit_amount,
      });
      toast.success("Bandlik yaratildi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Bandlik yaratishda xatolik", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yangi bandlik</DialogTitle>
          <DialogDescription>Tadbir va mijoz ma'lumotlarini kiriting.</DialogDescription>
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
                      <Input placeholder="Ism Familiya" autoFocus {...field} />
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
                      <Input placeholder="+998 90 123 45 67" {...field} />
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
                            {pkg.name} — {formatCurrency(pkg.price_per_guest)} so'm/kishi
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
                  <FormItem>
                    <FormLabel>Umumiy summa</FormLabel>
                    <FormControl>
                      <MoneyInput
                        value={field.value}
                        onChange={(value) => {
                          setTotalTouched(true);
                          field.onChange(value);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deposit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avans (ixtiyoriy)</FormLabel>
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
                      <Textarea placeholder="Dekoratsiya, musiqa va h.k." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createBooking.isPending}>
                {createBooking.isPending && <Loader2 className="animate-spin" />}
                Bandlikni yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
