"use server";

import { revalidatePath } from "next/cache";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { CONTENT_ASSETS_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function updateLandingContentAction(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!key) return;

  const supabase = await createClient();
  await supabase.from("landing_content").upsert({ key, value, updated_at: new Date().toISOString() });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/content");
  await redirectWithToast("Landing content saved.");
}

export async function addLandingTestimonialAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "");
  const role = String(formData.get("role") ?? "");
  const quote = String(formData.get("quote") ?? "");
  if (!name || !role || !quote) return;

  const supabase = await createClient();
  await supabase.from("landing_testimonials").insert({ name, role, quote });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/content");
  await redirectWithToast("Testimonial added.");
}

export async function deleteLandingTestimonialAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("landing_testimonials").delete().eq("id", id);

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/content");
  await redirectWithToast("Testimonial removed.");
}

export async function uploadLandingAssetAction(formData: FormData): Promise<void> {
  const key = String(formData.get("key") ?? "");
  const file = formData.get("file");
  if (!key || !(file instanceof File) || file.size === 0) return;

  const supabase = await createClient();
  const safeName = file.name.replaceAll(/[^a-zA-Z0-9_.-]/g, "_");
  const path = `landing/${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(CONTENT_ASSETS_BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) return;

  const { data } = supabase.storage.from(CONTENT_ASSETS_BUCKET).getPublicUrl(path);
  await supabase.from("landing_content").upsert({
    key,
    value: data.publicUrl,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/content");
  await redirectWithToast("Landing image uploaded.");
}

export async function setWatermarkToggleAction(formData: FormData): Promise<void> {
  const enabled = String(formData.get("enabled") ?? "") === "true";
  const supabase = await createClient();
  await supabase.from("app_settings").upsert({
    key: "enable_pdf_watermark",
    value: enabled ? "true" : "false",
    updated_at: new Date().toISOString(),
  });
  await redirectWithToast(enabled ? "PDF watermark enabled." : "PDF watermark disabled.");
}

export async function addFaqAction(formData: FormData): Promise<void> {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  if (!question || !answer) return;
  const supabase = await createClient();
  await supabase.from("faqs").insert({ question, answer, sort_order: Number.isFinite(sortOrder) ? sortOrder : 0 });
  await redirectWithToast("FAQ added.");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("faqs").delete().eq("id", id);
  await redirectWithToast("FAQ removed.");
}
