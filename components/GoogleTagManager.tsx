import Script from "next/script";

type GoogleTagManagerProps = {
  gtmId?: string;
};

const normalizeGtmId = (gtmId: string | undefined) => gtmId?.trim();

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const normalizedGtmId = normalizeGtmId(gtmId);

  if (!normalizedGtmId) return null;

  const encodedGtmId = encodeURIComponent(normalizedGtmId);

  return (
    <>
      <Script id="flowr-gtm-data-layer" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "gtm.js", "gtm.start": new Date().getTime() });`}
      </Script>
      <Script
        id="flowr-gtm-script"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodedGtmId}`}
        strategy="afterInteractive"
      />
    </>
  );
}

export function GoogleTagManagerNoScript({ gtmId }: GoogleTagManagerProps) {
  const normalizedGtmId = normalizeGtmId(gtmId);

  if (!normalizedGtmId) return null;

  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
          normalizedGtmId,
        )}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
