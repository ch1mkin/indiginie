import { PublicChrome } from "@/components/marketing/public-chrome";

export default function ContactPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Contact Us</h1>
        <p className="text-on-surface-variant">
          Reach out for support, refunds, service consultations, or account help.
        </p>
        <div className="rounded-lg border bg-white p-6">
          <p>
            <span className="font-semibold">Email:</span> support@indiginie.com
          </p>
          <p className="mt-2">
            <span className="font-semibold">Phone:</span> +91 80915 41477
          </p>
        </div>
      </main>
    </PublicChrome>
  );
}
