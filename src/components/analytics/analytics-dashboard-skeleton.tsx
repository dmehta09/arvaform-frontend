/**
 * Analytics Dashboard Skeleton Component
 *
 * Loading skeleton for analytics dashboard with accessibility
 * and modern design patterns following 2025 standards.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="p-6 space-y-8" role="status" aria-label="Loading analytics dashboard">
      {/* Screen Reader Only Text */}
      <span className="sr-only">Loading analytics dashboard...</span>

      {/* Date Range and Refresh Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" /> {/* Date range picker */}
          <Skeleton className="h-10 w-24" /> {/* Period selector */}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" /> {/* Refresh button */}
          <Skeleton className="h-10 w-24" /> {/* Export button */}
        </div>
      </div>

      {/* Key Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" /> {/* Metric label */}
                <Skeleton className="h-8 w-16" /> {/* Metric value */}
              </div>
              <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon */}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Trend icon */}
              <Skeleton className="h-4 w-12" /> {/* Percentage change */}
              <Skeleton className="h-4 w-20" /> {/* Trend description */}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Submission Trends Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" /> {/* Chart title */}
              <Skeleton className="mt-2 h-4 w-64" /> {/* Chart description */}
            </div>
            <Skeleton className="h-8 w-20" /> {/* Chart options */}
          </div>
          <Skeleton className="h-64 w-full" /> {/* Chart area */}
        </div>

        {/* Device Breakdown Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Skeleton className="h-6 w-36" /> {/* Chart title */}
            <Skeleton className="mt-2 h-4 w-48" /> {/* Chart description */}
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" /> {/* Pie chart */}
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" /> {/* Legend color */}
                  <Skeleton className="h-4 w-16" /> {/* Device type */}
                </div>
                <Skeleton className="h-4 w-12" /> {/* Percentage */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Completion Rate Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <Skeleton className="h-5 w-32" /> {/* Chart title */}
          </div>
          <Skeleton className="h-40 w-full" /> {/* Chart area */}
        </div>

        {/* Geographic Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <Skeleton className="h-5 w-36" /> {/* Chart title */}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-8" /> {/* Country flag */}
                  <Skeleton className="h-4 w-20" /> {/* Country name */}
                </div>
                <Skeleton className="h-4 w-8" /> {/* Count */}
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <Skeleton className="h-5 w-32" /> {/* Section title */}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" /> {/* Metric name */}
                <Skeleton className="h-4 w-16" /> {/* Metric value */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table Skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <Skeleton className="h-6 w-32" /> {/* Table title */}
        </div>
        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 border-b border-gray-100 pb-3">
            <Skeleton className="h-4 w-16" /> {/* Column 1 header */}
            <Skeleton className="h-4 w-20" /> {/* Column 2 header */}
            <Skeleton className="h-4 w-18" /> {/* Column 3 header */}
            <Skeleton className="h-4 w-14" /> {/* Column 4 header */}
          </div>

          {/* Table Rows */}
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                <Skeleton className="h-4 w-24" /> {/* Column 1 data */}
                <Skeleton className="h-4 w-32" /> {/* Column 2 data */}
                <Skeleton className="h-4 w-20" /> {/* Column 3 data */}
                <Skeleton className="h-4 w-16" /> {/* Column 4 data */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboardSkeleton;
