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
    const clientId = process.env.GOOGLE_CLIENT_ID || '264905281304-ibmr3p9759rv17l4g02nmthcg7jria2f.apps.googleusercontent.com';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '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';
    
    console.log('Exchanging authorization code for token...', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri,
      codeLength: code?.length
    });
    
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    console.log('Sending user data to backend:', {
      backendUrl: `${backendUrl}/users/google-signup`,
      userEmail: userInfo.email,
      userName: userInfo.name
    });
    
    const backendResponse = await axios.post(`${backendUrl}/users/google-signup`, {
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
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Authentication failed';
    let statusCode = 500;
    
    if (error.response) {
      // Google OAuth API error
      if (error.response.data?.error) {
        const googleError = error.response.data.error;
        if (googleError === 'invalid_grant') {
          errorMessage = 'Authorization code expired or invalid. Please try signing in again.';
        } else if (googleError === 'invalid_client') {
          errorMessage = 'Invalid OAuth client configuration. Please contact support.';
        } else if (googleError === 'redirect_uri_mismatch') {
          errorMessage = 'Redirect URI mismatch. Please check Google Cloud Console configuration.';
        } else {
          errorMessage = `Google OAuth error: ${googleError}. ${error.response.data.error_description || ''}`;
        }
        statusCode = error.response.status || 400;
      } else if (error.response.status === 401) {
        errorMessage = 'Failed to authenticate with Google. Please try again.';
        statusCode = 401;
      } else if (error.response.status === 400) {
        errorMessage = 'Invalid request to Google OAuth. Please try again.';
        statusCode = 400;
      }
    } else if (error.request) {
      // Network error - backend not reachable
      errorMessage = 'Unable to connect to backend server. Please check your connection.';
      statusCode = 503;
    } else if (error.message) {
      // Other errors
      errorMessage = `Authentication error: ${error.message}`;
    }
    
    console.error('Detailed error:', {
      message: errorMessage,
      status: statusCode,
      error: error.response?.data || error.message
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
