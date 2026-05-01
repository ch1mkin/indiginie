import Link from "next/link";

import { PublicChrome } from "@/components/marketing/public-chrome";

export default function TermsPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Terms &amp; Conditions</h1>
        <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Indiginie&apos;s services, you accept and agree to be bound by the terms and provision
          of this agreement.
        </p>
        <h2 className="text-xl font-bold">2. Services</h2>
        <p>
          Indiginie provides support services for Non-Resident Indians (NRIs) including but not limited to property
          verification, liaison services, travel assistance, and event management.
        </p>
        <h2 className="text-xl font-bold">3. Pricing and Payment</h2>
        <p>
          All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. Payment
          must be made in full before services are rendered, unless otherwise agreed upon.
        </p>
        <h2 className="text-xl font-bold">4. Refund Policy</h2>
        <p>Refunds are processed according to our refund policy. Please refer to the specific terms for each service type.</p>
        <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
        <p>
          Indiginie shall not be liable for any indirect, incidental, special, or consequential damages arising out of
          or in connection with the use of our services.
        </p>
        <h2 className="text-xl font-bold">6. Contact</h2>
        <p>
          For questions about these Terms &amp; Conditions, please contact us on the <Link href="/contact" className="text-primary underline">Contact page</Link>.
        </p>
        <p className="text-sm text-muted-foreground">Last updated: May 1, 2026</p>
      </main>
    </PublicChrome>
  );
}
