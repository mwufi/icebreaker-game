# Google Authentication Setup

## Overview
This app now has Google authentication integrated with InstantDB. Here's how to set it up:

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
7. Copy the Client ID

## 2. InstantDB Dashboard Setup

1. Go to your [InstantDB Dashboard](https://instantdb.com/dash)
2. Navigate to your app's "Auth" tab
3. Add a new OAuth provider:
   - Provider: Google
   - Client Name: Choose a name (e.g., "google-web")
   - Client ID: Your Google Client ID from step 1
   - Client Secret: Your Google Client Secret from step 1
4. Save the configuration

## 3. Environment Variables

Create a `.env.local` file in the webapp directory:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_NAME=your-instantdb-client-name

# InstantDB Admin Token (for dev scripts)
INSTANT_APP_ADMIN_TOKEN=your-instantdb-admin-token
```

Replace:
- `your-google-client-id.apps.googleusercontent.com` with your actual Google Client ID
- `your-instantdb-client-name` with the client name you set in InstantDB dashboard
- `your-instantdb-admin-token` with your InstantDB admin token

## 4. Test the Authentication

1. Start the development server:
   ```bash
   cd webapp
   bun run dev
   ```

2. Open http://localhost:3000
3. You should see a "Sign in with Google" button
4. Click it to test the authentication flow

## How It Works

The authentication flow uses:
- `@react-oauth/google` for the Google OAuth UI
- InstantDB's `signInWithIdToken` method to authenticate with the ID token
- InstantDB's `db.SignedIn` and `db.SignedOut` components for conditional rendering
- `db.useUser()` hook to access user information

## Components

- `AuthWrapper`: Handles the authentication state and renders appropriate UI
- `GoogleSignIn`: Contains the Google login button and sign-out functionality
- `UserInfo`: Displays the current user's information

## Next Steps

Once authentication is working, you can:
1. Add user-specific data to your InstantDB schema
2. Implement role-based permissions
3. Add user profiles and settings
4. Integrate with your existing data models
