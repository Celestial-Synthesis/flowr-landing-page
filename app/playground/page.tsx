import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./playground.css";
import PlaygroundShell from "@/components/playground/PlaygroundShell";
import { playgroundSdkEntryUrl } from "@/lib/playground-sdk-runtime";

export const metadata: Metadata = {
  title: "Try FlowR — Playground",
  description:
    "Experience FlowR in your browser — no extension required. Record interactions on live practice surfaces, replay them instantly, and explore the official recording library.",
  alternates: {
    canonical: `${siteUrl}/playground`,
  },
  openGraph: {
    title: "Try FlowR — Playground",
    description:
      "Record and replay browser interactions right here. No sign-up, no install needed.",
    url: `${siteUrl}/playground`,
  },
};

export default function PlaygroundPage() {
  return (
    <>
      <link
        rel="modulepreload"
        href={playgroundSdkEntryUrl}
      />
      <main id="flowr-playground-main" aria-label="FlowR playground">
        <PlaygroundShell />
      </main>
    </>
  );
}
