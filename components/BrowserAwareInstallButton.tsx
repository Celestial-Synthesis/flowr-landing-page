"use client";

import { useSyncExternalStore } from "react";
import { ArrowRight, Clock3, MonitorSmartphone, Puzzle } from "lucide-react";
import { chromeStoreUrl, contactUrl, firefoxStoreUrl } from "./store-links";

type BrowserStore = "chrome" | "firefox" | "safari";
type BrowserEnvironment =
  | "chrome-desktop"
  | "firefox-android"
  | "firefox-desktop"
  | "mobile-unsupported"
  | "safari-desktop";

type BrowserAwareInstallButtonProps = {
  className?: string;
  label?: string;
  showDetectedStore?: boolean;
  storeMode?: "detected" | "alternate";
  storeNameConnector?: "on" | "for";
  trackingLocation?: string;
  trackingName?: string;
  unsupportedMobileMode?: "message" | "hide";
  variant?: "primary" | "secondary";
};

function detectBrowserStore(userAgent: string): BrowserStore {
  if (/firefox|fxios/i.test(userAgent)) {
    return "firefox";
  }

  if (
    /safari/i.test(userAgent) &&
    !/chrome|chromium|crios|edg|opr|opera|fxios/i.test(userAgent)
  ) {
    return "safari";
  }

  return "chrome";
}

function detectBrowserEnvironment(userAgent: string): BrowserEnvironment {
  const store = detectBrowserStore(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

  if (isAndroid && store === "firefox") {
    return "firefox-android";
  }

  if (isMobile) {
    return "mobile-unsupported";
  }

  if (store === "firefox") {
    return "firefox-desktop";
  }

  if (store === "safari") {
    return "safari-desktop";
  }

  return "chrome-desktop";
}

function getStoreFromEnvironment(
  environment: BrowserEnvironment,
): BrowserStore {
  if (environment === "firefox-android" || environment === "firefox-desktop") {
    return "firefox";
  }

  if (environment === "safari-desktop") {
    return "safari";
  }

  return "chrome";
}

function getStoreDetails(store: BrowserStore) {
  if (store === "firefox") {
    return {
      href: firefoxStoreUrl,
      storeLabel: "Firefox",
      ariaLabel: "Install FlowR from Mozilla Add-ons for Firefox",
      unavailable: false,
    };
  }

  if (store === "safari") {
    return {
      href: contactUrl,
      storeLabel: "Safari coming soon",
      ariaLabel: "Safari support is coming soon for FlowR",
      unavailable: true,
    };
  }

  return {
    href: chromeStoreUrl,
    storeLabel: "Chrome",
    ariaLabel: "Install FlowR from the Chrome Web Store",
    unavailable: false,
  };
}

function getAlternateStore(store: BrowserStore): BrowserStore {
  return store === "firefox" ? "chrome" : "firefox";
}

function subscribeToBrowserStore() {
  return () => {};
}

function getBrowserEnvironmentSnapshot(): BrowserEnvironment {
  return detectBrowserEnvironment(window.navigator.userAgent);
}

function getServerBrowserEnvironmentSnapshot(): BrowserEnvironment {
  return "chrome-desktop";
}

export function BrowserAwareInstallButton({
  className = "",
  label = "Install free",
  showDetectedStore = false,
  storeMode = "detected",
  storeNameConnector = "on",
  trackingLocation = "browser_aware_install",
  trackingName = "install_extension",
  unsupportedMobileMode = "message",
  variant = "primary",
}: BrowserAwareInstallButtonProps) {
  const browserEnvironment = useSyncExternalStore(
    subscribeToBrowserStore,
    getBrowserEnvironmentSnapshot,
    getServerBrowserEnvironmentSnapshot,
  );

  const detectedStore = getStoreFromEnvironment(browserEnvironment);
  const store =
    storeMode === "alternate" && browserEnvironment !== "firefox-android"
      ? getAlternateStore(detectedStore)
      : detectedStore;
  const details = getStoreDetails(store);
  const visualClass =
    variant === "primary"
      ? "bg-[#7a263f] text-white hover:bg-[#681f35] focus-visible:outline-[#7a263f]"
      : "border border-[#7a263f]/20 bg-white text-[#512238] hover:border-[#7a263f]/40 hover:bg-[#fff8f6] focus-visible:outline-[#7a263f]";
  const unsupportedMobileClass =
    "border border-[#d59632]/35 bg-[#fff7ea] text-[#6f4a12] focus-visible:outline-[#d59632]";
  const text = details.unavailable
    ? "Safari coming soon"
    : showDetectedStore
      ? `${label} ${storeNameConnector} ${details.storeLabel}`
      : label;
  const Icon = details.unavailable ? Clock3 : Puzzle;

  if (browserEnvironment === "mobile-unsupported") {
    if (unsupportedMobileMode === "hide") {
      return null;
    }

    return (
      <span
        aria-label="FlowR is only supported on Android Firefox and desktop browsers"
        data-flowr-browser-environment={browserEnvironment}
        data-flowr-browser-store={store}
        className={`flowr-browser-aware-install-button flowr-browser-aware-install-button--unsupported inline-flex min-h-10 w-full items-start justify-start gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${unsupportedMobileClass} ${className}`}
      >
        <MonitorSmartphone
          aria-hidden="true"
          className="flowr-browser-aware-install-button-icon mt-0.5 size-4 shrink-0"
        />
        <span className="flowr-browser-aware-install-button-copy min-w-0 flex-1 break-words">
          Only supported on Android Firefox and desktop
        </span>
      </span>
    );
  }

  return (
    <a
      href={details.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={details.ariaLabel}
      data-flowr-cta={trackingName}
      data-flowr-cta-location={trackingLocation}
      data-flowr-cta-store={store}
      data-flowr-cta-destination={details.href}
      data-flowr-cta-unavailable={details.unavailable ? "true" : undefined}
      data-flowr-browser-environment={browserEnvironment}
      data-flowr-browser-store={store}
      className={`flowr-browser-aware-install-button flowr-browser-aware-install-button--available inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4 ${visualClass} ${className}`}
    >
      <Icon
        aria-hidden="true"
        className="flowr-browser-aware-install-button-icon size-4"
      />
      {text}
      <ArrowRight
        aria-hidden="true"
        className="flowr-browser-aware-install-button-arrow size-4"
      />
    </a>
  );
}
