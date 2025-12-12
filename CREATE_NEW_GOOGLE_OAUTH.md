# Create New Google OAuth Client ID - Step by Step Guide

This guide will walk you through creating a fresh Google OAuth 2.0 Client ID for your HMS application.

## Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (sankethmarasingha@gmail.com)

## Step 2: Create or Select a Project

1. Click on the **project dropdown** at the top of the page
2. Either:
   - **Select an existing project**, OR
   - **Click "New Project"** to create a new one
   - Give it a name like "HMS Application" or "Berghaus Bungalow"
   - Click **Create**

## Step 3: Enable Google+ API (if needed)

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Make sure **Google Identity Services API** is enabled
4. If not enabled, click **Enable**

## Step 4: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required information:
   - **App name**: HMS Application (or your app name)
   - **User support email**: sankethmarasingha@gmail.com
   - **Developer contact information**: sankethmarasingha@gmail.com
5. Click **Save and Continue**
6. On **Scopes** page, click **Save and Continue** (you can add scopes later)
7. On **Test users** page, click **Save and Continue** (optional for now)
8. Review and click **Back to Dashboard**

## Step 5: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**

## Step 6: Configure OAuth Client

1. **Application type**: Select **Web application**
2. **Name**: Enter a descriptive name like "HMS Web Client" or "Berghaus Bungalow Web"
3. **Authorized JavaScript origins**: Click **+ ADD URI** and add:
   ```
   http://localhost:3000
   https://berghausbungalow.live
   ```
   (Add `https://www.berghausbungalow.live` if you use www subdomain)

4. **Authorized redirect URIs**: Click **+ ADD URI** and add:
   ```
   http://localhost:3000/auth/google/callback
   https://berghausbungalow.live/auth/google/callback
   ```
   (Add `https://www.berghausbungalow.live/auth/google/callback` if you use www)

5. Click **CREATE**

## Step 7: Copy Your Credentials

After creating, you'll see a popup with:
- **Your Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Your Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

**⚠️ IMPORTANT**: Copy both of these immediately! You won't be able to see the Client Secret again.

## Step 8: Set Up Environment Variables

### For Local Development (Frontend)

Create or update `frontend/.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**To create the file:**
- Windows: Create a new file named `.env.local` in the `frontend` folder
- Or use: `echo NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE > frontend/.env.local`

### For Production (Frontend)

Create or update `frontend/.env.production` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
```

**To create the file:**
- Create a new file named `.env.production` in the `frontend` folder
- Add the environment variables above

### For Backend (Server-side)

Create or update `backend/.env` file:

```env
NODE_ENV=production
PORT=5000

# MongoDB connection (your existing connection string)
MONGO_URI=your-mongodb-connection-string

# JWT Secret (your existing secret)
JWT_SECRET=your-existing-jwt-secret

# Google OAuth Configuration (NEW - Add these)
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
```

**To create/update the file:**
- Open `backend/.env` file (create it if it doesn't exist)
- Add the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` lines
- Keep your existing environment variables (MONGO_URI, JWT_SECRET, etc.)

**⚠️ Important Notes:**
- Replace `YOUR_NEW_CLIENT_ID_HERE` with your actual Client ID from Step 7
- Replace `YOUR_NEW_CLIENT_SECRET_HERE` with your actual Client Secret from Step 7
- The Client Secret should NEVER be exposed in frontend code. It's only used server-side.
- Never commit `.env` files to Git (they're already in `.gitignore`)

## Step 9: Update Your Code

The code has already been updated to use environment variables. Just make sure:

1. ✅ `frontend/components/google-auth-button.tsx` uses `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`
2. ✅ `frontend/components/google-oauth-button.tsx` uses `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`
3. ✅ `frontend/app/api/auth/google/callback/route.ts` uses `process.env.GOOGLE_CLIENT_ID` and `process.env.GOOGLE_CLIENT_SECRET`

## Step 10: Test Your Setup

### Local Testing:
1. Make sure your `.env.local` file has the new Client ID
2. Restart your Next.js dev server: `npm run dev`
3. Try signing in with Google on `http://localhost:3000`

### Production Testing:
1. Deploy your updated code with the new environment variables
2. Make sure `.env.production` has the correct Client ID
3. Try signing in with Google on `https://berghausbungalow.live`

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Double-check that the redirect URI in Google Cloud Console matches **exactly** what your app uses
- Make sure there are no trailing slashes
- Verify the protocol (http vs https)

### Error: "invalid_client"
- Verify your Client ID is correct in environment variables
- Make sure you're using the right Client ID for the right environment

### Error: "invalid_grant"
- Check that your Client Secret is correct
- Make sure the Client Secret is set in your backend `.env` file

### Still Having Issues?
1. Check browser console for exact error messages
2. Verify environment variables are loaded: `console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)`
3. Make sure you've restarted your server after changing environment variables
4. Wait 1-2 minutes after making changes in Google Cloud Console

## Security Best Practices

1. ✅ **Never commit** `.env` files to Git
2. ✅ **Never expose** Client Secret in frontend code
3. ✅ **Use different** Client IDs for development and production (optional but recommended)
4. ✅ **Restrict** Authorized JavaScript origins to your actual domains
5. ✅ **Keep** your Client Secret secure and rotate it if compromised

## Next Steps

After setting up:
1. Test Google Sign-In on both local and production
2. Monitor Google Cloud Console for any security alerts
3. Set up OAuth consent screen publishing if you want to make it public

---

**Need Help?** Check the error message in your browser console - it usually tells you exactly what's wrong!

