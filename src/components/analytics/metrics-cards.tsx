/**
 * Analytics Metrics Cards Component
 *
 * Displays key performance indicators with trend analysis,
 * accessibility features, and modern design patterns for 2025.
 */

'use client';

import {
  Activity,
  Clock,
  DollarSign,
  FileText,
  Minus,
  Shield,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  calculatePercentageChange,
  formatMetricValue,
  getTrendIndicator,
} from '@/lib/api/analytics';
import type { AnalyticsOverviewDto } from '@/types/analytics.types';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface MetricsCardsProps {
  data: AnalyticsOverviewDto;
  previousData?: AnalyticsOverviewDto;
  isLoading?: boolean;
  className?: string;
}

interface MetricCardData {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  change?: number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    color: 'success' | 'danger' | 'muted';
    icon: 'TrendingUp' | 'TrendingDown' | 'Minus';
  };
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  valueType: 'number' | 'percentage' | 'duration' | 'currency';
}

// ============================================================================
// Main Metrics Cards Component
// ============================================================================

export function MetricsCards({
  data,
  previousData,
  isLoading = false,
  className,
}: MetricsCardsProps) {
  // Process metrics data with trend analysis
  const metricsData = useMemo<MetricCardData[]>(() => {
    const metrics: MetricCardData[] = [
      {
        key: 'totalSubmissions',
        label: 'Total Submissions',
        value: data.totalSubmissions,
        formattedValue: formatMetricValue(data.totalSubmissions, 'number'),
        icon: FileText,
        description: 'Total number of form submissions received',
        valueType: 'number',
      },
      {
        key: 'totalViews',
        label: 'Total Views',
        value: data.totalViews,
        formattedValue: formatMetricValue(data.totalViews, 'number'),
        icon: Users,
        description: 'Total number of form page views',
        valueType: 'number',
      },
      {
        key: 'completionRate',
        label: 'Completion Rate',
        value: data.completionRate,
        formattedValue: formatMetricValue(data.completionRate, 'percentage'),
        icon: Target,
        description: 'Percentage of visitors who completed the form',
        valueType: 'percentage',
      },
      {
        key: 'avgCompletionTime',
        label: 'Avg. Completion Time',
        value: data.avgCompletionTime,
        formattedValue: formatMetricValue(data.avgCompletionTime, 'duration'),
        icon: Clock,
        description: 'Average time taken to complete the form',
        valueType: 'duration',
      },
    ];

    // Add optional metrics if they have meaningful values
    if (data.totalRevenue > 0) {
      metrics.push({
        key: 'totalRevenue',
        label: 'Total Revenue',
        value: data.totalRevenue,
        formattedValue: formatMetricValue(data.totalRevenue, 'currency'),
        icon: DollarSign,
        description: 'Total revenue generated from form submissions',
        valueType: 'currency',
      });
    }

    if (data.qualityScore > 0) {
      metrics.push({
        key: 'qualityScore',
        label: 'Quality Score',
        value: data.qualityScore,
        formattedValue: `${data.qualityScore}/100`,
        icon: Star,
        description: 'Overall form quality and user experience score',
        valueType: 'number',
      });
    }

    if (data.spamRate > 0) {
      metrics.push({
        key: 'spamRate',
        label: 'Spam Rate',
        value: data.spamRate,
        formattedValue: formatMetricValue(data.spamRate, 'percentage'),
        icon: Shield,
        description: 'Percentage of submissions identified as spam',
        valueType: 'percentage',
      });
    }

    if (data.bounceRate > 0) {
      metrics.push({
        key: 'bounceRate',
        label: 'Bounce Rate',
        value: data.bounceRate,
        formattedValue: formatMetricValue(data.bounceRate, 'percentage'),
        icon: Activity,
        description: 'Percentage of visitors who left without interacting',
        valueType: 'percentage',
      });
    }

    // Calculate trends if previous data is available
    if (previousData) {
      return metrics.map((metric) => {
        const previousValue = previousData[metric.key as keyof AnalyticsOverviewDto] as number;
        const change = calculatePercentageChange(metric.value, previousValue);
        const trend = getTrendIndicator(change);

        return {
          ...metric,
          previousValue,
          change,
          trend,
        };
      });
    }

    return metrics;
  }, [data, previousData]);

  // Responsive grid layout based on number of metrics
  const gridCols = useMemo(() => {
    const count = metricsData.length;
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }, [metricsData.length]);

  if (isLoading) {
    return <MetricsCardsSkeleton />;
  }

  return (
    <div className={`grid gap-6 ${gridCols} ${className}`}>
      {metricsData.map((metric) => (
        <MetricCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
}

// ============================================================================
// Individual Metric Card Component
// ============================================================================

interface MetricCardProps {
  metric: MetricCardData;
}

function MetricCard({ metric }: MetricCardProps) {
  const IconComponent = metric.icon;
  const TrendIcon =
    metric.trend?.icon === 'TrendingUp'
      ? TrendingUp
      : metric.trend?.icon === 'TrendingDown'
        ? TrendingDown
        : Minus;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
        <IconComponent className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Main Metric Value */}
          <div
            className="text-2xl font-bold text-gray-900"
            role="text"
            aria-label={`${metric.label}: ${metric.formattedValue}`}>
            {metric.formattedValue}
          </div>

          {/* Trend Indicator */}
          {metric.trend && typeof metric.change === 'number' && (
            <div className="flex items-center gap-2 text-sm">
              <TrendIcon
                className={`h-4 w-4 ${
                  metric.trend.color === 'success'
                    ? 'text-green-600'
                    : metric.trend.color === 'danger'
                      ? 'text-red-600'
                      : 'text-gray-400'
                }`}
                aria-hidden="true"
              />

              <span
                className={`font-medium ${
                  metric.trend.color === 'success'
                    ? 'text-green-600'
                    : metric.trend.color === 'danger'
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
                role="text"
                aria-label={`${metric.trend.direction === 'up' ? 'Increased' : metric.trend.direction === 'down' ? 'Decreased' : 'No change'} by ${formatMetricValue(Math.abs(metric.change), 'percentage')}`}>
                {formatMetricValue(Math.abs(metric.change), 'percentage')}
              </span>

              <span className="text-gray-500">vs previous period</span>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-gray-500" role="text">
            {metric.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Loading Skeleton Component
// ============================================================================

function MetricsCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading metrics">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default MetricsCards;
export { MetricsCardsSkeleton };
