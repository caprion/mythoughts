/**
 * Review blog drafts with AI-generated inline critique comments
 * Multi-provider: Gemini (primary) → Groq (fallback)
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import YAML from 'yaml';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// Load environment variables from .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Load review config
interface ReviewConfig {
  max_content_length: number;
  delay_ms: number;
  paragraph_hash_length: number;
  prompt: string;
}

const CONFIG_PATH = './config/review.yaml';
const config = YAML.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as ReviewConfig;

const CONTENT_DIR = './content';
const MAX_CONTENT_LENGTH = config.max_content_length;
const DELAY_MS = config.delay_ms;
const HASH_LENGTH = config.paragraph_hash_length;
const PROMPT = config.prompt;

// CLI flags
const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const ALL_DRAFTS = process.argv.includes('--all-drafts');
const SHOW_PROMPT = process.argv.includes('--show-prompt');

// Parse --file flag for specific file
const fileArgIndex = process.argv.indexOf('--file');
const SPECIFIC_FILE = fileArgIndex !== -1 && process.argv[fileArgIndex + 1]
  ? process.argv[fileArgIndex + 1]
  : null;

interface ReviewComment {
  paragraph_start: string;
  comment: string;
}

interface ReviewResult {
  comments: ReviewComment[];
}

// Provider definitions
type ProviderName = 'gemini' | 'groq';

interface ProviderResult {
  success: boolean;
  text?: string;
  error?: string;
  rateLimited?: boolean;
}

// Gemini provider
async function callGemini(content: string): Promise<ProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return { success: false, error: 'GEMINI_API_KEY not configured' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(PROMPT + '\n"""' + content + '\n"""');
    return { success: true, text: result.response.text() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const rateLimited = message.includes('429') || message.includes('quota') || message.includes('rate');
    return { success: false, error: message, rateLimited };
  }
}

// Groq provider
async function callGroq(content: string): Promise<ProviderResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return { success: false, error: 'GROQ_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: PROMPT + '\n"""' + content + '\n"""'
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const rateLimited = response.status === 429;
      const errorText = await response.text();
      return { success: false, error: `${response.status}: ${errorText}`, rateLimited };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    
    if (!text) {
      return { success: false, error: 'Empty response from Groq' };
    }

    return { success: true, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// Provider chain with fallback
const providers: { name: ProviderName; call: (content: string) => Promise<ProviderResult> }[] = [
  { name: 'gemini', call: callGemini },
  { name: 'groq', call: callGroq },
];

async function callWithFallback(content: string): Promise<{ text: string; provider: ProviderName } | null> {
  for (const provider of providers) {
    const result = await provider.call(content);
    
    if (result.success && result.text) {
      return { text: result.text, provider: provider.name };
    }
    
    if (result.rateLimited) {
      console.log(`   ⚠️  ${provider.name} rate limited, trying next...`);
      continue;
    }
    
    if (result.error?.includes('not configured')) {
      // Skip unconfigured providers silently
      continue;
    }
    
    console.log(`   ⚠️  ${provider.name} failed: ${result.error}`);
  }
  
  return null;
}

function parseReviewResponse(text: string): ReviewResult {
  // Clean response - remove markdown code blocks if present
  const cleanedResponse = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  return JSON.parse(cleanedResponse);
}

// Extract paragraphs from markdown content
function extractParagraphs(content: string): Array<{ text: string; hash: string; lineStart: number }> {
  const lines = content.split('\n');
  const paragraphs: Array<{ text: string; hash: string; lineStart: number }> = [];
  let currentParagraph = '';
  let currentLineStart = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      if (currentParagraph) {
        const hashText = currentParagraph.substring(0, HASH_LENGTH);
        paragraphs.push({
          text: currentParagraph,
          hash: hashText,
          lineStart: currentLineStart
        });
        currentParagraph = '';
      }
      continue;
    }
    
    // Start new paragraph
    if (!currentParagraph) {
      currentLineStart = i;
      currentParagraph = trimmed;
    } else {
      currentParagraph += ' ' + trimmed;
    }
  }
  
  // Add last paragraph if exists
  if (currentParagraph) {
    const hashText = currentParagraph.substring(0, HASH_LENGTH);
    paragraphs.push({
      text: currentParagraph,
      hash: hashText,
      lineStart: currentLineStart
    });
  }
  
  return paragraphs;
}

// Check if paragraph already has a comment
function hasExistingComment(content: string, paragraphEndLine: number): boolean {
  const lines = content.split('\n');
  
  // Check next few lines after paragraph for HTML comment
  for (let i = paragraphEndLine + 1; i < Math.min(paragraphEndLine + 3, lines.length); i++) {
    if (lines[i].trim().startsWith('<!-- COMMENT:')) {
      return true;
    }
  }
  
  return false;
}

// Inject comments into markdown content
function injectComments(
  content: string,
  paragraphs: Array<{ text: string; hash: string; lineStart: number }>,
  comments: ReviewComment[],
  force: boolean
): string {
  const lines = content.split('\n');
  const insertions: Array<{ lineIndex: number; comment: string }> = [];
  
  for (const comment of comments) {
    // Find matching paragraph by hash
    const paragraph = paragraphs.find(p => 
      p.hash === comment.paragraph_start.substring(0, HASH_LENGTH)
    );
    
    if (!paragraph) {
      console.log(`   ⚠️  Could not find paragraph for comment: ${comment.paragraph_start.substring(0, 50)}...`);
      continue;
    }
    
    // Find end of paragraph (next empty line or end of content)
    let paragraphEndLine = paragraph.lineStart;
    for (let i = paragraph.lineStart + 1; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        paragraphEndLine = i - 1;
        break;
      }
      paragraphEndLine = i;
    }
    
    // Skip if comment exists and not forced
    if (!force && hasExistingComment(content, paragraphEndLine)) {
      console.log(`   ⏭️  Skipping paragraph (already has comment): ${paragraph.hash.substring(0, 50)}...`);
      continue;
    }
    
    // Format comment
    const commentText = `\n<!-- COMMENT: ${comment.comment} -->`;
    insertions.push({ lineIndex: paragraphEndLine + 1, comment: commentText });
  }
  
  // Sort insertions in reverse order to maintain line indices
  insertions.sort((a, b) => b.lineIndex - a.lineIndex);
  
  // Apply insertions
  for (const insertion of insertions) {
    lines.splice(insertion.lineIndex, 0, insertion.comment);
  }
  
  return lines.join('\n');
}

async function reviewArticle(
  filePath: string,
  force: boolean = false,
  maxRetries: number = 2
): Promise<{ success: boolean; provider?: ProviderName; skipped?: boolean; commentsAdded?: number }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(content);
  
  // Only review drafts
  if (parsed.data.status !== 'draft') {
    return { success: false, skipped: true };
  }
  
  // Build review content including wip_notes
  let reviewContent = `Title: ${parsed.data.title}\n\n`;
  if (parsed.data.wip_notes) {
    reviewContent += `WIP Notes: ${parsed.data.wip_notes}\n\n`;
  }
  reviewContent += `Content:\n${parsed.content}`;
  
  // Truncate if needed
  const truncatedContent = reviewContent.substring(0, MAX_CONTENT_LENGTH);
  
  if (SHOW_PROMPT) {
    console.log('\n' + '='.repeat(80));
    console.log('FULL PROMPT BEING SENT TO LLM:');
    console.log('='.repeat(80));
    console.log(PROMPT + '\n"""' + truncatedContent + '\n"""');
    console.log('='.repeat(80) + '\n');
  }
  
  // Extract paragraphs for hash matching
  const paragraphs = extractParagraphs(parsed.content);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await callWithFallback(truncatedContent);
      
      if (!result) {
        console.error(`   ❌ All providers failed`);
        return { success: false };
      }
      
      const reviewResult = parseReviewResponse(result.text);
      
      if (!reviewResult.comments || reviewResult.comments.length === 0) {
        console.log(`   ✨ No critique needed - draft is strong`);
        return { success: true, provider: result.provider, commentsAdded: 0 };
      }
      
      // Inject comments into content
      const updatedContent = injectComments(parsed.content, paragraphs, reviewResult.comments, force);
      
      // Count actually added comments
      const commentsAdded = reviewResult.comments.length;
      
      if (DRY_RUN) {
        console.log(`   🔍 [DRY RUN] Would add ${commentsAdded} comment(s):\n`);
        reviewResult.comments.forEach((comment, idx) => {
          const preview = comment.paragraph_start.substring(0, 60);
          console.log(`   ${idx + 1}. Paragraph: "${preview}..."`);
          console.log(`      Comment: ${comment.comment}\n`);
        });
        return { success: true, provider: result.provider, commentsAdded };
      }
      
      // Write back to file
      const updatedFile = matter.stringify(updatedContent, parsed.data);
      fs.writeFileSync(filePath, updatedFile);
      
      return { success: true, provider: result.provider, commentsAdded };
      
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`   ⚠️  Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Failed after ${maxRetries} attempts: ${message}`);
        return { success: false };
      }
    }
  }
  
  return { success: false };
}

async function main() {
  console.log('📝 Blog Draft Review\n');
  
  let filesToReview: string[] = [];
  
  if (SPECIFIC_FILE) {
    // Review specific file
    const fullPath = SPECIFIC_FILE.startsWith(CONTENT_DIR) 
      ? SPECIFIC_FILE 
      : path.join(CONTENT_DIR, SPECIFIC_FILE);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${fullPath}`);
      process.exit(1);
    }
    
    filesToReview = [fullPath];
  } else if (ALL_DRAFTS) {
    // Review all drafts
    const files = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .map(f => path.join(CONTENT_DIR, f));
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const parsed = matter(content);
      if (parsed.data.status === 'draft') {
        filesToReview.push(file);
      }
    }
  } else {
    console.log('Usage:');
    console.log('  npm run review -- --file <filename>          Review specific file');
    console.log('  npm run review -- --all-drafts               Review all drafts');
    console.log('');
    console.log('Options:');
    console.log('  --force         Re-review paragraphs with existing comments');
    console.log('  --dry-run       Preview without writing changes');
    console.log('  --show-prompt   Display the full prompt sent to LLM');
    process.exit(0);
  }
  
  if (filesToReview.length === 0) {
    console.log('📭 No draft files to review');
    return;
  }
  
  console.log(`Found ${filesToReview.length} file(s) to review\n`);
  
  let reviewed = 0;
  let skipped = 0;
  let failed = 0;
  let totalComments = 0;
  
  for (const [index, file] of filesToReview.entries()) {
    const fileName = path.basename(file);
    console.log(`[${index + 1}/${filesToReview.length}] ${fileName}`);
    
    const result = await reviewArticle(file, FORCE);
    
    if (result.skipped) {
      console.log(`   ⏭️  Skipped (not a draft)`);
      skipped++;
    } else if (result.success) {
      console.log(`   ✅ Reviewed with ${result.provider} - ${result.commentsAdded} comment(s) added`);
      reviewed++;
      totalComments += result.commentsAdded || 0;
    } else {
      failed++;
    }
    
    // Rate limiting delay between requests
    if (index < filesToReview.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Reviewed: ${reviewed}`);
  console.log(`   💬 Comments added: ${totalComments}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
}

main().catch(console.error);
