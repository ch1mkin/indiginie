"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginConsent, setLoginConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const supabase = useMemo(() => createClient(), []);

  const loginWithPassword = () =>
    startTransition(async () => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        toast.error("Email and password are required.");
        return;
      }
      if (!loginConsent) {
        toast.error("Please accept the login consent disclaimer.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user?.id) {
        await supabase.from("user_consents").insert({
          user_id: data.user.id,
          event_type: "login",
          statement:
            "I confirm I am authorized to access this account and consent to secure processing and audit logging of my session.",
          version: "v1",
        });
      }
      router.replace(nextPath);
      router.refresh();
    });

  const signUpWithPassword = () =>
    startTransition(async () => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password || !fullName.trim() || !phoneNumber.trim() || !phoneCountryCode.trim()) {
        toast.error("Name, email, phone and password are required.");
        return;
      }
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
        options: {
          data: { full_name: fullName.trim() },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.user) {
        toast.error("Signup pending confirmation. Disable email confirmation in Supabase for instant signup.");
        return;
      }

      await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone_country_code: phoneCountryCode.trim(),
          phone_number: phoneNumber.trim(),
        })
        .eq("id", data.user.id);

      router.replace(nextPath);
      router.refresh();
    });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-blue-50/60 via-surface to-surface px-4 py-10 text-on-surface shadow-sm md:px-8">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 animate-pulse rounded-full bg-brand-sky/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-300/10 blur-2xl" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-center rounded-2xl border border-blue-100 bg-gradient-to-b from-white/90 to-blue-50/70 p-10 shadow-sm backdrop-blur lg:flex">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase">Indiginie Secure Desk</p>
          <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight">
            Built for NRIs managing India matters globally.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Private document vault, service timelines, employee coordination, and audit-ready support workflows in one
            premium platform.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Institutional-grade privacy and access controls</li>
            <li>• Unified legal, tax, and concierge operations</li>
            <li>• Real-time service progress and notifications</li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-xl space-y-6 self-center">
          <Link href="/" className="text-sm font-semibold text-primary">
            ← Back
          </Link>
          <div className="flex gap-2">
            <Button type="button" variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
              Login
            </Button>
            <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
              Signup
            </Button>
          </div>
          <Card className="animate-in fade-in zoom-in-95 border-blue-100 bg-white/95 duration-300">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Login with your email and password."
                : "Create account with basic details only. Complete profile after login."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "login" ? (
              <>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Consent disclaimer</p>
                  <p className="mt-1">
                    By logging in, you consent to secure session monitoring and audit logging for legal compliance and
                    account protection.
                  </p>
                  <label className="mt-2 flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={loginConsent}
                      onChange={(e) => setLoginConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>I agree to the login consent disclaimer.</span>
                  </label>
                </div>
                <Button className="w-full" disabled={pending} onClick={loginWithPassword}>
                  Login
                </Button>
              </>
            ) : (
              <>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" value={phoneCountryCode} onChange={(e) => setPhoneCountryCode(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                </div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button className="w-full" disabled={pending} onClick={signUpWithPassword}>
                  Create account
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
