# Google Button Not Showing - Troubleshooting Guide

## Issue: Google Sign-up Button Not Visible

The Google sign-up button should be visible on the signup page, but it's not showing up. Here's how to fix it:

## Step 1: Create Environment Variables File

**CRITICAL**: You must create the `.env.local` file in your `frontend` directory with your Google credentials.

Create `frontend/.env.local` with this exact content:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here-make-it-long-and-random

# Google OAuth Configuration
GOOGLE_CLIENT_ID=264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Important Notes:**
- Replace `your-super-secret-nextauth-key-here-make-it-long-and-random` with a secure random string
- You can generate a secure secret using: `openssl rand -base64 32`
- The file must be named exactly `.env.local` and placed in the `frontend` directory

## Step 2: Restart Your Development Server

After creating the `.env.local` file, you MUST restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## Step 3: Test the Implementation

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Visit**: `http://localhost:3000/auth/signup`
4. **Look for**: 
   - "Sign up with Google" button (main button)
   - "DEBUG: Google Sign Up" button (red border, for testing)

## Step 4: Debug Steps

### If buttons are still not visible:

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any JavaScript errors
   - Check the Console tab for error messages

2. **Check Network Tab**:
   - Look for failed requests to `/api/auth/*`
   - Check if environment variables are being loaded

3. **Verify File Structure**:
   ```
   frontend/
   ├── .env.local          ← This file MUST exist
   ├── pages/
   │   └── api/
   │       └── auth/
   │           └── [...nextauth].ts
   └── components/
       ├── google-auth-button.tsx
       └── debug-google-button.tsx
   ```

## Step 5: Alternative Testing Method

If the buttons still don't show, try accessing the Google OAuth directly:

1. **Direct URL Test**: Visit `http://localhost:3000/api/auth/signin/google`
2. **Expected Result**: Should redirect to Google OAuth consent screen

## Step 6: Common Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Solution**: 
- Ensure `.env.local` is in the `frontend` directory
- Restart the development server
- Check for typos in variable names

### Issue 2: NextAuth Configuration Error
**Solution**:
- Check `frontend/pages/api/auth/[...nextauth].ts` exists
- Verify the file exports `{ handler as GET, handler as POST }`

### Issue 3: Component Import Error
**Solution**:
- Check if `GoogleAuthButton` component exists
- Verify import path in signup page

### Issue 4: Google OAuth Configuration
**Solution**:
- Verify Google Cloud Console settings
- Check redirect URIs include: `http://localhost:3000/api/auth/callback/google`

## Step 7: Quick Fix Commands

Run these commands to ensure everything is set up correctly:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Check if .env.local exists
ls -la .env.local

# 3. If it doesn't exist, create it with the content above

# 4. Restart the server
npm run dev
```

## Step 8: Expected Behavior

When working correctly, you should see:

1. **On Signup Page** (`/auth/signup`):
   - "Sign up with Google" button (blue/white)
   - "DEBUG: Google Sign Up" button (red border)
   - "Or create account with email" separator
   - Regular signup form below

2. **On Login Page** (`/auth/login`):
   - "Continue with Google" button
   - "Or continue with email" separator
   - Regular login form below

## Step 9: Remove Debug Button (After Testing)

Once everything is working, remove the debug button:

1. Remove the import: `import DebugGoogleButton from '@/components/debug-google-button';`
2. Remove the component: `<DebugGoogleButton />`
3. Delete the file: `frontend/components/debug-google-button.tsx`

## Step 10: Final Verification

The Google authentication should work as follows:

1. **Click Google Button** → Google OAuth consent screen
2. **Grant Permissions** → Redirect back to your app
3. **User Created** → Saved in MongoDB with `isGoogleUser: true`
4. **Redirect** → Home page with profile icon in navbar

## Still Having Issues?

If the buttons are still not visible after following these steps:

1. **Check the browser console** for JavaScript errors
2. **Verify the `.env.local` file** exists and has correct content
3. **Restart both backend and frontend** servers
4. **Check the network tab** for failed API requests
5. **Try the direct URL**: `http://localhost:3000/api/auth/signin/google`

The most common issue is missing or incorrectly configured environment variables. Make sure the `.env.local` file exists and contains your Google OAuth credentials!
