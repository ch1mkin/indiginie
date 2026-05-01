import { PublicChrome } from "@/components/marketing/public-chrome";

export default function RefundPolicyPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Refund Policy</h1>

        <h2 className="text-xl font-bold">1. Refund Eligibility</h2>
        <p>Refunds may be available under the following circumstances:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Service cancellation before work has commenced</li>
          <li>Service not delivered as per agreed terms</li>
          <li>Duplicate payment made in error</li>
          <li>Technical errors resulting in incorrect charges</li>
        </ul>

        <h2 className="text-xl font-bold">2. Refund Process</h2>
        <p>To request a refund:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Contact our support team at support@indiginie.com or call +91 80915 41477</li>
          <li>Provide your order number and reason for refund</li>
          <li>Our team will review your request within 2-3 business days</li>
          <li>If approved, refund will be processed within 5-7 business days</li>
        </ul>

        <h2 className="text-xl font-bold">3. Refund Timeline</h2>
        <p>
          Refunds will be credited to the original payment method within 5-7 business days after approval. The exact
          timeline may vary depending on your bank or payment provider.
        </p>

        <h2 className="text-xl font-bold">4. Non-Refundable Services</h2>
        <p>The following services are non-refundable once work has commenced:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Completed documentation services</li>
          <li>Government liaison services where applications have been submitted</li>
          <li>Travel bookings and reservations</li>
          <li>Event management services after event date</li>
        </ul>

        <h2 className="text-xl font-bold">5. Partial Refunds</h2>
        <p>
          In cases where partial work has been completed, refunds will be calculated based on the work completed and
          materials used. Administrative fees may apply.
        </p>
      </main>
    </PublicChrome>
  );
}
