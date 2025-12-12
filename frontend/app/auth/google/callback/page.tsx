'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams?.get('code');
        const error = searchParams?.get('error');

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
      } catch (error: any) {
        console.error('Google callback error:', error);
        setStatus('error');
        
        // Provide more specific error messages
        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else if (error.response?.data?.error) {
          setMessage(`Authentication error: ${error.response.data.error}`);
        } else if (error.message) {
          setMessage(`Error: ${error.message}`);
        } else {
          setMessage('An error occurred during authentication. Please try again.');
        }
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
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
