# Google OAuth Authentication Troubleshooting Guide

If you're seeing "Authentication Failed" or "An error occurred during authentication", follow these steps:

## Common Error Messages and Solutions

### 1. "Authorization code expired or invalid"
**Cause:** The authorization code from Google has expired (they expire quickly).

**Solution:**
- Try signing in again
- Make sure you're completing the sign-in flow quickly
- Don't leave the Google consent page open for too long

### 2. "Redirect URI mismatch"
**Cause:** The redirect URI in your code doesn't match what's configured in Google Cloud Console.

**Solution:**
1. Check your current redirect URI:
   - Open browser console and run: `console.log(window.location.origin + '/auth/google/callback')`
2. Go to [Google Cloud Console](https://console.cloud.google.com/)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add the exact redirect URI to **Authorized redirect URIs**
6. Save and wait 1-2 minutes

### 3. "Unable to connect to backend server"
**Cause:** Your backend server is not running or not accessible.

**Solution:**
- **Local Development:**
  - Make sure backend is running: `cd backend && npm start`
  - Check if backend is on port 5000: `http://localhost:5000`
  - Verify `NEXT_PUBLIC_API_URL` in `.env.local` is correct

- **Production:**
  - Check if backend server is running on your server
  - Verify `NEXT_PUBLIC_API_URL` in `.env.production` points to correct URL
  - Check server logs: `pm2 logs hms-backend`

### 4. "Invalid OAuth client configuration"
**Cause:** Client ID or Client Secret is incorrect or missing.

**Solution:**
- **Frontend:** Check `frontend/.env.local` (dev) or `frontend/.env.production` (prod)
  ```env
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
  ```

- **Backend:** Check `backend/.env`
  ```env
  GOOGLE_CLIENT_ID=your-client-id-here
  GOOGLE_CLIENT_SECRET=your-client-secret-here
  ```

- Restart your servers after updating environment variables

### 5. "Failed to create user account"
**Cause:** Backend API call succeeded but user creation failed.

**Solution:**
- Check backend logs for errors
- Verify MongoDB connection is working
- Check if user already exists with that email

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab for failed requests

### Step 2: Check Environment Variables

**Frontend (Local):**
```bash
# Check if .env.local exists
cat frontend/.env.local

# Should contain:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Frontend (Production):**
```bash
# On your server
cat frontend/.env.production

# Should contain:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
```

**Backend:**
```bash
# On your server
cat backend/.env

# Should contain:
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 3: Verify Google Cloud Console Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Verify:
   - **Authorized JavaScript origins** includes:
     - `http://localhost:3000` (dev)
     - `https://berghausbungalow.live` (prod)
   - **Authorized redirect URIs** includes:
     - `http://localhost:3000/auth/google/callback` (dev)
     - `https://berghausbungalow.live/auth/google/callback` (prod)

### Step 4: Test Backend Connection

**Local:**
```bash
# Test if backend is running
curl http://localhost:5000/api/users/google-signup

# Should return an error (expected) but confirms backend is running
```

**Production:**
```bash
# Test backend endpoint
curl https://berghausbungalow.live/api/users/google-signup

# Should return an error (expected) but confirms backend is accessible
```

### Step 5: Check Server Logs

**Frontend (Next.js):**
- Check terminal where `npm run dev` is running
- Look for error messages

**Backend:**
```bash
# Local
# Check terminal where backend is running

# Production
pm2 logs hms-backend
pm2 logs hms-frontend
```

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop all services
# Then restart:
cd backend && npm start
cd frontend && npm run dev
```

### Fix 2: Clear Browser Cache
- Clear browser cache and cookies
- Try in incognito/private mode
- Try a different browser

### Fix 3: Verify Redirect URI
1. Open your app in browser
2. Open browser console (F12)
3. Run: `console.log(window.location.origin + '/auth/google/callback')`
4. Copy the output
5. Add it to Google Cloud Console → OAuth Client → Authorized redirect URIs

### Fix 4: Check Network Connectivity
- Make sure backend server is accessible
- Check firewall settings
- Verify CORS configuration in backend

## Still Having Issues?

1. **Check the exact error message** in browser console
2. **Check server logs** for detailed error information
3. **Verify all environment variables** are set correctly
4. **Test with a fresh OAuth Client ID** (see CREATE_NEW_GOOGLE_OAUTH.md)

## Common Mistakes

❌ **Wrong redirect URI format:**
- `https://berghausbungalow.live/auth/google/callback/` (trailing slash)
- `http://berghausbungalow.live/auth/google/callback` (wrong protocol)

✅ **Correct format:**
- `https://berghausbungalow.live/auth/google/callback` (no trailing slash, correct protocol)

❌ **Environment variables not loaded:**
- Forgot to restart server after adding .env file
- Wrong file name (.env.local vs .env.production)

✅ **Correct approach:**
- Restart server after changing .env files
- Use correct file name for environment

❌ **Backend URL mismatch:**
- Frontend pointing to localhost in production
- Backend URL has trailing slash

✅ **Correct format:**
- Production: `https://berghausbungalow.live/api` (no trailing slash)
- Development: `http://localhost:5000/api` (no trailing slash)

