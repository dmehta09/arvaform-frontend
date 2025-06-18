'use client';

/**
 * FormRenderer - Renders complete forms in preview mode
 * Supports validation, data collection, and interactive testing
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FormElement } from '@/types/form-builder.types';
import { generateFormAnalytics, validateFormData } from '@/utils/preview-helpers';
import React, { useCallback, useMemo, useState } from 'react';
import { ElementRenderer } from './element-renderer';

interface FormRendererProps {
  elements: FormElement[];
  initialData?: Record<string, unknown>;
  onDataChange?: (data: Record<string, unknown>) => void;
  onSubmit?: (data: Record<string, unknown>) => void;
  mode?: 'view' | 'interact';
  showProgress?: boolean;
  showAnalytics?: boolean;
  submitButtonText?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * FormRenderer component that renders complete forms in preview mode
 */
export function FormRenderer({
  elements,
  initialData = {},
  onDataChange,
  onSubmit,
  mode = 'view',
  showProgress = false,
  showAnalytics = false,
  submitButtonText = 'Submit',
  className,
  disabled = false,
}: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Memoized validation and analytics
  const validationErrors = useMemo(() => {
    return validateFormData(elements, formData);
  }, [elements, formData]);

  const analytics = useMemo(() => {
    return generateFormAnalytics(elements, formData);
  }, [elements, formData]);

  // Update errors when validation changes
  React.useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  // Handle form data changes
  const handleFieldChange = useCallback(
    (elementId: string | number, value: unknown) => {
      const newData = { ...formData, [elementId]: value };
      setFormData(newData);
      onDataChange?.(newData);

      // Clear error for this field if it was previously invalid
      if (errors[elementId]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[elementId];
          return newErrors;
        });
      }
    },
    [formData, onDataChange, errors],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (mode === 'view' || disabled) return;

      // Validate all fields
      const currentErrors = validateFormData(elements, formData);
      setErrors(currentErrors);

      if (Object.keys(currentErrors).length > 0) {
        setSubmitMessage({
          type: 'error',
          message: 'Please fix the errors below before submitting.',
        });
        return;
      }

      setIsSubmitting(true);
      setSubmitMessage(null);

      try {
        await onSubmit?.(formData);
        setSubmitMessage({
          type: 'success',
          message: 'Form submitted successfully!',
        });
      } catch {
        setSubmitMessage({
          type: 'error',
          message: 'Failed to submit form. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, disabled, elements, formData, onSubmit],
  );

  // Reset form data
  const handleReset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setSubmitMessage(null);
  }, [initialData]);

  // Render progress bar
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{analytics.completionRate}%</span>
        </div>
        <Progress value={analytics.completionRate} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {analytics.completedFields} of {analytics.totalFields} fields completed
          </span>
          <span>~{analytics.estimatedTime} min remaining</span>
        </div>
      </div>
    );
  };

  // Render analytics panel
  const renderAnalytics = () => {
    if (!showAnalytics) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Form Analytics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-blue-600">Total Fields:</span>
            <div className="font-medium">{analytics.totalFields}</div>
          </div>
          <div>
            <span className="text-blue-600">Completed:</span>
            <div className="font-medium">{analytics.completedFields}</div>
          </div>
          <div>
            <span className="text-blue-600">Completion:</span>
            <div className="font-medium">{analytics.completionRate}%</div>
          </div>
          <div>
            <span className="text-blue-600">Est. Time:</span>
            <div className="font-medium">{analytics.estimatedTime}m</div>
          </div>
        </div>

        {analytics.hasValidationErrors && (
          <div className="mt-3 text-xs text-red-600">
            {analytics.errorCount} validation error{analytics.errorCount !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    );
  };

  // Render submit message
  const renderSubmitMessage = () => {
    if (!submitMessage) return null;

    return (
      <Alert
        className={cn(
          'mb-4',
          submitMessage.type === 'success' && 'border-green-500 bg-green-50',
          submitMessage.type === 'error' && 'border-red-500 bg-red-50',
        )}>
        <AlertDescription
          className={cn(
            submitMessage.type === 'success' && 'text-green-700',
            submitMessage.type === 'error' && 'text-red-700',
          )}>
          {submitMessage.message}
        </AlertDescription>
      </Alert>
    );
  };

  // Render form actions
  const renderFormActions = () => {
    if (mode === 'view') return null;

    return (
      <div className="flex gap-3 pt-6 border-t justify-center">
        <Button type="submit" disabled={disabled || isSubmitting} className="min-w-[120px] px-8">
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={disabled || isSubmitting}
          className="min-w-[80px] px-6">
          Reset
        </Button>
      </div>
    );
  };

  // Filter and sort elements by position order
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => a.position.order - b.position.order);
  }, [elements]);

  if (elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No form elements</p>
          <p className="text-sm text-gray-400">Add some elements to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('form-renderer', className)}>
      {renderProgress()}
      {renderAnalytics()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderSubmitMessage()}

        {sortedElements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            value={formData[element.id]}
            error={errors[element.id]}
            onChange={(value) => handleFieldChange(element.id, value)}
            mode={mode}
            disabled={disabled}
            className="animate-in fade-in-50 duration-300"
          />
        ))}

        {renderFormActions()}
      </form>
    </div>
  );
}
