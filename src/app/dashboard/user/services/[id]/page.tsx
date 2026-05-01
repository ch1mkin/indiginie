import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { RequestServiceDialog } from "@/components/dashboard/request-service-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function UserServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (!service) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-2xl tracking-tight">{service.title}</CardTitle>
            <Badge className="capitalize rounded-full px-4 py-1.5">{service.price_type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{service.detailed_description ?? service.description}</p>
          <div className="rounded-lg bg-surface-container-low p-4 text-sm text-muted-foreground">
            Timeline estimate: <span className="font-medium text-foreground">{service.timeline_estimate ?? "Custom"}</span>
          </div>
          <div>
            <h3 className="font-semibold">Required documents</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {(service.required_documents ?? []).length === 0 ? (
                <li>Will be requested by your relationship manager.</li>
              ) : (
                (service.required_documents ?? []).map((x: string) => (
                  <li key={x} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-secondary" />
                    {x}
                  </li>
                ))
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Request this service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Share call preferences and submit your request.</p>
          <RequestServiceDialog serviceId={service.id} serviceTitle={service.title} />
          <p className="text-[11px] text-muted-foreground">By continuing, you agree to service and confidentiality terms.</p>
        </CardContent>
      </Card>
    </div>
  );
}
