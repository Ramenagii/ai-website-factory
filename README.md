# AI Website Factory

An MVP for the literal blueprint: enter a URL, analyze structural patterns, generate an original site plan, produce a Next.js project manifest, and expose a daily automation endpoint.

## What is included

- `POST /api/analyze`: URL input to full factory run.
- `POST /api/export`: returns generated project files as JSON.
- `GET /api/daily`: cron-ready daily run.
- Local heuristic analyzer with extension points for Firecrawl, OpenAI, Supabase, GitHub, and Vercel.
- A Next.js dashboard for operating the MVP.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Next implementation steps

1. Replace the heuristic fetcher in `lib/pipeline.ts` with Firecrawl or Playwright screenshots.
2. Add OpenAI structured generation for `createSitePlan`.
3. Persist runs to Supabase using the schema in `supabase/schema.sql`.
4. Write generated files into a GitHub repo.
5. Trigger Vercel deployment after QA passes.
