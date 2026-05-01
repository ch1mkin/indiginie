import { PublicChrome } from "@/components/marketing/public-chrome";
import { createClient } from "@/lib/supabase/server";

export default async function FaqPage() {
  const supabase = await createClient();
  const { data: faqs } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });

  return (
    <PublicChrome>
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h1>
        <div className="space-y-3">
          {(faqs ?? []).map((faq) => (
            <details key={faq.id} className="rounded-lg border bg-white p-4">
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
          {(faqs ?? []).length === 0 ? <p className="text-sm text-muted-foreground">No FAQs published yet.</p> : null}
        </div>
      </main>
    </PublicChrome>
  );
}
