/**
 * Submissions Management Page - ArvaForm 2025
 *
 * Server Component for form submissions dashboard following Next.js 15 and React 19 patterns
 * Implements server-side data fetching with client-side interactivity boundaries
 */

import { SubmissionTableSkeleton } from '@/components/submissions/submission-table-skeleton';
import { SubmissionsDashboard } from '@/components/submissions/submissions-dashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getForm } from '@/lib/api/forms';
import { fetchSubmissions, fetchSubmissionStats } from '@/lib/api/submissions';
import type {
  Submission,
  SubmissionFilters,
  SubmissionQueryParams,
} from '@/types/submission.types';
import { AlertCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface SubmissionsPageProps {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generate metadata for the submissions page
 */
export async function generateMetadata({ params }: SubmissionsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { formId } = resolvedParams;

  try {
    const form = await getForm(formId);
    return {
      title: `${form.title} - Submissions | ArvaForm`,
      description: `Manage and analyze submissions for ${form.title}`,
    };
  } catch {
    return {
      title: 'Form Submissions | ArvaForm',
      description: 'Manage and analyze form submissions',
    };
  }
}

/**
 * Parse search params to submission query params
 */
function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): SubmissionQueryParams {
  const page = parseInt(String(searchParams.page || '1'), 10);
  const limit = parseInt(String(searchParams.limit || '20'), 10);

  const sortBy = String(searchParams.sortBy || 'submittedAt') as
    | keyof Submission
    | 'submitterInfo.email'
    | 'metadata.deviceType';
  const sortDir = String(searchParams.sortDir || 'desc') as 'asc' | 'desc';

  const filters: Partial<SubmissionFilters> = {};

  // Parse basic filters
  if (searchParams.search) {
    filters.search = String(searchParams.search);
  }

  if (searchParams.status) {
    const statusArray = Array.isArray(searchParams.status)
      ? searchParams.status
      : [searchParams.status];
    (filters as unknown as { status: string[] }).status = statusArray.map((s) => String(s));
  }

  if (searchParams.dateFrom || searchParams.dateTo) {
    filters.dateRange = {};
    if (searchParams.dateFrom) {
      filters.dateRange.from = new Date(String(searchParams.dateFrom));
    }
    if (searchParams.dateTo) {
      filters.dateRange.to = new Date(String(searchParams.dateTo));
    }
  }

  if (searchParams.hasEmail) {
    filters.hasEmail = String(searchParams.hasEmail) === 'true';
  }

  if (searchParams.hasFiles) {
    filters.hasFiles = String(searchParams.hasFiles) === 'true';
  }

  if (searchParams.maxSpamScore) {
    filters.maxSpamScore = parseInt(String(searchParams.maxSpamScore), 10);
  }

  if (searchParams.deviceType) {
    const deviceTypeArray = Array.isArray(searchParams.deviceType)
      ? searchParams.deviceType
      : [searchParams.deviceType];
    filters.deviceType = deviceTypeArray.map((d) => String(d)) as Array<
      'desktop' | 'mobile' | 'tablet'
    >;
  }

  return {
    page,
    limit,
    sorting: { field: sortBy, direction: sortDir },
    ...(Object.keys(filters).length > 0 && { filters }),
  };
}

/**
 * Submissions Statistics Component (Server Component)
 */
async function SubmissionStats({ formId }: { formId: string }) {
  try {
    const stats = await fetchSubmissionStats(formId);

    return (
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.today} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.new?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">New submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.thisWeek} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quality</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(100 - stats.avgSpamScore).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Quality score</p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (_error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load submission statistics. Please try again.</AlertDescription>
      </Alert>
    );
  }
}

/**
 * Form Header Component (Server Component)
 */
async function FormHeader({ formId }: { formId: string }) {
  try {
    const form = await getForm(formId);

    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
        <p className="text-muted-foreground">Manage and analyze submissions for your form</p>
      </div>
    );
  } catch (_error) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
        <p className="text-muted-foreground">Manage and analyze form submissions</p>
      </div>
    );
  }
}

/**
 * Main Submissions Page Component (Server Component)
 */
export default async function SubmissionsPage({ params, searchParams }: SubmissionsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { formId } = resolvedParams;

  // Validate form ID format
  if (!formId || formId.length < 1) {
    notFound();
  }

  // Parse search parameters
  const queryParams = parseSearchParams(resolvedSearchParams);

  try {
    // Pre-fetch initial data for better UX
    const [initialSubmissions, form] = await Promise.all([
      fetchSubmissions(formId, queryParams),
      getForm(formId).catch(() => null), // Don't fail if form fetch fails
    ]);

    // Check if form exists
    if (!form) {
      notFound();
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <Suspense
            fallback={
              <div className="space-y-2">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-5 w-96 bg-muted animate-pulse rounded" />
              </div>
            }>
            <FormHeader formId={formId} />
          </Suspense>
        </div>

        {/* Statistics Cards */}
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="space-y-0 pb-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
          <SubmissionStats formId={formId} />
        </Suspense>

        {/* Main Dashboard */}
        <Card>
          <CardContent className="p-0">
            <Suspense fallback={<SubmissionTableSkeleton />}>
              <SubmissionsDashboard
                formId={formId}
                initialData={initialSubmissions}
                initialParams={queryParams}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    // Handle server-side errors gracefully
    console.error('Error loading submissions page:', error);

    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Submissions</AlertTitle>
          <AlertDescription>
            There was a problem loading the submissions. Please check that the form exists and try
            again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
