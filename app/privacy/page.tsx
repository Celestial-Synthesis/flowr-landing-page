import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "FlowR Privacy Policy covering recording content, account data, billing, analytics, storage, retention, security, and user rights.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    title: "1. Who we are",
    body: [
      "FlowR provides a browser extension for recording and replaying guided website walkthroughs.",
      "Contact: support-flowr@celestialsynthesis.com",
    ],
  },
  {
    title: "2. Data we process",
    subsections: [
      {
        title: "a) Recording content",
        body: "When a user actively records a walkthrough, FlowR may process and store step metadata such as action type and timestamp, URLs relevant to recorded steps, selector metadata used for replay, instruction text entered by the user, and optional screenshot content where screenshot capture is enabled.",
      },
      {
        title: "b) Account and sharing data",
        body: "If users create an account or sign in, FlowR may process account information such as email address and account identifier. If users share recordings, FlowR may also process recipient email addresses and permission settings.",
      },
      {
        title: "c) Billing/subscription data",
        body: "Subscription and billing workflows may involve payment-related metadata, subscription status, and processor records generated through Stripe.",
      },
      {
        title: "d) Analytics data",
        body: "Some deployments may enable product analytics events, subject to applicable sanitization, redaction, and configuration controls.",
      },
    ],
  },
  {
    title: "3. Storage model",
    body: [
      "FlowR is designed with a local-first model, which means recordings may be stored locally in browser extension storage. Where cloud sync is available and enabled for signed-in users, recordings and related screenshot artifacts may also be synchronized to cloud services.",
    ],
  },
  {
    title: "4. Legal bases (EU/UK users)",
    body: [
      "For users in the EU or UK, processing may rely on one or more legal bases depending on the relevant feature or service context, including contract performance for service delivery, legitimate interests for security and reliability, consent for optional analytics or feature toggles where applicable, and legal obligations relating to billing or compliance records.",
    ],
  },
  {
    title: "5. Data sharing and processors",
    body: [
      "FlowR may rely on service providers and subprocessors to support authentication, storage, billing, analytics, and communications. These may include Supabase for authentication, database, and storage services; Stripe for billing and subscription workflows; Amplitude for analytics where enabled; and email delivery providers used for sharing notifications.",
    ],
  },
  {
    title: "6. Data retention",
    body: [
      "Retention periods depend on feature usage, account status, and applicable legal or operational requirements. Content stored locally generally remains available until the user deletes it or uninstalls the extension. Cloud-synced content may remain until the user deletes the data, the account is removed, or an applicable retention period expires. Billing records may be retained for longer where required by law.",
    ],
  },
  {
    title: "7. Security",
    body: [
      "Reasonable technical and organizational measures may be applied to protect personal data and product content. No system or transmission method can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "8. User rights",
    body: [
      "Depending on the applicable jurisdiction, users may have rights to access, correct, delete, export, or restrict certain processing of their information.",
      "For requests: support-flowr@celestialsynthesis.com",
    ],
  },
  {
    title: "9. International transfers",
    body: [
      "Where information is processed across jurisdictions, appropriate safeguards should be applied in accordance with applicable law.",
    ],
  },
  {
    title: "10. Children",
    body: [
      "FlowR is not intended for children below the applicable age of digital consent.",
    ],
  },
  {
    title: "11. Changes",
    body: [
      "This policy may be updated from time to time. Material changes should be reflected by updating the effective date shown on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[#fbf8f5] text-[#201916]">
      <header className="border-b border-[#eadfd8] bg-white">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7a263f]"
          >
            <Image
              src="/flowr128.png"
              alt="FlowR"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-lg font-semibold">FlowR</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-[#7a263f] transition hover:text-[#681f35]"
          >
            Back to home
          </Link>
        </nav>
      </header>

      <article className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
          Privacy Policy
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
          FlowR Privacy Policy
        </h1>
        <p className="mt-5 text-base font-medium text-[#675f59]">
          Last updated: 19 March 2026
        </p>

        <div className="mt-12 space-y-10 rounded-lg border border-[#eadfd8] bg-white p-6 shadow-sm sm:p-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-normal text-[#201916]">
                {section.title}
              </h2>
              {section.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-8 text-[#5f5550]"
                >
                  {paragraph}
                </p>
              ))}
              {section.subsections?.map((subsection) => (
                <div key={subsection.title} className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#201916]">
                    {subsection.title}
                  </h3>
                  <p className="text-base leading-8 text-[#5f5550]">
                    {subsection.body}
                  </p>
                </div>
              ))}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
