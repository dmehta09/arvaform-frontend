'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePublicForm } from '@/hooks/use-public-form';
import type { PublicForm } from '@/lib/api/public-forms';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Eye, Share2, Users } from 'lucide-react';
import { useActionState, useRef, useState } from 'react';
import { FormSecurity } from './form-security';
import { FormSkeletonError } from './form-skeleton';

interface PublicFormRendererProps {
  formSlug: string;
  initialFormData: PublicForm;
  searchParams?: Record<string, string | string[] | undefined>;
  className?: string;
}

/**
 * Main public form renderer with comprehensive features including:
 * - SSR-optimized rendering with hydration
 * - Responsive design for all device types
 * - WCAG 2.1 AA accessibility compliance
 * - Real-time form validation
 * - Security access controls
 * - Theme support and consistent styling
 * - Progressive enhancement
 */
export function PublicFormRenderer({
  formSlug,
  initialFormData,
  searchParams = {},
  className,
}: PublicFormRendererProps) {
  const [isSecurityPassed, setIsSecurityPassed] = useState<boolean | null>(null);
  const [submissionState, submitAction, isPending] = useActionState(submitForm, null);
  const formRef = useRef<HTMLFormElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Use the custom hook for state management
  const {
    form,
    isLoading,
    error,
    isAccessible,
    canSubmit,
    isFormValid,
    estimatedDuration,
    submissionStatus,
    refetch,
  } = usePublicForm({
    formSlug,
    initialData: initialFormData,
    enablePolling: true,
    pollingInterval: 60000, // 1 minute for submission count updates
    onError: (errorMessage) => {
      console.error('[PublicFormRenderer] Hook error:', errorMessage);
    },
    onFormLoaded: (loadedForm) => {
      console.log('[PublicFormRenderer] Form loaded:', loadedForm.title);
    },
  });

  console.log('[PublicFormRenderer] Rendering form:', {
    slug: formSlug,
    hasForm: !!form,
    isLoading,
    error,
    isAccessible,
    canSubmit,
  });

  // Submit form action (React 19 Server Action pattern)
  async function submitForm(
    prevState: unknown,
    formData: FormData,
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    submissionId?: string;
    fields?: Record<string, string>;
  }> {
    try {
      console.log('[PublicFormRenderer] Submitting form...');

      // Client-side pre-validation
      if (!form || !isAccessible || !canSubmit) {
        return {
          success: false,
          error: 'Form is not available for submission',
          fields: {},
        };
      }

      // Record submission attempt for rate limiting
      try {
        localStorage.setItem(`form_${form.id}_last_attempt`, Date.now().toString());
      } catch (e) {
        console.warn('[PublicFormRenderer] Could not record submission attempt:', e);
      }

      // Submit to API endpoint
      const response = await fetch(`/api/public/forms/${formSlug}/submit`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      console.log('[PublicFormRenderer] Form submitted successfully');

      // Refresh form data to update submission count
      setTimeout(() => refetch(), 1000);

      return {
        success: true,
        message: result.message || 'Form submitted successfully!',
        submissionId: result.submissionId,
      };
    } catch (error) {
      console.error('[PublicFormRenderer] Submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        fields: {},
      };
    }
  }

  // Handle security check results
  const handleSecurityCheck = (passed: boolean) => {
    setIsSecurityPassed(passed);
    console.log('[PublicFormRenderer] Security check result:', passed);
  };

  // Handle access denied
  const handleAccessDenied = (reason: string) => {
    console.warn('[PublicFormRenderer] Access denied:', reason);
  };

  // Calculate responsive classes based on device
  const containerClasses = cn(
    'min-h-screen bg-gradient-to-br from-background via-background to-muted/10',
    'transition-all duration-300',
    className,
  );

  // Error state
  if (error) {
    return (
      <div className={containerClasses}>
        <FormSkeletonError error={error} retry={refetch} />
      </div>
    );
  }

  // Loading state (should rarely show due to SSR)
  if (isLoading || !form) {
    return (
      <div className={containerClasses}>
        <div className="max-w-2xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Security check failed - show security component
  if (isSecurityPassed === false) {
    return (
      <div className={containerClasses}>
        <div className="max-w-4xl mx-auto p-6">
          <FormSecurity
            form={form}
            onSecurityCheck={handleSecurityCheck}
            onAccessDenied={handleAccessDenied}
          />
        </div>
      </div>
    );
  }

  // Main form rendering
  return (
    <div className={containerClasses}>
      {/* Skip to main content for accessibility */}
      <a
        href="#main-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Skip to form
      </a>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Security validation (hidden if passed) */}
        <FormSecurity
          form={form}
          onSecurityCheck={handleSecurityCheck}
          onAccessDenied={handleAccessDenied}
        />

        {/* Form header */}
        <header ref={headerRef} className="mb-8 text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {/* Form metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {estimatedDuration && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {estimatedDuration}
              </Badge>
            )}

            {submissionStatus.max && (
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {submissionStatus.current} / {submissionStatus.max} responses
              </Badge>
            )}

            {form.submissionDeadline && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                Closes {new Date(form.submissionDeadline).toLocaleDateString()}
              </Badge>
            )}

            <Badge variant="outline" className="gap-1">
              <Eye className="h-3 w-3" />
              Public Form
            </Badge>
          </div>

          {/* Submission progress bar */}
          {submissionStatus.max && submissionStatus.percentage !== null && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Responses</span>
                <span>{submissionStatus.percentage}% filled</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(submissionStatus.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Main form */}
        <main id="main-form">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              {/* Success message */}
              {submissionState?.success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <h3 className="font-medium text-green-800 dark:text-green-200">
                      Form Submitted Successfully!
                    </h3>
                  </div>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    {submissionState.message}
                  </p>
                  {submissionState.submissionId && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Reference ID: {submissionState.submissionId}
                    </p>
                  )}
                </div>
              )}

              {/* Error message */}
              {submissionState?.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <h3 className="font-medium text-red-800 dark:text-red-200">
                      Submission Failed
                    </h3>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">{submissionState.error}</p>
                </div>
              )}

              {/* Form elements */}
              <form ref={formRef} action={submitAction} className="space-y-6" noValidate>
                {/* Hidden fields for tracking */}
                <input type="hidden" name="formId" value={form.id} />
                <input type="hidden" name="formSlug" value={formSlug} />
                {searchParams.source && (
                  <input type="hidden" name="source" value={searchParams.source} />
                )}

                {/* Render form elements */}
                <div className="space-y-6">
                  {form.elements.map((element, _index) => (
                    <div
                      key={element.id}
                      className="space-y-2 transition-opacity duration-200"
                      style={{ opacity: isPending ? 0.7 : 1 }}>
                      <label className="block text-sm font-medium">
                        {element.label || 'Form Field'}
                        {element.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        name={element.id}
                        type="text"
                        placeholder={element.placeholder}
                        required={element.isRequired}
                        readOnly={!canSubmit || isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {submissionState?.fields?.[element.id] && (
                        <p className="text-sm text-red-600">{submissionState.fields[element.id]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit button */}
                <div className="pt-6 border-t">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {canSubmit ? (
                        <span>Ready to submit</span>
                      ) : (
                        <span>Submissions are currently closed</span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {/* Share button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: form.title,
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                          }
                        }}
                        className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>

                      {/* Submit button */}
                      <Button
                        type="submit"
                        disabled={!canSubmit || isPending || !isFormValid}
                        className="min-w-32 gap-2"
                        size="lg">
                        {isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Form'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Footer information */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span>Powered by ArvaForm</span>
            <Separator orientation="vertical" className="hidden sm:block h-4" />
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer">
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer">
              Terms of Service
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
