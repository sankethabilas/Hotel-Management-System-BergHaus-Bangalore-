# Fix Google OAuth Redirect URI Mismatch Error

## Problem
You're getting `Error 400: redirect_uri_mismatch` when trying to sign in with Google on your live production site.

## Root Cause
The redirect URI used in your application doesn't match what's configured in Google Cloud Console. Your app uses:
- **Production**: `https://berghausbungalow.live/auth/google/callback`
- **Local Development**: `http://localhost:3000/auth/google/callback`

## Solution: Add Redirect URIs to Google Cloud Console

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you haven't)

### Step 2: Navigate to OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com`
3. Click on it to edit

### Step 3: Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add these URIs:

```
https://berghausbungalow.live/auth/google/callback
http://localhost:3000/auth/google/callback
```

**Important Notes:**
- Include **both** `http://` and `https://` versions if needed
- Include **www** version if you use it: `https://www.berghausbungalow.live/auth/google/callback`
- Make sure there are **no trailing slashes**
- The URI must match **exactly** (case-sensitive)

### Step 4: Save Changes
1. Click **Save**
2. Wait 1-2 minutes for changes to propagate

### Step 5: Test
1. Try signing in with Google on your production site
2. The error should be resolved

## Additional Configuration (Optional)
If you want to support multiple environments, you can also add:
- `http://localhost:3000/auth/google/callback` (local development)
- `https://berghausbungalow.live/auth/google/callback` (production)
- `https://www.berghausbungalow.live/auth/google/callback` (production with www)

## Troubleshooting

### Still Getting the Error?
1. **Check the exact redirect URI** in your browser's network tab when the error occurs
2. **Verify the URI matches exactly** in Google Cloud Console (including protocol, domain, path)
3. **Clear browser cache** and try again
4. **Wait a few minutes** after saving changes in Google Cloud Console

### Common Mistakes
- ❌ Adding trailing slash: `https://berghausbungalow.live/auth/google/callback/`
- ❌ Wrong protocol: `http://` instead of `https://` for production
- ❌ Missing path: `https://berghausbungalow.live` instead of `https://berghausbungalow.live/auth/google/callback`
- ❌ Wrong domain: Typo in domain name

### Verify Your Current Redirect URI
Open browser console on your production site and run:
```javascript
console.log(`${window.location.origin}/auth/google/callback`);
```

This will show you the exact redirect URI your app is using. Make sure this **exact** URI is in Google Cloud Console.

