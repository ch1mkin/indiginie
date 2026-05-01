import { PublicChrome } from "@/components/marketing/public-chrome";

export default function PrivacyPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <h2 className="text-xl font-bold">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Name, email address, and phone number</li>
          <li>Payment information (processed securely through Razorpay)</li>
          <li>Service requests and order history</li>
          <li>Communication preferences</li>
        </ul>
        <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>
        <h2 className="text-xl font-bold">3. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. All data is encrypted and
          stored securely using industry-standard practices.
        </p>
        <h2 className="text-xl font-bold">4. Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share information only with
          service providers who assist us in operating our platform, subject to strict confidentiality agreements.
        </p>
        <h2 className="text-xl font-bold">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc space-y-1 pl-6 text-on-surface-variant">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </main>
    </PublicChrome>
  );
}
