import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { readFile } from 'fs/promises';
import { z } from 'zod';
import { story } from './story';
import { type MatchingResponse, type Profile } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY must be set in .env file");
}

function createMatchingResponseSchema(matchCount: number) {
  return z.object({
    mainProfileSummary: z.string().describe('Detailed summary of the main profile being matched'),
    matches: z.array(
      z.object({
        name: z.string().describe('Name of the matched person'),
        why: z.string().describe('Detailed reasoning for this match'),
        firstMessageForMain: z.string().describe('First message to show the main person about this match'),
      })
    ).length(matchCount).describe(`Exactly ${matchCount} matches for the main person`),
  });
}

export async function generateMatch(targetName: string, contextPath?: string, matchCount: number = 3, customPrompt?: string): Promise<MatchingResponse> {
  const contextFilePath = contextPath || path.join(process.cwd(), 'context.json');
  const contextContent = await readFile(contextFilePath, 'utf-8');
  const profiles: Profile[] = JSON.parse(contextContent);
  
  const storyText = story.map(item => {
    if (item.type === 'paragraph' || item.type === 'closing' || item.type === 'question') {
      return item.text;
    } else if (item.type === 'heading') {
      return `\n## ${item.text}\n`;
    } else if (item.type === 'divider') {
      return '\n---\n';
    }
    return '';
  }).join('\n\n');
  
  const prompt = customPrompt || `Based on the SuperSecret app's story and philosophy:

${storyText}

I have the following profiles data:

${contextContent}

What we're going to do is create ${matchCount} intriguing matches (or possibilities for connection? contrast? generativity?) out of this context, for one specific person. Your job is to give me the ${matchCount} matches for this person, as well as why, and the first message that this person can give to their match to initiate the conversation.

Only provide matches for this person: ${targetName}

Remember to:
1. Consider serendipity, authenticity, and genuine human connection
2. Look for resonance, compatible lenses, or intriguing contrasts
3. Focus on shared thoughts, perspectives, and ways of seeing the world
4. Create matches that could lead to meaningful conversations and connections
5. The first message should intrigue the potential match and give them insight into why this could be a special connection

Please generate the matches now.`;

  const { object } = await generateObject({
    model: google('gemini-2.5-pro'),
    schema: createMatchingResponseSchema(matchCount),
    prompt,
  });
  
  return object;
}