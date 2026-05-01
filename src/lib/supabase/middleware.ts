import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { AppRole } from "@/lib/types";

async function fetchRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;
  return data.role as AppRole;
}

async function fetchUserProfileCompletion(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, phone_country_code, phone_number")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return { role: null, complete: false };
  const complete = Boolean(
    data.full_name &&
      data.phone_country_code &&
      data.phone_number
  );
  return { role: data.role as AppRole, complete };
}

function redirectForRole(role: AppRole) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "employee") return "/dashboard/employee";
  return "/dashboard/user";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const role = await fetchRole(supabase, user.id);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role ? redirectForRole(role) : "/dashboard/user";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isDashboardRoute) {
    const profile = await fetchUserProfileCompletion(supabase, user.id);
    const role = profile.role;
    if (!role) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      return NextResponse.redirect(redirectUrl);
    }

    const isUserProfileRoute = pathname === "/dashboard/user/profile";
    if (role === "user" && !profile.complete && pathname.startsWith("/dashboard/user") && !isUserProfileRoute) {
      return NextResponse.redirect(new URL("/dashboard/user/profile?required=1", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(redirectForRole(role), request.url));
    }
    if (pathname.startsWith("/dashboard/employee") && role !== "employee") {
      return NextResponse.redirect(new URL(redirectForRole(role), request.url));
    }
    if (pathname.startsWith("/dashboard/user") && role !== "user") {
      return NextResponse.redirect(new URL(redirectForRole(role), request.url));
    }

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(redirectForRole(role), request.url));
    }
  }

  return supabaseResponse;
}
