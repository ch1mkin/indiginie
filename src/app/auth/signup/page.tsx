import { Suspense } from "react";

import LoginForm from "../login/login-form";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginForm initialMode="signup" />
    </Suspense>
  );
}
