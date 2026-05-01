import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { PublicChrome } from "@/components/marketing/public-chrome";
import { RequestServiceDialog } from "@/components/dashboard/request-service-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (!service) notFound();

  return (
    <PublicChrome>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-8">
        <div className="space-y-4">
          <Link href="/services" className="text-xs font-bold tracking-widest uppercase text-secondary">
            Services / Details
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-primary md:text-6xl">{service.title}</h1>
            <Badge className="capitalize rounded-full px-4 py-2">{service.price_type}</Badge>
          </div>
          <p className="max-w-3xl text-lg text-on-surface-variant">{service.detailed_description ?? service.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-xl bg-white p-8 shadow-[0px_20px_40px_rgba(25,28,29,0.06)]">
            <h2 className="mb-6 text-2xl font-bold text-primary">Service parameters</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-surface-container-low p-4">
                <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Timeline</div>
                <div className="mt-2 text-lg font-semibold">{service.timeline_estimate ?? "Custom schedule"}</div>
              </div>
              <div className="rounded-lg bg-surface-container-low p-4">
                <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Assurance</div>
                <div className="mt-2 text-lg font-semibold">Certified legal review</div>
              </div>
            </div>
            <h3 className="mt-8 text-xl font-bold">Service scope</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              {(service.required_documents ?? []).length === 0 ? (
                <li>Required documents will be shared after consultation.</li>
              ) : (
                (service.required_documents ?? []).map((doc: string) => (
                  <li key={doc} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-secondary" />
                    {doc}
                  </li>
                ))
              )}
            </ul>
          </section>

          <aside className="space-y-6 rounded-xl bg-surface-container-low p-6">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Required documents</h3>
              <div className="mt-3 space-y-2">
                {(service.required_documents ?? []).length === 0 ? (
                  <div className="rounded-md bg-white p-3 text-sm">Will be shared later</div>
                ) : (
                  (service.required_documents ?? []).map((doc: string) => (
                    <div key={doc} className="rounded-md bg-white p-3 text-sm font-medium">
                      {doc}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-3">
              <RequestServiceDialog serviceId={service.id} serviceTitle={service.title} />
              <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}>
                Login / Signup
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicChrome>
  );
}
