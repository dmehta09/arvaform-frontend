import { Card, CardContent } from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | ArvaForm Auth',
    default: 'Authentication | ArvaForm',
  },
  description:
    'Secure authentication for ArvaForm platform - Create forms, collect responses, and manage data with confidence.',
  keywords: ['authentication', 'login', 'register', 'forms', 'ArvaForm'],
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Branding Side */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 text-2xl font-bold text-slate-900 dark:text-slate-100 hover:opacity-80 transition-opacity"
              aria-label="ArvaForm Home">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span>ArvaForm</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Create Beautiful Forms
                <br />
                <span className="text-blue-600 dark:text-blue-400">In Minutes</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Build professional forms, surveys, and data collection tools with our intuitive
                drag-and-drop builder. No coding required.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400">Drag & drop form builder</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  Advanced logic and workflows
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400">
                  Real-time analytics & insights
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400">Secure data collection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Side */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            <CardContent className="p-8">
              {/* Mobile Branding */}
              <div className="lg:hidden mb-8 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-xl font-bold text-slate-900 dark:text-slate-100"
                  aria-label="ArvaForm Home">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span>ArvaForm</span>
                </Link>
              </div>

              {children}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
