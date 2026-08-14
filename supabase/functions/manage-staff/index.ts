import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function friendlyAuthError(message: string): string {
  if (message.includes("already been registered") || message.includes("already registered")) {
    return "Bu login band, boshqa login tanlang";
  }
  if (message.toLowerCase().includes("password")) {
    return "Parol talablarga javob bermaydi (kamida 6 ta belgi)";
  }
  return message;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

  const { data: callerProfile, error: callerProfileError } = await callerClient
    .from("profiles")
    .select("role, venue_id")
    .eq("id", userData.user.id)
    .single();

  if (callerProfileError || !callerProfile || callerProfile.role !== "owner" || !callerProfile.venue_id) {
    return json({ error: "Faqat to'yxona egasi xodimlarni boshqara oladi" }, 403);
  }

  const venueId = callerProfile.venue_id as string;
  const admin = createClient(supabaseUrl, serviceRoleKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Noto'g'ri so'rov" }, 400);
  }

  const action = body.action;

  if (action === "list") {
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, full_name, role, created_at")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: true });

    if (profilesError) return json({ error: profilesError.message }, 400);

    const withEmails = await Promise.all(
      (profiles ?? []).map(async (p) => {
        const { data } = await admin.auth.admin.getUserById(p.id);
        return { ...p, email: data.user?.email ?? null };
      }),
    );

    return json({ profiles: withEmails });
  }

  if (action === "create") {
    const email = body.email as string | undefined;
    const password = body.password as string | undefined;
    const fullName = body.full_name as string | undefined;
    const role = body.role as string | undefined;

    if (!email || !password || !fullName || !role) {
      return json({ error: "Barcha maydonlarni to'ldiring" }, 400);
    }
    if (!["owner", "manager", "kitchen_staff"].includes(role)) {
      return json({ error: "Noto'g'ri rol" }, 400);
    }
    if (password.length < 6) {
      return json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }, 400);
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, venue_id: venueId },
    });

    if (createError) return json({ error: friendlyAuthError(createError.message) }, 400);
    return json({ id: created.user?.id });
  }

  if (action === "delete") {
    const userId = body.user_id as string | undefined;
    if (!userId) return json({ error: "user_id kerak" }, 400);
    if (userId === userData.user.id) return json({ error: "O'zingizni o'chira olmaysiz" }, 400);

    const { data: targetProfile } = await admin.from("profiles").select("venue_id").eq("id", userId).single();
    if (!targetProfile || targetProfile.venue_id !== venueId) {
      return json({ error: "Bu xodim sizning to'yxonangizga tegishli emas" }, 403);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) return json({ error: deleteError.message }, 400);
    return json({ success: true });
  }

  if (action === "reset_password") {
    const userId = body.user_id as string | undefined;
    const password = body.password as string | undefined;
    if (!userId || !password) return json({ error: "Ma'lumot yetarli emas" }, 400);
    if (password.length < 6) {
      return json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }, 400);
    }

    const { data: targetProfile } = await admin.from("profiles").select("venue_id").eq("id", userId).single();
    if (!targetProfile || targetProfile.venue_id !== venueId) {
      return json({ error: "Bu xodim sizning to'yxonangizga tegishli emas" }, 403);
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password });
    if (updateError) return json({ error: friendlyAuthError(updateError.message) }, 400);
    return json({ success: true });
  }

  return json({ error: "Noma'lum amal" }, 400);
});
