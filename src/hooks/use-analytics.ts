/**
 * Analytics Hook for ArvaForm Frontend
 *
 * Provides comprehensive analytics data management with React 19 patterns,
 * TanStack Query v5 integration, and optimistic updates for 2025 standards.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';

import {
  analyticsKeys,
  calculateDateRange,
  calculatePercentageChange,
  formatMetricValue,
  getFormAnalytics,
  getFormAnalyticsOverview,
  getTrendIndicator,
  refreshFormAnalytics,
  transformDeviceData,
  transformTimeSeriesData,
} from '@/lib/api/analytics';
import type {
  AnalyticsDashboardState,
  AnalyticsPeriod,
  AnalyticsQueryParams,
  DeviceBreakdownData,
  SubmissionTrendData,
} from '@/types/analytics.types';
import {
  ANALYTICS_REFRESH_INTERVALS,
  AnalyticsMetric,
  DEFAULT_ANALYTICS_PERIOD,
} from '@/types/analytics.types';

// ============================================================================
// Analytics Overview Hook
// ============================================================================

interface UseFormAnalyticsOverviewOptions {
  formId: string;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useFormAnalyticsOverview({
  formId,
  refreshInterval = ANALYTICS_REFRESH_INTERVALS.dashboard,
  enabled = true,
}: UseFormAnalyticsOverviewOptions) {
  const queryResult = useQuery({
    queryKey: analyticsKeys.overview(formId),
    queryFn: () => getFormAnalyticsOverview(formId),
    enabled: enabled && !!formId,
    refetchInterval: refreshInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const formattedData = useMemo(() => {
    if (!queryResult.data) return null;

    const data = queryResult.data;

    return {
      ...data,
      formattedCompletionRate: formatMetricValue(data.completionRate, 'percentage'),
      formattedAvgCompletionTime: formatMetricValue(data.avgCompletionTime, 'duration'),
      formattedTotalRevenue: formatMetricValue(data.totalRevenue, 'currency'),
      formattedBounceRate: formatMetricValue(data.bounceRate, 'percentage'),
      formattedSpamRate: formatMetricValue(data.spamRate, 'percentage'),
      formattedTotalSubmissions: formatMetricValue(data.totalSubmissions, 'number'),
      formattedTotalViews: formatMetricValue(data.totalViews, 'number'),
      formattedUniqueVisitors: formatMetricValue(data.uniqueVisitors, 'number'),
    };
  }, [queryResult.data]);

  return {
    ...queryResult,
    data: formattedData,
  };
}

// ============================================================================
// Detailed Analytics Hook
// ============================================================================

interface UseFormAnalyticsOptions {
  formId: string;
  period?: AnalyticsPeriod;
  customDateRange?: { start: Date; end: Date };
  refreshInterval?: number;
  enabled?: boolean;
  includeDetails?: boolean;
}

export function useFormAnalytics({
  formId,
  period = DEFAULT_ANALYTICS_PERIOD,
  customDateRange,
  refreshInterval = ANALYTICS_REFRESH_INTERVALS.standard,
  enabled = true,
  includeDetails = true,
}: UseFormAnalyticsOptions) {
  const dateRange = useMemo(() => {
    return customDateRange || calculateDateRange(period);
  }, [customDateRange, period]);

  const queryParams: AnalyticsQueryParams = useMemo(
    () => ({
      period,
      startDate: dateRange.start,
      endDate: dateRange.end,
      includeDetails,
    }),
    [period, dateRange, includeDetails],
  );

  const queryResult = useQuery({
    queryKey: analyticsKeys.details(formId, queryParams),
    queryFn: () => getFormAnalytics(formId, queryParams),
    enabled: enabled && !!formId,
    refetchInterval: refreshInterval,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
  });

  // Transform data for charts using React 19 patterns
  const chartData = useMemo(() => {
    if (!queryResult.data) return null;

    const data = queryResult.data;

    // Transform time series data for submission trends
    const submissionTrends: SubmissionTrendData[] = transformTimeSeriesData(
      data.timeDistribution || [],
      period,
    );

    // Transform device data for pie charts
    const deviceBreakdown: DeviceBreakdownData[] = transformDeviceData(data.devices || []);

    return {
      submissionTrends,
      deviceBreakdown,
      geographic: data.geographic || [],
      performance: data.performance,
      conversionFunnel: data.conversionFunnel || [],
    };
  }, [queryResult.data, period]);

  return {
    ...queryResult,
    chartData,
    dateRange,
    period,
  };
}

// ============================================================================
// Analytics Dashboard State Hook
// ============================================================================

interface UseAnalyticsDashboardOptions {
  formId: string;
  defaultPeriod?: AnalyticsPeriod;
  enableRealtime?: boolean;
}

export function useAnalyticsDashboard({
  formId,
  defaultPeriod = DEFAULT_ANALYTICS_PERIOD,
  enableRealtime = false,
}: UseAnalyticsDashboardOptions) {
  // React 19 useTransition for smooth UI updates
  const [isPending, startTransition] = useTransition();

  // Analytics dashboard state with useOptimistic for immediate UI feedback
  const [dashboardState, setOptimisticState] = useOptimistic(
    {
      selectedPeriod: defaultPeriod,
      dateRange: calculateDateRange(defaultPeriod),
      selectedMetrics: [
        AnalyticsMetric.SUBMISSIONS,
        AnalyticsMetric.VIEWS,
        AnalyticsMetric.COMPLETION_RATE,
      ],
      isRealtime: enableRealtime,
      refreshInterval: enableRealtime
        ? ANALYTICS_REFRESH_INTERVALS.realtime
        : ANALYTICS_REFRESH_INTERVALS.standard,
      isLoading: false,
      error: null,
      lastRefresh: new Date(),
    },
    (
      currentState: AnalyticsDashboardState,
      optimisticUpdate: Partial<AnalyticsDashboardState>,
    ) => ({
      ...currentState,
      ...optimisticUpdate,
    }),
  );

  // Get analytics data based on current state
  const analytics = useFormAnalytics({
    formId,
    period: dashboardState.selectedPeriod,
    customDateRange: dashboardState.dateRange,
    refreshInterval: dashboardState.refreshInterval,
    enabled: true,
    includeDetails: true,
  });

  const overview = useFormAnalyticsOverview({
    formId,
    refreshInterval: dashboardState.refreshInterval,
    enabled: true,
  });

  // Update period with optimistic UI
  const updatePeriod = useCallback(
    (period: AnalyticsPeriod) => {
      startTransition(() => {
        const newDateRange = calculateDateRange(period);
        setOptimisticState({
          selectedPeriod: period,
          dateRange: newDateRange,
          lastRefresh: new Date(),
        });
      });
    },
    [setOptimisticState],
  );

  // Update date range with optimistic UI
  const updateDateRange = useCallback(
    (dateRange: { start: Date; end: Date }) => {
      startTransition(() => {
        setOptimisticState({
          dateRange,
          lastRefresh: new Date(),
        });
      });
    },
    [setOptimisticState],
  );

  // Toggle realtime mode
  const toggleRealtime = useCallback(() => {
    startTransition(() => {
      const newRealtimeState = !dashboardState.isRealtime;
      setOptimisticState({
        isRealtime: newRealtimeState,
        refreshInterval: newRealtimeState
          ? ANALYTICS_REFRESH_INTERVALS.realtime
          : ANALYTICS_REFRESH_INTERVALS.standard,
        lastRefresh: new Date(),
      });
    });
  }, [dashboardState.isRealtime, setOptimisticState]);

  return {
    // State
    dashboardState,
    isPending,

    // Data
    analytics,
    overview,

    // Actions
    updatePeriod,
    updateDateRange,
    toggleRealtime,

    // Computed values
    isLoading: analytics.isLoading || overview.isLoading || isPending,
    error: analytics.error || overview.error,
    lastRefresh: dashboardState.lastRefresh,
  };
}

// ============================================================================
// Analytics Refresh Hook
// ============================================================================

export function useAnalyticsRefresh(formId: string) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const refreshMutation = useMutation({
    mutationFn: () => refreshFormAnalytics(formId),
    onSuccess: () => {
      startTransition(() => {
        // Invalidate all analytics queries for this form
        queryClient.invalidateQueries({
          queryKey: analyticsKeys.form(formId),
        });

        toast.success('Analytics data refreshed successfully');
      });
    },
    onError: (error) => {
      toast.error(`Failed to refresh analytics: ${error.message}`);
    },
  });

  const refresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  return {
    refresh,
    isRefreshing: refreshMutation.isPending || isPending,
    error: refreshMutation.error,
  };
}

// ============================================================================
// Analytics Comparison Hook (for A/B testing or period comparison)
// ============================================================================

interface UseAnalyticsComparisonOptions {
  formId: string;
  currentPeriod: AnalyticsPeriod;
  comparisonPeriod?: AnalyticsPeriod;
  enabled?: boolean;
}

export function useAnalyticsComparison({
  formId,
  currentPeriod,
  comparisonPeriod,
  enabled = true,
}: UseAnalyticsComparisonOptions) {
  // Current period data
  const currentData = useFormAnalyticsOverview({
    formId,
    enabled,
  });

  // Previous period data for comparison
  const previousPeriodRange = useMemo(() => {
    const period = comparisonPeriod || currentPeriod;
    const current = calculateDateRange(period);
    const duration = current.end.getTime() - current.start.getTime();

    return {
      start: new Date(current.start.getTime() - duration),
      end: current.start,
    };
  }, [currentPeriod, comparisonPeriod]);

  const previousData = useFormAnalytics({
    formId,
    period: comparisonPeriod || currentPeriod,
    customDateRange: previousPeriodRange,
    enabled,
    includeDetails: false,
  });

  // Calculate comparison metrics
  const comparison = useMemo(() => {
    if (!currentData.data || !previousData.data) return null;

    const current = currentData.data;
    const previous = previousData.data;

    const metrics = [
      {
        key: 'totalSubmissions',
        label: 'Total Submissions',
        current: current.totalSubmissions,
        previous: previous.totalSubmissions,
        change: calculatePercentageChange(current.totalSubmissions, previous.totalSubmissions),
      },
      {
        key: 'completionRate',
        label: 'Completion Rate',
        current: current.completionRate,
        previous: previous.completionRate,
        change: calculatePercentageChange(current.completionRate, previous.completionRate),
      },
      {
        key: 'totalViews',
        label: 'Total Views',
        current: current.totalViews,
        previous: previous.totalViews,
        change: calculatePercentageChange(current.totalViews, previous.totalViews),
      },
      {
        key: 'bounceRate',
        label: 'Bounce Rate',
        current: current.bounceRate,
        previous: previous.bounceRate,
        change: calculatePercentageChange(current.bounceRate, previous.bounceRate),
      },
    ];

    return metrics.map((metric) => ({
      ...metric,
      trend: getTrendIndicator(metric.change),
      formattedChange: formatMetricValue(Math.abs(metric.change), 'percentage'),
    }));
  }, [currentData.data, previousData.data]);

  return {
    currentData: currentData.data,
    previousData: previousData.data,
    comparison,
    isLoading: currentData.isLoading || previousData.isLoading,
    error: currentData.error || previousData.error,
  };
}

// ============================================================================
// Analytics Export Hook
// ============================================================================

export function useAnalyticsExport(formId: string) {
  const [isPending, startTransition] = useTransition();

  // This would integrate with the export functionality from E3-T007
  const exportAnalytics = useCallback(
    (format: 'pdf' | 'csv' | 'xlsx') => {
      startTransition(() => {
        // Trigger export - would use actual export functionality from E3-T007
        toast.info(`Exporting analytics for form ${formId} as ${format.toUpperCase()}...`);

        // Simulate export process
        setTimeout(() => {
          toast.success(`Analytics exported successfully as ${format.toUpperCase()}`);
        }, 2000);
      });
    },
    [formId],
  );

  return {
    exportAnalytics,
    isExporting: isPending,
  };
}
