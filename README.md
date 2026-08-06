# Thriftable

Pre-loved premium, sold online. Physical outlets came first — this is the web storefront and portal.

## Stack

- Next.js (App Router), JavaScript — no TypeScript
- Tailwind CSS
- Deployed on Vercel, preview builds on every push

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

```
app/
  page.js                    landing page
  health/                    health-check page (fetches live, shows status)
  (customer)/                customer portal route group
    dashboard/ shop/ shop/[id]/ wishlist/ cart/ checkout/
    orders/ orders/[id]/return/ loyalty/ reviews/new/ support/
  (admin)/admin/              admin portal route group
    dashboard/ inventory/ inventory/[id]/edit/ drops/
    orders/ customers/ customers/[id]/ reviews/ analytics/ cms/ settings/
components/
  nav.js                     top nav shell
  placeholder.js             shared placeholder shell used by every unbuilt screen
```

Route groups `(customer)` and `(admin)` don't affect the URL — they're there so
auth/role gating can be added to each group's `layout.js` without touching every page.

## Status: Phase 1 (Foundations)

Every screen from the spec exists as a routed placeholder. Nothing is wired to
real data or auth yet.

**Still open:**
- Auth provider (customer + admin gating)
- Backend / database
- AI integration (capstone requirement, not yet scoped)

**Done:**
- All routes scaffolded, zero build errors
- Tailwind + base design tokens (`app/globals.css`)
- Health-check page (`/health`) — live fetch, shows healthy/unhealthy state
- No secrets in repo, `.env*` gitignored
