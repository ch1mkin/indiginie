import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export type SessionProfile = {
  userId: string;
  email: string | undefined;
  profile: Profile;
};

export function isUserProfileComplete(profile: Profile) {
  return Boolean(
    profile.full_name?.trim() &&
      profile.phone_country_code?.trim() &&
      profile.phone_number?.trim()
  );
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, phone_country_code, phone_number, alternate_phone, country_of_residence, time_zone, preferred_contact_method, date_of_birth, nationality, passport_number, india_address, property_location, service_purpose, profile_completed_at, role, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    userId: user.id,
    email: user.email,
    profile: profile as Profile,
  };
}

export function dashboardHomeForRole(role: AppRole) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "employee") return "/dashboard/employee";
  return "/dashboard/user";
}
