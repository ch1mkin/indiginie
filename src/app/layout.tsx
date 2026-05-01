import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";

import { RouteToast } from "@/components/ui/route-toast";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase.from("landing_content").select("value").eq("key", "site_favicon_url").maybeSingle();
  const favicon = data?.value?.trim();
  const description =
    "Professional NRI services in India including property management, legal assistance, and documentation support. Manage everything from abroad with trusted experts.";

  return {
    title: {
      default: "Indiginie NRI Solutions LLP",
      template: "%s | Indiginie",
    },
    description,
    openGraph: {
      title: "Indiginie NRI Solutions LLP",
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Indiginie NRI Solutions LLP",
      description,
    },
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
        <Suspense fallback={null}>
          <RouteToast />
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
