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

2. Optional - enrich with AI metadata:
   ```bash
   npm run enrich -- --files my-post.md
   ```

3. Build search index:
   ```bash
   npm run build:index
   ```

## Deploy

Push to GitHub → Cloudflare Pages auto-deploys.

**Build settings:**
- Build command: `npm run build`
- Output directory: `site/dist`
- Environment variables: `GEMINI_API_KEY`, `GROQ_API_KEY`



npm run build
git add .; git commit -m "Add frontmatter to scale-and-resilience.md draft article"; git push
✅ Done! The draft article now has proper frontmatter with status tracking and has been pushed to git.