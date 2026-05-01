import Link from "next/link";

import { PublicChrome } from "@/components/marketing/public-chrome";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Services | Indiginie NRI Solutions",
  description: "Institutional-grade NRI services catalog.",
};
const servicePlaceholder =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='100%' height='100%' fill='%23dbeafe'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='64' font-weight='700' fill='%23006192'>INDIGINIE</text></svg>";

export default async function PublicServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("created_at", { ascending: false });

  return (
    <PublicChrome>
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-8 text-on-surface">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Catalog</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Our Services</h1>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              Comprehensive support services designed specifically for NRIs.
            </p>
          </div>
          <Link className={cn(buttonVariants(), "self-start")} href="/auth/login">
            Secure login
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(services ?? []).map((service) => (
            <Card key={service.id} className="border-border/80 bg-surface-container-low shadow-sm shadow-blue-900/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.thumbnail_url || servicePlaceholder}
                alt={service.title}
                className="h-44 w-full rounded-t-xl object-cover"
              />
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {service.price_type}
                  </Badge>
                </div>
                <CardDescription className="text-base text-on-surface-variant">
                  {service.description ?? "Tailored NRI execution with concierge oversight."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link className={cn(buttonVariants({ variant: "outline" }), "inline-flex")} href={`/services/${service.id}`}>
                  View details
                </Link>
                <Link className={cn(buttonVariants(), "ml-2 inline-flex")} href="/auth/login">
                  Request inside the portal
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PublicChrome>
  );
}
