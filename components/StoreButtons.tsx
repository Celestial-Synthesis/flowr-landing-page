import { ArrowUpRight, Clock3, Globe, Puzzle, Store } from "lucide-react";
import { chromeStoreUrl, contactUrl, firefoxStoreUrl } from "./store-links";

export { chromeStoreUrl, contactUrl, firefoxStoreUrl } from "./store-links";

type StoreButtonsProps = {
  className?: string;
  compact?: boolean;
  showSafari?: boolean;
  stretch?: boolean;
};

export function StoreButtons({
  className = "",
  compact = false,
  showSafari = true,
  stretch = false,
}: StoreButtonsProps) {
  const sizeClass = compact
    ? "min-h-11 px-4 text-sm"
    : "min-h-12 px-5 text-base";
  const stretchClass = stretch ? "w-full sm:flex-1" : "";

  return (
    <div
      className={`flowr-store-buttons flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}
    >
      <a
        href={chromeStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install FlowR from the Chrome Web Store"
        className={`flowr-store-button flowr-store-button--chrome inline-flex items-center justify-center gap-2 rounded-md bg-[#7a263f] font-semibold text-white shadow-sm shadow-[#7a263f]/20 transition hover:bg-[#681f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f] ${sizeClass} ${stretchClass}`}
      >
        <Puzzle aria-hidden="true" className="flowr-store-button-icon size-4" />
        Start free on Chrome
        <ArrowUpRight
          aria-hidden="true"
          className="flowr-store-button-arrow size-4"
        />
      </a>
      <a
        href={firefoxStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Install FlowR from Mozilla Add-ons for Firefox"
        className={`flowr-store-button flowr-store-button--firefox inline-flex items-center justify-center gap-2 rounded-md border border-[#7a263f]/20 bg-white font-semibold text-[#512238] shadow-sm transition hover:border-[#7a263f]/40 hover:bg-[#fff8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f] ${sizeClass} ${stretchClass}`}
      >
        <Globe aria-hidden="true" className="flowr-store-button-icon size-4" />
        Start free on Firefox
        <ArrowUpRight
          aria-hidden="true"
          className="flowr-store-button-arrow size-4"
        />
      </a>
      {showSafari ? (
        <span
          aria-label="Safari support is coming soon"
          className={`flowr-store-button flowr-store-button--safari inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-[#d59632]/40 bg-[#fff7ea] font-medium text-[#6f4a12] ${sizeClass} ${stretchClass}`}
        >
          <Clock3
            aria-hidden="true"
            className="flowr-store-button-icon size-4"
          />
          Safari coming soon
        </span>
      ) : null}
      <span className="flowr-store-buttons-status sr-only">
        FlowR is available from the Chrome Web Store and Mozilla Add-ons.
      </span>
    </div>
  );
}

export function ContactButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={contactUrl}
      className={`flowr-contact-button inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#7a263f]/20 bg-white px-4 text-sm font-semibold text-[#512238] transition hover:border-[#7a263f]/40 hover:bg-[#fff8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a263f] ${className}`}
    >
      <Store aria-hidden="true" className="flowr-contact-button-icon size-4" />
      Get a custom solution
      <ArrowUpRight
        aria-hidden="true"
        className="flowr-contact-button-arrow size-4"
      />
    </a>
  );
}
