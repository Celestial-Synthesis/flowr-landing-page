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

## Playground SDK

The playground uses the local recorder SDK from the sibling FlowR repo instead of installing unpublished internal packages from npm.

```bash
npm run sync:sdk:local
```

The sync command builds `@flowr/sdk-recorder-local` from `../flowr`, packs the bundled internal source packages (`@flowr/sdk-core`, `@flowr/sdk-ui`, and `@flowr/sdk-recorder-kernel`) for provenance, copies the resulting tarballs to `vendor/flowr/sdk-packages/`, and refreshes the browser runtime at `public/vendor/flowr/sdk-recorder-local/`. The expanded `public/vendor/` runtime is generated and ignored; `dev` and `build` hydrate it from the repo-local tarballs automatically. The landing app loads `/vendor/flowr/sdk-recorder-local/index.js` at runtime.

## Netlify Deployment

This project is configured for Netlify as a static Next.js export.

- Build command: `npm run build`
- Publish directory: `out`

The Netlify config lives in `netlify.toml`.

Because the site is exported statically, `next/image` is configured as unoptimized in `next.config.ts`.

## Launch Notes

The current launch-domain placeholder is `https://flowr.celestialsynthesis.com`. Set `NEXT_PUBLIC_SITE_URL` before production or update the fallback in `lib/site.ts`.

The `/playground` official recordings library loads public SDK recordings from FlowR with a browser-safe publishable key. Set one of these before building:

```bash
NEXT_PUBLIC_FLOWR_PUBLISHABLE_TOKEN=flowr_pk_...
# or
NEXT_PUBLIC_FLOWR_API_KEY=flowr_pk_...
```

The backend defaults to `https://rfeiamxssoajeabwyean.supabase.co`; override it with `NEXT_PUBLIC_FLOWR_API_BASE_URL` for another FlowR environment.

Google Analytics 4 is loaded directly when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set before building:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-VZSMD9PHLT
```

For compatibility, the app also accepts `NEXT_PUBLIC_GTM_ID` only when it contains a GA measurement ID that starts with `G-`, but `NEXT_PUBLIC_GA_MEASUREMENT_ID` is the supported variable.

Important marketing CTAs emit a `flowr_cta_click` analytics event with CTA name, location, destination, store, page URL, referrer, and URL attribution params. The demo video also emits `flowr_video_start`, `flowr_video_progress`, and `flowr_video_complete`.

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
