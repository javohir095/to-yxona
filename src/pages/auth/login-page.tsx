import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { LOGIN_PATTERN, loginToEmail } from "@/lib/login-id";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  login: z.string().min(1, "Login kiriting").regex(LOGIN_PATTERN, "Faqat harflar, raqamlar, . va _ ishlatilishi mumkin"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginToEmail(values.login),
      password: values.password,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Kirishda xatolik", { description: "Login yoki parol noto'g'ri" });
      return;
    }

    const state = location.state as { from?: { pathname?: string } } | null;
    navigate(state?.from?.pathname ?? "/", { replace: true });
  }

  return (
    <AuthLayout
      title="Xush kelibsiz"
      description="Hisobingizga kirish uchun login va parolni kiriting"
      footer="Login va parolingiz yo'qmi? To'yxona egasi yoki administratoringizga murojaat qiling."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login</FormLabel>
                <FormControl>
                  <Input placeholder="login" autoComplete="username" autoCapitalize="none" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Kirish
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
