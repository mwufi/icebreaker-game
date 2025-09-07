import { init } from "@instantdb/admin";
import dotenv from 'dotenv';
import { type Profile } from './types';

dotenv.config();

const appId = process.env.INSTANTDB_APP_ID;
const adminToken = process.env.INSTANTDB_ADMIN_TOKEN;

if (!appId || !adminToken) {
  throw new Error("INSTANTDB_APP_ID and INSTANTDB_ADMIN_TOKEN must be set in .env file");
}

export const db = init({
  appId,
  adminToken,
});

export async function fetchAllProfiles(): Promise<Profile[]> {
  const query = db.query({
    profiles: {
      $: {
        where: {},
      },
      preferences: {},
    },
  });

  const result = await query;
  
  return result.profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    profileText: profile.profileText || undefined,
    preferences: profile.preferences ? {
      lookingFor: profile.preferences.lookingFor,
    } : undefined,
  }));
}