/**
 * File Upload Field Component - React 19 Edition
 *
 * Comprehensive file upload component with drag & drop, progress tracking,
 * multiple file support, and accessibility compliance.
 *
 * Features:
 * - Drag & drop file selection with visual feedback
 * - Progress tracking for individual files
 * - File type and size validation
 * - Multiple file upload support
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Mobile-friendly touch interface
 * - Error handling and retry functionality
 * - Preview for image files
 * - Integration with React Hook Form
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileUploadProgress } from '@/hooks/use-form-submission';
import { cn } from '@/lib/utils';
import { validateFileUpload } from '@/lib/validation/submission-validator';
import { FormElement } from '@/types/form.types';
import {
  AlertCircle,
  CheckCircle,
  Download,
  File,
  Image as LucideImage,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FilePreview {
  file: File;
  preview?: string;
  progress: FileUploadProgress;
}

interface FileUploadFieldProps<TData extends FieldValues = FieldValues> {
  element: FormElement;
  form: UseFormReturn<TData>;
  fileUploads: Record<string, FileUploadProgress>;
  onFileUpload: (elementId: string, files: FileList) => Promise<void>;
  onRemoveFile: (elementId: string, fileIndex?: number) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <LucideImage className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

const createPreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ============================================================================
// Sub-Components
// ============================================================================

interface FilePreviewCardProps {
  filePreview: FilePreview;
  index: number;
  onRemove: () => void;
  onRetry: () => void;
  showPreview: boolean;
}

function FilePreviewCard({
  filePreview,
  index,
  onRemove,
  onRetry,
  showPreview,
}: FilePreviewCardProps) {
  const { file, preview, progress } = filePreview;
  const { status, progress: uploadProgress, error } = progress;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        status === 'success' && 'border-green-200 bg-green-50',
        status === 'error' && 'border-red-200 bg-red-50',
        (status === 'pending' || status === 'uploading') && 'border-blue-200 bg-blue-50',
      )}
      role="listitem"
      aria-label={`File ${index + 1}: ${file.name}`}>
      {/* File Icon/Preview */}
      <div className="flex-shrink-0">
        {showPreview && preview && isImageFile(file) ? (
          <Image
            src={preview}
            alt={`Preview of ${file.name}`}
            className="h-10 w-10 rounded object-cover"
            width={40}
            height={40}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
            {getFileIcon(file)}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </span>
          {status === 'success' && (
            <CheckCircle className="h-4 w-4 text-green-600" aria-label="Upload successful" />
          )}
          {status === 'error' && (
            <AlertCircle className="h-4 w-4 text-red-600" aria-label="Upload failed" />
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span className="capitalize">{file.type.split('/')[1] || 'Unknown'}</span>
        </div>

        {/* Progress Bar */}
        {(status === 'uploading' || status === 'pending') && (
          <div className="mt-2">
            <Progress value={uploadProgress} className="h-1" aria-label="Upload progress" />
            <span className="sr-only">{uploadProgress}% uploaded</span>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && error && (
          <div className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {status === 'error' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            aria-label="Retry upload"
            className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {status === 'success' && progress.url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(progress.url, '_blank')}
            aria-label="Download file"
            className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label="Remove file"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FileUploadField<TData extends FieldValues = FieldValues>({
  element,
  form,
  fileUploads,
  onFileUpload,
  onRemoveFile,
  disabled = false,
  className,
}: FileUploadFieldProps<TData>) {
  // ========================================================================
  // State & Refs
  // ========================================================================

  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const fieldName = element.id as Path<TData>;
  const _currentValue = form.watch(fieldName);
  const fieldError = form.formState.errors[fieldName];

  const acceptedTypes = element.fileTypes?.join(',') || '*/*';
  const maxFiles = element.allowMultiple ? 5 : 1; // Defaulting to 5 for multiple
  const maxSize = element.maxFileSize || 10 * 1024 * 1024; // 10MB default

  const currentFiles = useMemo(() => {
    const relevantUploads = Object.entries(fileUploads).filter(([key]) =>
      key.startsWith(`${element.id}-`),
    );

    return relevantUploads.map(([key, progress], index) => ({
      file: progress.file,
      preview: previews[key],
      progress,
      index,
    }));
  }, [fileUploads, element.id, previews]);

  const canAddMoreFiles = element.allowMultiple && currentFiles.length < maxFiles;
  const hasErrors = !!fieldError || currentFiles.some((file) => file.progress.status === 'error');

  // ========================================================================
  // File Preview Generation
  // ========================================================================

  useEffect(() => {
    const generatePreviews = async () => {
      const newPreviews: Record<string, string> = {};

      for (const [key, progress] of Object.entries(fileUploads)) {
        if (key.startsWith(`${element.id}-`) && isImageFile(progress.file)) {
          try {
            if (!previews[key]) {
              newPreviews[key] = await createPreviewUrl(progress.file);
            }
          } catch (error) {
            console.warn('Failed to generate preview:', error);
          }
        }
      }

      if (Object.keys(newPreviews).length > 0) {
        setPreviews((prev) => ({ ...prev, ...newPreviews }));
      }
    };

    generatePreviews();
  }, [fileUploads, element.id, previews]);

  // ========================================================================
  // Cleanup Previews
  // ========================================================================

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  // ========================================================================
  // File Validation
  // ========================================================================

  const validateFiles = useCallback(
    (files: FileList): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        const validationError = validateFileUpload(file, element);
        if (validationError) {
          errors.push(`${file.name}: ${validationError.message}`);
        } else {
          valid.push(file);
        }
      });

      // Check total file count
      if (!element.allowMultiple && valid.length > 1) {
        errors.push('Only one file is allowed');
        return { valid: valid.slice(0, 1), errors };
      }

      if (element.allowMultiple && currentFiles.length + valid.length > maxFiles) {
        const allowedCount = maxFiles - currentFiles.length;
        errors.push(`Maximum ${maxFiles} files allowed. Can only add ${allowedCount} more.`);
        return { valid: valid.slice(0, allowedCount), errors };
      }

      return { valid, errors };
    },
    [element, currentFiles.length, maxFiles],
  );

  // ========================================================================
  // File Selection Handlers
  // ========================================================================

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (disabled || files.length === 0) return;

      const { valid, errors } = validateFiles(files);

      // Show validation errors
      if (errors.length > 0) {
        form.setError(fieldName, {
          type: 'manual',
          message: errors.join('; '),
        });
        return;
      }

      // Clear previous errors
      form.clearErrors(fieldName);

      // Create FileList from valid files
      const dt = new DataTransfer();
      valid.forEach((file) => dt.items.add(file));

      try {
        await onFileUpload(element.id, dt.files);
      } catch (error) {
        form.setError(fieldName, {
          type: 'manual',
          message: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    },
    [disabled, validateFiles, form, fieldName, onFileUpload, element.id],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        handleFileSelect(files);
      }
      // Reset input to allow selecting the same file again
      event.target.value = '';
    },
    [handleFileSelect],
  );

  // ========================================================================
  // Drag & Drop Handlers
  // ========================================================================

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Only hide drag over if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [disabled, handleFileSelect],
  );

  // ========================================================================
  // Keyboard Handlers
  // ========================================================================

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [disabled],
  );

  // ========================================================================
  // Action Handlers
  // ========================================================================

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback(
    (index: number) => {
      onRemoveFile(element.id, index);
    },
    [onRemoveFile, element.id],
  );

  const handleRetryFile = useCallback(
    async (filePreview: FilePreview) => {
      const dt = new DataTransfer();
      dt.items.add(filePreview.file);

      try {
        await onFileUpload(element.id, dt.files);
      } catch (error) {
        form.setError(fieldName, {
          type: 'manual',
          message: error instanceof Error ? error.message : 'Retry failed',
        });
      }
    },
    [onFileUpload, element.id, form, fieldName],
  );

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Field Label */}
      <div className="space-y-1">
        <label
          htmlFor={`file-input-${element.id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {element.label}
          {element.validation?.required && (
            <span className="ml-1 text-red-500" aria-label="Required">
              *
            </span>
          )}
        </label>
        {element.description && (
          <p className="text-sm text-muted-foreground">{element.description}</p>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload ${element.allowMultiple ? 'files' : 'file'} for ${element.label}`}
        aria-describedby={`file-help-${element.id}`}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          'hover:border-primary/50 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragOver && 'border-primary bg-primary/5',
          hasErrors && 'border-red-300 bg-red-50/50',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && !isDragOver && !hasErrors && 'border-muted-foreground/25',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={handleBrowseClick}>
        {/* Upload Icon */}
        <Upload className={cn('mb-4 h-10 w-10', isDragOver && 'text-primary')} />

        {/* Upload Text */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragOver
              ? `Drop ${element.allowMultiple ? 'files' : 'file'} here`
              : `Drag & drop ${element.allowMultiple ? 'files' : 'file'} here`}
          </p>
          <p className="text-xs text-muted-foreground">
            or{' '}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}>
              browse files
            </button>
          </p>
        </div>

        {/* File Requirements */}
        <div
          id={`file-help-${element.id}`}
          className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>Max size: {formatFileSize(maxSize)}</p>
          {element.allowMultiple && <p>Max files: {maxFiles}</p>}
          {element.fileTypes && <p>Accepted: {element.fileTypes.join(', ')}</p>}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          id={`file-input-${element.id}`}
          type="file"
          accept={acceptedTypes}
          multiple={element.allowMultiple}
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          aria-describedby={`file-help-${element.id}`}
        />
      </div>

      {/* File List */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {element.allowMultiple ? 'Selected Files' : 'Selected File'} ({currentFiles.length})
          </h4>
          <div role="list" className="space-y-2">
            {currentFiles.map((filePreview, index) => (
              <FilePreviewCard
                key={`${element.id}-${index}`}
                filePreview={filePreview}
                index={index}
                onRemove={() => handleRemoveFile(index)}
                onRetry={() => handleRetryFile(filePreview)}
                showPreview={isImageFile(filePreview.file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Limit Notice */}
      {element.allowMultiple && !canAddMoreFiles && !hasErrors && (
        <Alert>
          <AlertDescription>
            Maximum number of files reached ({maxFiles}). Remove a file to add another.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {fieldError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fieldError.message as string}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
