/**
 * Completion Rate Chart Component
 *
 * Displays completion rate trends with drop-off analysis
 * using Recharts with accessibility and 2025 design standards.
 */

'use client';

import { format } from 'date-fns';
import { Target, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalyticsPeriod, CompletionRateData } from '@/types/analytics.types';
import { CHART_COLORS } from '@/types/analytics.types';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface CompletionRateChartProps {
  data: CompletionRateData[];
  period: AnalyticsPeriod;
  height?: number;
  className?: string;
}

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
// Main Completion Rate Chart Component
// ============================================================================

export function CompletionRateChart({
  data,
  period,
  height = 250,
  className,
}: CompletionRateChartProps) {
  // Format data for display
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: format(item.timestamp, getPeriodFormat(period)),
      completionRate: Math.round(item.completionRate * 100) / 100,
      dropOffRate: Math.round(item.dropOffRate * 100) / 100,
    }));
  }, [data, period]);

  // Calculate average completion rate
  const avgCompletionRate = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.completionRate, 0);
    return Math.round((sum / data.length) * 100) / 100;
  }, [data]);

  // Determine performance level
  const performanceLevel = useMemo(() => {
    if (avgCompletionRate >= 70) return { level: 'excellent', color: 'text-green-600' };
    if (avgCompletionRate >= 50) return { level: 'good', color: 'text-blue-600' };
    if (avgCompletionRate >= 30) return { level: 'needs improvement', color: 'text-yellow-600' };
    return { level: 'poor', color: 'text-red-600' };
  }, [avgCompletionRate]);

  if (!data || data.length === 0) {
    return <EmptyChartState className={className} />;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Completion Rate</CardTitle>
            <p className="text-sm text-gray-600">Form completion trends over time</p>
          </div>

          {/* Performance Indicator */}
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{avgCompletionRate}%</span>
            </div>
            <p className={`text-xs font-medium ${performanceLevel.color}`}>
              {performanceLevel.level}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines for performance benchmarks */}
              <ReferenceLine
                y={70}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{ value: 'Excellent (70%+)', position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={50}
                stroke="#3b82f6"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{ value: 'Good (50%+)', position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={30}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeOpacity={0.6}
                label={{ value: 'Needs Improvement (30%+)', position: 'insideTopRight' }}
              />

              {/* Completion Rate Line */}
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{
                  fill: CHART_COLORS.primary,
                  strokeWidth: 2,
                  r: 4,
                  stroke: '#fff',
                }}
                activeDot={{
                  r: 6,
                  stroke: CHART_COLORS.primary,
                  strokeWidth: 2,
                  fill: '#fff',
                }}
                name="Completion Rate"
              />

              {/* Drop-off Rate Line (inverted for comparison) */}
              <Line
                type="monotone"
                dataKey="dropOffRate"
                stroke={CHART_COLORS.danger}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: CHART_COLORS.danger,
                  strokeWidth: 2,
                  r: 3,
                }}
                name="Drop-off Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Insights */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Performance Insights</h4>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            {avgCompletionRate >= 70 && (
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Excellent completion rate! Your form is highly effective.
              </p>
            )}
            {avgCompletionRate >= 50 && avgCompletionRate < 70 && (
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Good completion rate with room for optimization.
              </p>
            )}
            {avgCompletionRate >= 30 && avgCompletionRate < 50 && (
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Consider simplifying your form to improve completion rates.
              </p>
            )}
            {avgCompletionRate < 30 && (
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Low completion rate suggests form optimization is needed.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
            <span className="font-medium text-gray-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyChartState({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="flex h-64 items-center justify-center">
        <div className="text-center">
          <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Completion Data</h3>
          <p className="text-sm text-gray-600">
            Completion rate data will appear here once your form receives submissions.
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

export default CompletionRateChart;
