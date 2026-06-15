import Script from "next/script";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

const normalizeMeasurementId = (measurementId: string | undefined) =>
  measurementId?.trim();

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const normalizedMeasurementId = normalizeMeasurementId(measurementId);

  if (!normalizedMeasurementId) return null;

  const encodedMeasurementId = encodeURIComponent(normalizedMeasurementId);

  return (
    <>
      <Script
        id="flowr-ga-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodedMeasurementId}`}
        strategy="lazyOnload"
      />
      <Script id="flowr-ga-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} window.gtag = window.gtag || gtag; window.gtag('js', new Date()); window.gtag('config', '${normalizedMeasurementId}');`}
      </Script>
    </>
  );
}
