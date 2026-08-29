import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const user = data.user;

      // 1. Check if user already exists in profiles
      let isNewUser = false;
      try {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingProfile) {
          isNewUser = true;
        }

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Thriftable Member";

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "";

        // 2. Upsert profile into public.profiles table
        const isSuperAdmin = user.email?.trim().toLowerCase() === "skhan.bese23seecs@seecs.edu.pk";
        const profileData = {
          id: user.id,
          full_name: fullName,
          email: user.email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };

        if (isSuperAdmin) {
          profileData.role = "admin";
          profileData.is_admin = true;
        }

        await supabase.from("profiles").upsert(
          profileData,
          { onConflict: "id" }
        );

        // 3. If new Google user, send welcome email with discount code
        if (isNewUser && user.email) {
          const host = request.headers.get("host") || "localhost:3000";
          const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
          const baseUrl = `${protocol}://${host}`;

          fetch(`${baseUrl}/api/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "welcome",
              email: user.email,
              name: fullName,
            }),
          }).catch((err) => console.warn("Google OAuth welcome email error:", err));
        }
      } catch (profileErr) {
        console.warn("Google OAuth profile sync warning:", profileErr);
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate%20user`);
}
