import { PublicChrome } from "@/components/marketing/public-chrome";

export default function DisclaimerPage() {
  return (
    <PublicChrome>
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <h1 className="text-4xl font-black tracking-tight">Disclaimer</h1>

        <h2 className="text-xl font-bold">1. General Information</h2>
        <p>
          The information provided on this website is for general informational purposes only. While we strive to keep
          the information up to date and correct, we make no representations or warranties of any kind, express or
          implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the
          website or the information, products, services, or related graphics contained on the website for any purpose.
        </p>

        <h2 className="text-xl font-bold">2. Service Limitations</h2>
        <p>
          Indiginie NRI Solutions LLP provides support services and assistance. We act as an intermediary and
          facilitator. We do not guarantee specific outcomes, approvals, or results from government agencies or third
          parties. All timelines and outcomes are subject to external factors beyond our control.
        </p>

        <h2 className="text-xl font-bold">3. Legal and Financial Advice</h2>
        <p>
          The information on this website does not constitute legal, financial, or professional advice. For specific
          legal or financial matters, please consult with qualified professionals. We are not responsible for any
          decisions made based on information provided on this website.
        </p>

        <h2 className="text-xl font-bold">4. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We have no control over the nature, content, and
          availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse
          the views expressed within them.
        </p>

        <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
        <p>
          In no event will Indiginie NRI Solutions LLP be liable for any loss or damage including without limitation,
          indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or
          profits arising out of, or in connection with, the use of this website or our services.
        </p>

        <h2 className="text-xl font-bold">6. Changes to Services</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior
          notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance
          of services.
        </p>
      </main>
    </PublicChrome>
  );
}
