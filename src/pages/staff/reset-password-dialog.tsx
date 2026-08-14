import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useResetStaffPassword, type StaffMember } from "@/hooks/use-staff";
import { emailToLogin } from "@/lib/login-id";
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

const schema = z.object({ password: z.string().min(6, "Kamida 6 ta belgi") });
type Values = z.infer<typeof schema>;

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  staff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
}) {
  const resetPassword = useResetStaffPassword();
  const [visible, setVisible] = useState(true);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { password: "" } });

  useEffect(() => {
    if (open) form.reset({ password: generatePassword() });
  }, [open, form]);

  async function onSubmit(values: Values) {
    if (!staff) return;
    try {
      await resetPassword.mutateAsync({ userId: staff.id, password: values.password });
      toast.success("Parol yangilandi", { description: `${emailToLogin(staff.email)} — yangi parolni xodimga yetkazing.` });
      onOpenChange(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi", { description: (error as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Parolni tiklash</DialogTitle>
          <DialogDescription>{staff?.full_name} uchun yangi parol o'rnating.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yangi parol</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type={visible ? "text" : "password"} autoFocus {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Yangi parol yaratish"
                      onClick={() => {
                        form.setValue("password", generatePassword());
                        setVisible(true);
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
              <Button type="submit" disabled={resetPassword.isPending}>
                {resetPassword.isPending && <Loader2 className="animate-spin" />}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
