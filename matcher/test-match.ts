import { generateContextJson } from './src/generate-context';
import { generateMatch } from './src/matcher';

async function testGenerateMatch() {
  try {
    // Check if we have a name argument
    const targetName = process.argv[2];
    if (!targetName) {
      console.error('Please provide a name as argument');
      console.error('Usage: bun test-match.ts "Name of Person"');
      process.exit(1);
    }
    
    console.log(`\n🎯 Generating matches for: ${targetName}\n`);
    
    // Step 1: Generate context.json from InstantDB
    console.log('📊 Step 1: Fetching all profiles from database...');
    const contextPath = await generateContextJson();
    console.log('✅ Context file generated!\n');
    
    // Step 2: Generate matches using AI
    console.log('🤖 Step 2: Generating matches using AI...');
    const result = await generateMatch(targetName, contextPath);
    console.log('✅ Matches generated!\n');
    
    // Display results
    console.log('=' * 60);
    console.log(`MATCHES FOR: ${targetName}`);
    console.log('=' * 60);
    console.log(`\nProfile Summary:\n${result.mainProfileSummary}\n`);
    console.log('-' * 60);
    
    result.matches.forEach((match, index) => {
      console.log(`\n🔗 Match ${index + 1}: ${match.name}`);
      console.log(`\n💡 Why this match:\n${match.why}`);
      console.log(`\n💬 First message:\n"${match.firstMessageForMain}"`);
      console.log('\n' + '-' * 60);
    });
    
  } catch (error) {
    console.error('Error generating matches:', error);
    process.exit(1);
  }
}

// Run the test
testGenerateMatch();