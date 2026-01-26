# mythoughts

A personal blog for ideas, reflections, and lessons learned.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Writing

1. Create a new post in `content/`:
   ```bash
   cp content/_template.md content/my-post.md
   ```

2. Set visibility in frontmatter:
   - `visibility: public` (default) - appears in browse/search
   - `visibility: hidden` - only accessible via direct URL and `/ai-lab`

3. Optional - enrich with AI metadata:
   ```bash
   npm run enrich -- --files my-post.md
   ```

4. Optional - review draft with inline critique:
   ```bash
   npm run review -- --file my-post.md --dry-run
   ```

5. Build search index:
   ```bash
   npm run build:index
   ```

## Hidden Articles (AI Lab)

Articles with `visibility: hidden` are:
- ✅ Accessible via direct URL (`/article/slug`)
- ✅ Listed at `/ai-lab` (bookmark this URL)
- ❌ Excluded from public search index
- ❌ Not shown in Browse or Home pages

Use for personal brainstorms, AI conversations, or draft explorations.

### Import from External Thoughts

Import brainstorms from `C:\Learn\os\thoughts`:

```bash
# Import all files
npm run import

# Import specific file
npm run import -- --file 2025-01-26-my-brainstorm.md

# Preview without writing
npm run import -- --dry-run

# Force overwrite existing
npm run import -- --force
```

The script:
- Removes date prefix from filename (e.g., `2025-01-26-topic.md` → `topic.md`)
- Extracts date from filename and adds to frontmatter
- Sets `visibility: hidden` automatically
- Preserves existing frontmatter (title, tags, etc.)

## Deploy

Push to GitHub → Cloudflare Pages auto-deploys.

**Build settings:**
- Build command: `npm run build`
- Output directory: `site/dist`
- Environment variables: `GEMINI_API_KEY`, `GROQ_API_KEY`

**Content Architecture:**
- Source: `content/*.md` (committed to git)
- Build: Copies to `public/content/` (gitignored)
- Indexes: Truncated content (5KB) for search/browse
- Article view: Fetches full markdown from `/content/{slug}.md`
- Deployment: Both indexes and full .md files deployed to Cloudflare

**Why this approach:**
- Lighter index files (better performance for search/browse)
- Full content available for article rendering
- Cleaner git history (no 50KB+ JSON files)
- Scalable for long articles

## Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build site for production |
| `npm run build:index` | Build search indexes (public + AI Lab) |
| `npm run preview` | Preview production build locally |
| `npm run enrich` | AI-enrich articles with metadata |
| `npm run review` | AI critique drafts with inline comments |
| `npm run import` | Import brainstorms from external directory |
