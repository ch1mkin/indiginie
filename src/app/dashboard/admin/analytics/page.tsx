import { AdminAnalyticsPanel } from "@/components/dashboard/admin-analytics-panel";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const [{ data: services }, { data: users }, { data: requests }, { data: callbacks }, { data: tickets }, { data: documents }] =
    await Promise.all([
    supabase.from("services").select("id, title"),
    supabase.from("profiles").select("id, created_at"),
    supabase.from("user_services").select("id, service_id, user_id, status, payment_status, created_at"),
    supabase.from("callback_requests").select("id, user_id, status, created_at"),
    supabase.from("tickets").select("id, user_id, status, created_at"),
    supabase.from("documents").select("id, user_id, service_id, type, created_at"),
  ]);

  return <AdminAnalyticsPanel services={services ?? []} users={users ?? []} requests={requests ?? []} callbacks={callbacks ?? []} tickets={tickets ?? []} documents={documents ?? []} />;
}
