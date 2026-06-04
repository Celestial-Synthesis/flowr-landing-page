"use client";

import { useEffect } from "react";
import { pushAnalyticsEvent } from "@/lib/analytics";

const ctaSelector = "[data-flowr-cta]";
const firstTouchStorageKey = "flowr-attribution:first";
const latestTouchStorageKey = "flowr-attribution:latest";
const attributionParamNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
] as const;

type AttributionParams = Partial<
  Record<(typeof attributionParamNames)[number], string>
>;

function normalizeText(value: string | null | undefined) {
  const normalized = value?.replace(/\s+/g, " ").trim();

  return normalized || undefined;
}

function getAttribute(element: Element, attribute: string) {
  return element.getAttribute(attribute) || undefined;
}

function getAttributionFromUrl(): AttributionParams {
  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionParams = {};

  attributionParamNames.forEach((name) => {
    const value = params.get(name)?.trim();
    if (value) attribution[name] = value;
  });

  return attribution;
}

function readStoredAttribution(key: string): AttributionParams | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return undefined;

    return parsed as AttributionParams;
  } catch {
    return undefined;
  }
}

function writeStoredAttribution(
  key: string,
  attribution: AttributionParams,
  overwrite: boolean,
) {
  try {
    if (!overwrite && window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, JSON.stringify(attribution));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function syncAttribution() {
  const currentAttribution = getAttributionFromUrl();

  if (Object.keys(currentAttribution).length === 0) return;

  writeStoredAttribution(firstTouchStorageKey, currentAttribution, false);
  writeStoredAttribution(latestTouchStorageKey, currentAttribution, true);
}

function findAnchor(element: Element) {
  if (element instanceof HTMLAnchorElement) return element;

  return element.closest("a");
}

function isPlainPrimaryClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function shouldDelayNavigation(event: MouseEvent, anchor: HTMLAnchorElement | null) {
  if (!anchor || event.defaultPrevented) return false;
  if (!isPlainPrimaryClick(event)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  return Boolean(anchor.href);
}

function sendOutboundConversionEvent(url?: string) {
  if (typeof window.gtag !== "function") {
    if (typeof url === "string") window.location.assign(url);
    return;
  }

  const callback = () => {
    if (typeof url === "string") {
      window.location.assign(url);
    }
  };

  window.gtag("event", "conversion_event_outbound_click", {
    event_callback: callback,
    event_timeout: 2000,
  });
}

export function GtmCtaTracker() {
  useEffect(() => {
    syncAttribution();

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const ctaElement = event.target.closest<HTMLElement>(ctaSelector);
      if (!ctaElement) return;

      const anchor = findAnchor(ctaElement);
      const shouldHoldNavigation = shouldDelayNavigation(event, anchor);

      if (shouldHoldNavigation) event.preventDefault();

      const currentAttribution = getAttributionFromUrl();
      pushAnalyticsEvent("flowr_cta_click", {
        cta_id: ctaElement.id || undefined,
        cta_name: getAttribute(ctaElement, "data-flowr-cta"),
        cta_location: getAttribute(ctaElement, "data-flowr-cta-location"),
        cta_destination:
          getAttribute(ctaElement, "data-flowr-cta-destination") ||
          anchor?.href,
        cta_store:
          getAttribute(ctaElement, "data-flowr-cta-store") ||
          getAttribute(ctaElement, "data-flowr-browser-store"),
        cta_unavailable: getAttribute(ctaElement, "data-flowr-cta-unavailable"),
        cta_text: normalizeText(ctaElement.textContent),
        link_url: anchor?.href,
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title,
        page_referrer: document.referrer || undefined,
        attribution_current: currentAttribution,
        attribution_first: readStoredAttribution(firstTouchStorageKey),
        attribution_latest: readStoredAttribution(latestTouchStorageKey),
      });

      sendOutboundConversionEvent(shouldHoldNavigation ? anchor?.href : undefined);
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
