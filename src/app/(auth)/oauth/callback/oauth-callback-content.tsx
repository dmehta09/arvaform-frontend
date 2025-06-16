'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * OAuth callback content component that handles the OAuth authentication flow
 * Receives tokens from OAuth providers and manages authentication state
 * This component is wrapped in Suspense to handle useSearchParams() properly
 */
export default function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get tokens from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const error = searchParams.get('message');

        // Handle OAuth error
        if (error) {
          setStatus('error');
          setErrorMessage(getErrorMessage(error));
          return;
        }

        // Validate tokens
        if (!token || !refreshToken) {
          setStatus('error');
          setErrorMessage('Authentication tokens not received');
          return;
        }

        // Store tokens (in a real app, use secure storage)
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        // Set success status
        setStatus('success');

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage('Failed to process authentication');
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'authentication_failed':
        return 'Authentication failed. Please try again.';
      case 'callback_error':
        return 'There was an error processing your authentication.';
      default:
        return 'An unexpected error occurred during authentication.';
    }
  };

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {status === 'loading' && 'Processing Authentication...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && 'Please wait while we complete your login...'}
          {status === 'success' && 'You will be redirected to your dashboard shortly.'}
          {status === 'error' && errorMessage}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {status === 'loading' && (
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                Go Home
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
