import { init, tx, id } from '@instantdb/admin';
import fs from 'fs';
import path from 'path';

// Initialize Instant Admin SDK
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
});

interface ArticleItem {
  id: string;
  funnyheadline1?: string;
  funnyheadline2?: string;
  funnyheadline3?: string;
  [key: string]: any;
}

async function loadHeadlineItems(filePath: string) {
  try {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const articles: ArticleItem[] = JSON.parse(fileContent);
    
    console.log(`Loading ${articles.length} articles...`);
    
    // Prepare transactions for all headline items
    const transactions: any[] = [];
    
    for (const article of articles) {
      // Add funnyheadline1 if it exists
      if (article.funnyheadline1) {
        transactions.push(
          tx.headlineItems[id()].update({
            text: article.funnyheadline1
          }).link({
            author: article.id
          })
        );
      }
      
      // Add funnyheadline2 if it exists
      if (article.funnyheadline2) {
        transactions.push(
          tx.headlineItems[id()].update({
            text: article.funnyheadline2
          }).link({
            author: article.id
          })
        );
      }
      
      // Add funnyheadline3 if it exists
      if (article.funnyheadline3) {
        transactions.push(
          tx.headlineItems[id()].update({
            text: article.funnyheadline3
          }).link({
            author: article.id
          })
        );
      }
    }
    
    console.log(`Creating ${transactions.length} headline items...`);
    
    // Execute all transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
      console.log('✅ Successfully created all headline items!');
    } else {
      console.log('⚠️  No headline items to create');
    }
    
  } catch (error) {
    console.error('❌ Error loading headline items:', error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: bun run dev/initItems.ts <path-to-json-file>');
  process.exit(1);
}

const jsonFilePath = path.resolve(args[0]);
if (!fs.existsSync(jsonFilePath)) {
  console.error(`File not found: ${jsonFilePath}`);
  process.exit(1);
}

// Load the headline items
loadHeadlineItems(jsonFilePath);