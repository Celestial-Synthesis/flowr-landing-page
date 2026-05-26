import Image from "next/image";
import {
  Building2,
  Code2,
  FileText,
  Gauge,
  Keyboard,
  Languages,
  MousePointerClick,
  PanelsTopLeft,
  PlayCircle,
  Route,
  ScreenShare,
  Share2,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { BrowserAwareInstallButton } from "@/components/BrowserAwareInstallButton";
import { Faq, faqItems } from "@/components/Faq";
import { HeroWorkflowScene } from "@/components/HeroWorkflowScene";
import { EnterpriseSdkExamples } from "@/components/EnterpriseSdkExamples";
import { Pricing } from "@/components/Pricing";
import { ScrollRevealController } from "@/components/ScrollRevealController";
import { ScrollReplayIllustration } from "@/components/WorkflowIllustration";
import { siteUrl } from "@/lib/site";
import {
  ContactButton,
  StoreButtons,
  chromeStoreUrl,
  enterpriseContactUrl,
  firefoxStoreUrl,
} from "@/components/StoreButtons";

const capabilities = [
  {
    title: "Capture",
    heading: "Workflow recording",
    body: "Record clicks, inputs, navigation, hover states, scrolls, and keyboard-driven steps while you do the task normally.",
    icon: MousePointerClick,
  },
  {
    title: "Guide",
    heading: "Guided replay",
    body: "Replay the workflow with highlights and contextual instructions attached to the real page elements.",
    icon: PlayCircle,
  },
  {
    title: "Maintain",
    heading: "Step fixing",
    body: "Repair one changed step instead of rerecording the whole walkthrough when an interface shifts.",
    icon: Wrench,
  },
  {
    title: "Share",
    heading: "Team access",
    body: "Share guided workflows with teammates using permission-aware access for view-only or editable handoffs.",
    icon: Share2,
  },
  {
    title: "Document",
    heading: "Screenshot and export support",
    body: "Add supporting screenshots and export walkthrough material when a process needs an offline handoff.",
    icon: FileText,
  },
];

const comparison = [
  {
    label: "Live guidance",
    flowr: "Guides users on the live site, step by step.",
    recording:
      "Shows a video, so users map it back to the live page themselves.",
  },
  {
    label: "Updating after changes",
    flowr: "Fix a step without rebuilding the whole workflow.",
    recording: "Product changes often mean rerecording the demo.",
  },
  {
    label: "Finding the right moment",
    flowr: "Jump directly to the step that needs attention.",
    recording: "Scrub, rewind, and pause to find the useful moment.",
  },
  {
    label: "Instruction languages",
    flowr: "Reuse one workflow with localized instructions.",
    recording: "Often requires separate videos, subtitles, or voiceovers.",
  },
  {
    label: "Team handoff",
    flowr: "Built for repeatable onboarding, support, and training.",
    recording: "Useful for one-off demos, harder to keep current.",
  },
];

const useCases = [
  {
    title: "Product onboarding",
    body: "Guide new users through setup, activation, and recurring product moments without sending them to a static help article.",
    icon: Route,
  },
  {
    title: "Customer success",
    body: "Turn the answer to a repeated question into a replayable walkthrough your team can send again and again.",
    icon: Users,
  },
  {
    title: "Internal operations",
    body: "Document browser-based SOPs with enough context for teammates to complete the work on the real tool.",
    icon: Keyboard,
  },
  {
    title: "Training and support",
    body: "Replace fragile screenshot docs with steps that can be maintained when the product UI changes.",
    icon: ShieldCheck,
  },
];

const enterpriseSdkHighlights = [
  {
    title: "Simple drop-in",
    body: "Add a script tag and a small amount of code to start record and replay flows inside your website or web app.",
    icon: Code2,
  },
  {
    title: "Fits your product",
    body: "Launch FlowR from your own onboarding, support, or training entry points instead of sending users to a separate surface.",
    icon: Building2,
  },
  {
    title: "Enterprise rollout support",
    body: "Get help with SDK onboarding, public walkthrough visibility, and the rollout details that matter once embedded guidance becomes customer-facing.",
    icon: ShieldCheck,
  },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FlowR",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Chrome, Firefox",
  description:
    "FlowR is a browser extension for recording browser workflows and replaying them as guided walkthroughs with element highlights and tooltips.",
  image: `${siteUrl}/brand/flowr-social.png`,
  url: siteUrl,
  downloadUrl: [chromeStoreUrl, firefoxStoreUrl],
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "0",
      priceCurrency: "USD",
      description:
        "Configurable paid tier; exact public pricing to be announced.",
    },
    {
      "@type": "Offer",
      name: "Enterprise",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "0",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
      },
      description:
        "Custom pricing for SDK drop-in access, unlimited usage, and larger rollout needs.",
    },
  ],
  featureList: [
    "Browser workflow recording",
    "Guided replay with highlights and tooltips",
    "Enterprise SDK for embedded record and replay",
    "Step repair",
    "Team sharing",
    "Screenshot and export support",
    "Localized step instructions",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function elementId(prefix: string, value: string) {
  return `${prefix}-${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function ActionIllustration() {
  return (
    <div
      id="flowr-action-illustration"
      aria-hidden="true"
      className="flowr-action-illustration relative overflow-visible rounded-lg border border-[#eadfd8] bg-[#fffaf7] p-5 shadow-xl shadow-[#7a263f]/10"
      data-flowr-action-frame="true"
    >
      <div
        id="flowr-action-browser"
        className="flowr-action-browser rounded-lg border border-[#eadfd8] bg-white p-4"
      >
        <div
          id="flowr-action-toolbar"
          className="flowr-action-toolbar flex items-center justify-between border-b border-[#eadfd8] pb-3"
        >
          <div
            id="flowr-action-window-dots"
            className="flowr-action-window-dots flex items-center gap-2"
          >
            <span className="flowr-action-window-dot flowr-action-window-dot--close size-2.5 rounded-full bg-[#ff7a70]" />
            <span className="flowr-action-window-dot flowr-action-window-dot--minimize size-2.5 rounded-full bg-[#ffc24a]" />
            <span className="flowr-action-window-dot flowr-action-window-dot--zoom size-2.5 rounded-full bg-[#4fc3a1]" />
          </div>
          <div
            id="flowr-action-replay-badge"
            className="flowr-action-replay-badge rounded-md bg-[#f7f1ed] px-3 py-1 text-xs font-medium text-[#675f59]"
          >
            Guided replay
          </div>
        </div>

        <div
          id="flowr-action-canvas"
          className="flowr-action-canvas relative min-h-[360px] pt-5"
        >
          <div
            id="flowr-action-page-card"
            className="flowr-action-page-card rounded-lg border border-[#eadfd8] bg-[#fbf8f5] p-5"
          >
            <div
              id="flowr-action-page-title-line"
              className="flowr-action-page-title-line h-3 w-32 rounded-sm bg-[#d4c2b7]"
            />
            <div
              id="flowr-action-page-subtitle-line"
              className="flowr-action-page-subtitle-line mt-3 h-2 w-52 max-w-full rounded-sm bg-[#eadfd8]"
            />

            <div
              id="flowr-action-target-card"
              className="relative mt-8 max-w-lg rounded-lg border-2 border-[#7a263f] bg-[#fff3ee] p-4 shadow-[0_0_0_6px_rgba(122,38,63,0.11)]"
              data-flowr-action-target="owner-email"
            >
              <p
                id="flowr-action-target-label"
                className="flowr-action-target-label text-xs font-semibold uppercase tracking-[0.12em] text-[#7a263f]"
              >
                Owner email
              </p>
              <div
                id="flowr-action-target-input"
                className="flowr-action-target-input mt-3 flex h-12 items-center rounded-md border border-[#e5c6d1] bg-white px-4 text-sm font-semibold text-[#201916]"
              >
                maya@company.com
                <span className="flowr-action-target-caret ml-1 h-5 w-px bg-[#7a263f]" />
              </div>

              <div
                id="flowr-action-tooltip"
                className="absolute left-4 top-[calc(100%+14px)] z-10 w-[calc(100%-2rem)] max-w-[300px] rounded-lg border border-[#7a263f]/20 bg-white p-4 shadow-xl shadow-[#7a263f]/10 sm:w-[300px]"
                data-flowr-action-tooltip="true"
              >
                <span className="flowr-action-tooltip-arrow absolute -top-2 left-8 size-4 rotate-45 border-l border-t border-[#7a263f]/20 bg-white" />
                <p
                  id="flowr-action-tooltip-step"
                  className="flowr-action-tooltip-step text-xs font-semibold uppercase tracking-[0.14em] text-[#7a263f]"
                >
                  Step 3 of 5
                </p>
                <p
                  id="flowr-action-tooltip-title"
                  className="flowr-action-tooltip-title mt-2 text-sm font-semibold text-[#201916]"
                >
                  Choose the highlighted owner field.
                </p>
                <p
                  id="flowr-action-tooltip-copy"
                  className="flowr-action-tooltip-copy mt-2 text-sm leading-5 text-[#675f59]"
                >
                  The instruction stays beside the live element instead of
                  inside a video player.
                </p>
              </div>

              <div
                id="flowr-action-cursor"
                className="flowr-action-cursor flowr-pointer-cursor absolute left-[58%] top-[55%] z-20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />
      <ScrollRevealController />

      <header
        id="flowr-site-header"
        className="flowr-site-header absolute inset-x-0 top-0 z-20"
      >
        <nav
          id="flowr-site-nav"
          className="flowr-site-nav mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8"
        >
          <a
            id="flowr-site-logo"
            href="#top"
            className="flowr-site-logo flex items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7a263f]"
          >
            <Image
              src="/flowr128.png"
              alt="FlowR"
              width={36}
              height={36}
              priority
              className="flowr-site-logo-mark rounded-md"
            />
            <span className="flowr-site-logo-text text-lg font-semibold text-[#201916]">
              FlowR
            </span>
          </a>
          <div
            id="flowr-site-nav-links"
            className="flowr-site-nav-links hidden items-center gap-6 text-sm font-semibold text-[#5f5550] md:flex"
          >
            <a
              id="flowr-nav-link-features"
              className="flowr-site-nav-link flowr-site-nav-link--features transition hover:text-[#7a263f]"
              href="#features"
            >
              Features
            </a>
            <a
              id="flowr-nav-link-workflow"
              className="flowr-site-nav-link flowr-site-nav-link--workflow transition hover:text-[#7a263f]"
              href="#workflow"
            >
              Replay
            </a>
            <a
              id="flowr-nav-link-pricing"
              className="flowr-site-nav-link flowr-site-nav-link--pricing transition hover:text-[#7a263f]"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              id="flowr-nav-link-faq"
              className="flowr-site-nav-link flowr-site-nav-link--faq transition hover:text-[#7a263f]"
              href="#faq"
            >
              FAQ
            </a>
            <a
              id="flowr-nav-link-playground"
              className="flowr-site-nav-link flowr-site-nav-link--playground transition hover:text-[#7a263f]"
              href="/playground"
              data-flowr-cta="nav_playground"
              data-flowr-cta-location="site_header"
              data-flowr-cta-destination="/playground"
            >
              Playground
            </a>
          </div>
          <div
            id="flowr-site-nav-cta"
            className="flowr-site-nav-cta hidden md:block"
          >
            <BrowserAwareInstallButton
              trackingLocation="site_header"
              trackingName="header_install"
            />
          </div>
        </nav>
      </header>

      <main id="top" className="flowr-page-main bg-[#fbf8f5] text-[#201916]">
        <section
          id="flowr-hero"
          className="flowr-hero-section relative overflow-visible bg-[#fbf8f5] px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32"
        >
          <div
            id="flowr-hero-content"
            className="flowr-hero-content relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center"
          >
            <h1
              id="flowr-hero-title"
              className="flowr-hero-title order-1 mt-7 max-w-4xl text-5xl font-semibold tracking-normal text-[#201916] sm:text-6xl lg:text-7xl"
            >
              Guided walkthroughs that live on the page.
            </h1>
            <HeroWorkflowScene className="order-3 mt-8 md:mt-12" />
            <div
              id="flowr-hero-copy-block"
              className="flowr-hero-copy-block order-2 flex w-full max-w-5xl flex-col items-center"
            >
              <p
                id="flowr-hero-description"
                className="flowr-hero-description mt-7 max-w-2xl text-lg leading-8 text-[#5f5550] sm:text-xl sm:leading-9"
              >
                Record browser workflows once. Replay them with highlights,
                tooltips, and step-by-step guidance on the real page, so teams
                stop translating videos and outdated screenshot docs.
              </p>
              <div
                id="flowr-hero-cta-group"
                className="flowr-hero-cta-group mt-8 flex w-full max-w-xl flex-col items-stretch gap-3"
              >
                <div
                  id="flowr-hero-store-buttons"
                  className="flowr-hero-store-buttons hidden md:block"
                >
                  <StoreButtons
                    className="justify-center"
                    trackingLocation="hero"
                  />
                </div>
                <div
                  id="flowr-hero-mobile-cta"
                  className="flowr-hero-mobile-cta md:hidden"
                >
                  <BrowserAwareInstallButton
                    className="w-full px-4"
                    trackingLocation="hero_mobile"
                    trackingName="hero_install"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="flowr-playground-entry"
          className="flowr-playground-entry-section border-y border-[#eadfd8] bg-white py-10"
        >
          <div
            id="flowr-playground-entry-container"
            className="flowr-playground-entry-container mx-auto grid w-full max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,20rem)] lg:items-center"
          >
            <div className="flowr-playground-entry-copy max-w-3xl">
              <p className="flowr-section-eyebrow flowr-playground-entry-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Try first
              </p>
              <h2
                id="flowr-playground-entry-title"
                className="flowr-playground-entry-title mt-3 text-2xl font-semibold tracking-normal text-[#201916] sm:text-3xl"
              >
                Explore FlowR in a safe playground before adding the extension.
              </h2>
              <p className="flowr-playground-entry-description mt-4 text-base leading-7 text-[#675f59]">
                Record clicks, forms, keyboard steps, scrolls, hovers, and
                screenshots on a practice page, then replay the walkthrough
                immediately. The demo stays in local browser storage.
              </p>
            </div>

            <div className="flowr-playground-entry-actions flex w-full items-center lg:justify-end">
              <a
                id="flowr-playground-entry-link"
                href="/playground"
                data-flowr-cta="open_playground"
                data-flowr-cta-location="playground_entry"
                data-flowr-cta-destination="/playground"
                className="flowr-playground-entry-link inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#7a263f] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#7a263f]/20 transition hover:bg-[#681f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7a263f]"
              >
                <PlayCircle aria-hidden="true" className="size-4" />
                Open playground
              </a>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="flowr-features-section bg-[#fbf8f5] py-24 sm:py-28"
        >
          <div
            id="flowr-features-container"
            className="flowr-features-container mx-auto w-full max-w-7xl px-5 sm:px-8"
          >
            <div
              id="flowr-features-header"
              className="flowr-features-header grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"
            >
              <div
                id="flowr-features-heading-block"
                className="flowr-features-heading-block"
              >
                <p className="flowr-section-eyebrow flowr-features-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                  Core capabilities
                </p>
                <h2
                  id="flowr-features-title"
                  className="flowr-features-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
                >
                  Capture the process, not just the screen.
                </h2>
              </div>
              <p
                id="flowr-features-description"
                className="flowr-features-description text-lg leading-8 text-[#675f59]"
              >
                FlowR stores structured steps and instructions instead of
                producing another passive video. That makes workflows easier to
                replay, easier to update, and easier to hand off to the next
                person.
              </p>
            </div>

            <div
              id="flowr-features-grid"
              className="flowr-features-grid mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5"
            >
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article
                    id={elementId("flowr-capability-card", item.title)}
                    key={item.title}
                    className="flowr-capability-card rounded-lg border border-[#eadfd8] bg-white p-5 shadow-sm"
                  >
                    <div className="flowr-capability-card-header mb-8 flex items-center justify-between">
                      <span className="flowr-capability-card-index text-sm font-semibold text-[#7a263f]">
                        0{index + 1}
                      </span>
                      <div className="flowr-capability-card-icon grid size-10 place-items-center rounded-md bg-[#fff0ea] text-[#7a263f]">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                    </div>
                    <p className="flowr-capability-card-label text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                      {item.title}
                    </p>
                    <h3 className="flowr-capability-card-title mt-2 text-xl font-semibold text-[#201916]">
                      {item.heading}
                    </h3>
                    <p className="flowr-capability-card-copy mt-4 text-sm leading-6 text-[#675f59]">
                      {item.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <ScrollReplayIllustration />

        <section
          id="flowr-comparison"
          className="flowr-comparison-section bg-white py-24 sm:py-28"
        >
          <div
            id="flowr-comparison-container"
            className="flowr-comparison-container mx-auto w-full max-w-7xl px-5 sm:px-8"
          >
            <div
              id="flowr-comparison-header"
              className="flowr-comparison-header max-w-3xl"
            >
              <p className="flowr-section-eyebrow flowr-comparison-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Why guided replay
              </p>
              <h2
                id="flowr-comparison-title"
                className="flowr-comparison-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
              >
                Screen recordings explain what happened. FlowR helps someone do
                it.
              </h2>
            </div>
            <div
              id="flowr-comparison-table-frame"
              className="flowr-comparison-table-frame mt-12 overflow-hidden rounded-lg border border-[#eadfd8]"
            >
              <div
                id="flowr-comparison-mobile-list"
                className="flowr-comparison-mobile-list divide-y divide-[#eadfd8] bg-white md:hidden"
              >
                {comparison.map((row) => (
                  <article
                    id={elementId("flowr-comparison-card", row.label)}
                    key={row.label}
                    className="flowr-comparison-card p-4"
                  >
                    <p className="flowr-comparison-card-need text-sm font-semibold text-[#201916]">
                      {row.label}
                    </p>
                    <div className="flowr-comparison-card-body mt-4 grid gap-3">
                      <div className="flowr-comparison-card-flowr rounded-md bg-[#fffaf7] p-3">
                        <p className="flowr-comparison-card-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a263f]">
                          FlowR
                        </p>
                        <p className="flowr-comparison-card-copy mt-2 text-sm leading-6 text-[#3f4949]">
                          {row.flowr}
                        </p>
                      </div>
                      <div className="flowr-comparison-card-recording rounded-md bg-[#f7f1ed] p-3">
                        <p className="flowr-comparison-card-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#675f59]">
                          Screen recording
                        </p>
                        <p className="flowr-comparison-card-copy mt-2 text-sm leading-6 text-[#675f59]">
                          {row.recording}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <table
                id="flowr-comparison-table"
                className="flowr-comparison-table hidden w-full border-collapse bg-white text-left text-sm md:table"
              >
                <thead className="flowr-comparison-table-head bg-[#f7f1ed] text-[#201916]">
                  <tr>
                    <th
                      scope="col"
                      className="flowr-comparison-heading flowr-comparison-heading--need w-1/4 px-4 py-4 font-semibold sm:px-6"
                    >
                      Need
                    </th>
                    <th
                      scope="col"
                      className="flowr-comparison-heading flowr-comparison-heading--flowr w-1/3 px-4 py-4 font-semibold sm:px-6"
                    >
                      FlowR
                    </th>
                    <th
                      scope="col"
                      className="flowr-comparison-heading flowr-comparison-heading--recording px-4 py-4 font-semibold sm:px-6"
                    >
                      Conventional screen recording
                    </th>
                  </tr>
                </thead>
                <tbody className="flowr-comparison-table-body divide-y divide-[#eadfd8]">
                  {comparison.map((row) => (
                    <tr
                      id={elementId("flowr-comparison-row", row.label)}
                      key={row.label}
                      className="flowr-comparison-row align-top"
                    >
                      <th
                        scope="row"
                        className="flowr-comparison-cell flowr-comparison-cell--need px-4 py-5 font-semibold text-[#201916] sm:px-6"
                      >
                        {row.label}
                      </th>
                      <td className="flowr-comparison-cell flowr-comparison-cell--flowr px-4 py-5 text-[#3f4949] sm:px-6">
                        <span className="flowr-comparison-flowr-copy flex gap-3">
                          {row.flowr}
                        </span>
                      </td>
                      <td className="flowr-comparison-cell flowr-comparison-cell--recording px-4 py-5 text-[#675f59] sm:px-6">
                        {row.recording}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          id="flowr-use-cases"
          className="flowr-use-cases-section bg-[#fbf8f5] py-24 sm:py-28"
        >
          <div
            id="flowr-use-cases-container"
            className="flowr-use-cases-container mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center"
          >
            <div id="flowr-use-cases-copy" className="flowr-use-cases-copy">
              <p className="flowr-section-eyebrow flowr-use-cases-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Built for handoffs
              </p>
              <h2
                id="flowr-use-cases-title"
                className="flowr-use-cases-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
              >
                The people explaining browser work get their time back.
              </h2>
              <p
                id="flowr-use-cases-description"
                className="flowr-use-cases-description mt-5 text-lg leading-8 text-[#675f59]"
              >
                FlowR is for the teams who repeat the same explanation across
                calls, tickets, docs, and onboarding sessions. Record the path
                once, then guide people through it where the work actually
                happens.
              </p>
            </div>
            <div
              id="flowr-use-cases-grid"
              className="flowr-use-cases-grid grid gap-5 sm:grid-cols-2"
            >
              {useCases.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    id={elementId("flowr-use-case-card", item.title)}
                    key={item.title}
                    className="flowr-use-case-card rounded-lg border border-[#eadfd8] bg-white p-6 shadow-sm"
                  >
                    <div className="flowr-use-case-card-icon grid size-11 place-items-center rounded-md bg-[#fff0ea] text-[#7a263f]">
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <h3 className="flowr-use-case-card-title mt-7 text-xl font-semibold text-[#201916]">
                      {item.title}
                    </h3>
                    <p className="flowr-use-case-card-copy mt-3 text-base leading-7 text-[#675f59]">
                      {item.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="flowr-action"
          className="flowr-action-section bg-white py-24 sm:py-28"
        >
          <div
            id="flowr-action-container"
            className="flowr-action-container mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
          >
            <ActionIllustration />
            <div id="flowr-action-copy" className="flowr-action-copy">
              <p className="flowr-section-eyebrow flowr-action-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Designed for action
              </p>
              <h2
                id="flowr-action-title"
                className="flowr-action-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
              >
                Less pausing and replaying. More guidance in context.
              </h2>
              <div
                id="flowr-action-benefit-list"
                className="flowr-action-benefit-list mt-8 grid gap-4"
              >
                {[
                  [
                    PanelsTopLeft,
                    "The instruction panel keeps the workflow visible while the user stays on the page.",
                  ],
                  [
                    Gauge,
                    "Structured steps stay smaller and easier to navigate than full video files.",
                  ],
                  [
                    Languages,
                    "Localized instructions let one workflow serve different teams and audiences.",
                  ],
                  [
                    ScreenShare,
                    "Optional screenshots add context when a handoff needs a lasting artifact.",
                  ],
                ].map(([Icon, text], index) => {
                  const FeatureIcon = Icon;
                  return (
                    <div
                      id={`flowr-action-benefit-${index + 1}`}
                      key={text as string}
                      className="flowr-action-benefit flex gap-4 rounded-lg border border-[#eadfd8] bg-[#fffaf7] p-4"
                    >
                      <div className="flowr-action-benefit-icon grid size-10 shrink-0 place-items-center rounded-md bg-white text-[#7a263f]">
                        <FeatureIcon aria-hidden="true" className="size-5" />
                      </div>
                      <p className="flowr-action-benefit-copy text-base leading-7 text-[#675f59]">
                        {text as string}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="enterprise-sdk"
          className="flowr-enterprise-sdk-section bg-[#fbf8f5] py-20 sm:py-24"
        >
          <div
            id="flowr-enterprise-sdk-container"
            className="flowr-enterprise-sdk-container mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-start lg:gap-10"
          >
            <div
              id="flowr-enterprise-sdk-copy"
              className="flowr-enterprise-sdk-copy"
            >
              <p className="flowr-section-eyebrow flowr-enterprise-sdk-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Enterprise SDK
              </p>
              <h2
                id="flowr-enterprise-sdk-title"
                className="flowr-enterprise-sdk-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
              >
                Drop FlowR into your product with a script tag and a few lines
                of code.
              </h2>
              <p
                id="flowr-enterprise-sdk-description"
                className="flowr-enterprise-sdk-description mt-5 max-w-3xl text-lg leading-8 text-[#675f59]"
              >
                Enterprise teams can embed FlowR directly in their website or
                web app so users can start recording and replay guided flows
                without rebuilding the experience somewhere else.
              </p>

              <div
                id="flowr-enterprise-sdk-highlights"
                className="flowr-enterprise-sdk-highlights mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
              >
                {enterpriseSdkHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      id={elementId(
                        "flowr-enterprise-sdk-highlight",
                        item.title,
                      )}
                      key={item.title}
                      className="flowr-enterprise-sdk-highlight rounded-lg border border-[#eadfd8] bg-white p-4 shadow-sm"
                    >
                      <div className="flowr-enterprise-sdk-highlight-icon grid size-11 place-items-center rounded-md bg-[#fff0ea] text-[#7a263f]">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                      <h3 className="flowr-enterprise-sdk-highlight-title mt-4 text-lg font-semibold text-[#201916]">
                        {item.title}
                      </h3>
                      <p className="flowr-enterprise-sdk-highlight-copy mt-2 text-sm leading-6 text-[#675f59]">
                        {item.body}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div
                id="flowr-enterprise-sdk-actions"
                className="flowr-enterprise-sdk-actions mt-7 flex w-full max-w-lg flex-col gap-3"
              >
                <ContactButton
                  className="w-full"
                  ctaName="enterprise_sdk_contact"
                  href={enterpriseContactUrl}
                  label="Contact us about enterprise"
                  trackingLocation="enterprise_sdk"
                />
                <p className="flowr-enterprise-sdk-action-note text-sm leading-6 text-[#675f59]">
                  Opens an email draft so we can scope the enterprise plan with
                  you.
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <EnterpriseSdkExamples />
            </div>
          </div>
        </section>

        <Pricing />
        <Faq />

        <section
          id="flowr-final-cta"
          className="flowr-final-cta-section bg-[#fff3ee] py-20 text-[#201916] sm:py-24"
        >
          <div
            id="flowr-final-cta-container"
            className="flowr-final-cta-container mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-end"
          >
            <div
              id="flowr-final-cta-copy"
              className="flowr-final-cta-copy max-w-3xl"
            >
              <p className="flowr-section-eyebrow flowr-final-cta-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
                Start free
              </p>
              <h2
                id="flowr-final-cta-title"
                className="flowr-final-cta-title mt-4 text-3xl font-semibold tracking-normal sm:text-5xl"
              >
                Put one real workflow into FlowR and see what changes.
              </h2>
              <p
                id="flowr-final-cta-description"
                className="flowr-final-cta-description mt-5 text-lg leading-8 text-[#675f59]"
              >
                Capture the steps once, guide the next person with context, and
                keep the workflow usable as your browser tools change.
              </p>
            </div>
            <div
              id="flowr-final-cta-actions"
              className="flowr-final-cta-actions flex w-full max-w-2xl flex-col gap-3"
            >
              <StoreButtons
                compact
                showSafari={false}
                stretch
                className="w-full"
                trackingLocation="final_cta"
              />
              <ContactButton className="w-full" trackingLocation="final_cta" />
            </div>
          </div>
        </section>
      </main>

      <footer
        id="flowr-site-footer"
        className="flowr-site-footer border-t border-[#eadfd8] bg-white py-10 text-sm text-[#675f59]"
      >
        <div
          id="flowr-site-footer-container"
          className="flowr-site-footer-container mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between"
        >
          <div
            id="flowr-site-footer-brand"
            className="flowr-site-footer-brand flex items-center gap-3"
          >
            <Image
              src="/flowr128.png"
              alt="FlowR"
              width={32}
              height={32}
              className="flowr-site-footer-logo rounded-md"
            />
            <span className="flowr-site-footer-brand-text">
              FlowR by Celestial Synthesis
            </span>
          </div>
          <div
            id="flowr-site-footer-links"
            className="flowr-site-footer-links flex flex-wrap gap-5"
          >
            <a
              id="flowr-footer-link-chrome"
              className="flowr-site-footer-link flowr-site-footer-link--chrome transition hover:text-[#7a263f]"
              href={chromeStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-flowr-cta="footer_chrome_store"
              data-flowr-cta-location="site_footer"
              data-flowr-cta-store="chrome"
              data-flowr-cta-destination={chromeStoreUrl}
            >
              Chrome Web Store
            </a>
            <a
              id="flowr-footer-link-firefox"
              className="flowr-site-footer-link flowr-site-footer-link--firefox transition hover:text-[#7a263f]"
              href={firefoxStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-flowr-cta="footer_firefox_store"
              data-flowr-cta-location="site_footer"
              data-flowr-cta-store="firefox"
              data-flowr-cta-destination={firefoxStoreUrl}
            >
              Firefox Add-ons
            </a>
            <a
              id="flowr-footer-link-privacy"
              className="flowr-site-footer-link flowr-site-footer-link--privacy transition hover:text-[#7a263f]"
              href="/privacy"
            >
              Privacy
            </a>
            <a
              id="flowr-footer-link-terms"
              className="flowr-site-footer-link flowr-site-footer-link--terms transition hover:text-[#7a263f]"
              href="/terms"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
