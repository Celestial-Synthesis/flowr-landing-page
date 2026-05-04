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

Static export output is written to `out/`.

## Netlify Deployment

This project is configured for Netlify as a static Next.js export.

- Build command: `npm run build`
- Publish directory: `out`

The Netlify config lives in `netlify.toml`.

Because the site is exported statically, `next/image` is configured as unoptimized in `next.config.ts`.

## Launch Notes

The current launch-domain placeholder is `https://flowr.celestialsynthesis.com`. Set `NEXT_PUBLIC_SITE_URL` before production or update the fallback in `lib/site.ts`.

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
