# Matcher Package

This package generates AI-powered matches for users in the SuperSecret app.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

### Generate matches for a specific person

```bash
bun test-match.ts "Person Name"
```

This will:
1. Fetch all profiles from InstantDB
2. Save them to `context.json`
3. Use Gemini AI to generate 3 matches for the specified person
4. Display the results with explanations and first messages

### Generate matches for everyone

```bash
bun generate-all-matches.ts
```

This will:
1. Fetch all profiles from InstantDB
2. Generate matches for every person in the database
3. Display live progress as each person is processed
4. Save all results to `all-matches.json`

The output includes:
- Profile summaries
- 3 matches per person with explanations
- First messages to spark connections
- Generation statistics and timing

## How it works

1. **Data Collection**: The system fetches all user profiles from InstantDB, including names, profile texts, and preferences.

2. **AI Matching**: Using Google's Gemini model via the AI SDK, it analyzes all profiles considering:
   - The SuperSecret app's philosophy of serendipity and authentic connection
   - Profile content and preferences
   - Potential for meaningful conversations
   - Compatible worldviews or intriguing contrasts

3. **Match Generation**: For each person, it generates:
   - A profile summary
   - 3 carefully selected matches
   - Explanations for why each match could be meaningful
   - First messages to spark connection

## Future Features

- Writing matches back to InstantDB (for online mode)
- Past interaction history consideration
- Batch processing for all users
- Match quality scoring
