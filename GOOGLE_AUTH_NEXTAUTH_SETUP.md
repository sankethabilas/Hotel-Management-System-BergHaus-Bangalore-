# Google Authentication with NextAuth.js Setup Guide

## Overview
This guide explains how to set up Google authentication using NextAuth.js in your HMS project. The implementation properly saves Google profile data and displays it throughout the application.

## Environment Variables Setup

Create a `.env.local` file in your `frontend` directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## Key Features Implemented

### 1. NextAuth.js Configuration (`frontend/lib/auth.ts`)
- Proper Google OAuth provider setup
- Custom callbacks to save user data to your backend
- JWT token management with user profile data
- Session management with extended user properties

### 2. Profile Image Handling
- **Custom uploaded images**: Stored in backend uploads folder (`/uploads/`)
- **Google profile images**: External URLs from Google
- **Fallback**: User initials when no image is available
- **Smart URL resolution**: Automatically detects image type and constructs proper URLs

### 3. User Data Flow
1. User clicks "Sign up with Google"
2. NextAuth handles OAuth flow
3. `signIn` callback sends user data to backend `/api/users/google-signup`
4. Backend creates/updates user in MongoDB
5. `jwt` callback stores user data in JWT token
6. `session` callback makes user data available to frontend
7. AuthContext reads session and provides user data to components

### 4. Profile Page Features
- Displays Google profile image or custom uploaded image
- Shows user's name, email, and role from Google account
- Allows editing of profile information
- Supports profile picture upload with fallback to Google image
- Loading states during data fetching

### 5. Navbar Integration
- Dynamic profile icon that updates after login
- Shows Google profile image or user initials
- Displays user name and email in dropdown
- Proper loading states

## Components Updated

### New Components
- `GoogleAuthButton` - NextAuth-based Google authentication button
- `[...nextauth]/route.ts` - NextAuth API route handler

### Updated Components
- `AuthContext` - Now properly reads NextAuth session data
- `ProfilePage` - Enhanced profile image handling and Google data display
- `Navbar` - Dynamic profile icon with proper image fallbacks
- `LoginPage` & `SignupPage` - Updated to use new Google auth button

## Backend Integration

The backend `/api/users/google-signup` endpoint:
- Receives Google user data (name, email, profile picture)
- Creates new user or updates existing user
- Sets `isGoogleUser: true` flag
- Stores Google profile image URL
- Returns complete user object

## Testing the Implementation

1. Start your backend server: `cd backend && npm start`
2. Start your frontend server: `cd frontend && npm run dev`
3. Navigate to `/auth`
4. Click "Sign up with Google"
5. Complete Google OAuth flow
6. Check that profile page shows Google data
7. Verify navbar shows profile icon

## Troubleshooting

### Common Issues

1. **Profile image not showing**
   - Check if Google profile image URL is accessible
   - Verify backend is saving profile image URL correctly
   - Check browser console for image loading errors

2. **User data not appearing**
   - Verify NextAuth session is being created
   - Check AuthContext is reading session data correctly
   - Ensure backend is returning complete user object

3. **Authentication not working**
   - Verify Google OAuth credentials are correct
   - Check redirect URIs in Google Console
   - Ensure NEXTAUTH_SECRET is set

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test backend `/api/users/google-signup` endpoint directly
4. Check NextAuth session in browser dev tools
5. Verify MongoDB user document structure

## Security Notes

- Never commit `.env.local` file to version control
- Use strong NEXTAUTH_SECRET in production
- Validate all user data on backend
- Implement proper CORS settings for production
- Use HTTPS in production for OAuth redirects

## Production Deployment

1. Update Google OAuth redirect URIs for production domain
2. Set production environment variables
3. Use secure NEXTAUTH_SECRET
4. Configure proper CORS settings
5. Use HTTPS for all OAuth flows
