import { generateContextJson } from './src/generate-context';
import { generateMatch } from './src/matcher';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface CustomMatchResult {
  profileName: string;
  summary: string;
  matches: Array<{
    name: string;
    why: string;
    firstMessage: string;
  }>;
  generatedAt: string;
}

async function generateCustomMatches() {
  try {
    // Check if we have a name argument
    const targetName = process.argv[2];
    if (!targetName) {
      console.error('Please provide a name as argument');
      console.error('Usage: bun generate-custom-matches.ts "Name of Person"');
      process.exit(1);
    }
    
    console.log(`\n🎯 Generating 10 custom matches for: ${targetName}\n`);
    
    // Step 1: Generate context.json from InstantDB
    console.log('📊 Step 1: Fetching all profiles from database...');
    const contextPath = await generateContextJson();
    console.log('✅ Context file generated!\n');
    
    // Create custom run folder
    const runDate = new Date().toISOString().slice(0, 19).replace(/[:\s]/g, '-');
    const runId = `custom-${runDate}`;
    const matchesDir = path.join(process.cwd(), 'matches', runId);
    await mkdir(matchesDir, { recursive: true });
    console.log(`📁 Created matches directory: ${matchesDir}\n`);
    
    // Step 2: Generate 10 matches using AI
    console.log('🤖 Step 2: Generating 10 custom matches...');
    
    try {
      const startTime = Date.now();
      
      // Use default prompt (same as generate-all-matches)
      const customPrompt = undefined;
      
      const result = await generateMatch(targetName, contextPath, 10, customPrompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log(`✅ Matches generated in ${duration}s!\n`);
      
      // Prepare match data
      const matchResult: CustomMatchResult = {
        profileName: targetName,
        summary: result.mainProfileSummary,
        matches: result.matches.map(match => ({
          name: match.name,
          why: match.why,
          firstMessage: match.firstMessageForMain
        })),
        generatedAt: new Date().toISOString()
      };
      
      // Save to file
      const safeFileName = targetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePath = path.join(matchesDir, `${safeFileName}.json`);
      await writeFile(filePath, JSON.stringify(matchResult, null, 2));
      
      // Display results
      console.log('='.repeat(60));
      console.log(`CUSTOM MATCHES FOR: ${targetName}`);
      console.log('='.repeat(60));
      console.log(`\nProfile Summary:\n${result.mainProfileSummary}\n`);
      console.log('-'.repeat(60));
      
      result.matches.forEach((match, index) => {
        console.log(`\n🔗 Match ${index + 1}: ${match.name}`);
        console.log(`\n💡 Why this match:\n${match.why}`);
        console.log(`\n💬 First message:\n"${match.firstMessageForMain}"`);
        console.log('\n' + '-'.repeat(60));
      });
      
      console.log(`\n✅ Results saved to: ${filePath}`);
      console.log(`\n📤 To upload these matches, run:`);
      console.log(`   bun upload-matches.ts ${runId}\n`);
      
    } catch (error) {
      console.error('❌ Error generating matches:', error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the custom generation
generateCustomMatches();