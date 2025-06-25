/**
 * Export Utilities - ArvaForm 2025
 *
 * Comprehensive utilities for data export functionality
 * Following React 19 and TypeScript strict mode best practices
 */

import type {
  ExportConfig,
  ExportFormat,
  ExportOptions,
  ExportProgress,
  ExportTemplate,
  SubmissionListItem,
} from '@/types/submission.types';

/**
 * Export format configurations with proper MIME types and extensions
 */
export const EXPORT_FORMATS: Record<
  ExportFormat,
  {
    label: string;
    extension: string;
    mimeType: string;
    description: string;
    maxSize: number; // in MB
  }
> = {
  csv: {
    label: 'CSV',
    extension: 'csv',
    mimeType: 'text/csv',
    description: 'Comma-separated values - ideal for Excel and data analysis',
    maxSize: 50,
  },
  excel: {
    label: 'Excel',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Excel workbook with formatting and multiple sheets',
    maxSize: 100,
  },
  json: {
    label: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    description: 'JavaScript Object Notation - for developers and APIs',
    maxSize: 200,
  },
};

/**
 * Pre-defined export templates for common use cases
 */
export const EXPORT_TEMPLATES: Record<string, ExportTemplate> = {
  basic: {
    name: 'Basic Export',
    description: 'Essential submission data',
    fields: ['submissionId', 'submittedAt', 'status', 'submitterEmail', 'submitterName'],
    filters: {},
  },
  complete: {
    name: 'Complete Export',
    description: 'All submission data including form responses',
    fields: [],
    filters: {},
  },
  recent: {
    name: 'Recent Submissions',
    description: 'Submissions from the last 30 days',
    fields: ['submissionId', 'submittedAt', 'status', 'submitterEmail', 'data'],
    filters: {
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    },
  },
  processed: {
    name: 'Processed Only',
    description: 'Only processed submissions',
    fields: ['submissionId', 'submittedAt', 'submitterEmail', 'data'],
    filters: {
      status: ['processed'],
    },
  },
  analytics: {
    name: 'Analytics Report',
    description: 'Data optimized for analytics and reporting',
    fields: ['submissionId', 'submittedAt', 'status', 'source', 'spamScore', 'gdprConsent'],
    filters: {},
  },
};

/**
 * Available export fields with descriptions
 */
export const EXPORT_FIELDS = {
  submissionId: {
    label: 'Submission ID',
    description: 'Unique identifier for the submission',
    type: 'string',
  },
  formId: {
    label: 'Form ID',
    description: 'Identifier of the form',
    type: 'string',
  },
  status: {
    label: 'Status',
    description: 'Current submission status',
    type: 'enum',
    options: ['new', 'read', 'processed', 'archived'],
  },
  submittedAt: {
    label: 'Submitted At',
    description: 'Date and time of submission',
    type: 'datetime',
  },
  submitterEmail: {
    label: 'Submitter Email',
    description: 'Email address of the person who submitted',
    type: 'email',
  },
  submitterName: {
    label: 'Submitter Name',
    description: 'Name of the person who submitted',
    type: 'string',
  },
  source: {
    label: 'Source',
    description: 'How the form was submitted (web, mobile, etc.)',
    type: 'enum',
    options: ['web', 'mobile', 'api', 'embed'],
  },
  spamScore: {
    label: 'Spam Score',
    description: 'Automated spam detection score (0-100)',
    type: 'number',
  },
  gdprConsent: {
    label: 'GDPR Consent',
    description: 'Whether GDPR consent was given',
    type: 'boolean',
  },
  data: {
    label: 'Form Data',
    description: 'All form field responses',
    type: 'object',
  },
  notes: {
    label: 'Admin Notes',
    description: 'Internal notes added by administrators',
    type: 'text',
  },
  files: {
    label: 'Attachments',
    description: 'File attachments and uploads',
    type: 'array',
  },
} as const;

/**
 * Export configuration validation
 */
export function validateExportConfig(config: ExportConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate format
  if (!config.format || !EXPORT_FORMATS[config.format]) {
    errors.push('Invalid export format');
  }

  // Validate date range
  if (config.dateRange) {
    const { from, to } = config.dateRange;
    if (from && to && from > to) {
      errors.push('Start date must be before end date');
    }
  }

  // Validate field selection
  if (config.columns && config.columns.length === 0) {
    errors.push('At least one field must be selected for export');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate export filename with timestamp and metadata
 */
export function generateExportFilename(
  formTitle: string,
  format: ExportFormat,
  recordCount: number,
  customName?: string,
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const safeName = (customName || formTitle || 'submissions')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .toLowerCase();

  return `${safeName}-${timestamp}-${recordCount}records.${EXPORT_FORMATS[format].extension}`;
}

/**
 * Calculate estimated export size based on data
 */
export function estimateExportSize(
  recordCount: number,
  fieldCount: number,
  format: ExportFormat,
  includeFiles: boolean = false,
): {
  sizeBytes: number;
  sizeFormatted: string;
  estimatedTime: number; // in seconds
} {
  let bytesPerRecord = fieldCount * 50; // Average 50 bytes per field

  // Format-specific multipliers
  switch (format) {
    case 'csv':
      bytesPerRecord *= 1.2;
      break;
    case 'excel':
      bytesPerRecord *= 2.5; // Excel has more overhead
      break;
    case 'json':
      bytesPerRecord *= 3; // JSON is more verbose
      break;
  }

  // Add file attachment overhead
  if (includeFiles) {
    bytesPerRecord += 1024 * 1024; // Assume 1MB average per submission with files
  }

  const totalBytes = recordCount * bytesPerRecord;
  const estimatedTime = Math.max(1, Math.ceil(recordCount / 100)); // ~100 records per second

  return {
    sizeBytes: totalBytes,
    sizeFormatted: formatFileSize(totalBytes),
    estimatedTime,
  };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

/**
 * Format export progress for display
 */
export function formatExportProgress(progress: ExportProgress): {
  percentage: number;
  message: string;
  timeRemaining?: string;
} {
  const percentage = Math.min(100, Math.max(0, progress.progress));

  let message = 'Preparing export...';
  let timeRemaining: string | undefined;

  if (progress.status === 'processing') {
    if (percentage < 20) {
      message = 'Gathering data...';
    } else if (percentage < 80) {
      message = `Processing ${progress.processedRecords || 0} of ${progress.totalRecords || 0} records...`;
    } else if (percentage < 95) {
      message = 'Generating file...';
    } else {
      message = 'Finalizing export...';
    }

    // Calculate estimated time remaining
    if (progress.startTime && percentage > 10) {
      const elapsed = Date.now() - progress.startTime.getTime();
      const remaining = (elapsed / percentage) * (100 - percentage);
      timeRemaining = formatDuration(remaining);
    }
  } else if (progress.status === 'completed') {
    message = 'Export completed successfully!';
  } else if (progress.status === 'failed') {
    message = progress.error || 'Export failed';
  }

  return {
    percentage,
    message,
    timeRemaining,
  };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Prepare export data for different formats
 */
export function prepareExportData(
  submissions: SubmissionListItem[],
  selectedFields: string[],
  format: ExportFormat,
): unknown {
  const fields = selectedFields.length > 0 ? selectedFields : Object.keys(EXPORT_FIELDS);

  const processedData = submissions.map((submission) => {
    const row: Record<string, unknown> = {};

    fields.forEach((field) => {
      switch (field) {
        case 'submittedAt':
          row[field] =
            format === 'excel'
              ? new Date(submission.submittedAt)
              : new Date(submission.submittedAt).toISOString();
          break;
        case 'data':
          // Use preview data from list item
          if (submission.previewData && typeof submission.previewData === 'object') {
            if (format === 'json') {
              row[field] = submission.previewData;
            } else {
              // For CSV/Excel, flatten the preview data object
              Object.entries(submission.previewData).forEach(([key, value]) => {
                row[`data_${key}`] = Array.isArray(value) ? value.join(', ') : String(value || '');
              });
            }
          }
          break;
        case 'files':
          // Use hasFiles boolean since files aren't available in list view
          row[field] = format === 'json' ? submission.hasFiles : submission.hasFiles ? 'Yes' : 'No';
          break;
        default:
          row[field] = submission[field as keyof SubmissionListItem] || '';
      }
    });

    return row;
  });

  // Format-specific processing
  switch (format) {
    case 'json':
      return {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: submissions.length,
          fields: fields,
        },
        submissions: processedData,
      };
    default:
      return processedData;
  }
}

/**
 * Download file from blob data
 */
export function downloadFile(blob: Blob, filename: string, mimeType?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  if (mimeType) {
    link.type = mimeType;
  }

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Create export options from configuration
 */
export function createExportOptions(config: ExportConfig): ExportOptions {
  return {
    format: config.format,
    fields: config.columns,
    filters: {
      status: config.applyFilters ? undefined : undefined, // Apply current filters if requested
      dateRange: config.dateRange
        ? {
            start: config.dateRange.from.toISOString(),
            end: config.dateRange.to.toISOString(),
          }
        : undefined,
    },
    includeFiles: config.includeFiles || false,
    filename: generateExportFilename('form', config.format, 0, 'custom'),
    compression: 'none',
    maxRecords: 0, // No limit by default
    async: true, // Use async processing for large datasets
  };
}

/**
 * Validate export permissions
 */
export function validateExportPermissions(
  userRole: string,
  formPermissions: string[],
): {
  canExport: boolean;
  restrictions: string[];
} {
  const restrictions: string[] = [];
  let canExport = true;

  // Basic permission check
  if (!formPermissions.includes('read') && !formPermissions.includes('admin')) {
    canExport = false;
    restrictions.push('Insufficient permissions to export form data');
  }

  // Role-specific restrictions
  if (userRole === 'viewer') {
    restrictions.push('Limited to basic export formats');
  }

  if (userRole === 'user' && !formPermissions.includes('admin')) {
    restrictions.push('Cannot export personal data fields');
  }

  return {
    canExport,
    restrictions,
  };
}

/**
 * Export result cache management
 */
export class ExportCache {
  private static readonly CACHE_KEY = 'arvaform_export_cache';
  private static readonly MAX_ENTRIES = 10;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static save(
    formId: string,
    config: ExportConfig,
    result: { jobId: string; createdAt: Date },
  ): void {
    try {
      const cache = this.getCache();
      const key = this.generateKey(formId, config);

      cache[key] = {
        formId,
        config,
        result,
        createdAt: result.createdAt.getTime(),
      };

      // Cleanup old entries
      this.cleanup(cache);

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to save export cache:', error);
    }
  }

  static get(formId: string, config: ExportConfig): { jobId: string; createdAt: Date } | null {
    try {
      const cache = this.getCache();
      const key = this.generateKey(formId, config);
      const entry = cache[key] as
        | {
            formId: string;
            config: ExportConfig;
            result: { jobId: string; createdAt: Date };
            createdAt: number;
          }
        | undefined;

      if (!entry) return null;

      // Check if expired
      if (Date.now() - entry.createdAt > this.CACHE_DURATION) {
        delete cache[key];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return {
        jobId: entry.result.jobId,
        createdAt: new Date(entry.createdAt),
      };
    } catch (error) {
      console.warn('Failed to get export cache:', error);
      return null;
    }
  }

  private static getCache(): Record<string, unknown> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  private static generateKey(formId: string, config: ExportConfig): string {
    const keyData = {
      formId,
      format: config.format,
      fields: config.columns?.sort(),
      filters: config.applyFilters,
      dateRange: config.dateRange,
    };

    return btoa(JSON.stringify(keyData));
  }

  private static cleanup(cache: Record<string, unknown>): void {
    const entries = Object.entries(cache);

    if (entries.length > this.MAX_ENTRIES) {
      // Sort by creation time and remove oldest
      entries.sort(
        (a, b) =>
          (b[1] as { createdAt: number }).createdAt - (a[1] as { createdAt: number }).createdAt,
      );

      const toKeep = entries.slice(0, this.MAX_ENTRIES);
      const newCache: Record<string, unknown> = {};

      toKeep.forEach(([key, value]) => {
        newCache[key] = value;
      });

      Object.keys(cache).forEach((key) => delete cache[key]);
      Object.assign(cache, newCache);
    }
  }
}
