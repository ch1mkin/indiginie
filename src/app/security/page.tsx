import { PublicChrome } from "@/components/marketing/public-chrome";

export default function SecurityPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Security</h1>
        <p className="text-on-surface-variant">
          We maintain layered access controls, secure file handling, and monitoring to protect client operations and
          data. Sensitive workflows are guarded with role-based access and operational logging.
        </p>
      </main>
    </PublicChrome>
  );
}
