import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCreateStaff } from "@/hooks/use-staff";
import { USER_ROLE_LABELS, VENUE_ROLES } from "@/entities";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const staffSchema = z.object({
  full_name: z.string().min(2, "Ism kiriting"),
  login: z.string().min(3, "Kamida 3 ta belgi").regex(LOGIN_PATTERN, "Faqat harflar, raqamlar, . va _ ishlatilishi mumkin"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
  role: z.enum(["owner", "manager", "kitchen_staff"]),
});
type StaffValues = z.infer<typeof staffSchema>;

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function CreateStaffDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createStaff = useCreateStaff();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<StaffValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { full_name: "", login: "", password: "", role: "kitchen_staff" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ full_name: "", login: "", password: generatePassword(), role: "kitchen_staff" });
      setShowPassword(false);
    }
  }, [open, form]);

  async function onSubmit(values: StaffValues) {
    try {
      await createStaff.mutateAsync({
        full_name: values.full_name,
        email: loginToEmail(values.login),
        password: values.password,
        role: values.role,
      });
      toast.success("Xodim qo'shildi", {
        description: `${values.login} — parolni xodimga xavfsiz tarzda yetkazing.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Xodim qo'shishda xatolik", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi xodim</DialogTitle>
          <DialogDescription>Xodim uchun login va parol yarating.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To'liq ism</FormLabel>
                  <FormControl>
                    <Input placeholder="Ism Familiya" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login</FormLabel>
                  <FormControl>
                    <Input placeholder="masalan: aziz.oshpaz" autoCapitalize="none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VENUE_ROLES.map((key) => (
                        <SelectItem key={key} value={key}>
                          {USER_ROLE_LABELS[key]}
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
              name="password"
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
                        form.setValue("password", generatePassword());
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
              <Button type="submit" disabled={createStaff.isPending}>
                {createStaff.isPending && <Loader2 className="animate-spin" />}
                Xodim yaratish
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
