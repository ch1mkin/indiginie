import { PublicChrome } from "@/components/marketing/public-chrome";

export default function KnowledgePage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Knowledge</h1>
        <p className="text-on-surface-variant">
          Insights, checklists, and practical guides for NRIs managing India-side services and compliance workflows.
        </p>
      </main>
    </PublicChrome>
  );
}
