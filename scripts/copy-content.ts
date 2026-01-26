/**
 * Copy markdown content files to public directory for deployment
 * These files are deployed but not committed to git
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './content';
const PUBLIC_CONTENT_DIR = './public/content';

function main() {
  console.log('📄 Copying content files to public...\n');
  
  // Create public/content directory if it doesn't exist
  if (!fs.existsSync(PUBLIC_CONTENT_DIR)) {
    fs.mkdirSync(PUBLIC_CONTENT_DIR, { recursive: true });
    console.log(`📁 Created ${PUBLIC_CONTENT_DIR}`);
  }
  
  // Get all markdown files except template
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));
  
  let copied = 0;
  
  for (const file of files) {
    const sourcePath = path.join(CONTENT_DIR, file);
    const destPath = path.join(PUBLIC_CONTENT_DIR, file);
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✅ ${file}`);
    copied++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Copied: ${copied} file(s)`);
  console.log(`   Destination: ${PUBLIC_CONTENT_DIR}`);
  console.log(`\n💡 Note: ${PUBLIC_CONTENT_DIR} is gitignored but will be deployed`);
}

main();
