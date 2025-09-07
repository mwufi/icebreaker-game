import { generateContextJson } from './src/generate-context';
import { generateMatch } from './src/matcher';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import type { Profile } from './src/types';

interface AllMatches {
  generatedAt: string;
  totalProfiles: number;
  matches: {
    [profileName: string]: {
      summary: string;
      matches: Array<{
        name: string;
        why: string;
        firstMessage: string;
      }>;
    };
  };
}

async function generateAllMatches() {
  try {
    console.log('🚀 Starting batch match generation...\n');
    
    // Step 1: Generate context from InstantDB
    console.log('📊 Step 1: Fetching all profiles from database...');
    const contextPath = await generateContextJson();
    
    // Read profiles to get all names
    const contextContent = await readFile(contextPath, 'utf-8');
    const profiles: Profile[] = JSON.parse(contextContent);
    console.log(`✅ Found ${profiles.length} profiles\n`);
    
    // Initialize results
    const allMatches: AllMatches = {
      generatedAt: new Date().toISOString(),
      totalProfiles: profiles.length,
      matches: {}
    };
    
    // Process each profile
    console.log('🤖 Step 2: Generating matches for each profile...\n');
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const progress = `[${i + 1}/${profiles.length}]`;
      
      try {
        // Show live progress
        process.stdout.write(`${progress} Generating matches for ${profile.name}... `);
        
        const startTime = Date.now();
        const result = await generateMatch(profile.name, contextPath);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Store results
        allMatches.matches[profile.name] = {
          summary: result.mainProfileSummary,
          matches: result.matches.map(match => ({
            name: match.name,
            why: match.why,
            firstMessage: match.firstMessageForMain
          }))
        };
        
        console.log(`✅ Done (${duration}s)`);
        
        // Display a preview of the matches
        console.log(`   → Matched with: ${result.matches.map(m => m.name).join(', ')}\n`);
        
      } catch (error) {
        console.log(`❌ Failed`);
        console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        
        // Store error in results
        allMatches.matches[profile?.name || ''] = {
          summary: 'Error generating matches',
          matches: []
        };
      }
      
      // Add a small delay to avoid rate limiting
      if (i < profiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 3: Save results
    console.log('\n💾 Step 3: Saving results...');
    const outputPath = path.join(process.cwd(), 'all-matches.json');
    await writeFile(outputPath, JSON.stringify(allMatches, null, 2));
    console.log(`✅ Results saved to: ${outputPath}\n`);
    
    // Display summary
    console.log('=' .repeat(60));
    console.log('GENERATION COMPLETE');
    console.log('=' .repeat(60));
    console.log(`Total profiles processed: ${profiles.length}`);
    console.log(`Successful matches: ${Object.values(allMatches.matches).filter(m => m.matches.length > 0).length}`);
    console.log(`Failed matches: ${Object.values(allMatches.matches).filter(m => m.matches.length === 0).length}`);
    console.log(`Generated at: ${allMatches.generatedAt}`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the batch generation
generateAllMatches();