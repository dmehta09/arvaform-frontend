/**
 * Form Submission Handler - React 19 Edition
 *
 * Comprehensive wrapper component that manages form submission with all
 * validation, file uploads, state management, and UI feedback.
 *
 * Features:
 * - Complete integration with useFormSubmission hook
 * - React Hook Form integration with Zod validation
 * - File upload handling with progress tracking
 * - Auto-save and draft management
 * - Accessible submission states and feedback
 * - Error handling with retry logic
 * - Optimistic updates with React 19 patterns
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliance
 */

'use client';

import { FileUploadField } from '@/components/form-elements/file-upload-field';
import {
  DraftIndicator,
  SubmissionProgress,
  SubmissionStates,
} from '@/components/form-submission/submission-states';
import { Button } from '@/components/ui/button';
import { SubmissionOptions, useFormSubmission } from '@/hooks/use-form-submission';
import { cn } from '@/lib/utils';
import { Form } from '@/types/form.types';
import { AlertTriangle, FileText, RotateCcw, Save, Send, Upload } from 'lucide-react';
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormSubmissionHandlerProps<TData extends FieldValues = FieldValues> {
  formConfig: Form;
  submitEndpoint: string;
  children: ReactNode;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  options?: SubmissionOptions;
  className?: string;
  showDraftIndicator?: boolean;
  showProgressSteps?: boolean;
  showSubmissionStates?: boolean;
  autoSave?: boolean;
  allowDrafts?: boolean;
  submitButtonText?: string;
  draftButtonText?: string;
  resetButtonText?: string;
  customActions?: ReactNode;
  isMultiStep?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
}

interface SubmissionControlsProps<TData extends FieldValues = FieldValues> {
  form: ReturnType<typeof useFormSubmission<TData>>;
  isSubmitting: boolean;
  hasErrors: boolean;
  hasUnsavedChanges: boolean;
  submitButtonText: string;
  draftButtonText: string;
  resetButtonText: string;
  customActions?: ReactNode;
  onSubmit: () => void;
  className?: string;
}

interface FileUploadManagerProps<TData extends FieldValues = FieldValues> {
  formConfig: Form;
  form: ReturnType<typeof useFormSubmission<TData>>;
  className?: string;
}

// ============================================================================
// Submission Controls Component
// ============================================================================

function SubmissionControls<TData extends FieldValues = FieldValues>({
  form,
  isSubmitting,
  hasErrors,
  hasUnsavedChanges,
  submitButtonText,
  draftButtonText,
  resetButtonText,
  customActions,
  onSubmit,
  className,
}: SubmissionControlsProps<TData>) {
  const { state, saveDraft, reset, hasDraft, loadDraft, clearDraft } = form;

  const handleSaveDraft = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  const handleReset = useCallback(() => {
    if (
      window.confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')
    ) {
      reset();
    }
  }, [reset]);

  const handleLoadDraft = useCallback(() => {
    if (window.confirm('Load your saved draft? This will replace current form data.')) {
      loadDraft();
    }
  }, [loadDraft]);

  const canSubmit = !isSubmitting && !hasErrors;
  const showDraftActions = hasUnsavedChanges || hasDraft;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Draft Actions */}
      {showDraftActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Draft Options</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {hasUnsavedChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="text-xs">
                <Save className="mr-1 h-3 w-3" />
                {draftButtonText}
              </Button>
            )}

            {hasDraft && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDraft}
                  disabled={isSubmitting}
                  className="text-xs">
                  <Upload className="mr-1 h-3 w-3" />
                  Load Draft
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDraft}
                  disabled={isSubmitting}
                  className="text-xs text-red-600 hover:text-red-700">
                  Clear Draft
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="text-sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            {resetButtonText}
          </Button>

          {customActions}
        </div>

        {/* Primary Submit Action */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {hasErrors && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Please fix errors before submitting</span>
            </div>
          )}

          <Button
            type="submit"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              'min-w-[120px] text-sm font-medium',
              isSubmitting && 'cursor-not-allowed',
            )}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {state.status === 'validating' ? 'Validating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// File Upload Manager Component
// ============================================================================

function FileUploadManager<TData extends FieldValues = FieldValues>({
  formConfig,
  form,
  className,
}: FileUploadManagerProps<TData>) {
  const fileElements = useMemo(() => {
    return formConfig.elements.filter((element) => element.type === 'file');
  }, [formConfig.elements]);

  const { form: hookForm, fileUploads, handleFileUpload, removeFile, state } = form;

  if (fileElements.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {fileElements.map((element) => (
        <FileUploadField
          key={element.id}
          element={element}
          form={hookForm}
          fileUploads={fileUploads}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          disabled={state.isSubmitting}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Main Form Submission Handler Component
// ============================================================================

export function FormSubmissionHandler<TData extends FieldValues = FieldValues>({
  formConfig,
  submitEndpoint,
  children,
  onSuccess,
  onError,
  options = {},
  className,
  showDraftIndicator = true,
  showProgressSteps = false,
  showSubmissionStates = true,
  autoSave = true,
  allowDrafts = true,
  submitButtonText = 'Submit Form',
  draftButtonText = 'Save Draft',
  resetButtonText = 'Reset Form',
  customActions,
  isMultiStep = false,
  currentStep = 1,
  totalSteps = 1,
  stepLabels = [],
}: FormSubmissionHandlerProps<TData>) {
  // ========================================================================
  // State & Hooks
  // ========================================================================

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Configure submission options
  const submissionOptions = useMemo(
    () => ({
      ...options,
      autoSave: {
        enabled: autoSave && allowDrafts,
        debounceMs: 2000,
        storageKey: `form-draft-${formConfig.id}`,
        ...options.autoSave,
      },
      onSuccess: (data: unknown) => {
        setHasUnsavedChanges(false);
        onSuccess?.(data as TData);
      },
      onError: (error: Error) => {
        onError?.(error);
      },
    }),
    [options, autoSave, allowDrafts, formConfig.id, onSuccess, onError],
  );

  // Initialize form submission hook
  const form = useFormSubmission<TData>(formConfig, submitEndpoint, submissionOptions);

  const {
    form: hookForm,
    state,
    optimisticState,
    submitForm,
    retrySubmission,
    cancelSubmission,
    hasDraft,
    loadDraft,
    clearDraft,
  } = form;

  // ========================================================================
  // Form Change Detection
  // ========================================================================

  useEffect(() => {
    const subscription = hookForm.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [hookForm]);

  // Reset unsaved changes flag on successful submission
  useEffect(() => {
    if (state.status === 'success') {
      setHasUnsavedChanges(false);
    }
  }, [state.status]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();

      try {
        await submitForm();
      } catch (error) {
        console.error('Submission error:', error);
      }
    },
    [submitForm],
  );

  const handleFormSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit],
  );

  // ========================================================================
  // Auto-load Draft on Mount
  // ========================================================================

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (allowDrafts && hasDraft) {
      // Show a subtle notification that a draft is available
      timer = setTimeout(() => {
        if (window.confirm('A saved draft was found. Would you like to load it?')) {
          loadDraft();
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [allowDrafts, hasDraft, loadDraft]);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const hasErrors = Object.keys(hookForm.formState.errors).length > 0;
  const isSubmitting = state.isSubmitting || state.status === 'submitting';

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <form onSubmit={handleFormSubmit} className={cn('space-y-6', className)} noValidate>
      {/* Progress Steps */}
      {showProgressSteps && isMultiStep && (
        <SubmissionProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />
      )}

      {/* Draft Indicator */}
      {showDraftIndicator && allowDrafts && (
        <DraftIndicator
          isDraftSaving={false}
          lastSaved={state.lastSubmissionTime}
          hasDraft={hasDraft}
          onLoadDraft={loadDraft}
          onClearDraft={clearDraft}
        />
      )}

      {/* Form Content */}
      <div className="space-y-6">
        {children}

        {/* File Upload Manager */}
        <FileUploadManager formConfig={formConfig} form={form} />
      </div>

      {/* Submission States */}
      {showSubmissionStates && (
        <SubmissionStates
          state={state}
          optimisticState={optimisticState}
          onRetry={retrySubmission}
          onCancel={cancelSubmission}
          autoHideSuccess={true}
          autoHideDelay={5000}
        />
      )}

      {/* Submission Controls */}
      <SubmissionControls
        form={form}
        isSubmitting={isSubmitting}
        hasErrors={hasErrors}
        hasUnsavedChanges={hasUnsavedChanges}
        submitButtonText={submitButtonText}
        draftButtonText={draftButtonText}
        resetButtonText={resetButtonText}
        customActions={customActions}
        onSubmit={handleSubmit}
      />
    </form>
  );
}

// ============================================================================
// Export Types and Components
// ============================================================================

export type { FileUploadManagerProps, FormSubmissionHandlerProps, SubmissionControlsProps };

export { FileUploadManager, SubmissionControls };
