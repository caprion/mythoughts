mythoughts - Project Setup Plan
Context
This is a new personal blog project, forked from the TimelessInsights codebase. The goal is to reuse the infrastructure while creating a distinct site for original writing.

Key Decision: Separate repo, same tech stack. Can consolidate into monorepo later if duplication becomes painful.

Site Identity
Attribute	TimelessInsights (source)	mythoughts (new)
Purpose	Curated wisdom from others	Original thinking/writing
Content	Scraped & enriched articles	Directly authored markdown
Tone	Library, timeless	Workbench, evolving
Topics	Mental models, decision-making	PM × Tech, personal journey
Update frequency	Batch processing	1+ posts/week, quick notes welcome
Step-by-Step Setup
Phase 1: Clone & Clean (10 mins)
Copy the folder

Remove scraping artifacts

Delete: input folder
Delete: scrape.ts
Delete: convert-urls.ts
Delete: extractors.yaml
Clear existing content

Reset git

Phase 2: Rebrand (15 mins)
Update site.yaml

Update package.json

Change name to mythoughts
Remove unused scripts (scrape, convert)
Update Header.tsx

Change title to "mythoughts"
Optional: Adjust colors in tailwind.config.js or index.css

Phase 3: Configure Enrichment (10 mins)
Update enrich.yaml:

Phase 4: Markdown Template
Create content/_template.md:

Phase 5: Deploy to Cloudflare (10 mins)
Push to GitHub
Cloudflare Pages → Connect repo
Build command: npm run build:local
Build output: dist
Add env vars: GEMINI_API_KEY, GROQ_API_KEY
Add custom domain
Workflow
Quick Note:

With AI enrichment:

File Structure (After Cleanup)
Annotation Syntax
Commands
Command	Purpose
npm run dev	Local dev server
npm run build:local	Build index + site
npm run enrich -- --files X.md	AI-enrich specific post
npm run preview	Preview build
Copy this into the new project and start a fresh chat there with this as context.