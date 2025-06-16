import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import OAuthCallbackContent from './oauth-callback-content';

/**
 * OAuth callback page that handles the OAuth authentication flow
 * Wrapped in Suspense to handle useSearchParams() properly in Next.js 15
 */
export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Suspense fallback={<OAuthCallbackLoading />}>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}

/**
 * Loading component shown while Suspense is resolving
 */
function OAuthCallbackLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Processing Authentication...</CardTitle>
        <CardDescription>Please wait while we complete your login...</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
}
