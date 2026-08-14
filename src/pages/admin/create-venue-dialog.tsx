import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCreateVenue } from "@/hooks/use-platform";
import { LOGIN_PATTERN, loginToEmail } from "@/lib/login-id";
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

const venueSchema = z.object({
  venue_name: z.string().min(2, "To'yxona nomini kiriting"),
  owner_full_name: z.string().min(2, "Egasining ismini kiriting"),
  owner_login: z
    .string()
    .min(3, "Kamida 3 ta belgi")
    .regex(LOGIN_PATTERN, "Faqat harflar, raqamlar, . va _ ishlatilishi mumkin"),
  owner_password: z.string().min(6, "Kamida 6 ta belgi"),
});
type VenueValues = z.infer<typeof venueSchema>;

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function CreateVenueDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createVenue = useCreateVenue();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<VenueValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: { venue_name: "", owner_full_name: "", owner_login: "", owner_password: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ venue_name: "", owner_full_name: "", owner_login: "", owner_password: generatePassword() });
      setShowPassword(false);
    }
  }, [open, form]);

  async function onSubmit(values: VenueValues) {
    try {
      await createVenue.mutateAsync({
        venue_name: values.venue_name,
        owner_full_name: values.owner_full_name,
        owner_email: loginToEmail(values.owner_login),
        owner_password: values.owner_password,
      });
      toast.success("To'yxona yaratildi", {
        description: `${values.owner_login} — parolni egasiga xavfsiz tarzda yetkazing.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("To'yxona yaratishda xatolik", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi to'yxona</DialogTitle>
          <DialogDescription>To'yxona va uning egasi uchun login/parol yarating.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="venue_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To'yxona nomi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masalan: Baxt saroyi" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner_full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Egasining ismi</FormLabel>
                  <FormControl>
                    <Input placeholder="Ism Familiya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner_login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Egasining logini</FormLabel>
                  <FormControl>
                    <Input placeholder="masalan: baxtsaroyi.egasi" autoCapitalize="none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parol</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type={showPassword ? "text" : "password"} {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Yangi parol yaratish"
                      onClick={() => {
                        form.setValue("owner_password", generatePassword());
                        setShowPassword(true);
                      }}
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createVenue.isPending}>
                {createVenue.isPending && <Loader2 className="animate-spin" />}
                To'yxona yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
