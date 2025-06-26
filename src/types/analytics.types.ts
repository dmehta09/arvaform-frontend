/**
 * Analytics Types for ArvaForm Frontend
 *
 * TypeScript interfaces matching the backend analytics DTOs
 * with comprehensive type safety and 2025 standards compliance.
 */

// ============================================================================
// Analytics Query Parameters & Enums
// ============================================================================

export enum AnalyticsPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export enum AnalyticsMetric {
  SUBMISSIONS = 'submissions',
  VIEWS = 'views',
  COMPLETION_RATE = 'completion_rate',
  BOUNCE_RATE = 'bounce_rate',
  CONVERSION_RATE = 'conversion_rate',
  REVENUE = 'revenue',
  FIELD_ANALYTICS = 'field_analytics',
  GEOGRAPHIC = 'geographic',
  DEVICES = 'devices',
  PERFORMANCE = 'performance',
}

export interface AnalyticsDateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsQueryParams {
  period?: AnalyticsPeriod;
  startDate?: Date;
  endDate?: Date;
  metrics?: AnalyticsMetric[];
  realtime?: boolean;
  timezone?: string;
  includeDetails?: boolean;
}

// ============================================================================
// Core Analytics Data Structures
// ============================================================================

export interface GeographicMetrics {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  submissions: number;
  views: number;
  completionRate: number;
}

export interface DeviceMetrics {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  operatingSystem: string;
  browser: string;
  browserVersion?: string;
  screenResolution?: string;
  submissions: number;
  views: number;
  completionRate: number;
}

export interface FieldMetrics {
  fieldId: string;
  fieldType: string;
  fieldLabel: string;
  completionRate: number;
  dropOffRate: number;
  avgTimeSpent: number;
  errorCount: number;
  validationErrors: Record<string, number>;
}

export interface ConversionFunnel {
  step: number;
  stepName: string;
  totalViews: number;
  completions: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface PerformanceMetrics {
  avgLoadTime?: number; // milliseconds
  avgSubmissionTime?: number; // seconds
  errorCount: number;
  errorRate?: number; // percentage
  bounceRate?: number; // percentage
}

export interface TimeMetrics {
  hour: number; // 0-23
  dayOfWeek: number; // 0-6
  dayOfMonth: number; // 1-31
  month: number; // 1-12
  year: number;
  submissions: number;
  views: number;
}

// ============================================================================
// Analytics Response DTOs
// ============================================================================

export interface AnalyticsOverviewDto {
  totalSubmissions: number;
  totalViews: number;
  uniqueVisitors: number;
  completionRate: number;
  avgCompletionTime: number; // seconds
  totalRevenue: number;
  bounceRate: number;
  spamRate: number;
  qualityScore: number;
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}

export interface AnalyticsDetailDto extends AnalyticsOverviewDto {
  geographic: GeographicMetrics[];
  devices: DeviceMetrics[];
  fields: FieldMetrics[];
  conversionFunnel: ConversionFunnel[];
  performance: PerformanceMetrics;
  timeDistribution: TimeMetrics[];
}

export interface BulkAnalyticsQueryDto {
  formIds: string[];
  period?: AnalyticsPeriod;
  metrics?: AnalyticsMetric[];
}

export interface AnalyticsHealthDto {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cacheStatus: 'enabled' | 'disabled' | 'error';
  lastDataUpdate: Date;
  processingDelay: number; // milliseconds
  activeQueries: number;
}

// ============================================================================
// Chart Data Structures for Recharts
// ============================================================================

export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label: string;
  [key: string]: string | number | Date;
}

export interface SubmissionTrendData extends ChartDataPoint {
  submissions: number;
  views: number;
  conversionRate: number;
}

export interface CompletionRateData extends ChartDataPoint {
  completionRate: number;
  dropOffRate: number;
  totalViews: number;
}

export interface DeviceBreakdownData {
  deviceType: string;
  submissions: number;
  percentage: number;
  fill: string;
}

export interface GeographicHeatmapData {
  country: string;
  countryCode: string;
  value: number;
  submissions: number;
  completionRate: number;
}

export interface FieldPerformanceData {
  fieldLabel: string;
  completionRate: number;
  dropOffRate: number;
  avgTimeSpent: number;
  errorRate: number;
}

// ============================================================================
// Analytics Dashboard State
// ============================================================================

export interface AnalyticsDashboardState {
  selectedPeriod: AnalyticsPeriod;
  dateRange: AnalyticsDateRange;
  selectedMetrics: AnalyticsMetric[];
  isRealtime: boolean;
  refreshInterval: number; // milliseconds
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date;
}

export interface AnalyticsFilterState {
  period: AnalyticsPeriod;
  customDateRange?: AnalyticsDateRange;
  includeSpam: boolean;
  includeTestData: boolean;
  timezone: string;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface AnalyticsApiResponse<T> {
  data: T;
  meta: {
    cached: boolean;
    cacheExpiry?: Date;
    processingTime: number;
    dataFreshness: number; // minutes since last update
  };
  success: boolean;
  message?: string;
}

export interface AnalyticsErrorResponse {
  error: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  requestId: string;
}

// ============================================================================
// Export Configuration
// ============================================================================

export interface AnalyticsExportOptions {
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  includeCharts: boolean;
  includeTables: boolean;
  dateRange: AnalyticsDateRange;
  metrics: AnalyticsMetric[];
  customTitle?: string;
}

export interface AnalyticsExportJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  downloadUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  estimatedCompletion?: Date;
}

// ============================================================================
// Real-time Analytics
// ============================================================================

export interface RealtimeAnalyticsEvent {
  type: 'submission' | 'view' | 'error' | 'completion';
  formId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    region?: string;
    city?: string;
  };
}

export interface RealtimeAnalyticsUpdate {
  formId: string;
  metrics: Partial<AnalyticsOverviewDto>;
  timestamp: Date;
  eventCount: number;
}

// ============================================================================
// Type Guards and Utilities
// ============================================================================

export const isAnalyticsPeriod = (value: string): value is AnalyticsPeriod => {
  return Object.values(AnalyticsPeriod).includes(value as AnalyticsPeriod);
};

export const isAnalyticsMetric = (value: string): value is AnalyticsMetric => {
  return Object.values(AnalyticsMetric).includes(value as AnalyticsMetric);
};

// ============================================================================
// Default Values and Constants
// ============================================================================

export const DEFAULT_ANALYTICS_PERIOD = AnalyticsPeriod.DAY;
export const DEFAULT_ANALYTICS_METRICS = [
  AnalyticsMetric.SUBMISSIONS,
  AnalyticsMetric.VIEWS,
  AnalyticsMetric.COMPLETION_RATE,
];

export const ANALYTICS_REFRESH_INTERVALS = {
  realtime: 5000, // 5 seconds
  nearRealtime: 30000, // 30 seconds
  standard: 300000, // 5 minutes
  dashboard: 600000, // 10 minutes
} as const;

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  success: '#22c55e',
  info: '#06b6d4',
  muted: '#6b7280',
} as const;

export const DEVICE_TYPE_COLORS = {
  mobile: CHART_COLORS.primary,
  tablet: CHART_COLORS.secondary,
  desktop: CHART_COLORS.accent,
} as const;
