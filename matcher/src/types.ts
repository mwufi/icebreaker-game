export interface Profile {
  id: string;
  name: string;
  profileText?: string;
  preferences?: {
    lookingFor?: any;
  };
}

export interface MatchResult {
  name: string;
  why: string;
  firstMessageForMain: string;
}

export interface MatchingResponse {
  mainProfileSummary: string;
  matches: MatchResult[];
}