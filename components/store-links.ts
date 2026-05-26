export const chromeStoreUrl =
  "https://chromewebstore.google.com/detail/flowr-website-recorder/kajjcogpdapfeigbkcaoeihljpihjlie";
export const firefoxStoreUrl =
  "https://addons.mozilla.org/en-US/firefox/addon/flowr-website-recorder/";
export const supportEmail = "support-flowr@celestialsynthesis.com";
export const contactUrl = "https://celestialsynthesis.com/contact";

function buildMailtoUrl(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const enterpriseContactUrl = buildMailtoUrl(
  supportEmail,
  "FlowR enterprise SDK inquiry",
  [
    "Hi FlowR team,",
    "",
    "We want to learn more about the enterprise plan and SDK drop-in for our website or web app.",
    "",
    "Website or web app:",
    "Use case:",
    "Estimated users or internal seats:",
  ].join("\n"),
);
