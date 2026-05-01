"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { CONTENT_ASSETS_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  detailed_description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  required_documents: z.string().optional(),
  timeline_estimate: z.string().optional(),
  price_type: z.enum(["fixed", "custom"]),
});

export async function upsertServiceAction(formData: FormData): Promise<void> {
  const idRaw = String(formData.get("id") ?? "").trim();
  const parsed = upsertSchema.safeParse({
    id: idRaw ? idRaw : undefined,
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    detailed_description: String(formData.get("detailed_description") ?? ""),
    thumbnail_url: String(formData.get("thumbnail_url") ?? ""),
    required_documents: String(formData.get("required_documents") ?? ""),
    timeline_estimate: String(formData.get("timeline_estimate") ?? ""),
    price_type: String(formData.get("price_type") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  let thumbnailUrl = parsed.data.thumbnail_url ? parsed.data.thumbnail_url : null;
  const maybeFile = formData.get("thumbnail_file");
  if (maybeFile instanceof File && maybeFile.size > 0) {
    const safeName = maybeFile.name.replaceAll(/[^a-zA-Z0-9_.-]/g, "_");
    const path = `services/${Date.now()}-${safeName}`;
    const bytes = Buffer.from(await maybeFile.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(CONTENT_ASSETS_BUCKET)
      .upload(path, bytes, { contentType: maybeFile.type || "application/octet-stream", upsert: false });
    if (!uploadError) {
      const { data } = supabase.storage.from(CONTENT_ASSETS_BUCKET).getPublicUrl(path);
      thumbnailUrl = data.publicUrl;
    }
  }

  if (parsed.data.id) {
    const { error } = await supabase
      .from("services")
      .update({
        title: parsed.data.title,
        description: parsed.data.description ? parsed.data.description : null,
        detailed_description: parsed.data.detailed_description ? parsed.data.detailed_description : null,
        thumbnail_url: thumbnailUrl,
        required_documents: parsed.data.required_documents
          ? parsed.data.required_documents
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
        timeline_estimate: parsed.data.timeline_estimate ? parsed.data.timeline_estimate : null,
        price_type: parsed.data.price_type,
      })
      .eq("id", parsed.data.id);

    if (error) return;
  } else {
    const { error } = await supabase.from("services").insert({
      title: parsed.data.title,
      description: parsed.data.description ? parsed.data.description : null,
      detailed_description: parsed.data.detailed_description ? parsed.data.detailed_description : null,
      thumbnail_url: thumbnailUrl,
      required_documents: parsed.data.required_documents
        ? parsed.data.required_documents
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [],
      timeline_estimate: parsed.data.timeline_estimate ? parsed.data.timeline_estimate : null,
      price_type: parsed.data.price_type,
    });

    if (error) return;
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/user");
  revalidatePath("/services");
  await redirectWithToast(parsed.data.id ? "Service changes saved." : "Service created successfully.");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const uuid = z.string().uuid().safeParse(id);
  if (!uuid.success) return;

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", uuid.data);
  if (error) return;

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/user");
  revalidatePath("/services");
  await redirectWithToast("Service deleted.");
}
