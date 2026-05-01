"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { serviceRequestedTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { notifyUser } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  serviceId: z.string().uuid(),
  whatsappCountryCode: z.string().min(1),
  whatsappNumber: z.string().min(5),
  preferredCallTime: z.string().min(1),
  preferredCallTimezone: z.string().min(1),
});

export async function requestServiceAction(formData: FormData): Promise<void> {
  const parsed = requestSchema.safeParse({
    serviceId: String(formData.get("serviceId") ?? ""),
    whatsappCountryCode: String(formData.get("whatsappCountryCode") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    preferredCallTime: String(formData.get("preferredCallTime") ?? ""),
    preferredCallTimezone: String(formData.get("preferredCallTimezone") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("user_services").insert({
    user_id: user.id,
    service_id: parsed.data.serviceId,
    status: "pending",
    whatsapp_country_code: parsed.data.whatsappCountryCode,
    whatsapp_number: parsed.data.whatsappNumber,
    preferred_call_time: parsed.data.preferredCallTime,
    preferred_call_timezone: parsed.data.preferredCallTimezone,
    payment_status: "not_paid",
    call_completed: false,
  });

  if (error) return;

  const { data: service } = await supabase
    .from("services")
    .select("title")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();
  const title = service?.title ?? "Requested service";
  await notifyUser(user.id, "Service request received", `${title} has been added to your queue.`, "service");
  await sendEmail({
    to: user.email,
    subject: "Service request received",
    html: serviceRequestedTemplate(title),
  });

  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/admin");
  await redirectWithToast("Service request submitted successfully.");
}

const adminUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "active", "completed"]),
  assignedEmployeeId: z.union([z.string().uuid(), z.null()]),
  paymentStatus: z.enum(["not_paid", "paid"]),
  callCompleted: z.boolean(),
});

export async function adminUpdateUserServiceAction(formData: FormData): Promise<void> {
  const rawAssignee = String(formData.get("assignedEmployeeId") ?? "");
  const assignedEmployeeId = rawAssignee.trim() === "" ? null : rawAssignee.trim();

  const parsed = adminUpdateSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
    assignedEmployeeId,
    paymentStatus: String(formData.get("paymentStatus") ?? ""),
    callCompleted: String(formData.get("callCompleted") ?? "") === "on",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const updates: Record<string, unknown> = {
    status: parsed.data.status,
    assigned_employee: parsed.data.assignedEmployeeId,
    payment_status: parsed.data.paymentStatus,
    call_completed: parsed.data.callCompleted,
  };

  const { data: requestRow, error: getReqErr } = await supabase
    .from("user_services")
    .select("user_id, service_id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (getReqErr || !requestRow) return;

  const { error } = await supabase.from("user_services").update(updates).eq("id", parsed.data.id);
  if (error) return;

  const { data: service } = await supabase
    .from("services")
    .select("title")
    .eq("id", requestRow.service_id)
    .maybeSingle();
  const title = service?.title ?? "Service";

  await notifyUser(
    requestRow.user_id,
    "Service status updated",
    `${title} is now ${parsed.data.status}. Payment: ${parsed.data.paymentStatus}. Call completed: ${parsed.data.callCompleted ? "yes" : "no"}.`,
    "service"
  );

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/employee");
  revalidatePath("/dashboard/user");
  await redirectWithToast("Request status updated.");
}

const employeeStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "active", "completed"]),
});

export async function employeeUpdateUserServiceStatusAction(formData: FormData): Promise<void> {
  const parsed = employeeStatusSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("user_services")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("assigned_employee", user.id);

  if (error) return;

  revalidatePath("/dashboard/employee");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/user");
  await redirectWithToast("Service status saved.");
}

export async function deleteUserServiceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (adminProfile?.role !== "admin") return;

  const { data: reqRow } = await supabase
    .from("user_services")
    .select("id, user_id, service_id")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (!reqRow) return;

  const { data: service } = await supabase.from("services").select("title").eq("id", reqRow.service_id).maybeSingle();

  const { error } = await supabase.from("user_services").delete().eq("id", parsedId.data);
  if (error) return;

  await notifyUser(
    reqRow.user_id,
    "Request removed by admin",
    `${service?.title ?? "A service request"} has been removed by the admin team.`,
    "service"
  );

  revalidatePath("/dashboard/admin/requests");
  revalidatePath("/dashboard/user/services");
  revalidatePath("/dashboard/user");
  await redirectWithToast("Request deleted.");
}
