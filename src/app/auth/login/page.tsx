import { Suspense } from "react";

import { PublicChrome } from "@/components/marketing/public-chrome";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <PublicChrome>
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
        <LoginForm initialMode="login" />
      </Suspense>
    </PublicChrome>
  );
}
