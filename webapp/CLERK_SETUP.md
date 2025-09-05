# Clerk Authentication Setup

## Overview
This app now uses Clerk for authentication with InstantDB integration. Here's how to set it up:

## 1. Clerk Dashboard Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select an existing one
3. Go to "Sessions" → "Customize session token"
4. Add the email claim to your session token:
   ```json
   {
     "email": "{{user.primary_email_address}}"
   }
   ```
5. Go to "API Keys" and copy your **Publishable key** (starts with `pk_`)

## 2. InstantDB Dashboard Setup

1. Go to your [InstantDB Dashboard](https://instantdb.com/dash)
2. Navigate to your app's "Auth" tab
3. Add a new Clerk app:
   - Provider: Clerk
   - Client Name: Choose a name (e.g., "clerk-web")
   - Publishable Key: Your Clerk publishable key from step 1
4. Save the configuration

## 3. Environment Variables

Create a `.env.local` file in the webapp directory:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
NEXT_PUBLIC_CLERK_CLIENT_NAME=clerk-web

# Clerk Redirect URLs (as per Clerk docs)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# InstantDB Admin Token (for dev scripts)
INSTANT_APP_ADMIN_TOKEN=your-instantdb-admin-token
```

Replace:
- `pk_test_your-clerk-publishable-key` with your actual Clerk publishable key
- `clerk-web` with the client name you set in InstantDB dashboard
- `your-instantdb-admin-token` with your InstantDB admin token

## 4. Test the Authentication

1. Start the development server:
   ```bash
   cd webapp
   bun run dev
   ```

2. Open http://localhost:3001
3. Click "Sign In" to go to the sign-in page
4. Use the custom sign-in form to test authentication

## How It Works

The authentication flow uses:
- **Clerk's prebuilt SignIn component** for a polished authentication experience
- **Custom styling** to match your app's design
- **InstantDB integration** via `signInWithIdToken` with Clerk's JWT
- **Seamless session management** between Clerk and InstantDB

## Components

- `ClerkAuth`: Handles the InstantDB integration with Clerk tokens (invisible component)
- `ClerkSignOutButton`: Handles sign-out from both Clerk and InstantDB
- `AvatarPopover`: Updated to use Clerk sign-out functionality
- `SignIn` page: Uses Clerk's prebuilt component with custom styling

## Features

- ✅ **Clerk's prebuilt SignIn component** with professional UI
- ✅ **Custom styling** to match your app's design system
- ✅ **Email/password + social login** options (configurable in Clerk dashboard)
- ✅ **Seamless InstantDB integration**
- ✅ **Beautiful avatar popover** with menu
- ✅ **Proper session management**
- ✅ **Sign-out from both services**
- ✅ **Less code to maintain** - Clerk handles the complex auth logic

## Next Steps

Once authentication is working, you can:
1. Add user registration functionality
2. Implement password reset
3. Add social login options (Google, GitHub, etc.)
4. Customize the user profile experience
5. Add role-based permissions
