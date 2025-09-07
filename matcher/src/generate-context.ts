import { fetchAllProfiles } from './instant-client';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function generateContextJson(): Promise<string> {
  console.log("Fetching all profiles from InstantDB...");
  
  const profiles = await fetchAllProfiles();
  
  console.log(`Fetched ${profiles.length} profiles`);
  
  const contextPath = path.join(process.cwd(), 'context.json');
  
  await writeFile(contextPath, JSON.stringify(profiles, null, 2));
  
  console.log(`Context saved to ${contextPath}`);
  
  return contextPath;
}