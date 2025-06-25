'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';

import type {
  ExportConfig,
  ExportJob,
  ExportOptions,
  ExportProgress,
} from '@/types/submission.types';

/**
 * Export Hook Return Type
 */
interface UseExportReturn {
  /** Export data/results */
  exportData: ExportJob | null;
  /** Current export progress */
  progress: ExportProgress | null;
  /** Is export currently running */
  isExporting: boolean;
  /** Export error if any */
  error: string | null;
  /** Start export function */
  startExport: (formId: string, config: ExportConfig) => Promise<ExportJob>;
  /** Cancel current export */
  cancelExport: () => void;
  /** Download completed export */
  downloadExport: (downloadUrl: string) => void;
  /** Clear export state */
  clearExport: () => void;
}

/**
 * Export Hook - ArvaForm 2025
 *
 * Comprehensive hook for managing data export functionality
 * Following React 19 patterns with concurrent features and optimistic updates
 */
export function useExport(): UseExportReturn {
  // State management
  const [exportData, setExportData] = useState<ExportJob | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for cancellation and polling
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start export mutation
   */
  const startExportMutation = useMutation({
    mutationFn: async ({ formId, config }: { formId: string; config: ExportConfig }) => {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Convert config to export options
      const exportOptions: ExportOptions = {
        format: config.format,
        fields: config.columns,
        includeFiles: config.includeFiles || false,
        filename: config.customFilename,
        async: true, // Always use async for better UX
        filters: {
          dateRange: config.dateRange
            ? {
                start: config.dateRange.from.toISOString(),
                end: config.dateRange.to.toISOString(),
              }
            : undefined,
        },
      };

      // Make API request
      const response = await fetch(`/api/submissions/form/${formId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      const result = await response.json();

      // Handle synchronous response (small datasets)
      if (response.headers.get('content-type')?.includes('application/json')) {
        return result.data as ExportJob;
      }

      // Handle direct file response
      throw new Error('Unexpected response format');
    },
    onSuccess: (data) => {
      setExportData(data);
      setError(null);

      // Start polling for progress if async export
      if (data.status !== 'completed') {
        startProgressPolling(data.jobId);
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Export failed');
      setIsExporting(false);
      setProgress(null);
    },
  });

  /**
   * Progress polling query
   */
  const _progressQuery = useQuery({
    queryKey: ['export-progress', exportData?.jobId],
    queryFn: async () => {
      if (!exportData?.jobId) return null;

      const response = await fetch(`/api/submissions/export/job/${exportData.jobId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch export progress');
      }

      const result = await response.json();
      return result.data as ExportJob;
    },
    enabled: false, // Manual control
    refetchInterval: false,
  });

  /**
   * Start progress polling
   */
  const startProgressPolling = useCallback((jobId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/submissions/export/job/${jobId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }

        const result = await response.json();
        const jobData = result.data as ExportJob;

        // Update progress
        setProgress({
          status: jobData.status,
          progress: jobData.progress,
          message: getProgressMessage(jobData),
          startTime: new Date(jobData.createdAt),
          downloadUrl: jobData.downloadUrl,
          error: jobData.error,
        });

        // Update export data
        setExportData(jobData);

        // Stop polling if completed or failed
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          setIsExporting(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Progress polling failed');
        setIsExporting(false);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    // Start polling every 2 seconds
    pollingIntervalRef.current = setInterval(pollProgress, 2000);

    // Initial poll
    pollProgress();
  }, []);

  /**
   * Get progress message from job data
   */
  const getProgressMessage = (job: ExportJob): string => {
    switch (job.status) {
      case 'pending':
        return 'Export queued...';
      case 'processing':
        return job.totalRecords
          ? `Processing ${job.totalRecords.toLocaleString()} records...`
          : 'Processing data...';
      case 'completed':
        return 'Export completed successfully!';
      case 'failed':
        return job.error || 'Export failed';
      default:
        return 'Processing...';
    }
  };

  /**
   * Start export function
   */
  const startExport = useCallback(
    async (formId: string, config: ExportConfig): Promise<ExportJob> => {
      setIsExporting(true);
      setError(null);
      setProgress({
        status: 'pending',
        progress: 0,
        message: 'Starting export...',
        startTime: new Date(),
      });

      try {
        const result = await startExportMutation.mutateAsync({ formId, config });
        return result;
      } catch (error) {
        setIsExporting(false);
        throw error;
      }
    },
    [startExportMutation],
  );

  /**
   * Cancel export function
   */
  const cancelExport = useCallback(() => {
    // Cancel fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Reset state
    setIsExporting(false);
    setProgress(null);
    setExportData(null);
    setError(null);
  }, []);

  /**
   * Download export function
   */
  const downloadExport = useCallback((downloadUrl: string) => {
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  /**
   * Clear export state
   */
  const clearExport = useCallback(() => {
    setExportData(null);
    setProgress(null);
    setError(null);
    setIsExporting(false);

    // Clean up polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Clean up abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     cancelExport();
  //   };
  // }, [cancelExport]);

  return {
    exportData,
    progress,
    isExporting,
    error,
    startExport,
    cancelExport,
    downloadExport,
    clearExport,
  };
}
