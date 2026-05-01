"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function RouteToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const success = params.get("success");
    const error = params.get("error");
    if (!success && !error) return;

    if (success) toast.success(success);
    if (error) toast.error(error);

    const next = new URLSearchParams(params.toString());
    next.delete("success");
    next.delete("error");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, router, pathname]);

  return null;
}
