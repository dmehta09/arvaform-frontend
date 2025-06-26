/**
 * Analytics Dashboard Component
 *
 * Main dashboard component integrating all analytics components
 * with React 19 patterns, TanStack Query, and 2025 best practices.
 */

'use client';

import { Download, Globe, RefreshCw, Smartphone, TrendingUp } from 'lucide-react';
import { Suspense, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CompletionRateChart } from '@/components/analytics/charts/completion-rate-chart';
import { SubmissionChart } from '@/components/analytics/charts/submission-chart';
import { MetricsCards } from '@/components/analytics/metrics-cards';

import {
  useAnalyticsComparison,
  useAnalyticsDashboard,
  useAnalyticsRefresh,
} from '@/hooks/use-analytics';
import { AnalyticsPeriod, DEFAULT_ANALYTICS_PERIOD } from '@/types/analytics.types';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface AnalyticsDashboardProps {
  formId: string;
  className?: string;
}

// ============================================================================
// Main Analytics Dashboard Component
// ============================================================================

export function AnalyticsDashboard({ formId, className }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>(DEFAULT_ANALYTICS_PERIOD);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data and state management
  const { analytics, overview, updatePeriod, updateDateRange, isPending, isLoading, error } =
    useAnalyticsDashboard({
      formId,
      defaultPeriod: selectedPeriod,
    });

  // Analytics refresh functionality
  const { refresh, isRefreshing } = useAnalyticsRefresh(formId);

  // Period comparison data
  const comparison = useAnalyticsComparison({
    formId,
    currentPeriod: selectedPeriod,
    enabled: !!overview.data,
  });

  // Handle period change
  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    setCustomDateRange(undefined);
    updatePeriod(period);
  };

  // Handle custom date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setCustomDateRange(range);
      updateDateRange({ start: range.from, end: range.to });
    }
  };

  // Handle data refresh
  const handleRefresh = () => {
    refresh();
  };

  // Handle data export (placeholder for E3-T007 integration)
  const handleExport = () => {
    // This would integrate with the export functionality
    console.log('Export analytics data');
  };

  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <div className={`space-y-8 p-6 ${className}`}>
      {/* Dashboard Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Range Picker */}
          <DatePickerWithRange
            value={customDateRange}
            onChange={handleDateRangeChange}
            placeholder="Custom date range"
            className="w-64"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Key Metrics Cards */}
          <Suspense fallback={<MetricsCardsSkeleton />}>
            {overview.data && (
              <MetricsCards
                data={overview.data}
                previousData={comparison.previousData}
                isLoading={isLoading}
              />
            )}
          </Suspense>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Submission Trends */}
            <Suspense fallback={<ChartSkeleton />}>
              {analytics.chartData?.submissionTrends && (
                <SubmissionChart
                  data={analytics.chartData.submissionTrends}
                  period={selectedPeriod}
                  height={350}
                />
              )}
            </Suspense>

            {/* Completion Rate */}
            <Suspense fallback={<ChartSkeleton />}>
              {analytics.chartData?.submissionTrends && (
                <CompletionRateChart
                  data={analytics.chartData.submissionTrends.map((item) => ({
                    timestamp: item.timestamp,
                    value: item.conversionRate,
                    label: item.label,
                    completionRate: item.conversionRate,
                    dropOffRate: 100 - item.conversionRate,
                    totalViews: item.views,
                  }))}
                  period={selectedPeriod}
                  height={350}
                />
              )}
            </Suspense>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Extended Submission Trends */}
            <Suspense fallback={<ChartSkeleton />}>
              {analytics.chartData?.submissionTrends && (
                <SubmissionChart
                  data={analytics.chartData.submissionTrends}
                  period={selectedPeriod}
                  title="Detailed Submission Trends"
                  description="Comprehensive view of form submissions and views over time"
                  height={450}
                  showConversionRate={true}
                />
              )}
            </Suspense>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Device analytics will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Geographic data will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.data?.performance && (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.data.performance.avgLoadTime || 0}ms
                        </p>
                        <p className="text-sm text-gray-600">Avg. Load Time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.data.performance.avgSubmissionTime || 0}s
                        </p>
                        <p className="text-sm text-gray-600">Avg. Submission Time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.data.performance.errorCount || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Errors</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.data.performance.bounceRate || 0}%
                        </p>
                        <p className="text-sm text-gray-600">Bounce Rate</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading Indicator */}
      {(isLoading || isPending) && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading analytics...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Loading Components
// ============================================================================

function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Error Component
// ============================================================================

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Analytics</h3>
        <p className="text-sm text-gray-600 mb-4 max-w-sm">
          {error.message || 'There was an error loading the analytics data.'}
        </p>
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default AnalyticsDashboard;
