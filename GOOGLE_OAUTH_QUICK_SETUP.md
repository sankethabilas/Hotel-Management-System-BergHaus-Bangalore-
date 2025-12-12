# Google OAuth Quick Setup Checklist

Use this checklist when creating a new Google OAuth Client ID.

## ✅ Pre-Setup Checklist

- [ ] Google account ready (sankethmarasingha@gmail.com)
- [ ] Access to Google Cloud Console
- [ ] Know your production domain: `berghausbungalow.live`
- [ ] Know your local development URL: `http://localhost:3000`

## ✅ Google Cloud Console Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create or select a project
- [ ] Enable **Google Identity Services API** (APIs & Services → Library)
- [ ] Configure OAuth consent screen (APIs & Services → OAuth consent screen)
- [ ] Create OAuth 2.0 Client ID (APIs & Services → Credentials → Create Credentials)

## ✅ OAuth Client Configuration

**Application Type:** Web application

**Authorized JavaScript origins:**
- [ ] `http://localhost:3000`
- [ ] `https://berghausbungalow.live`

**Authorized redirect URIs:**
- [ ] `http://localhost:3000/auth/google/callback`
- [ ] `https://berghausbungalow.live/auth/google/callback`

## ✅ Copy Credentials

- [ ] Copy **Client ID** (save it somewhere safe)
- [ ] Copy **Client Secret** (save it somewhere safe - you won't see it again!)

## ✅ Environment Variables Setup

### Frontend - Local (`frontend/.env.local`)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
- [ ] File created
- [ ] Client ID added

### Frontend - Production (`frontend/.env.production`)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_API_URL=https://berghausbungalow.live/api
```
- [ ] File created
- [ ] Client ID added

### Backend (`backend/.env`)
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```
- [ ] File updated
- [ ] Client ID added
- [ ] Client Secret added

## ✅ Code Verification

- [ ] Code already uses environment variables (✅ Already done!)
- [ ] No hardcoded credentials in code

## ✅ Testing

### Local Testing
- [ ] Restart dev server: `npm run dev`
- [ ] Test Google Sign-In on `http://localhost:3000`
- [ ] Verify redirect works correctly

### Production Testing
- [ ] Deploy updated code with new environment variables
- [ ] Test Google Sign-In on `https://berghausbungalow.live`
- [ ] Verify redirect works correctly

## ✅ Troubleshooting

If you get errors:

**Error: redirect_uri_mismatch**
- [ ] Check redirect URI matches exactly in Google Cloud Console
- [ ] No trailing slashes
- [ ] Correct protocol (http vs https)

**Error: invalid_client**
- [ ] Verify Client ID in environment variables
- [ ] Restart server after changing .env files

**Error: invalid_grant**
- [ ] Verify Client Secret in backend .env
- [ ] Make sure Client Secret is correct

## 📝 Notes

- Environment variables are already configured in code ✅
- Client Secret is server-side only (never exposed to frontend) ✅
- .env files are in .gitignore (won't be committed) ✅

---

**Need detailed instructions?** See `CREATE_NEW_GOOGLE_OAUTH.md`

