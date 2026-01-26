/**
 * Build AI Lab index from hidden content files
 * Generates ai-lab-index.json for private brainstorms page
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = './content';
const PUBLIC_DIR = './public';
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'ai-lab-index.json');

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  content: string;
  status?: string;
  visibility?: string;
  wip_notes?: string;
}

interface AILabIndex {
  articles: Article[];
  total: number;
  generated_at: string;
}

function extractExcerpt(content: string, maxLength: number = 200): string {
  const plain = content
    .replace(/^#+\s+.+$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.+?\]\(.+?\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/>\s+.+/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function main() {
  console.log('🔬 Building AI Lab index...\n');
  
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content directory found');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ articles: [], total: 0, generated_at: new Date().toISOString() }));
    return;
  }
  
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  const articles: Article[] = [];
  
  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content);
    
    // Only include hidden articles
    if (parsed.data.visibility !== 'hidden') {
      continue;
    }
    
    const slug = file.replace('.md', '');
    const tags = parsed.data.tags || [];
    
    let dateStr = parsed.data.date || '';
    if (dateStr && typeof dateStr !== 'string') {
      dateStr = dateStr.toISOString().split('T')[0];
    }
    
    articles.push({
      slug,
      title: parsed.data.title || 'Untitled',
      excerpt: extractExcerpt(parsed.content),
      date: dateStr,
      tags,
      content: parsed.content.substring(0, 50000),
      status: parsed.data.status,
      visibility: parsed.data.visibility,
      wip_notes: parsed.data.wip_notes,
    });
    
    console.log(`🔒 ${slug}`);
  }
  
  // Sort by date (newest first)
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  
  const index: AILabIndex = {
    articles,
    total: articles.length,
    generated_at: new Date().toISOString(),
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Hidden articles: ${articles.length}`);
  console.log(`   Index size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
  console.log(`\n✅ Saved to ${OUTPUT_FILE}`);
}

main();
