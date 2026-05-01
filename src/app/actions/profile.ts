"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  full_name: z.string().min(2).max(120),
  phone_country_code: z.string().min(1),
  phone_number: z.string().min(1),
  alternate_phone: z.string().optional(),
  country_of_residence: z.string().optional(),
  time_zone: z.string().optional(),
  preferred_contact_method: z.enum(["email", "whatsapp", "phone"]).optional(),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  passport_number: z.string().optional(),
  india_address: z.string().optional(),
  property_location: z.string().optional(),
  service_purpose: z.enum(["property", "legal", "documentation", "other"]).optional(),
});

export async function updateProfileNameAction(formData: FormData): Promise<void> {
  const parsed = updateSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    phone_country_code: String(formData.get("phone_country_code") ?? ""),
    phone_number: String(formData.get("phone_number") ?? ""),
    alternate_phone: String(formData.get("alternate_phone") ?? ""),
    country_of_residence: String(formData.get("country_of_residence") ?? ""),
    time_zone: String(formData.get("time_zone") ?? ""),
    preferred_contact_method: String(formData.get("preferred_contact_method") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? ""),
    nationality: String(formData.get("nationality") ?? ""),
    passport_number: String(formData.get("passport_number") ?? ""),
    india_address: String(formData.get("india_address") ?? ""),
    property_location: String(formData.get("property_location") ?? ""),
    service_purpose: String(formData.get("service_purpose") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone_country_code: parsed.data.phone_country_code,
      phone_number: parsed.data.phone_number,
      alternate_phone: parsed.data.alternate_phone || null,
      country_of_residence: parsed.data.country_of_residence || null,
      time_zone: parsed.data.time_zone || null,
      preferred_contact_method: parsed.data.preferred_contact_method || null,
      date_of_birth: parsed.data.date_of_birth || null,
      nationality: parsed.data.nationality || null,
      passport_number: parsed.data.passport_number || null,
      india_address: parsed.data.india_address || null,
      property_location: parsed.data.property_location || null,
      service_purpose: parsed.data.service_purpose || null,
      profile_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return;

  revalidatePath("/dashboard", "layout");
  await redirectWithToast("Profile details saved.");
}

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "admin", "employee"]),
});

export async function adminUpdateUserRoleAction(formData: FormData): Promise<void> {
  const parsed = roleSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    role: String(formData.get("role") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.id);
  if (error) return;

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin");
  await redirectWithToast("User role updated.");
}
