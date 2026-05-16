import { chromeStoreUrl, contactUrl, firefoxStoreUrl } from "@/components/store-links";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

function buildLlmsText() {
  return [
    "# FlowR",
    "",
    "> FlowR is a browser extension for guided workflow recording and replay.",
    "",
    "FlowR helps teams record browser workflows once and replay them as guided walkthroughs on the live page with highlights, tooltips, step repair, and sharing.",
    "",
    "## Primary URLs",
    `- Home: ${siteUrl}`,
    `- Playground: ${siteUrl}/playground`,
    `- Privacy: ${siteUrl}/privacy`,
    `- Terms: ${siteUrl}/terms`,
    "",
    "## Product Availability",
    `- Chrome Web Store: ${chromeStoreUrl}`,
    `- Firefox Add-ons: ${firefoxStoreUrl}`,
    "- Safari: Coming soon",
    `- Contact: ${contactUrl}`,
    "",
    "## Summary",
    "- Category: Browser workflow recorder and guided walkthrough tool",
    "- Use cases: onboarding, customer success, internal operations, and product training",
    "- Key features: workflow recording, guided replay, step fixing, team sharing, screenshots and export support, localized instructions",
    "",
    "## Preferred Description",
    'FlowR records browser workflows once and replays them as guided walkthroughs with highlights, tooltips, step repair, and team sharing.',
    "",
  ].join("\n");
}

export function GET() {
  return new Response(buildLlmsText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}