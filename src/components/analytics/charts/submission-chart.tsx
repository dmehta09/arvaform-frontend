/**
 * Submission Trends Chart Component
 *
 * Interactive chart showing submission trends over time using Recharts
 * with accessibility features, responsive design, and 2025 best practices.
 */

'use client';

import { format } from 'date-fns';
import { Eye, FileText, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsPeriod, SubmissionTrendData } from '@/types/analytics.types';
import { CHART_COLORS } from '@/types/analytics.types';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface SubmissionChartProps {
  data: SubmissionTrendData[];
  period: AnalyticsPeriod;
  title?: string;
  description?: string;
  height?: number;
  showConversionRate?: boolean;
  className?: string;
}

type ChartType = 'line' | 'area' | 'bar';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

// ============================================================================
// Main Submission Chart Component
// ============================================================================

export function SubmissionChart({
  data,
  period,
  title = 'Submission Trends',
  description = 'Track form submissions and views over time',
  height = 300,
  showConversionRate = true,
  className,
}: SubmissionChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  // Format data for display
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(item.timestamp, getPeriodFormat(period)),
      conversionRate: Math.round(item.conversionRate * 100) / 100, // Round to 2 decimal places
    }));
  }, [data, period]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalSubmissions = data.reduce((sum, item) => sum + item.submissions, 0);
    const totalViews = data.reduce((sum, item) => sum + item.views, 0);
    const avgConversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;

    return {
      totalSubmissions,
      totalViews,
      avgConversionRate: Math.round(avgConversionRate * 100) / 100,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <EmptyChartState />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 rounded-md border bg-gray-50 p-1">
            {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType(type)}
                className="h-8 px-3 text-xs"
                aria-label={`Switch to ${type} chart`}>
                {type === 'line' && <TrendingUp className="h-3 w-3" />}
                {type === 'area' && <TrendingUp className="h-3 w-3" />}
                {type === 'bar' && <BarChart className="h-3 w-3" />}
                <span className="ml-1 capitalize">{type}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Total Submissions</p>
              <p className="font-medium">{stats.totalSubmissions.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Total Views</p>
              <p className="font-medium">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Avg. Conversion</p>
              <p className="font-medium">{stats.avgConversionRate}%</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(chartType, chartData, showConversionRate)}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Chart Rendering Functions
// ============================================================================

function renderChart(type: ChartType, data: SubmissionTrendData[], showConversionRate: boolean) {
  const commonProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  const xAxisProps = {
    dataKey: 'date',
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 12, fill: '#6b7280' },
  };

  const yAxisProps = {
    axisLine: false,
    tickLine: false,
    tick: { fontSize: 12, fill: '#6b7280' },
    grid: false,
  };

  switch (type) {
    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Area
            type="monotone"
            dataKey="views"
            stackId="1"
            stroke={CHART_COLORS.secondary}
            fill={CHART_COLORS.secondary}
            fillOpacity={0.6}
            name="Views"
          />
          <Area
            type="monotone"
            dataKey="submissions"
            stackId="1"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.8}
            name="Submissions"
          />

          {showConversionRate && (
            <Area
              type="monotone"
              dataKey="conversionRate"
              stroke={CHART_COLORS.accent}
              fill="none"
              strokeWidth={2}
              name="Conversion Rate (%)"
            />
          )}
        </AreaChart>
      );

    case 'bar':
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar dataKey="views" fill={CHART_COLORS.secondary} name="Views" radius={[2, 2, 0, 0]} />
          <Bar
            dataKey="submissions"
            fill={CHART_COLORS.primary}
            name="Submissions"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      );

    default: // line
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Line
            type="monotone"
            dataKey="views"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
            name="Views"
          />
          <Line
            type="monotone"
            dataKey="submissions"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.primary, strokeWidth: 2 }}
            name="Submissions"
          />

          {showConversionRate && (
            <Line
              type="monotone"
              dataKey="conversionRate"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: CHART_COLORS.accent, strokeWidth: 2, r: 3 }}
              name="Conversion Rate (%)"
            />
          )}
        </LineChart>
      );
  }
}

// ============================================================================
// Custom Tooltip Component
// ============================================================================

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.dataKey === 'conversionRate'
                ? `${entry.value}%`
                : entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyChartState() {
  return (
    <Card>
      <CardContent className="flex h-64 items-center justify-center">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-sm text-gray-600">
            Submission data will appear here once your form starts receiving responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

function getPeriodFormat(period: AnalyticsPeriod): string {
  switch (period) {
    case 'hour':
      return 'HH:mm';
    case 'day':
      return 'MMM dd';
    case 'week':
    case 'month':
      return 'MMM dd';
    case 'quarter':
    case 'year':
      return 'MMM yyyy';
    default:
      return 'MMM dd';
  }
}

// ============================================================================
// Exports
// ============================================================================

export default SubmissionChart;
