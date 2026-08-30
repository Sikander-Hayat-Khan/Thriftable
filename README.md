# Thriftable — Pre-Loved Luxury & Archival Apparel

Pre-loved premium, sold online. Physical outlets came first — this is the web storefront and portal powered by Next.js and AI semantic search.

- 🌐 **Live Production URL**: [https://thriftable.vercel.app](https://thriftable.vercel.app)
- 📦 **GitHub Repository**: [https://github.com/Sikander-Hayat-Khan/Thriftable.git](https://github.com/Sikander-Hayat-Khan/Thriftable.git)

---

## Deliverable Documentation Files

- 📄 [**PROJECT_BRIEF.md**](./PROJECT_BRIEF.md) — Problem statement, target audience, and rationale.
- ⚙️ [**SETUP_AND_ARCHITECTURE.md**](./SETUP_AND_ARCHITECTURE.md) — Quickstart run instructions and system architecture.
- 🧠 [**AI_INTEGRATION.md**](./AI_INTEGRATION.md) — LLM integration, prompt design, and search query scoring.
- 🚀 [**DEPLOYMENT_AND_OPERATIONS.md**](./DEPLOYMENT_AND_OPERATIONS.md) — FE-11 deployment checklist, fail-safe error states, and rollback plan.
- 📝 [**REFLECTION.md**](./REFLECTION.md) — Engineering challenges, lessons learned, and future enhancements.

---

## Stack

- **Framework**: Next.js 16 (App Router), React 19, JavaScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Database & Backend**: Supabase Postgres (`@supabase/supabase-js`, `@supabase/ssr`)
- **AI Inference**: Groq SDK (`llama-3.3-70b-versatile`)
- **Deployment**: Vercel Serverless Platform with continuous integration

## Run Locally

```bash
git clone https://github.com/Sikander-Hayat-Khan/Thriftable.git
cd Thriftable
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

## Structure

```
app/
  page.js                    landing page & hero drops
  health/                    health-check page (fetches live, shows status)
  (customer)/                customer portal route group
    dashboard/ shop/ shop/[id]/ wishlist/ cart/ checkout/
    orders/ orders/[id]/return/ loyalty/ reviews/new/ support/
  (admin)/admin/              admin portal route group
    dashboard/ inventory/ inventory/[id]/edit/ drops/
    orders/ customers/ customers/[id]/ reviews/ analytics/ cms/ settings/
components/
  nav.js                     top navigation & mobile drawer
  search/ai-search-bar.js    AI search bar with real-time suggestion dropdown
  cart/                      slide-over cart & optimistic state
```

---

## AI Natural Language Search Architecture

### How It Works
Customers can search the catalogue using conversational natural language descriptions (e.g., *"vintage oversized black leather jacket under $100"* or *"warm earth-tone baggy knit sweater"*).

1. **Input Submission**: `AiSearchBar` client component captures natural language query and dispatches to `POST /api/search/ai`.
2. **LLM Attribute Extraction**: The server-side route handler calls Groq API (`llama-3.3-70b-versatile`) with `temperature: 0` and `response_format: { type: "json_object" }` to extract structured JSON (category, gender, size, condition, color, material, brand, price constraints, and descriptive keywords).
3. **Sanitization & Whitelist Validation**: Sanitizes extracted attributes against strict enum whitelists.
4. **Semantic Relevance Scoring**: `buildProductQuery` computes multi-attribute match scores against the Supabase `products` table and catalogue data.
5. **Fallback Safety**: If Groq extraction times out (8s limit) or returns malformed data, the system automatically runs multi-term keyword search against `name`, `description`, and `category` so the user never hits a dead end.

---

## Known Limitations & Future Improvements

- **Current Limitation**: LLM search relies on text metadata rather than direct image pixel embeddings.
- **Planned Improvement**: Introduce vector embeddings with Supabase `pgvector` (CLIP / OpenAI embeddings) for visual similarity matching and image drag-and-drop search.
- **Planned Improvement**: Implement Edge Redis caching (Upstash) to cache recurring LLM search extractions with zero latency and zero repeated API cost.

