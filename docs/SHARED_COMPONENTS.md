# Shared Components

This document lists components that are shared between **mythoughts** and **TimelessInsights**. These components maintain consistent branding and functionality across both sites.

## Components to Copy

### 1. SisterSite Component
**File:** `site/src/components/SisterSite.tsx`

A cross-navigation component that links between the two sites.

```tsx
import { ExternalLink } from 'lucide-react';

interface SisterSiteProps {
  label: string;
  url: string;
}

export default function SisterSite({ label, url }: SisterSiteProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors rounded-full border border-gray-200 hover:border-purple-300 hover:bg-purple-50"
    >
      <span className="font-medium">{label}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
```

**Usage in Header:**
```tsx
// mythoughts header
<SisterSite label="What I Read" url="https://timelessinsights.pages.dev/" />

// TimelessInsights header  
<SisterSite label="My Thoughts" url="https://mythoughts.pages.dev/" />
```

---

### 2. Footer Component
**File:** `site/src/components/Footer.tsx`

Social links and copyright footer.

```tsx
import { Mail, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="mailto:st.garg19@gmail.com"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm font-medium">Email</span>
            </a>
            
            <a
              href="https://www.linkedin.com/in/stgarg/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            
            <a
              href="https://x.com/gargsumit"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm font-medium">X</span>
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sumit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Integration:**
1. Import in each page: `import Footer from '../components/Footer';`
2. Add before closing `</div>`: `<Footer />`
3. For proper sticky footer, ensure parent div has `min-h-screen` and `flex flex-col` classes (if needed)

---

## Setup Instructions for TimelessInsights

### Step 1: Copy Components
```bash
# In TimelessInsights repo
mkdir -p site/src/components
# Copy the two files manually or via Git
```

### Step 2: Update Header
Add SisterSite to your Header component:
```tsx
import SisterSite from './SisterSite';

// Inside Header nav
<SisterSite label="My Thoughts" url="https://mythoughts.pages.dev/" />
```

### Step 3: Add Footer to Pages
Import and add Footer to:
- Home.tsx
- Browse.tsx  
- Article.tsx
- NotFound.tsx

### Step 4: Verify Dependencies
Ensure `lucide-react` is installed:
```bash
npm install lucide-react
```

---

## Design System

Both sites use the same design tokens:

**Colors:**
- Primary: `purple-700`, `purple-600`, `purple-300`
- Hover: `purple-800`, `purple-700`
- Text: `gray-900`, `gray-600`, `gray-500`
- Borders: `gray-200`, `gray-100`
- Backgrounds: `gray-50`, `white`, `purple-50`

**Typography:**
- Font: `font-serif` for headings, default sans-serif for body
- Sizes: `text-sm`, `text-lg`, `text-2xl`, `text-3xl`, `text-4xl`

**Spacing:**
- Gaps: `gap-2`, `gap-4`, `gap-6`
- Padding: `px-3`, `px-4`, `py-1.5`, `py-8`

---

## Maintenance

When updating shared components:
1. Make changes in one repo
2. Copy updated component to the other repo
3. Test on both sites
4. Deploy both sites to ensure consistency
