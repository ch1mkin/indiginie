import { Suspense } from "react";

import { PublicChrome } from "@/components/marketing/public-chrome";
import LoginForm from "../login/login-form";

export default function SignupPage() {
  return (
    <PublicChrome>
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading…</div>}>
        <LoginForm initialMode="signup" />
      </Suspense>
    </PublicChrome>
  );
}
