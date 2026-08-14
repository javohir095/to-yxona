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
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (callerProfileError || !callerProfile || callerProfile.role !== "superadmin") {
    return json({ error: "Faqat superadmin bu amalni bajara oladi" }, 403);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Noto'g'ri so'rov" }, 400);
  }

  const action = body.action;

  if (action === "list_venues") {
    const { data: venues, error: venuesError } = await admin
      .from("venues")
      .select("id, name, address, phone, created_at")
      .order("created_at", { ascending: true });

    if (venuesError) return json({ error: venuesError.message }, 400);

    const withOwners = await Promise.all(
      (venues ?? []).map(async (venue) => {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, full_name")
          .eq("venue_id", venue.id)
          .eq("role", "owner")
          .limit(1);

        const owner = profiles?.[0];
        let ownerEmail: string | null = null;
        if (owner) {
          const { data } = await admin.auth.admin.getUserById(owner.id);
          ownerEmail = data.user?.email ?? null;
        }

        const { count: staffCount } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venue.id);

        return {
          ...venue,
          owner_name: owner?.full_name ?? null,
          owner_email: ownerEmail,
          staff_count: staffCount ?? 0,
        };
      }),
    );

    return json({ venues: withOwners });
  }

  if (action === "create_venue") {
    const venueName = body.venue_name as string | undefined;
    const ownerFullName = body.owner_full_name as string | undefined;
    const ownerEmail = body.owner_email as string | undefined;
    const ownerPassword = body.owner_password as string | undefined;

    if (!venueName || !ownerFullName || !ownerEmail || !ownerPassword) {
      return json({ error: "Barcha maydonlarni to'ldiring" }, 400);
    }
    if (ownerPassword.length < 6) {
      return json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }, 400);
    }

    const { data: venue, error: venueError } = await admin
      .from("venues")
      .insert({ name: venueName })
      .select("id")
      .single();

    if (venueError) return json({ error: venueError.message }, 400);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { full_name: ownerFullName, role: "owner", venue_id: venue.id },
    });

    if (createError) {
      await admin.from("venues").delete().eq("id", venue.id);
      return json({ error: friendlyAuthError(createError.message) }, 400);
    }

    return json({ venue_id: venue.id, owner_id: created.user?.id });
  }

  return json({ error: "Noma'lum amal" }, 400);
});
