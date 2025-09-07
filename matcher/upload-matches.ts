import { db } from './src/instant-client';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { id } from '@instantdb/core';

interface MatchFile {
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

interface ProfileMap {
  [name: string]: string; // name -> id
}

async function uploadMatches(folderName?: string) {
  try {
    console.log('🚀 Starting match upload to InstantDB...\n');
    
    // Get folder path
    const matchesDir = path.join(process.cwd(), 'matches');
    let targetFolder: string;
    
    if (folderName) {
      targetFolder = path.join(matchesDir, folderName);
    } else {
      // Get most recent folder
      const folders = await readdir(matchesDir);
      const runFolders = folders.filter(f => f.startsWith('run-')).sort();
      if (runFolders.length === 0) {
        throw new Error('No match folders found. Run generate-all-matches.ts first.');
      }
      targetFolder = path.join(matchesDir, runFolders[runFolders.length - 1]);
      console.log(`📁 Using most recent folder: ${runFolders[runFolders.length - 1]}\n`);
    }
    
    // Step 1: Fetch all profiles to create name->id mapping
    console.log('📊 Step 1: Fetching profile IDs from database...');
    const { profiles } = await db.query({
      profiles: {
        $: {
          where: {},
        },
      },
    });
    
    const profileMap: ProfileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.name] = profile.id;
    });
    console.log(`✅ Found ${profiles.length} profiles\n`);
    
    // Helper function to find profile ID
    function findProfileIdForProfileName(name: string): string {
      const profileId = profileMap[name];
      if (!profileId) {
        throw new Error(`Profile not found: ${name}`);
      }
      return profileId;
    }
    
    // Step 2: Read all match files
    console.log('📂 Step 2: Reading match files...');
    const files = await readdir(targetFolder);
    const matchFiles = files.filter(f => f.endsWith('.json') && f !== '_summary.json');
    console.log(`✅ Found ${matchFiles.length} match files\n`);
    
    // Step 3: Process each match file
    console.log('🔄 Step 3: Creating daily connections...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of matchFiles) {
      try {
        const filePath = path.join(targetFolder, file);
        const content = await readFile(filePath, 'utf-8');
        const matchData: MatchFile = JSON.parse(content);
        
        if (matchData.error || matchData.matches.length === 0) {
          console.log(`⏭️  Skipping ${matchData.profileName} (no matches or error)`);
          skipped++;
          continue;
        }
        
        const profileId = findProfileIdForProfileName(matchData.profileName);
        
        // Create daily connections for each match
        for (const match of matchData.matches) {
          try {
            const targetProfileId = findProfileIdForProfileName(match.name);
            
            // Create the connection text
            const connectionText = `💡 Why this match:\n${match.why}\n\n💬 First message:\n"${match.firstMessage}"`;
            
            // Create the daily connection
            const connectionId = id();
            await db.transact([
              db.tx.dailyConnections![connectionId].update({
                date: today,
                accepted: false,
                otherSideAccepted: false,
                text: connectionText,
              }).link({
                profiles: profileId,
                targetProfile: targetProfileId,
              })
            ]);
            
            created++;
            console.log(`✅ Created connection: ${matchData.profileName} → ${match.name}`);
            
          } catch (error) {
            console.error(`❌ Error creating connection ${matchData.profileName} → ${match.name}:`, error);
            errors++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error);
        errors++;
      }
    }
    
    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('UPLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`Date: ${today.toDateString()}`);
    console.log(`Total connections created: ${created}`);
    console.log(`Profiles skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Get folder name from command line arguments
const folderName = process.argv[2];

// Run the upload
uploadMatches(folderName);