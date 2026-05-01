"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AppRole } from "@/lib/types";
import { navForRole } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function DashboardShell({
  role,
  title,
  email,
  children,
}: {
  role: AppRole;
  title: string;
  email?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const items = navForRole(role);
  const accentClass = role === "admin" ? "text-blue-950" : "text-primary";
  const activeClass = role === "admin" ? "bg-blue-100 text-blue-950" : "bg-sidebar-accent text-sidebar-accent-foreground";
  const mobileButtonClass =
    role === "admin"
      ? "border-blue-200 text-blue-950 hover:bg-blue-50"
      : "border-border text-foreground hover:bg-accent";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col",
            role === "admin" ? "border-blue-100 bg-blue-50/40" : "border-border"
          )}
        >
          <div className="flex h-16 items-center px-6">
            <div className={cn("text-sm font-semibold tracking-tight", accentClass)}>Indiginie Portal</div>
          </div>
          <Separator />
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition-colors",
                    active ? activeClass : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-2 p-4">
            {email ? <div className="text-xs text-muted-foreground">{email}</div> : null}
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass-nav sticky top-0 z-40 border-b border-border bg-background/85 px-4 py-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className={cn("md:hidden", mobileButtonClass)}
                      />
                    }
                  >
                    <Menu className="size-4" />
                  </SheetTrigger>
                  <SheetContent side="left" className={cn(role === "admin" ? "bg-blue-50" : "bg-sidebar")}>
                    <SheetHeader>
                      <SheetTitle className={accentClass}>Indiginie Portal</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-2 flex flex-col gap-1 px-4">
                      {items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm font-semibold",
                              active ? activeClass : "hover:bg-sidebar-accent/60"
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="mt-4 space-y-2 px-4">
                      <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
                        Visit website
                      </Link>
                      <form action={signOut}>
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          Sign out
                        </Button>
                      </form>
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {role} workspace
                </p>
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}>
                  Visit website
                </Link>
                <NotificationBell />
              </div>
            </div>
          </header>
          <main className="flex-1 space-y-8 px-4 py-8 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
