# FlowR Landing Page

A Next.js App Router landing page for FlowR, the browser extension for recording browser workflows and replaying them as live guided walkthroughs.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react icons

## Development

```bash
npm run dev
```

Open http://localhost:3000 to view the site.

## Verification

```bash
npm run lint
npm run build
```

## Launch Notes

The current launch-domain placeholder is `https://flowr.celestialsynthesis.com`. Update it before production in:

- `app/layout.tsx`
- `app/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`

Primary extension CTAs currently point to:

- Chrome Web Store: https://chromewebstore.google.com/detail/flowr-website-recorder/kajjcogpdapfeigbkcaoeihljpihjlie
- Firefox Add-ons: https://addons.mozilla.org/en-US/firefox/addon/flowr-website-recorder/

Safari is presented as coming soon.

## Content Sources

Product positioning, FAQ, and pricing tiers are based on the existing FlowR product page plus the nearby product repo at `../flowr`, especially:

- `../flowr/docs/demo-video-script.md`
- `../flowr/docs/subscription-limits.md`
- `../flowr/public/manifest.json`
- `../flowr/website-handoff/brand/flowr-linkedin-post.*`
