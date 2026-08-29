import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPER_ADMIN_EMAIL = "skhan.bese23seecs@seecs.edu.pk";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available (bypasses RLS), otherwise fallback to anon key
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// GET: Fetch list of authorized admin emails and user IDs
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ adminEmails: [SUPER_ADMIN_EMAIL], adminIds: [] });
    }

    // 1. Fetch from store_settings
    const { data: settings } = await supabase
      .from("store_settings")
      .select("admin_roles")
      .eq("id", "global")
      .maybeSingle();

    const storedAdmins = Array.isArray(settings?.admin_roles) ? settings.admin_roles : [];
    
    // Always include super admin
    const adminEmails = new Set([SUPER_ADMIN_EMAIL]);
    const adminIds = new Set();

    storedAdmins.forEach((item) => {
      if (typeof item === "string") {
        if (item.includes("@")) adminEmails.add(item.toLowerCase());
        else adminIds.add(item);
      } else if (item && typeof item === "object") {
        if (item.email) adminEmails.add(item.email.toLowerCase());
        if (item.id) adminIds.add(item.id);
      }
    });

    // 2. Also fetch profiles marked as admin
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin");

      (profiles || []).forEach((p) => {
        if (p.email) adminEmails.add(p.email.toLowerCase().trim());
        if (p.id) adminIds.add(p.id);
      });
    } catch (e) {
      console.warn("Profiles query in GET role:", e);
    }

    return NextResponse.json({
      adminEmails: Array.from(adminEmails),
      adminIds: Array.from(adminIds),
    });
  } catch (err) {
    console.error("GET role error:", err);
    return NextResponse.json({ adminEmails: [SUPER_ADMIN_EMAIL], adminIds: [] });
  }
}

// POST: Grant or revoke admin role
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, email, targetRole } = body;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const normEmail = email ? email.trim().toLowerCase() : null;
    const isAdmin = targetRole === "admin";

    // 1. Update or upsert in public.profiles table
    const isValidUUID = typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let targetId = isValidUUID ? userId : null;

    try {
      // If we don't have UUID, try to find existing profile ID by email
      if (!targetId && normEmail) {
        const { data: foundProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", normEmail)
          .maybeSingle();
        if (foundProfile?.id) {
          targetId = foundProfile.id;
        }
      }

      if (targetId) {
        // Update by ID
        const { error: err1 } = await supabase
          .from("profiles")
          .update({
            role: targetRole,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetId);

        if (err1) {
          // Try upsert
          await supabase.from("profiles").upsert(
            {
              id: targetId,
              email: normEmail || undefined,
              role: targetRole,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } else if (normEmail) {
        // Update by email
        await supabase
          .from("profiles")
          .update({
            role: targetRole,
            updated_at: new Date().toISOString(),
          })
          .eq("email", normEmail);
      }

      // 1b. Try executing RPC function if configured in Supabase
      try {
        await supabase.rpc("set_user_role", {
          target_email: normEmail || "",
          target_user_id: targetId || "",
          new_role: targetRole,
        });
      } catch {}
    } catch (profileErr) {
      console.warn("Notice: public.profiles table update:", profileErr?.message || profileErr);
    }

    // 2. Persist admin roster in store_settings to guarantee persistence regardless of RLS
    try {
      const { data: currentSettings } = await supabase
        .from("store_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      let currentAdminRoles = Array.isArray(currentSettings?.admin_roles)
        ? [...currentSettings.admin_roles]
        : [SUPER_ADMIN_EMAIL];

      if (isAdmin) {
        // Add user to admin roster
        const entry = normEmail || userId;
        if (entry && !currentAdminRoles.includes(entry)) {
          currentAdminRoles.push(entry);
        }
      } else {
        // Remove user from admin roster (except super admin)
        if (normEmail !== SUPER_ADMIN_EMAIL) {
          currentAdminRoles = currentAdminRoles.filter(
            (item) => item !== normEmail && item !== userId
          );
        }
      }

      // Ensure super admin is always preserved
      if (!currentAdminRoles.includes(SUPER_ADMIN_EMAIL)) {
        currentAdminRoles.push(SUPER_ADMIN_EMAIL);
      }

      await supabase.from("store_settings").upsert({
        ...(currentSettings || {}),
        id: "global",
        admin_roles: currentAdminRoles,
        updated_at: new Date().toISOString(),
      });
    } catch (settingsErr) {
      console.warn("store_settings admin_roles sync notice:", settingsErr);
    }

    return NextResponse.json({
      success: true,
      userId,
      email: normEmail,
      targetRole,
      isAdmin,
    });
  } catch (err) {
    console.error("API role update exception:", err);
    return NextResponse.json({ error: err.message || "Failed to update role" }, { status: 500 });
  }
}
