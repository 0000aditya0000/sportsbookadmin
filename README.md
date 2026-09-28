# Meridian Super Admin

Operations console for a sportsbook platform. Phase 1 is the design system, authenticated shell, and a development dashboard. Later modules are routed but not implemented.

The browser talks only to this app's API routes. Those routes are a stand-in for the normalized backend. They read development fixtures. They do not call a third-party provider.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `SESSION_SECRET` to at least 32 characters.

Open `http://localhost:3000`. In development, the sign-in screen shows the fixture email, password, and 2FA code. Those credentials are not a production account.

## Checks

```bash
npm run test
npm run lint
npx tsc --noEmit
```
