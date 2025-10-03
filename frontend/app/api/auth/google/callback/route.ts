import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: '264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com',
      client_secret: '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',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userInfo = userResponse.data;

    // Send user data to backend
    console.log('Sending user data to backend:', {
      name: userInfo.name,
      email: userInfo.email,
      profilePic: userInfo.picture,
      accountType: 'guest'
    });

    const backendResponse = await axios.post('http://localhost:5000/api/users/google-signup', {
      name: userInfo.name,
      email: userInfo.email,
      profilePic: userInfo.picture,
      accountType: 'guest'
    });

    console.log('Backend response:', backendResponse.data);

    if (backendResponse.data.success) {
      // Set session cookie or JWT token
      const response = NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: backendResponse.data.user
      });

      // Set a session cookie that can be read by JavaScript
      const sessionData = {
        userId: backendResponse.data.user._id,
        email: backendResponse.data.user.email,
        role: backendResponse.data.user.role,
        isAuthenticated: true,
        user: backendResponse.data.user // Include full user data
      };
      
      console.log('Setting session cookie with data:', sessionData);
      console.log('User data being stored:', backendResponse.data.user);
      
      response.cookies.set('hms-session', JSON.stringify(sessionData), {
        httpOnly: false, // Allow JavaScript to read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/', // Ensure cookie is available on all paths
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create user account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
