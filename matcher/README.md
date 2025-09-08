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

### Generate matches for everyone (parallel)

```bash
bun generate-all-matches.ts
```

This will:
1. Fetch all profiles from InstantDB
2. Generate matches for every person in parallel (5 concurrent workers)
3. Display live progress with completion counter
4. Save results to individual files in `matches/run-<timestamp>/`

Output structure:
```
matches/
└── run-2025-09-07-10-30-45/
    ├── _summary.json        # Run summary and statistics
    ├── john_doe.json        # Individual match results
    ├── jane_smith.json
    └── ...
```

Each match file includes:
- Profile summary
- 3 matches with explanations and first messages
- Generation timestamp

Features:
- Parallel processing with semaphore (5 concurrent API calls)
- Automatic progress tracking
- Error resilience (continues if one profile fails)
- Performance metrics in summary

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

### Generate custom matches (10 matches)

```bash
bun generate-custom-matches.ts "Person Name"
```

This will:
1. Generate 10 matches for the specified person
2. Save to `matches/custom-<timestamp>/`
3. Display all matches with explanations
4. Ready for upload using the upload-matches script

Note: The custom prompt can be modified in the script when needed.

### Upload matches to InstantDB

```bash
# Upload most recent matches
bun upload-matches.ts

# Upload specific folder
bun upload-matches.ts run-2025-09-07-10-30-45
```

This will:
1. Read match files from the specified (or most recent) run
2. Look up profile IDs from InstantDB
3. Create `dailyConnections` entries for today
4. Link each connection to both profiles
5. Include the match explanation and first message

The connection text format:
```
💡 Why this match:
[Explanation of why these two people should connect]

💬 First message:
"[Suggested first message to send]"
```

## Future Features

- Past interaction history consideration
- Match quality scoring
- Reciprocal match validation
