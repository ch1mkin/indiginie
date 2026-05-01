import Link from "next/link";
import { Archive, ClipboardCheck } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function UserOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ count: activeCount }, { count: docCount }, { data: timelineRows }, { data: services }] = await Promise.all([
    supabase
      .from("user_services")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "active"]),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_services").select("id, service_id, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("services").select("id, title"),
  ]);
  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const latest = timelineRows?.[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100/80 bg-white shadow-sm transition hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2 text-primary">
                <ClipboardCheck className="size-5" />
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-widest text-primary uppercase">Live</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{activeCount ?? 0}</div>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Active requests</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100/80 bg-white shadow-sm transition hover:-translate-y-0.5">
          <CardHeader className="pb-2">
            <div className="rounded-lg bg-blue-50 p-2 text-primary w-fit">
              <Archive className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight">{docCount ?? 0}</div>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Vault documents</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg">
          <CardHeader>
            <CardTitle>Global concierge</CardTitle>
            <CardDescription className="text-blue-100">Response and support from your case desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-100">Priority support line + callback orchestration.</p>
            <Link className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-center")} href="/dashboard/user/support">
              Open support desk
            </Link>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="text-xl">Quick actions</CardTitle>
          <CardDescription>Browse services, upload documents, and manage support in one click.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-12 justify-start rounded-xl")} href="/dashboard/user/services">
            Browse services
          </Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-12 justify-start rounded-xl")} href="/dashboard/user/documents">
            Manage documents
          </Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-12 justify-start rounded-xl")} href="/dashboard/user/support">
            Raise issue
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Service timeline</CardTitle>
          <CardDescription>Live progress tracker for your most recent requests.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(timelineRows ?? []).map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-xl border bg-surface-container-low p-4">
              <div>
                <p className="font-medium">{serviceMap.get(row.service_id) ?? row.service_id}</p>
                <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge value={row.status} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="bg-surface-container-low">
        <CardHeader>
          <CardTitle>Current focus</CardTitle>
          <CardDescription>Most recent active service context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold">{latest ? serviceMap.get(latest.service_id) ?? latest.service_id : "No active request yet"}</p>
          <p className="text-xs text-muted-foreground">
            {latest ? new Date(latest.created_at).toLocaleString() : "Start by requesting a service from the catalog."}
          </p>
          {latest ? <StatusBadge value={latest.status} /> : null}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
