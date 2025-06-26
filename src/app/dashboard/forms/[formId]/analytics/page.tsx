/**
 * Analytics Page for Form Dashboard
 *
 * Next.js 15 App Router implementation with Server Component patterns,
 * async params handling, and React 19 integration for 2025 standards.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { AnalyticsDashboardSkeleton } from '@/components/analytics/analytics-dashboard-skeleton';
import { getForm } from '@/lib/api/forms';

// ============================================================================
// Page Props & Metadata
// ============================================================================

interface AnalyticsPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export async function generateMetadata({ params }: AnalyticsPageProps): Promise<Metadata> {
  const { formId } = await params;

  try {
    const form = await getForm(formId);

    return {
      title: `Analytics - ${form.title} | ArvaForm`,
      description: `View detailed analytics and insights for ${form.title}. Track submissions, completion rates, and user engagement.`,
      robots: {
        index: false, // Private analytics page
        follow: false,
      },
    };
  } catch {
    return {
      title: 'Analytics | ArvaForm',
      description: 'Form analytics dashboard',
    };
  }
}

// ============================================================================
// Main Analytics Page Component
// ============================================================================

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { formId } = await params;

  // Validate form exists - this will throw notFound() if form doesn't exist
  let form;
  try {
    form = await getForm(formId);
  } catch (error) {
    console.error('Failed to fetch form for analytics:', error);
    notFound();
  }

  // Ensure user has access to this form (basic check)
  if (!form) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Page Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Insights and performance metrics for <span className="font-medium">{form.title}</span>
            </p>
          </div>

          {/* Form Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                form.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : form.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
              {form.status === 'published' ? '● Live' : '● Draft'}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="flex-1 bg-gray-50">
        <Suspense fallback={<AnalyticsDashboardSkeleton />}>
          <AnalyticsDashboard formId={formId} />
        </Suspense>
      </div>
    </div>
  );
}
