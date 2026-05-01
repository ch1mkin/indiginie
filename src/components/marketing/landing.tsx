import Link from "next/link";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const heroImageFallback =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4fWRRuqj0l5EnQ7TzF3F2PlZaGDasI46HtMbXgBxtPYg5x1x1Y2Bdv8J55Y9vYtmvK4otp4bArZvi74YU-Iiq5lCG-NYqdwKohdKSYlDkSbAIq8RWpqq2qFY6f6Kw7ZkD76TrP_wYrv4bpUgl1g0RsXQuDowmGlxaJ7gsvmjUl5xUw7btL-tN51rSil5iuIKHztAJTZcQI6Zwq807-z471Q6vNufZGOE33ZSCU-mRapNBE5Nd8WioHAXB8h1xdutQVs1O9JOZ-ks";
const servicePlaceholder =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect width='100%' height='100%' fill='%23dbeafe'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='64' font-weight='700' fill='%23006192'>INDIGINIE</text></svg>";

export async function Landing() {
  const supabase = await createClient();
  const [{ data: services }, { data: testimonials }, { data: contentRows }, { data: faqs }] = await Promise.all([
    supabase.from("services").select("*").limit(6),
    supabase.from("landing_testimonials").select("*").order("created_at", { ascending: false }).limit(4),
    supabase.from("landing_content").select("key, value"),
    supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
  ]);
  const content = new Map((contentRows ?? []).map((r) => [r.key, r.value]));
  const heroTitle =
    !content.get("hero_title") || content.get("hero_title") === "Managing your India matters, from anywhere"
      ? "Your Trusted Partner for NRI Support Services"
      : (content.get("hero_title") as string);
  const heroImage = content.get("hero_image_url") || heroImageFallback;
  const howSteps = [
    [
      "1",
      content.get("how_step_1_title") || "Discovery",
      content.get("how_step_1_body") || "We map your service, document, and compliance requirements.",
    ],
    [
      "2",
      content.get("how_step_2_title") || "Execution",
      content.get("how_step_2_body") || "Our team executes and updates status in your portal.",
    ],
    [
      "3",
      content.get("how_step_3_title") || "Closure",
      content.get("how_step_3_body") || "Receive outputs, review history, and raise follow-ups anytime.",
    ],
  ];

  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-primary selection:text-primary-foreground">
      <main className="pt-2">
        <section className="relative overflow-hidden bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="editorial-grid items-center">
              <div className="col-span-12 md:col-span-7 lg:col-span-6">
                <span className="mb-6 inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-bold tracking-[0.2em] text-on-secondary-container uppercase">
                  Welcome to INDIGINIE
                </span>
                <h1 className="mb-8 text-4xl leading-[1.05] font-black tracking-tighter text-on-surface md:text-7xl">
                  {heroTitle}
                </h1>
                <p className="mb-10 max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                  {content.get("hero_subtitle") ??
                    "We make your life easier, one service at a time. From property verification to travel assistance, we've got you covered."}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    className="inline-flex h-[56px] items-center justify-center rounded-xl bg-gradient-to-br from-primary to-brand-sky px-8 text-sm font-bold text-white shadow-xl transition-transform active:scale-95"
                    href="/services"
                  >
                    {content.get("hero_primary_cta") ?? "Explore Services"}
                  </Link>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "h-[56px] justify-center gap-2 rounded-xl px-8 text-sm font-bold shadow-sm"
                    )}
                    href="/auth/login"
                  >
                    <PlayCircle className="size-4" />
                    {content.get("hero_secondary_cta") ?? "Request Callback"}
                  </Link>
                </div>
              </div>
              <div className="relative col-span-12 mt-12 md:col-span-5 md:mt-0 lg:col-span-6">
                <div className="aspect-square overflow-hidden rounded-full bg-surface-container-highest shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt="Modern architectural lines" className="h-full w-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur md:-left-12">
                  <div className="mb-2 flex items-center gap-3">
                    <Sparkles className="size-5 text-primary" />
                    <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">Community</span>
                  </div>
                  <div className="text-2xl font-black text-on-surface">Trusted by 50+ Clients</div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[96%] bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="mb-12">
              <h2 className="mb-4 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
                {content.get("services_title") || "Our Services"}
              </h2>
              <p className="max-w-2xl text-lg text-on-surface-variant">
                {content.get("services_subtitle") ||
                  "Comprehensive support services designed specifically for NRIs"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {(services ?? []).map((service) => (
                <div
                  key={service.id}
                  className="group flex flex-col justify-between rounded-xl border border-border/60 bg-surface-container-low p-6 shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  {/* Use plain img because admin can paste arbitrary CDN URLs. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.thumbnail_url || servicePlaceholder}
                    alt={service.title}
                    className="mb-4 h-40 w-full rounded-md object-cover"
                  />
                  <div>
                    <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{service.description}</p>
                  </div>
                  <Link
                    href={`/services`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3"
                  >
                    Explore <ArrowRight className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <h2 className="mb-8 text-3xl font-black tracking-tight">{content.get("how_title") || "How it works"}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {howSteps.map(([n, title, body]) => (
                <div key={n} className="rounded-xl border border-border bg-white p-6">
                  <div className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-primary text-white">
                    {n}
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <h2 className="mb-8 text-3xl font-black tracking-tight">Testimonials</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {(testimonials ?? []).map((t) => (
                <div key={t.id} className="rounded-2xl border border-border bg-white p-8">
                  <p className="text-lg italic">&quot;{t.quote}&quot;</p>
                  <div className="mt-6">
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20">
          <div className="mx-auto max-w-5xl px-6 md:px-10">
            <h2 className="mb-8 text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {(faqs ?? []).map((faq) => (
                <details key={faq.id} className="rounded-lg border bg-white p-4">
                  <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                  <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
              {(faqs ?? []).length === 0 ? <p className="text-sm text-muted-foreground">FAQs will be published soon.</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-inverse-surface px-6 py-16 text-center text-inverse-on-surface md:mx-auto md:max-w-6xl md:px-16">
          <h2 className="text-3xl font-black tracking-tighter md:text-5xl">
            {content.get("final_cta_title") || "Ready to Get Started?"}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-200 md:text-lg">
            {content.get("final_cta_body") ||
              "Join thousands of NRIs who trust Indiginie for their support needs in India"}
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              className="inline-flex items-center justify-center rounded-md bg-brand-sky px-10 py-4 text-sm font-bold text-white shadow-2xl transition-transform active:scale-95"
              href="/auth/login"
            >
              Lets get Started
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
