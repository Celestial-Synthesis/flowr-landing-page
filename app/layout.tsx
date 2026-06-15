import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function normalizeMeasurementId(value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) return undefined;
  if (!/^G-[A-Z0-9]+$/.test(normalizedValue)) return undefined;

  return normalizedValue;
}

const googleAnalyticsMeasurementId =
  normalizeMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ??
  normalizeMeasurementId(process.env.NEXT_PUBLIC_GTM_ID);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "FlowR",
  title: {
    default: "FlowR | Guided browser workflow recording and replay",
    template: "%s | FlowR",
  },
  description:
    "FlowR records browser workflows once and replays them as guided walkthroughs with highlights, tooltips, step repair, and team sharing.",
  keywords: [
    "browser workflow recorder",
    "guided walkthroughs",
    "browser extension",
    "screen recording alternative",
    "workflow documentation",
    "customer onboarding",
    "product training",
  ],
  authors: [{ name: "Celestial Synthesis" }],
  creator: "Celestial Synthesis",
  publisher: "Celestial Synthesis",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/flowr48.png", sizes: "48x48", type: "image/png" },
      { url: "/flowr128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: [{ url: "/flowr128.png", sizes: "128x128", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FlowR",
    title: "FlowR | Guided walkthroughs that live on the page",
    description:
      "Record browser workflows once. Replay them with highlights, tooltips, and step-by-step guidance on the real page.",
    images: [
      {
        url: "/brand/flowr-social.png",
        width: 1200,
        height: 627,
        alt: "FlowR browser workflow recorder brand visual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowR | Guided walkthroughs that live on the page",
    description:
      "Record browser workflows once and replay them as guided page-level walkthroughs.",
    images: ["/brand/flowr-social.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#fbf8f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.youtube-nocookie.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-full bg-[#fbf8f5] text-[#201916]">
        <GoogleAnalytics measurementId={googleAnalyticsMeasurementId} />
        {children}
      </body>
    </html>
  );
}
