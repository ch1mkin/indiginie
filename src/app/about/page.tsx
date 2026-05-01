import { PublicChrome } from "@/components/marketing/public-chrome";

export default function AboutPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">About</h1>
        <p className="text-on-surface-variant">
          Indiginie supports NRIs with trusted legal, property, and documentation operations through one secure platform.
        </p>
      </main>
    </PublicChrome>
  );
}
