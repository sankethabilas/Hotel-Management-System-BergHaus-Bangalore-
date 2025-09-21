'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Exchange code for user info
        console.log('Exchanging code for user info...', { code, redirectUri: `${window.location.origin}/auth/google/callback` });
        
        const response = await axios.post('/api/auth/google/callback', {
          code: code,
          redirectUri: `${window.location.origin}/auth/google/callback`
        });

        console.log('API response:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting to home page...');
          
          // Redirect to home page after successful authentication
          setTimeout(() => {
            // Force a page refresh to ensure AuthContext picks up the new session
            window.location.href = '/';
          }, 1500);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hms-highlight via-white to-hms-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-hms-primary">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your Google authentication'}
            {status === 'success' && 'You have been successfully authenticated'}
            {status === 'error' && 'There was an issue with your authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-hms-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
