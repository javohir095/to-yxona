import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";

export function NoVenuePage() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <AuthLayout title="Hisobingiz sozlanmagan" description="Sizga hali to'yxona biriktirilmagan">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Hisobingizga hali to'yxona biriktirilmagan. Iltimos, to'yxona egasi yoki administratorga murojaat qiling.
        </p>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Chiqish
        </Button>
      </div>
    </AuthLayout>
  );
}
