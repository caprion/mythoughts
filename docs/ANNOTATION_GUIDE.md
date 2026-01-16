# Annotation Guide

Add personal notes, highlights, and insights directly in your markdown articles using callout syntax.

## Syntax

```markdown
> [!type] Your annotation text here
```

## Available Types

| Type | Icon | Use For |
|------|------|---------|
| `highlight` | ✨ | Important passages worth remembering |
| `note` | 📝 | General personal notes |
| `question` | ❓ | Things to explore or research further |
| `insight` | 💡 | Connections to other ideas, personal realizations |
| `warning` | ⚠️ | Disagreements, cautions, things to be skeptical of |
| `tip` | 💡 | Actionable advice to implement |

## Examples

### Highlight a key passage
```markdown
> [!highlight] This is the core insight of the entire article.
```

### Add a personal note
```markdown
> [!note] Reminds me of the Pareto principle - 80/20 applies here too.
```

### Mark something to explore
```markdown
> [!question] How does this relate to Kahneman's System 1/System 2?
```

### Record a personal insight
```markdown
> [!insight] This connects to Munger's latticework - collecting many imperfect tools beats having one "perfect" tool.
```

### Flag a disagreement
```markdown
> [!warning] The author oversimplifies here. Real-world constraints often make this impractical.
```

### Note actionable advice
```markdown
> [!tip] Start a decision journal to apply this immediately.
```

## Multi-line Annotations

For longer notes, continue on the next lines with `>`:

```markdown
> [!insight] This is a longer annotation that spans
> multiple lines. Each line needs to start with `>`
> to remain part of the callout block.
```

## Quick Copy Templates

```markdown
> [!highlight] 

> [!note] 

> [!question] 

> [!insight] 

> [!warning] 

> [!tip] 
```

## Tips

1. Place annotations **after** the passage they refer to
2. Keep annotations concise - a sentence or two
3. Use `insight` for connections between articles
4. Use `question` to create a reading backlog
5. Annotations are version-controlled with git
