/**
 * Import brainstorms from external thoughts directory
 * Applies proper frontmatter and sets visibility: hidden for AI Lab
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SOURCE_DIR = 'C:\\Learn\\os\\thoughts';
const DEST_DIR = './content';

// CLI flags
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// Parse --file flag for specific file
const fileArgIndex = process.argv.indexOf('--file');
const SPECIFIC_FILE = fileArgIndex !== -1 && process.argv[fileArgIndex + 1]
  ? process.argv[fileArgIndex + 1]
  : null;

interface ImportStats {
  imported: number;
  skipped: number;
  updated: number;
  errors: number;
}

function normalizeSlug(filename: string): string {
  // Convert "2025-01-26-how-to-actually-produce-ideas.md" -> "how-to-actually-produce-ideas"
  return filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
    .replace(/\.md$/, ''); // Remove .md extension
}

function extractDateFromFilename(filename: string): string | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function ensureProperFrontmatter(content: string, filename: string): string {
  const parsed = matter(content);
  const slug = normalizeSlug(filename);
  const dateFromFilename = extractDateFromFilename(filename);
  
  // Ensure required fields for hidden articles
  const frontmatter = {
    title: parsed.data.title || 'Untitled',
    date: parsed.data.date || dateFromFilename || new Date().toISOString().split('T')[0],
    status: parsed.data.status || 'published',
    visibility: 'hidden', // Always set to hidden for AI Lab
    tags: parsed.data.tags || [],
    source: parsed.data.source || 'brainstorm-with-ai',
    wip_notes: parsed.data.wip_notes || undefined,
  };
  
  // Remove undefined fields
  Object.keys(frontmatter).forEach(key => {
    if (frontmatter[key as keyof typeof frontmatter] === undefined) {
      delete frontmatter[key as keyof typeof frontmatter];
    }
  });
  
  return matter.stringify(parsed.content, frontmatter);
}

function importFile(sourceFile: string, stats: ImportStats): void {
  const filename = path.basename(sourceFile);
  
  // Skip README and non-markdown files
  if (filename.toLowerCase() === 'readme.md' || !filename.endsWith('.md')) {
    console.log(`   ⏭️  ${filename} (skipped - not a content file)`);
    stats.skipped++;
    return;
  }
  
  const slug = normalizeSlug(filename);
  const destFile = path.join(DEST_DIR, `${slug}.md`);
  
  try {
    // Read source file
    const content = fs.readFileSync(sourceFile, 'utf-8');
    
    // Apply proper frontmatter
    const updatedContent = ensureProperFrontmatter(content, filename);
    
    // Check if destination exists
    const exists = fs.existsSync(destFile);
    
    if (exists && !FORCE) {
      console.log(`   ⏭️  ${slug} (already exists - use --force to overwrite)`);
      stats.skipped++;
      return;
    }
    
    if (DRY_RUN) {
      console.log(`   🔍 [DRY RUN] Would ${exists ? 'update' : 'import'}: ${slug}`);
      if (exists) {
        stats.updated++;
      } else {
        stats.imported++;
      }
      return;
    }
    
    // Write to destination
    fs.writeFileSync(destFile, updatedContent);
    
    if (exists) {
      console.log(`   ✅ Updated: ${slug}`);
      stats.updated++;
    } else {
      console.log(`   ✅ Imported: ${slug}`);
      stats.imported++;
    }
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`   ❌ Error importing ${filename}: ${message}`);
    stats.errors++;
  }
}

function main() {
  console.log('📥 Importing Brainstorms\n');
  
  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }
  
  // Ensure destination directory exists
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }
  
  const stats: ImportStats = {
    imported: 0,
    skipped: 0,
    updated: 0,
    errors: 0,
  };
  
  if (SPECIFIC_FILE) {
    // Import specific file
    const sourceFile = path.join(SOURCE_DIR, SPECIFIC_FILE);
    
    if (!fs.existsSync(sourceFile)) {
      console.error(`❌ File not found: ${sourceFile}`);
      process.exit(1);
    }
    
    console.log(`Importing: ${SPECIFIC_FILE}\n`);
    importFile(sourceFile, stats);
    
  } else {
    // Import all markdown files
    const files = fs.readdirSync(SOURCE_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(SOURCE_DIR, f));
    
    if (files.length === 0) {
      console.log('📭 No markdown files found in source directory');
      return;
    }
    
    console.log(`Found ${files.length} file(s) in ${SOURCE_DIR}\n`);
    
    for (const file of files) {
      importFile(file, stats);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   ✅ Imported: ${stats.imported}`);
  console.log(`   🔄 Updated: ${stats.updated}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  console.log(`   ❌ Errors: ${stats.errors}`);
  
  if (!DRY_RUN && (stats.imported > 0 || stats.updated > 0)) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run: npm run build:index');
    console.log('   2. Visit: /ai-lab to see your brainstorms');
  }
}

main();
