/**
 * Analytics API Client for ArvaForm Frontend
 *
 * Provides type-safe API functions for analytics operations
 * including metrics retrieval, real-time updates, and export functionality.
 */

import { apiClient } from '@/lib/api-client';
import type {
  AnalyticsDetailDto,
  AnalyticsExportJob,
  AnalyticsExportOptions,
  AnalyticsHealthDto,
  AnalyticsOverviewDto,
  AnalyticsQueryParams,
  BulkAnalyticsQueryDto,
  RealtimeAnalyticsEvent,
} from '@/types/analytics.types';
import { AnalyticsPeriod } from '@/types/analytics.types';

// ============================================================================
// Analytics Query Key Factory (for TanStack Query)
// ============================================================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  forms: () => [...analyticsKeys.all, 'forms'] as const,
  form: (formId: string) => [...analyticsKeys.forms(), formId] as const,
  overview: (formId: string) => [...analyticsKeys.form(formId), 'overview'] as const,
  details: (formId: string, params?: AnalyticsQueryParams) =>
    [...analyticsKeys.form(formId), 'details', params] as const,
  realtime: (formId: string) => [...analyticsKeys.form(formId), 'realtime'] as const,
  bulk: (formIds: string[]) => [...analyticsKeys.all, 'bulk', formIds] as const,
  health: () => [...analyticsKeys.all, 'health'] as const,
  export: (formId: string, options: AnalyticsExportOptions) =>
    [...analyticsKeys.form(formId), 'export', options] as const,
} as const;

// ============================================================================
// Core Analytics API Functions
// ============================================================================

/**
 * Get comprehensive analytics for a specific form
 * Includes all metrics: overview, geographic, devices, performance
 */
export const getFormAnalytics = async (
  formId: string,
  params?: AnalyticsQueryParams,
): Promise<AnalyticsDetailDto> => {
  const searchParams = new URLSearchParams();

  if (params?.period) searchParams.append('period', params.period);
  if (params?.startDate) searchParams.append('startDate', params.startDate.toISOString());
  if (params?.endDate) searchParams.append('endDate', params.endDate.toISOString());
  if (params?.metrics?.length) {
    params.metrics.forEach((metric) => searchParams.append('metrics', metric));
  }
  if (params?.realtime !== undefined) searchParams.append('realtime', String(params.realtime));
  if (params?.timezone) searchParams.append('timezone', params.timezone);
  if (params?.includeDetails !== undefined) {
    searchParams.append('includeDetails', String(params.includeDetails));
  }

  const endpoint = `/analytics/forms/${formId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await apiClient.get<AnalyticsDetailDto>(endpoint);
  return response.data;
};

/**
 * Get quick overview metrics for dashboard display
 * Optimized for fast loading with cached results
 */
export const getFormAnalyticsOverview = async (formId: string): Promise<AnalyticsOverviewDto> => {
  const response = await apiClient.get<AnalyticsOverviewDto>(`/analytics/forms/${formId}/overview`);
  return response.data;
};

/**
 * Refresh analytics data manually
 * Triggers fresh computation and cache invalidation
 */
export const refreshFormAnalytics = async (
  formId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/analytics/forms/${formId}/refresh`,
  );
  return response.data;
};

/**
 * Get bulk analytics for multiple forms
 * Efficient for dashboard overview of many forms
 */
export const getBulkAnalytics = async (
  query: BulkAnalyticsQueryDto,
): Promise<Record<string, AnalyticsOverviewDto>> => {
  const response = await apiClient.post<Record<string, AnalyticsOverviewDto>>(
    '/analytics/bulk',
    query,
  );
  return response.data;
};

/**
 * Get real-time analytics stream for live updates
 * Returns Server-Sent Events endpoint URL for streaming
 */
export const getRealtimeAnalytics = async (formId: string): Promise<RealtimeAnalyticsEvent[]> => {
  const response = await apiClient.get<RealtimeAnalyticsEvent[]>(
    `/analytics/forms/${formId}/realtime`,
  );
  return response.data;
};

/**
 * Get analytics service health status
 * Useful for monitoring and troubleshooting
 */
export const getAnalyticsHealth = async (): Promise<AnalyticsHealthDto> => {
  const response = await apiClient.get<AnalyticsHealthDto>('/analytics/health');
  return response.data;
};

// ============================================================================
// Analytics Export Functions
// ============================================================================

/**
 * Export analytics data in specified format
 * Returns export job ID for tracking progress
 */
export const exportAnalytics = async (
  formId: string,
  options: AnalyticsExportOptions,
): Promise<AnalyticsExportJob> => {
  const response = await apiClient.post<AnalyticsExportJob>(
    `/analytics/forms/${formId}/export`,
    options,
  );
  return response.data;
};

/**
 * Get export job status and download URL
 */
export const getExportJob = async (jobId: string): Promise<AnalyticsExportJob> => {
  const response = await apiClient.get<AnalyticsExportJob>(`/analytics/export/${jobId}`);
  return response.data;
};

/**
 * Cancel an export job
 */
export const cancelExportJob = async (jobId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete<{ success: boolean }>(`/analytics/export/${jobId}`);
  return response.data;
};

// ============================================================================
// Analytics Utility Functions
// ============================================================================

/**
 * Calculate date range for a given period
 * Utility function for consistent date range calculation
 */
export const calculateDateRange = (period: AnalyticsPeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case AnalyticsPeriod.HOUR:
      start.setHours(start.getHours() - 1);
      break;
    case AnalyticsPeriod.DAY:
      start.setDate(start.getDate() - 1);
      break;
    case AnalyticsPeriod.WEEK:
      start.setDate(start.getDate() - 7);
      break;
    case AnalyticsPeriod.MONTH:
      start.setMonth(start.getMonth() - 1);
      break;
    case AnalyticsPeriod.QUARTER:
      start.setMonth(start.getMonth() - 3);
      break;
    case AnalyticsPeriod.YEAR:
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 7); // Default to week
  }

  return { start, end };
};

/**
 * Format analytics period for display
 */
export const formatAnalyticsPeriod = (period: AnalyticsPeriod): string => {
  const periodLabels: Record<AnalyticsPeriod, string> = {
    [AnalyticsPeriod.HOUR]: 'Last Hour',
    [AnalyticsPeriod.DAY]: 'Last 24 Hours',
    [AnalyticsPeriod.WEEK]: 'Last 7 Days',
    [AnalyticsPeriod.MONTH]: 'Last 30 Days',
    [AnalyticsPeriod.QUARTER]: 'Last 3 Months',
    [AnalyticsPeriod.YEAR]: 'Last Year',
  };
  return periodLabels[period];
};

/**
 * Format metric values for display
 */
export const formatMetricValue = (
  value: number,
  type: 'percentage' | 'number' | 'duration' | 'currency',
): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat().format(value);
    case 'duration':
      if (value < 60) return `${value.toFixed(1)}s`;
      const minutes = Math.floor(value / 60);
      const seconds = value % 60;
      return `${minutes}m ${seconds.toFixed(0)}s`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    default:
      return String(value);
  }
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Determine trend direction and color
 */
export const getTrendIndicator = (
  percentageChange: number,
): {
  direction: 'up' | 'down' | 'neutral';
  color: 'success' | 'danger' | 'muted';
  icon: 'TrendingUp' | 'TrendingDown' | 'Minus';
} => {
  if (percentageChange > 0) {
    return { direction: 'up', color: 'success', icon: 'TrendingUp' };
  } else if (percentageChange < 0) {
    return { direction: 'down', color: 'danger', icon: 'TrendingDown' };
  } else {
    return { direction: 'neutral', color: 'muted', icon: 'Minus' };
  }
};

// ============================================================================
// Data Transformation Functions for Charts
// ============================================================================

/**
 * Transform analytics data for time series charts
 */
export const transformTimeSeriesData = (
  timeMetrics: Array<{
    hour: number;
    dayOfWeek: number;
    dayOfMonth: number;
    month: number;
    year: number;
    submissions: number;
    views: number;
  }>,
  period: AnalyticsPeriod,
): Array<{
  timestamp: Date;
  value: number;
  submissions: number;
  views: number;
  conversionRate: number;
  label: string;
}> => {
  return timeMetrics.map((metric) => {
    const timestamp = new Date(metric.year, metric.month - 1, metric.dayOfMonth, metric.hour);
    const conversionRate = metric.views > 0 ? (metric.submissions / metric.views) * 100 : 0;

    let label: string;
    switch (period) {
      case AnalyticsPeriod.HOUR:
        label = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        break;
      case AnalyticsPeriod.DAY:
        label = timestamp.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        break;
      case AnalyticsPeriod.WEEK:
      case AnalyticsPeriod.MONTH:
        label = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
      case AnalyticsPeriod.QUARTER:
      case AnalyticsPeriod.YEAR:
        label = timestamp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        break;
      default:
        label = timestamp.toLocaleDateString();
    }

    return {
      timestamp,
      value: metric.submissions, // Using submissions as the primary value
      submissions: metric.submissions,
      views: metric.views,
      conversionRate,
      label,
    };
  });
};

/**
 * Transform device metrics for pie chart
 */
export const transformDeviceData = (
  deviceMetrics: Array<{
    deviceType: 'mobile' | 'tablet' | 'desktop';
    submissions: number;
  }>,
): Array<{
  deviceType: string;
  submissions: number;
  percentage: number;
  fill: string;
}> => {
  const total = deviceMetrics.reduce((sum, device) => sum + device.submissions, 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b']; // blue, green, amber

  return deviceMetrics
    .map((device, index) => ({
      deviceType: device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1),
      submissions: device.submissions,
      percentage: total > 0 ? (device.submissions / total) * 100 : 0,
      fill: colors[index % colors.length] || '#6b7280', // fallback color
    }))
    .sort((a, b) => b.submissions - a.submissions);
};

/**
 * Transform geographic metrics for world map visualization
 */
export const transformGeographicData = (
  geographicMetrics: Array<{
    country: string;
    countryCode: string;
    submissions: number;
    completionRate: number;
  }>,
): Array<{
  country: string;
  countryCode: string;
  value: number;
  submissions: number;
  completionRate: number;
}> => {
  const maxSubmissions = Math.max(...geographicMetrics.map((g) => g.submissions));

  return geographicMetrics.map((geo) => ({
    country: geo.country,
    countryCode: geo.countryCode,
    value: maxSubmissions > 0 ? (geo.submissions / maxSubmissions) * 100 : 0,
    submissions: geo.submissions,
    completionRate: geo.completionRate,
  }));
};
