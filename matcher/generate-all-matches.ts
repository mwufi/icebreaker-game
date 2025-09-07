import { generateContextJson } from './src/generate-context';
import { generateMatch } from './src/matcher';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import type { Profile } from './src/types';
import { Semaphore } from './src/semaphore';

interface MatchResult {
  profileName: string;
  summary: string;
  matches: Array<{
    name: string;
    why: string;
    firstMessage: string;
  }>;
  generatedAt: string;
  error?: string;
}

async function generateAllMatches() {
  try {
    console.log('🚀 Starting parallel match generation...\n');
    
    // Configuration
    const PARALLEL_LIMIT = 10; // Number of concurrent API calls
    const semaphore = new Semaphore(PARALLEL_LIMIT);
    
    // Step 1: Generate context from InstantDB
    console.log('📊 Step 1: Fetching all profiles from database...');
    const contextPath = await generateContextJson();
    
    // Read profiles to get all names
    const contextContent = await readFile(contextPath, 'utf-8');
    const profiles: Profile[] = JSON.parse(contextContent);
    console.log(`✅ Found ${profiles.length} profiles\n`);
    
    // Create run ID and matches folder
    const runDate = new Date().toISOString().slice(0, 19).replace(/[:\s]/g, '-');
    const runId = `run-${runDate}`;
    const matchesDir = path.join(process.cwd(), 'matches', runId);
    await mkdir(matchesDir, { recursive: true });
    console.log(`📁 Created matches directory: ${matchesDir}\n`);
    
    // Progress tracking
    let completed = 0;
    let successful = 0;
    let failed = 0;
    const startTime = Date.now();
    
    // Process function for each profile
    async function processProfile(profile: Profile): Promise<MatchResult> {
      await semaphore.acquire();
      
      try {
        const profileStartTime = Date.now();
        const result = await generateMatch(profile.name, contextPath);
        const duration = ((Date.now() - profileStartTime) / 1000).toFixed(1);
        
        completed++;
        successful++;
        
        // Update progress
        console.log(`✅ [${completed}/${profiles.length}] ${profile.name} (${duration}s) → ${result.matches.map(m => m.name).join(', ')}`);
        
        const matchResult: MatchResult = {
          profileName: profile.name,
          summary: result.mainProfileSummary,
          matches: result.matches.map(match => ({
            name: match.name,
            why: match.why,
            firstMessage: match.firstMessageForMain
          })),
          generatedAt: new Date().toISOString()
        };
        
        // Save individual file
        const safeFileName = profile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = path.join(matchesDir, `${safeFileName}.json`);
        await writeFile(filePath, JSON.stringify(matchResult, null, 2));
        
        return matchResult;
        
      } catch (error) {
        completed++;
        failed++;
        
        console.error(`❌ [${completed}/${profiles.length}] ${profile.name} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        return {
          profileName: profile.name,
          summary: 'Error generating matches',
          matches: [],
          generatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      } finally {
        semaphore.release();
      }
    }
    
    // Step 2: Generate matches in parallel
    console.log(`🤖 Step 2: Generating matches (${PARALLEL_LIMIT} parallel workers)...\n`);
    
    const promises = profiles.map(profile => processProfile(profile));
    const results = await Promise.all(promises);
    
    // Save summary file
    const summaryPath = path.join(matchesDir, '_summary.json');
    const summary = {
      runId,
      generatedAt: runDate,
      totalProfiles: profiles.length,
      successful,
      failed,
      duration: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
      profiles: results.map(r => ({
        name: r.profileName,
        matches: r.matches.map(m => m.name),
        error: r.error
      }))
    };
    
    await writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    // Display final summary
    console.log('\n' + '='.repeat(60));
    console.log('GENERATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Run ID: ${runId}`);
    console.log(`Total profiles: ${profiles.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total time: ${summary.duration}`);
    console.log(`Average time per profile: ${(parseFloat(summary.duration) / profiles.length).toFixed(1)}s`);
    console.log(`\nResults saved to: ${matchesDir}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the batch generation
generateAllMatches();