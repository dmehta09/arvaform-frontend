/**
 * Form Submission States Components - React 19 Edition
 *
 * Comprehensive UI components for displaying form submission states including
 * loading indicators, success feedback, error handling, and retry functionality.
 *
 * Features:
 * - Loading states with animated progress indicators
 * - Success states with celebration animations
 * - Error states with actionable retry options
 * - Accessibility compliant with ARIA attributes
 * - Mobile-friendly responsive design
 * - Progress tracking for multi-step submissions
 * - Draft saving indicators
 * - Optimistic UI updates with React 19 patterns
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SubmissionState } from '@/hooks/use-form-submission';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCheck,
  CheckCircle,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface SubmissionStatesProps {
  state: SubmissionState;
  optimisticState?: SubmissionState;
  onRetry?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
  showProgress?: boolean;
  autoHideSuccess?: boolean;
  autoHideDelay?: number;
}

interface LoadingIndicatorProps {
  status: SubmissionState['status'];
  progress?: number;
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

interface SuccessIndicatorProps {
  message?: string;
  autoHide?: boolean;
  onClose?: () => void;
  showAnimation?: boolean;
  className?: string;
}

interface ErrorIndicatorProps {
  message?: string;
  onRetry?: () => void;
  onClose?: () => void;
  retryCount?: number;
  className?: string;
}

interface DraftIndicatorProps {
  isDraftSaving?: boolean;
  lastSaved?: Date;
  hasDraft?: boolean;
  onLoadDraft?: () => void;
  onClearDraft?: () => void;
  className?: string;
}

// ============================================================================
// Loading States Component
// ============================================================================

export function LoadingIndicator({
  status,
  progress,
  message,
  showSpinner = true,
  className,
}: LoadingIndicatorProps) {
  const [dots, setDots] = useState('');

  // Animated dots for loading text
  useEffect(() => {
    if (status === 'validating' || status === 'submitting') {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
    return () => {}; // Return an empty cleanup function for other statuses
  }, [status]);

  const getLoadingMessage = (): string => {
    if (message) return `${message}${dots}`;

    switch (status) {
      case 'validating':
        return `Validating form${dots}`;
      case 'submitting':
        return `Submitting form${dots}`;
      default:
        return `Processing${dots}`;
    }
  };

  const getLoadingIcon = () => {
    switch (status) {
      case 'validating':
        return <CheckCheck className="h-5 w-5" />;
      case 'submitting':
        return <Send className="h-5 w-5" />;
      default:
        return <Loader2 className="h-5 w-5" />;
    }
  };

  if (status === 'idle' || status === 'success' || status === 'error') {
    return null;
  }

  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {showSpinner && (
            <div className="flex-shrink-0">
              <div className="animate-spin text-blue-600">{getLoadingIcon()}</div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-blue-900" role="status" aria-live="polite">
              {getLoadingMessage()}
            </p>

            {progress !== undefined && (
              <div className="mt-2 space-y-1">
                <Progress value={progress} className="h-2" aria-label="Submission progress" />
                <p className="text-xs text-blue-700">{Math.round(progress)}% complete</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Success States Component
// ============================================================================

export function SuccessIndicator({
  message = 'Form submitted successfully!',
  autoHide = false,
  onClose,
  showAnimation = true,
  className,
}: SuccessIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showCheckmark, setShowCheckmark] = useState(false);

  // Animation sequence
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setShowCheckmark(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowCheckmark(true);
    }
    return () => {}; // Add a return for the 'else' path
  }, [showAnimation]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return () => {}; // Add a return for the 'else' path
  }, [autoHide, onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <Card className={cn('border-green-200 bg-green-50', className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div
              className={cn(
                'transition-all duration-500',
                showCheckmark ? 'scale-100 text-green-600' : 'scale-0 text-green-600',
              )}>
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium text-green-900"
              role="status"
              aria-live="polite"
              aria-label="Success message">
              {message}
            </p>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              aria-label="Close success message"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Error States Component
// ============================================================================

export function ErrorIndicator({
  message = 'Something went wrong. Please try again.',
  onRetry,
  onClose,
  retryCount = 0,
  className,
}: ErrorIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  if (!isVisible) return null;

  const canRetry = onRetry && retryCount < 3;
  const showRetryWarning = retryCount >= 2;

  return (
    <Card className={cn('border-red-200 bg-red-50', className)}>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Error Message */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-900" role="alert" aria-live="assertive">
                {message}
              </p>

              {showRetryWarning && (
                <p className="mt-1 text-xs text-red-700">
                  Multiple retry attempts detected. If the issue persists, please contact support.
                </p>
              )}
            </div>

            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                aria-label="Close error message"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          {canRetry && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-red-300 text-red-700 hover:bg-red-100">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
                {retryCount > 0 && ` (${retryCount + 1}/3)`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Draft Indicator Component
// ============================================================================

export function DraftIndicator({
  isDraftSaving = false,
  lastSaved,
  hasDraft = false,
  onLoadDraft,
  onClearDraft,
  className,
}: DraftIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  // Update time ago display
  useEffect(() => {
    if (!lastSaved) return () => {}; // Return cleanup for early exit

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);

      if (minutes < 1) {
        setTimeAgo('just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours}h ago`);
      } else {
        setTimeAgo('more than 24h ago');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (!hasDraft && !isDraftSaving) {
    return null;
  }

  return (
    <Alert className={cn('border-blue-200 bg-blue-50', className)}>
      <div className="flex items-center gap-2">
        {isDraftSaving ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <Save className="h-4 w-4 text-blue-600" />
        )}

        <AlertDescription className="flex-1">
          {isDraftSaving ? (
            <span role="status" aria-live="polite">
              Saving draft...
            </span>
          ) : (
            <span>
              Draft saved {timeAgo && <span className="text-blue-700 font-medium">{timeAgo}</span>}
            </span>
          )}
        </AlertDescription>

        {hasDraft && !isDraftSaving && (
          <div className="flex gap-1">
            {onLoadDraft && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadDraft}
                className="h-6 px-2 text-xs text-blue-700 hover:text-blue-800">
                Load
              </Button>
            )}

            {onClearDraft && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearDraft}
                className="h-6 px-2 text-xs text-blue-700 hover:text-blue-800">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    </Alert>
  );
}

// ============================================================================
// Main Submission States Component
// ============================================================================

export function SubmissionStates({
  state,
  optimisticState,
  onRetry,
  onCancel,
  onClose,
  className,
  showProgress: _showProgress = true,
  autoHideSuccess = true,
  autoHideDelay = 5000,
}: SubmissionStatesProps) {
  // Use optimistic state when available, fall back to actual state
  const currentState = optimisticState || state;
  const [successAutoHide] = useState(autoHideSuccess);

  // Auto-hide success after delay
  useEffect(() => {
    if (currentState.status === 'success' && autoHideSuccess) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
    return () => {}; // Add a return for the 'else' path
  }, [currentState.status, autoHideSuccess, autoHideDelay, onClose]);

  // Don't render anything for idle state
  if (currentState.status === 'idle') {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Form submission status">
      {/* Loading States */}
      {(currentState.status === 'validating' || currentState.status === 'submitting') && (
        <div className="relative">
          <LoadingIndicator status={currentState.status} showSpinner={true} />

          {/* Cancel Button for Long Operations */}
          {currentState.status === 'submitting' && onCancel && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-800">
                Cancel Submission
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {currentState.status === 'success' && (
        <SuccessIndicator
          message="Form submitted successfully!"
          autoHide={successAutoHide}
          onClose={onClose}
          showAnimation={true}
        />
      )}

      {/* Error State */}
      {currentState.status === 'error' && (
        <ErrorIndicator
          message="Failed to submit form. Please check your inputs and try again."
          onRetry={onRetry}
          onClose={onClose}
          retryCount={currentState.submitCount - 1}
        />
      )}

      {/* Optimistic Updates Indicator */}
      {optimisticState && optimisticState !== state && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription>Processing your submission...</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ============================================================================
// Submission Progress Component
// ============================================================================

interface SubmissionProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export function SubmissionProgress({
  currentStep,
  totalSteps,
  stepLabels = [],
  className,
}: SubmissionProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2" aria-label="Submission progress" />

      {stepLabels[currentStep - 1] && (
        <p className="text-sm font-medium" role="status" aria-live="polite">
          {stepLabels[currentStep - 1]}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Export All Components
// ============================================================================
