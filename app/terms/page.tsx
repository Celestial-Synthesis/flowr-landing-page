import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "FlowR Terms of Use covering access, accounts, acceptable use, user content, sharing, subscriptions, service changes, liability, and termination.",
  alternates: {
    canonical: "/terms",
  },
};

const sections = [
  {
    title: "1. Agreement scope",
    body: "These Terms govern access to and use of FlowR software and related services.",
  },
  {
    title: "2. Eligibility and account use",
    body: "Where accounts are required, users must provide accurate account information and keep that information reasonably up to date. Users are responsible for activity carried out through their accounts and for safeguarding credentials, access methods, and devices used to access the service.",
  },
  {
    title: "3. Acceptable use",
    body: "Users may not use FlowR in a manner that violates applicable law, infringes third-party rights, records or shares unlawful or unauthorized content, attempts to bypass plan limits or security controls, or reverse engineers, disrupts, or abuses service infrastructure beyond permitted use.",
  },
  {
    title: "4. User content and permissions",
    body: "Users retain rights in content they create or upload, subject to the rights reasonably necessary for FlowR to operate the service. Users are responsible for ensuring they have the necessary authority and permissions to record, store, and share walkthrough content, screenshots, and related materials.",
  },
  {
    title: "5. Sharing and collaboration",
    body: "FlowR may support email sharing, access controls, and permission settings for collaboration. Users are responsible for selecting recipients appropriately, managing access settings, and verifying that shared content is disclosed only to authorized parties.",
  },
  {
    title: "6. Subscription and billing",
    body: "Certain features may require a paid subscription. Billing and subscription workflows may be managed through Stripe or related providers. Plan limits, pricing, and feature availability may vary by subscription tier and may change with notice where required.",
  },
  {
    title: "7. Service changes",
    body: "FlowR may modify, suspend, or discontinue features, functionality, or portions of the service from time to time. Where practical, reasonable notice may be provided before material changes take effect.",
  },
  {
    title: "8. Warranties disclaimer",
    body: 'To the maximum extent permitted by applicable law, FlowR is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, statutory, or otherwise.',
  },
  {
    title: "9. Limitation of liability",
    body: "To the maximum extent permitted by applicable law, FlowR and its operators are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, data, goodwill, or business interruption arising out of or related to use of the service.",
  },
  {
    title: "10. Indemnity",
    body: "Users agree to indemnify and hold the provider harmless against claims, liabilities, damages, losses, and expenses arising from misuse of the service, unlawful content, or violations of these Terms, to the extent permitted by applicable law.",
  },
  {
    title: "11. Termination",
    body: "Access to FlowR may be suspended or terminated where necessary for breach of these Terms, security risk, suspected misuse, legal compliance, or operational protection. Violations of these Terms may result in immediate suspension or permanent loss of access. Where permitted by applicable law, users suspended or terminated for Terms violations may not be eligible for refunds, credits, or prorated reimbursements.",
  },
  {
    title: "12. Governing law and dispute resolution",
    body: "These Terms are governed by the law and dispute resolution framework specified for the applicable contracting entity and service region. Additional governing law, venue, and dispute resolution details may be provided in a separate order form, commercial agreement, or jurisdiction-specific supplement where applicable.",
  },
  {
    title: "13. Contact",
    body: "Questions regarding these Terms may be sent to support-flowr@celestialsynthesis.com.",
  },
];

export default function TermsPage() {
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
          Terms of Use
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-6xl">
          FlowR Terms of Use
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
              <p className="text-base leading-8 text-[#5f5550]">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
