import {
  BadgeCheck,
  Building2,
  Check,
  Infinity,
  LockKeyhole,
  Rocket,
} from "lucide-react";
import { BrowserAwareInstallButton } from "./BrowserAwareInstallButton";
import {
  chromeStoreUrl,
  enterpriseContactUrl,
  firefoxStoreUrl,
} from "./store-links";

const plans = [
  {
    name: "Free",
    eyebrow: "For local walkthroughs",
    price: "$0",
    description:
      "Capture a handful of repeatable workflows and replay them directly in the browser.",
    icon: BadgeCheck,
    cta: "Start free on Chrome",
    href: chromeStoreUrl,
    secondaryCta: "Use Firefox instead",
    secondaryHref: firefoxStoreUrl,
    features: [
      "5 saved recordings",
      "40 uploaded screenshots",
      "2 share recipients per recording",
      "View-only sharing",
      "2 received shares",
      "3 active logins",
    ],
  },
  {
    name: "Pro",
    eyebrow: "For teams keeping guides current",
    price: "Flexible",
    description:
      "Higher limits and stronger editing controls for teams building a reusable workflow library.",
    icon: Rocket,
    cta: "Start free, upgrade when ready",
    href: chromeStoreUrl,
    secondaryCta: "Install for Firefox",
    secondaryHref: firefoxStoreUrl,
    featured: true,
    features: [
      "Configurable recording limits",
      "More screenshots and recipients",
      "Editable shared walkthroughs",
      "Import and export support",
      "Conditional steps",
      "Expanded active-login limits",
    ],
  },
  {
    name: "Enterprise",
    eyebrow: "For embedded workflow guidance",
    price: "Custom",
    description:
      "Unlimited usage, SDK drop-in support for record and replay, public walkthrough visibility, and onboarding for larger rollout needs.",
    icon: Building2,
    cta: "Email us about enterprise",
    href: enterpriseContactUrl,
    secondaryCta: "Review store extension",
    secondaryHref: chromeStoreUrl,
    features: [
      "Unlimited recordings",
      "Unlimited screenshots",
      "Unlimited share recipients",
      "SDK drop-in for embedded record and replay",
      "Public recording visibility",
      "Custom onboarding and support",
    ],
  },
];

function elementId(prefix: string, value: string) {
  return `${prefix}-${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="flowr-pricing-section bg-[#f7f1ed] py-24 sm:py-28"
    >
      <div
        id="flowr-pricing-container"
        className="flowr-pricing-container mx-auto w-full max-w-7xl px-5 sm:px-8"
      >
        <div
          id="flowr-pricing-header"
          className="flowr-pricing-header max-w-3xl"
        >
          <p className="flowr-section-eyebrow flowr-pricing-eyebrow text-sm font-semibold uppercase tracking-[0.14em] text-[#7a263f]">
            Pricing
          </p>
          <h2
            id="flowr-pricing-title"
            className="flowr-pricing-title mt-4 text-3xl font-semibold tracking-normal text-[#201916] sm:text-5xl"
          >
            Start with the extension. Scale into a workflow library.
          </h2>
          <p
            id="flowr-pricing-description"
            className="flowr-pricing-description mt-5 text-lg leading-8 text-[#675f59]"
          >
            FlowR pricing follows the way teams adopt guided replay: record a
            few critical flows, share them with the people who need them, then
            expand into collaboration and embedded guidance when the process
            becomes business-critical.
          </p>
        </div>

        <div
          id="flowr-pricing-grid"
          className="flowr-pricing-grid mt-12 grid gap-5 lg:grid-cols-3"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;
            const trackingLocation = `pricing_${elementId("plan", plan.name)}`;
            return (
              <article
                id={elementId("flowr-pricing-plan", plan.name)}
                key={plan.name}
                className={`flowr-pricing-plan-card rounded-lg border bg-white p-6 shadow-sm ${
                  plan.featured
                    ? "flowr-pricing-plan-card--featured border-[#7a263f] shadow-[#7a263f]/12"
                    : "border-[#e4d9d1]"
                }`}
              >
                <div className="flowr-pricing-plan-header flex items-center justify-between gap-4">
                  <div className="flowr-pricing-plan-heading-block">
                    <p className="flowr-pricing-plan-eyebrow text-sm font-medium text-[#7a263f]">
                      {plan.eyebrow}
                    </p>
                    <h3 className="flowr-pricing-plan-title mt-2 text-2xl font-semibold text-[#201916]">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="flowr-pricing-plan-icon grid size-11 place-items-center rounded-md bg-[#fff3ee] text-[#7a263f]">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                </div>

                <div className="flowr-pricing-plan-price-row mt-7 flex items-end gap-2">
                  <span className="flowr-pricing-plan-price text-4xl font-semibold tracking-normal text-[#201916]">
                    {plan.price}
                  </span>
                  {plan.price === "$0" ? (
                    <span className="flowr-pricing-plan-price-note pb-1 text-sm font-medium text-[#675f59]">
                      forever
                    </span>
                  ) : null}
                </div>

                <p className="flowr-pricing-plan-description mt-5 min-h-20 text-base leading-7 text-[#675f59]">
                  {plan.description}
                </p>

                {plan.name === "Enterprise" ? (
                  <a
                    id="flowr-pricing-enterprise-primary-cta"
                    href={plan.href}
                    target={plan.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      plan.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    data-flowr-cta="pricing_enterprise_contact"
                    data-flowr-cta-location={trackingLocation}
                    data-flowr-cta-destination={plan.href}
                    className="flowr-pricing-plan-primary-cta mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#7a263f]/20 bg-white px-4 text-sm font-semibold text-[#512238] transition hover:border-[#7a263f]/40 hover:bg-[#fff8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
                  >
                    <LockKeyhole aria-hidden="true" className="size-4" />
                    {plan.cta}
                  </a>
                ) : (
                  <BrowserAwareInstallButton
                    className="flowr-pricing-plan-primary-cta mt-7 min-h-11 w-full px-4"
                    label={
                      plan.name === "Free"
                        ? "Start free"
                        : "Start free, upgrade when ready"
                    }
                    showDetectedStore={plan.name === "Free"}
                    trackingLocation={trackingLocation}
                    trackingName={
                      plan.name === "Free"
                        ? "pricing_start_free"
                        : "pricing_start_free_upgrade"
                    }
                    variant={plan.featured ? "primary" : "secondary"}
                  />
                )}
                {plan.name === "Enterprise" ? (
                  <a
                    id="flowr-pricing-enterprise-secondary-cta"
                    href={plan.secondaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-flowr-cta="pricing_enterprise_review_store"
                    data-flowr-cta-location={trackingLocation}
                    data-flowr-cta-store="chrome"
                    data-flowr-cta-destination={plan.secondaryHref}
                    className="flowr-pricing-plan-secondary-cta mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-[#7a263f] transition hover:bg-[#fff3ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f]"
                  >
                    {plan.secondaryCta}
                  </a>
                ) : (
                  <BrowserAwareInstallButton
                    className="flowr-pricing-plan-secondary-cta mt-3 min-h-10 w-full bg-transparent px-4 shadow-none"
                    label="Install"
                    showDetectedStore
                    storeMode="alternate"
                    storeNameConnector="for"
                    trackingLocation={trackingLocation}
                    trackingName="pricing_alternate_install"
                    unsupportedMobileMode="hide"
                    variant="secondary"
                  />
                )}

                <ul className="flowr-pricing-feature-list mt-7 space-y-3 text-sm leading-6 text-[#4b4540]">
                  {plan.features.map((feature) => (
                    <li
                      id={elementId(
                        `flowr-pricing-${plan.name}-feature`,
                        feature,
                      )}
                      key={feature}
                      className="flowr-pricing-feature-item flex gap-3"
                    >
                      {feature.toLowerCase().includes("unlimited") ? (
                        <Infinity
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-[#7a263f]"
                        />
                      ) : (
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-[#7a263f]"
                        />
                      )}
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
