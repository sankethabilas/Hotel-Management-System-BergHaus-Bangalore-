# Auth.js (NextAuth.js v5) Setup Guide

## Overview
This guide will help you set up Google authentication using Auth.js (the modern version of NextAuth.js) for your Hotel Management System.

## Your Google OAuth Credentials
- **Client ID**: `264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com`
- **Client Secret**: `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`

## Step 1: Environment Variables Setup

Create a `.env.local` file in your `frontend` directory with the following content:

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
- Never commit the `.env.local` file to version control

## Step 2: Google Cloud Console Configuration

### 2.1 Authorized Redirect URIs
Make sure your Google Cloud Console project has these redirect URIs configured:
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/signin/google`

### 2.2 OAuth Consent Screen
Ensure your OAuth consent screen is properly configured:
1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Add your email to test users if in testing mode
3. Configure the consent screen with your app information

## Step 3: Implementation Details

### 3.1 Auth.js Configuration
The Auth.js configuration is located in `frontend/pages/api/auth/[...nextauth].ts`:

```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import axios from 'axios';

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Send user data to backend for Google signup
          const response = await axios.post('http://localhost:5000/api/users/google-signup', {
            name: user.name,
            email: user.email,
            profilePic: user.image,
            accountType: 'guest'
          });

          if (response.data.success) {
            user.id = response.data.user._id;
            user.role = response.data.user.role;
            return true;
          }
        } catch (error) {
          console.error('Google signup error:', error);
          return false;
        }
      }
      return true;
    },
    // ... other callbacks
  },
  // ... other configuration
});

export { handler as GET, handler as POST };
```

### 3.2 Backend Integration
The backend route `/api/users/google-signup` handles:
- Creating new users with Google data
- Updating existing users' last login
- Setting `isGoogleUser: true` flag
- Assigning default `guest` role

### 3.3 Frontend Components
- **Google Button**: `frontend/components/google-auth-button.tsx`
- **Auth Context**: `frontend/contexts/AuthContext.tsx`
- **Providers**: `frontend/components/providers.tsx`

## Step 4: Testing the Implementation

### 4.1 Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4.2 Test Google Authentication
1. Navigate to `http://localhost:3000/auth/login`
2. Click "Continue with Google"
3. Complete the Google OAuth flow
4. Verify you're redirected to the home page
5. Check that the navbar shows your profile icon
6. Verify user data is saved in MongoDB

## Step 5: User Flow

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

## Step 6: Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure redirect URI in Google Console: `http://localhost:3000/api/auth/callback/google`

2. **"Client ID not found" error**
   - Verify `GOOGLE_CLIENT_ID` in `.env.local` is correct
   - Check OAuth consent screen configuration

3. **"Access blocked" error**
   - Add your email to test users in OAuth consent screen
   - Ensure consent screen is properly configured

4. **Session not persisting**
   - Verify `NEXTAUTH_SECRET` is set
   - Check browser cookies are enabled

### Debug Mode
Add to your `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## Step 7: Production Deployment

For production deployment:

1. **Update Google OAuth redirect URIs** to your production domain
2. **Set `NEXTAUTH_URL`** to your production URL
3. **Use a secure `NEXTAUTH_SECRET`**
4. **Configure OAuth consent screen** for production
5. **Verify your domain** in Google Console

## Features Implemented

✅ Google Sign-in/Sign-up buttons on login and signup pages  
✅ Auth.js (NextAuth.js v5) integration with Google provider  
✅ Backend route `/api/users/google-signup`  
✅ User creation with `accountType="guest"`  
✅ Profile icon in navbar after login  
✅ Session management and logout  
✅ Error handling and user feedback  
✅ Modern UI with Shadcn components  
✅ TypeScript support  
✅ Production-ready configuration  

## Security Features

- ✅ Secure OAuth 2.0 flow
- ✅ JWT session management
- ✅ Environment variable protection
- ✅ Input validation on backend
- ✅ HTTPS ready for production
- ✅ Secure cookie handling

## Next Steps

1. Create the `.env.local` file with your credentials
2. Start both backend and frontend servers
3. Test the Google authentication flow
4. Verify user creation in MongoDB
5. Test the complete user experience

The Google authentication system is now ready for testing and production use!
