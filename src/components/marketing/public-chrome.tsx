import Link from "next/link";
import { Menu } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { dashboardHomeForRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function PublicChrome({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const roleRow = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  const dashboardHref = roleRow.data?.role ? dashboardHomeForRole(roleRow.data.role) : "/dashboard";
  const { data: contentRows } = await supabase.from("landing_content").select("key, value").in("key", ["site_logo_url"]);
  const content = new Map((contentRows ?? []).map((r) => [r.key, r.value]));
  const siteLogoUrl = content.get("site_logo_url") ?? "";
  const initials =
    user?.email
      ?.split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-surface text-on-surface">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="floating-orb orb-one" />
        <div className="floating-orb orb-two" />
        <div className="floating-orb orb-three" />
      </div>
      <header className="glass-nav fixed top-0 z-50 w-full border-b border-border/60 bg-white/90 shadow-[0px_20px_40px_rgba(25,28,29,0.06)]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tighter text-primary sm:text-2xl">
            {siteLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={siteLogoUrl} alt="Indiginie logo" className="size-7 rounded-md object-cover sm:size-8" />
            ) : null}
            <span className="sm:hidden">INDIGINIE</span>
            <span className="hidden sm:inline">Indiginie NRI Solutions</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold tracking-tight text-on-surface-variant lg:flex">
            <Link className="hover:text-primary transition-colors" href="/services">
              Services
            </Link>
            <Link className="hover:text-primary transition-colors" href="/knowledge">
              Knowledge
            </Link>
            <Link className="hover:text-primary transition-colors" href="/about">
              About
            </Link>
            <Link className="hover:text-primary transition-colors" href="/faq">
              FAQ
            </Link>
          </div>
          {user ? (
            <Link href={dashboardHref} className="hidden items-center gap-2 rounded-full border px-3 py-1.5 md:inline-flex">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">Dashboard</span>
            </Link>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-sm")} href="/auth/login">
                Login
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }))} href="/auth/signup">
                Signup
              </Link>
            </div>
          )}
          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer rounded-md border border-border p-2 text-sm">
              <Menu className="size-4" />
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white p-2 shadow-xl">
              <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/services">
                Services
              </Link>
              <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/knowledge">
                Knowledge
              </Link>
              <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/about">
                About
              </Link>
              <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/faq">
                FAQ
              </Link>
              {user ? (
                <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href={dashboardHref}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/auth/login">
                    Login
                  </Link>
                  <Link className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href="/auth/signup">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </details>
        </nav>
      </header>

      <main className="pt-28">{children}</main>

      <footer className="mt-20 bg-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-lg font-black tracking-tight">Indiginie NRI Solutions LLP</p>
            <p className="mt-2 text-sm text-blue-100">Your trusted partner for NRI support services.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-blue-100">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/security">Security</Link>
            <Link href="/refund-policy">Refund Policy</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/knowledge">Knowledge</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="border-t border-blue-900/70 py-4 text-center text-xs text-blue-200">
          Powered by{" "}
          <a href="https://salhantech.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            SalhanTech.com
          </a>
        </div>
      </footer>
    </div>
  );
}
