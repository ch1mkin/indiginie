"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { DOCUMENTS_BUCKET } from "@/lib/constants";
import { documentTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { notifyUser } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

function sanitizeFilename(name: string) {
  return name.replaceAll(/[^\w.\-()+ ]/g, "_").slice(0, 180);
}

async function addWatermarkToPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument, degrees, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText("INDIGINIE.COM", {
      x: width * 0.14,
      y: height * 0.4,
      size: 36,
      rotate: degrees(35),
      color: rgb(0.12, 0.23, 0.54),
      opacity: 0.08,
    });
  }
  return Uint8Array.from(await doc.save());
}

const uploadSchema = z.object({
  serviceId: z.string().uuid(),
  requestId: z.string().uuid().optional(),
  type: z.enum(["upload", "output"]),
  ownerUserId: z.string().uuid().optional(),
  consentAccepted: z.boolean().optional(),
});

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const ownerRaw = formData.get("ownerUserId");
  const ownerUserId =
    typeof ownerRaw === "string" && ownerRaw.trim() !== "" ? ownerRaw.trim() : undefined;

  const parsed = uploadSchema.safeParse({
    serviceId: formData.get("serviceId"),
    requestId: String(formData.get("requestId") ?? "") || undefined,
    type: formData.get("type"),
    ownerUserId,
    consentAccepted: String(formData.get("consentAccepted") ?? "") === "on",
  });

  if (!parsed.success) return;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as string | undefined;
  const { data: watermarkSetting } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "enable_pdf_watermark")
    .maybeSingle();
  const watermarkEnabled = watermarkSetting?.value !== "false";

  if (parsed.data.type === "output" && !parsed.data.ownerUserId) {
    return;
  }

  const targetUserId =
    parsed.data.type === "output" && parsed.data.ownerUserId ? parsed.data.ownerUserId : user.id;

  if (parsed.data.type === "upload" && !parsed.data.consentAccepted) {
    return;
  }

  if (parsed.data.type === "upload") {
    if (!parsed.data.requestId) return;
    const { data: ownRequest } = await supabase
      .from("user_services")
      .select("id, payment_status, service_id")
      .eq("id", parsed.data.requestId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ownRequest || ownRequest.service_id !== parsed.data.serviceId || ownRequest.payment_status !== "paid") {
      return;
    }
  }

  if (parsed.data.type === "output" && role === "employee") {
    const { data: assignment } = await supabase
      .from("user_services")
      .select("id")
      .eq("user_id", targetUserId)
      .eq("service_id", parsed.data.serviceId)
      .eq("assigned_employee", user.id)
      .maybeSingle();

    if (!assignment) return;
  }

  const filename = sanitizeFilename(file.name);
  const folder = parsed.data.type === "output" ? "outputs" : "uploads";
  const path = `${targetUserId}/${parsed.data.serviceId}/${folder}/${Date.now()}-${filename}`;

  let fileBytes: Uint8Array = new Uint8Array(await file.arrayBuffer());
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (parsed.data.type === "output" && role === "admin" && isPdf && watermarkEnabled) {
    fileBytes = await addWatermarkToPdf(fileBytes);
  }
  const bytes = Buffer.from(fileBytes);
  const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) return;

  const { error: insertError } = await supabase.from("documents").insert({
    user_id: targetUserId,
    service_id: parsed.data.serviceId,
    request_id: parsed.data.requestId ?? null,
    type: parsed.data.type,
    file_url: path,
  });

  if (insertError) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
    return;
  }

  await notifyUser(
    targetUserId,
    parsed.data.type === "output" ? "New output document" : "Document uploaded",
    parsed.data.type === "output"
      ? "A deliverable has been uploaded for one of your services."
      : "Your file was successfully uploaded.",
    "document"
  );

  if (targetUserId === user.id) {
    await sendEmail({
      to: user.email,
      subject: parsed.data.type === "output" ? "New deliverable uploaded" : "Document upload confirmed",
      html: documentTemplate(parsed.data.type),
    });
  }

  if (parsed.data.type === "upload") {
    await supabase.from("user_consents").insert({
      user_id: user.id,
      event_type: "document_upload",
      statement:
        "I confirm this document is lawfully shared by me and I consent to secure processing, storage, and compliance audit logging.",
      version: "v1",
      metadata: {
        service_id: parsed.data.serviceId,
        request_id: parsed.data.requestId ?? null,
        file_name: file.name,
      },
    });
  }

  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/employee");
  await redirectWithToast(parsed.data.type === "output" ? "Output document uploaded." : "Document uploaded successfully.");
}
