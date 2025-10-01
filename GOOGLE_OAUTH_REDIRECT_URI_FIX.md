# Google OAuth Redirect URI Fix

## 🚨 **Error: redirect_uri_mismatch**

The error occurs because the redirect URI in our code doesn't match what's configured in your Google Cloud Console.

## 🔧 **Current Redirect URI in Code**

Our code is using: `${window.location.origin}/auth/google/callback`

This translates to: `http://localhost:3000/auth/google/callback`

## ✅ **How to Fix This**

### **Step 1: Go to Google Cloud Console**

1. Visit: [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with Client ID: `264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com`)

### **Step 2: Navigate to OAuth Configuration**

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com`
3. Click on it to edit

### **Step 3: Add Authorized Redirect URIs**

In the **Authorized redirect URIs** section, add these URIs:

```
http://localhost:3000/auth/google/callback
https://localhost:3000/auth/google/callback
```

**For production, also add:**
```
https://yourdomain.com/auth/google/callback
```

### **Step 4: Save Changes**

Click **Save** to update the configuration.

## 🔄 **Alternative: Use Different Redirect URI**

If you prefer to use a different redirect URI, I can update the code. Common alternatives:

1. **Use `/api/auth/google/callback`** (more RESTful)
2. **Use `/auth/callback`** (shorter)
3. **Use `/callback`** (simplest)

## 🧪 **Test After Fix**

1. **Update Google Cloud Console** with the correct redirect URI
2. **Wait 5-10 minutes** for changes to propagate
3. **Test the Google OAuth flow** again
4. **Should work without redirect_uri_mismatch error**

## 📋 **Current Configuration**

- **Client ID**: `264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com`
- **Redirect URI**: `http://localhost:3000/auth/google/callback`
- **Scopes**: `openid email profile`

## 🎯 **Quick Fix**

The fastest solution is to add `http://localhost:3000/auth/google/callback` to your Google Cloud Console's authorized redirect URIs list.

Let me know if you need help with any of these steps!
