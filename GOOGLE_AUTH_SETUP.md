# Google Authentication Setup Guide

This guide will help you set up Google Sign-in/Sign-up for your Hotel Management System.

## Prerequisites

1. A Google Cloud Console account
2. Your HMS application running locally

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "HMS Google Auth"
4. Click "Create"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google OAuth2 API"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the name: "HMS Web Client"
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/signin/google` (for development)
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

## Step 2: Environment Variables Setup

Create a `.env.local` file in your `frontend` directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Important:** 
- Replace `your-super-secret-nextauth-key-here` with a random string (you can generate one using `openssl rand -base64 32`)
- Replace the Google credentials with the ones from Step 1.3

## Step 3: Backend Configuration

The backend is already configured to handle Google authentication. The route `/api/users/google-signup` will:
- Accept Google user data
- Create new users with `accountType="guest"`
- Return existing users if they already exist
- Set `isGoogleUser: true` flag

## Step 4: Frontend Features

### 4.1 Google Sign-in/Sign-up Buttons
- Added to both login and signup pages
- Modern design with Google branding
- Proper error handling and success messages

### 4.2 NextAuth Integration
- Configured with Google provider
- Automatic user creation in backend
- Session management
- Redirect to home page after successful authentication

### 4.3 Navbar Updates
- Shows profile icon instead of "Get Started" when logged in
- Profile dropdown with user information
- Logout functionality

## Step 5: Testing the Implementation

### 5.1 Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5.2 Test Google Authentication
1. Go to `http://localhost:3000/auth/login` or `http://localhost:3000/auth/signup`
2. Click "Continue with Google" or "Sign up with Google"
3. Complete Google OAuth flow
4. Verify you're redirected to the home page
5. Check that the navbar shows your profile icon
6. Verify user data is saved in MongoDB

## Step 6: User Flow

### New User (First Time)
1. User clicks "Continue with Google"
2. Google OAuth consent screen appears
3. User grants permissions
4. Backend creates new user with:
   - `firstName` and `lastName` from Google profile
   - `email` from Google account
   - `profileImage` from Google profile picture
   - `role: "guest"`
   - `isGoogleUser: true`
5. User is redirected to home page
6. Navbar shows profile icon

### Existing User
1. User clicks "Continue with Google"
2. Google OAuth flow completes
3. Backend finds existing user by email
4. Updates `lastLogin` timestamp
5. User is redirected to home page
6. Navbar shows profile icon

## Step 7: Database Schema Updates

The User model has been updated to support Google authentication:

```javascript
{
  // ... existing fields
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser; // Password not required for Google users
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`

2. **"Client ID not found" error**
   - Verify `GOOGLE_CLIENT_ID` in `.env.local` is correct
   - Ensure the OAuth consent screen is configured

3. **"Access blocked" error**
   - Check OAuth consent screen configuration
   - Add your email to test users if in testing mode

4. **Session not persisting**
   - Verify `NEXTAUTH_SECRET` is set
   - Check that cookies are enabled in browser

### Debug Mode
To enable debug mode, add to your `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **HTTPS in Production**: Use HTTPS URLs in production
3. **Domain Verification**: Verify your domain in Google Console for production
4. **OAuth Consent Screen**: Configure properly for production use

## Production Deployment

For production deployment:

1. Update Google OAuth redirect URIs to your production domain
2. Set `NEXTAUTH_URL` to your production URL
3. Use a secure `NEXTAUTH_SECRET`
4. Configure OAuth consent screen for production
5. Verify your domain in Google Console

## Features Implemented

✅ Google Sign-in/Sign-up buttons on login and signup pages  
✅ NextAuth.js integration with Google provider  
✅ Backend route `/api/users/google-signup`  
✅ User creation with `accountType="guest"`  
✅ Profile icon in navbar after login  
✅ Session management and logout  
✅ Error handling and user feedback  
✅ Modern UI with Shadcn components  

The Google authentication system is now fully integrated and ready for use!
