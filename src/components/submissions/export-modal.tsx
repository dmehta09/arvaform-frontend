'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Settings,
} from 'lucide-react';
import { startTransition, useActionState, useEffect, useOptimistic, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useExport } from '@/hooks/use-export';
import {
  estimateExportSize,
  EXPORT_FIELDS,
  EXPORT_FORMATS,
  EXPORT_TEMPLATES,
  formatExportProgress,
  generateExportFilename,
  validateExportConfig,
} from '@/lib/export/export-utils';

import type {
  ExportConfig,
  ExportFormat,
  ExportProgress,
  SubmissionListItem,
} from '@/types/submission.types';

/**
 * Export Modal Props Interface
 */
interface ExportModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Form ID to export submissions from */
  formId: string;
  /** Form title for display */
  formTitle: string;
  /** Total number of submissions available */
  totalSubmissions: number;
  /** Current filters applied to submissions list */
  currentFilters?: Record<string, unknown>;
  /** Selected submissions for export (if any) */
  selectedSubmissions?: SubmissionListItem[];
  /** Whether user has premium features */
  isPremium?: boolean;
}

/**
 * Export Modal Component - ArvaForm 2025
 *
 * Comprehensive modal for exporting form submissions with:
 * - Multiple format support (CSV, Excel, JSON)
 * - Field selection and filtering
 * - Progress tracking for large exports
 * - Export templates and presets
 * - Real-time progress updates
 * - Responsive design with accessibility
 */
export function ExportModal({
  isOpen,
  onClose,
  formId,
  formTitle,
  totalSubmissions,
  currentFilters,
  selectedSubmissions,
  isPremium = false,
}: ExportModalProps): React.JSX.Element {
  // Export configuration state
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    columns: [],
    includeFiles: false,
    applyFilters: true,
    dateRange: undefined,
    customFilename: '',
  });

  // UI state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('format');
  const [_showAdvanced, _setShowAdvanced] = useState<boolean>(false);

  // Export hook with React 19 patterns
  const { progress, isExporting, error, startExport, cancelExport, downloadExport } = useExport();

  // Optimistic state for immediate UI feedback
  const [optimisticProgress, addOptimisticProgress] = useOptimistic(
    progress,
    (state: ExportProgress | null, newProgress: Partial<ExportProgress>) =>
      ({
        ...state,
        ...newProgress,
      }) as ExportProgress,
  );

  // Form action state for export initiation
  const [_exportState, exportAction, isPending] = useActionState(
    async (prevState: { success: boolean; error?: string }, formData: FormData) => {
      try {
        const exportConfig = JSON.parse(formData.get('config') as string) as ExportConfig;

        // Optimistic update
        addOptimisticProgress({
          status: 'pending',
          progress: 0,
          message: 'Starting export...',
          startTime: new Date(),
        });

        await startExport(formId, exportConfig);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Export failed',
        };
      }
    },
    { success: false },
  );

  // Initialize default selected fields
  useEffect(() => {
    if (config.columns.length === 0) {
      setConfig((prev) => ({
        ...prev,
        columns: ['submissionId', 'submittedAt', 'status', 'submitterEmail', 'data'],
      }));
    }
  }, [config.columns.length]);

  // Auto-close on successful completion
  useEffect(() => {
    if (optimisticProgress?.status === 'completed' && optimisticProgress.downloadUrl) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
    return () => {}; // Return empty cleanup function for other code paths
  }, [optimisticProgress?.status, optimisticProgress?.downloadUrl, onClose]);

  /**
   * Handle template selection
   */
  const handleTemplateSelect = (templateKey: string): void => {
    const template = EXPORT_TEMPLATES[templateKey];
    if (!template) return;

    setConfig((prev) => ({
      ...prev,
      columns: template.fields.length > 0 ? template.fields : Object.keys(EXPORT_FIELDS),
      dateRange: template.filters.dateRange as { from: Date; to: Date } | undefined,
      applyFilters: !!template.filters.status,
    }));

    setSelectedTemplate(templateKey);
    setActiveTab('fields');
  };

  /**
   * Handle field selection toggle
   */
  const handleFieldToggle = (fieldKey: string, checked: boolean): void => {
    setConfig((prev) => ({
      ...prev,
      columns: checked ? [...prev.columns, fieldKey] : prev.columns.filter((f) => f !== fieldKey),
    }));
  };

  /**
   * Handle export format change
   */
  const handleFormatChange = (format: ExportFormat): void => {
    setConfig((prev) => ({ ...prev, format }));
  };

  /**
   * Handle export submission
   */
  const handleExport = (): void => {
    const validation = validateExportConfig(config);

    if (!validation.isValid) {
      // Show validation errors
      return;
    }

    startTransition(() => {
      const formData = new FormData();
      formData.append('config', JSON.stringify(config));
      exportAction(formData);
    });
  };

  /**
   * Calculate export statistics
   */
  const exportStats = (() => {
    const recordCount = selectedSubmissions?.length || totalSubmissions;
    const fieldCount = config.columns.length || Object.keys(EXPORT_FIELDS).length;

    return estimateExportSize(recordCount, fieldCount, config.format, config.includeFiles);
  })();

  /**
   * Get progress display data
   */
  const progressDisplay = optimisticProgress ? formatExportProgress(optimisticProgress) : null;

  /**
   * Check if export can proceed
   */
  const canExport = config.columns.length > 0 && !isExporting && !isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Submissions - {formTitle}
          </DialogTitle>
          <DialogDescription>
            Export {totalSubmissions.toLocaleString()} submissions in your preferred format
            {selectedSubmissions && (
              <span className="text-blue-600"> ({selectedSubmissions.length} selected)</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Export Progress Overlay */}
          <AnimatePresence>
            {(isExporting || isPending) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {optimisticProgress?.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : optimisticProgress?.status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                      {optimisticProgress?.status === 'completed'
                        ? 'Export Complete!'
                        : 'Exporting Data'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progressDisplay && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{progressDisplay.message}</span>
                            <span>{Math.round(progressDisplay.percentage)}%</span>
                          </div>
                          <Progress value={progressDisplay.percentage} className="w-full" />
                          {progressDisplay.timeRemaining && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{progressDisplay.timeRemaining} remaining</span>
                            </div>
                          )}
                        </div>

                        {optimisticProgress?.status === 'completed' &&
                          optimisticProgress.downloadUrl && (
                            <Button
                              onClick={() => downloadExport(optimisticProgress.downloadUrl!)}
                              className="w-full">
                              <Download className="w-4 h-4 mr-2" />
                              Download Export
                            </Button>
                          )}

                        {optimisticProgress?.status === 'failed' && (
                          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                            {optimisticProgress.error || 'Export failed. Please try again.'}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex gap-2">
                      {optimisticProgress?.status !== 'completed' && (
                        <Button variant="outline" onClick={cancelExport} className="flex-1">
                          Cancel Export
                        </Button>
                      )}
                      <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Export Configuration */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="fields">Fields</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Format Selection Tab */}
            <TabsContent value="format" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label className="text-base font-medium">Export Format</Label>
                  <RadioGroup
                    value={config.format}
                    onValueChange={handleFormatChange}
                    className="grid grid-cols-1 gap-4 mt-3">
                    {Object.entries(EXPORT_FORMATS).map(([key, format]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{format.label}</div>
                              <div className="text-sm text-gray-600">{format.description}</div>
                            </div>
                            <div className="text-sm text-gray-500">
                              .{format.extension} • {format.maxSize}MB max
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">Quick Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {Object.entries(EXPORT_TEMPLATES).map(([key, template]) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleTemplateSelect(key)}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-xs text-gray-600">
                            {template.fields.length || Object.keys(EXPORT_FIELDS).length} fields
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Field Selection Tab */}
            <TabsContent value="fields" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Fields to Export</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, columns: Object.keys(EXPORT_FIELDS) }))
                    }>
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfig((prev) => ({ ...prev, columns: [] }))}>
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {Object.entries(EXPORT_FIELDS).map(([key, field]) => (
                  <div key={key} className="flex items-start space-x-3 p-3 border rounded">
                    <Checkbox
                      id={key}
                      checked={config.columns.includes(key)}
                      onCheckedChange={(checked) => handleFieldToggle(key, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {field.label}
                      </Label>
                      <div className="text-sm text-gray-600">{field.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Type: {field.type}
                        {'options' in field && field.options && ` (${field.options.join(', ')})`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm">
                  <strong>{config.columns.length}</strong> fields selected •{' '}
                  <strong>{exportStats.sizeFormatted}</strong> estimated size •{' '}
                  <strong>{exportStats.estimatedTime}s</strong> estimated time
                </div>
              </div>
            </TabsContent>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="apply-filters"
                    checked={config.applyFilters}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, applyFilters: checked }))
                    }
                  />
                  <Label htmlFor="apply-filters">Apply current dashboard filters</Label>
                </div>

                {currentFilters && config.applyFilters && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(currentFilters, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label className="text-base font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label htmlFor="date-from" className="text-sm">
                        From
                      </Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={config.dateRange?.from?.toISOString().split('T')[0] || ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setConfig((prev) => ({
                            ...prev,
                            dateRange:
                              date && prev.dateRange?.to
                                ? {
                                    from: date,
                                    to: prev.dateRange.to,
                                  }
                                : undefined,
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to" className="text-sm">
                        To
                      </Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={config.dateRange?.to?.toISOString().split('T')[0] || ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          setConfig((prev) => ({
                            ...prev,
                            dateRange:
                              date && prev.dateRange?.from
                                ? {
                                    from: prev.dateRange.from,
                                    to: date,
                                  }
                                : undefined,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-files"
                    checked={config.includeFiles}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, includeFiles: checked }))
                    }
                  />
                  <Label htmlFor="include-files">Include file attachments</Label>
                  {!isPremium && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Advanced Options Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-filename" className="text-base font-medium">
                    Custom Filename
                  </Label>
                  <Input
                    id="custom-filename"
                    placeholder={generateExportFilename(formTitle, config.format, totalSubmissions)}
                    value={config.customFilename}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customFilename: e.target.value }))
                    }
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Leave empty to use auto-generated filename
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Export Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Records:</span>
                        <span>
                          {(selectedSubmissions?.length || totalSubmissions).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fields:</span>
                        <span>{config.columns.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Size:</span>
                        <span>{exportStats.sizeFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Time:</span>
                        <span>{exportStats.estimatedTime}s</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Processing Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="background-processing"
                          checked={totalSubmissions > 1000}
                          disabled
                        />
                        <Label htmlFor="background-processing" className="text-sm">
                          Background processing
                          {totalSubmissions > 1000 && ' (auto-enabled)'}
                        </Label>
                      </div>
                      <div className="text-xs text-gray-600">
                        Large exports are processed in the background
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-red-800 text-sm">{error}</div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleExport} disabled={!canExport} className="min-w-32">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
