"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function redirectWithToast(
  message: string,
  type: "success" | "error" = "success",
  fallbackPath = "/dashboard"
): Promise<never> {
  const h = await headers();
  const referer = h.get("referer");
  const url = referer ? new URL(referer) : new URL(fallbackPath, "http://localhost");
  url.searchParams.set(type, message);
  redirect(url.pathname + (url.search ? url.search : ""));
}
