'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PublicForm } from '@/lib/api/public-forms';
import { AlertTriangle, Clock, Shield, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface FormSecurityProps {
  form: PublicForm;
  currentDomain?: string;
  onAccessDenied?: (reason: string) => void;
  onSecurityCheck?: (passed: boolean) => void;
}

interface SecurityCheck {
  name: string;
  passed: boolean;
  reason?: string;
  severity: 'info' | 'warning' | 'error';
  icon: React.ReactNode;
}

/**
 * Security component that validates form access and displays security status
 * Implements comprehensive security checks including domain validation,
 * submission limits, deadlines, and rate limiting
 */
export function FormSecurity({
  form,
  currentDomain,
  onAccessDenied,
  onSecurityCheck,
}: FormSecurityProps) {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [isSecurityPassed, setIsSecurityPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('[FormSecurity] Performing security checks for form:', form.id);

  const formatTimeDifference = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }, []);

  const checkDomainAccess = useCallback((): boolean => {
    try {
      // If no domain restrictions, allow access
      if (!form.allowedDomains || form.allowedDomains.length === 0) {
        return true;
      }

      // Get current domain
      const domain =
        currentDomain || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

      console.log('[FormSecurity] Checking domain access:', {
        current: domain,
        allowed: form.allowedDomains,
      });

      // Check if current domain is in allowed list
      return form.allowedDomains.some(
        (allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`),
      );
    } catch (error) {
      console.error('[FormSecurity] Error checking domain access:', error);
      return false;
    }
  }, [form.allowedDomains, currentDomain]);

  const checkSubmissionDeadline = useCallback((): { passed: boolean; reason?: string } => {
    try {
      if (!form.submissionDeadline) {
        return { passed: true };
      }

      const deadline = new Date(form.submissionDeadline);
      const now = new Date();

      if (deadline < now) {
        const timeAgo = formatTimeDifference(now.getTime() - deadline.getTime());
        return {
          passed: false,
          reason: `Submission deadline expired ${timeAgo} ago`,
        };
      }

      const timeRemaining = formatTimeDifference(deadline.getTime() - now.getTime());
      return {
        passed: true,
        reason: `Submissions close in ${timeRemaining}`,
      };
    } catch (error) {
      console.error('[FormSecurity] Error checking deadline:', error);
      return { passed: false, reason: 'Invalid deadline configuration' };
    }
  }, [form.submissionDeadline, formatTimeDifference]);

  const checkSubmissionCapacity = useCallback((): { passed: boolean; reason?: string } => {
    try {
      if (!form.maxSubmissions) {
        return { passed: true, reason: 'No submission limit' };
      }

      const remaining = form.maxSubmissions - form.currentSubmissions;

      if (remaining <= 0) {
        return {
          passed: false,
          reason: `Maximum submissions reached (${form.maxSubmissions})`,
        };
      }

      const percentage = Math.round((form.currentSubmissions / form.maxSubmissions) * 100);
      return {
        passed: true,
        reason: `${remaining} submissions remaining (${percentage}% full)`,
      };
    } catch (error) {
      console.error('[FormSecurity] Error checking capacity:', error);
      return { passed: false, reason: 'Error checking submission capacity' };
    }
  }, [form.maxSubmissions, form.currentSubmissions]);

  const checkRateLimit = useCallback(async (): Promise<{ passed: boolean; reason?: string }> => {
    try {
      // Check localStorage for recent submissions
      const storageKey = `form_${form.id}_last_attempt`;
      const lastAttempt = localStorage.getItem(storageKey);

      if (lastAttempt) {
        const lastAttemptTime = parseInt(lastAttempt, 10);
        const timeSinceLastAttempt = Date.now() - lastAttemptTime;
        const cooldownPeriod = 60 * 1000; // 1 minute cooldown

        if (timeSinceLastAttempt < cooldownPeriod) {
          const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000);
          return {
            passed: false,
            reason: `Please wait ${remainingTime} seconds before submitting again`,
          };
        }
      }

      return { passed: true, reason: 'Rate limit check passed' };
    } catch (error) {
      console.warn('[FormSecurity] Rate limit check failed:', error);
      // Don't block on client-side rate limit failures
      return { passed: true, reason: 'Rate limit check unavailable' };
    }
  }, [form.id]);

  const performSecurityChecks = useCallback(async () => {
    setIsLoading(true);
    console.log('[FormSecurity] Starting security validation...');

    const checks: SecurityCheck[] = [];

    // Check 1: Form publication status
    checks.push({
      name: 'Form Status',
      passed: form.isPublic && !form.isArchived,
      reason: !form.isPublic
        ? 'Form is not publicly accessible'
        : form.isArchived
          ? 'Form has been archived'
          : undefined,
      severity: 'error',
      icon: <Shield className="h-4 w-4" />,
    });

    // Check 2: Domain access validation
    const isDomainAllowed = checkDomainAccess();
    checks.push({
      name: 'Domain Access',
      passed: isDomainAllowed,
      reason: !isDomainAllowed ? 'Access denied from this domain' : undefined,
      severity: 'error',
      icon: <Shield className="h-4 w-4" />,
    });

    // Check 3: Submission deadline
    const isWithinDeadline = checkSubmissionDeadline();
    checks.push({
      name: 'Submission Deadline',
      passed: isWithinDeadline.passed,
      reason: isWithinDeadline.reason,
      severity: isWithinDeadline.passed ? 'info' : 'warning',
      icon: <Clock className="h-4 w-4" />,
    });

    // Check 4: Submission capacity
    const hasCapacity = checkSubmissionCapacity();
    checks.push({
      name: 'Submission Capacity',
      passed: hasCapacity.passed,
      reason: hasCapacity.reason,
      severity: hasCapacity.passed ? 'info' : 'warning',
      icon: <Users className="h-4 w-4" />,
    });

    // Check 5: Rate limiting (client-side check)
    const rateLimitCheck = await checkRateLimit();
    checks.push({
      name: 'Rate Limiting',
      passed: rateLimitCheck.passed,
      reason: rateLimitCheck.reason,
      severity: rateLimitCheck.passed ? 'info' : 'warning',
      icon: <AlertTriangle className="h-4 w-4" />,
    });

    setSecurityChecks(checks);

    // Determine overall security status
    const criticalChecks = checks.filter((check) => check.severity === 'error');
    const failedCritical = criticalChecks.some((check) => !check.passed);
    const securityPassed = !failedCritical;

    setIsSecurityPassed(securityPassed);

    // Notify parent components
    onSecurityCheck?.(securityPassed);

    if (!securityPassed) {
      const failedCriticalCheck = criticalChecks.find((check) => !check.passed);
      onAccessDenied?.(failedCriticalCheck?.reason || 'Access denied');
    }
  }, [
    checkDomainAccess,
    checkSubmissionDeadline,
    checkSubmissionCapacity,
    checkRateLimit,
    form.isPublic,
    form.isArchived,
    onSecurityCheck,
    onAccessDenied,
  ]);

  useEffect(() => {
    performSecurityChecks();
  }, [performSecurityChecks]);

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 animate-pulse" />
            <CardTitle>Validating Access...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render if all checks passed - let form render normally
  if (isSecurityPassed && securityChecks.every((check) => check.passed)) {
    return null;
  }

  const failedChecks = securityChecks.filter((check) => !check.passed);
  const warningChecks = securityChecks.filter(
    (check) => !check.passed && check.severity === 'warning',
  );
  const errorChecks = securityChecks.filter((check) => !check.passed && check.severity === 'error');

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Critical security failures */}
      {errorChecks.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Access Denied</div>
            This form is not accessible due to security restrictions:
            <ul className="mt-2 list-disc list-inside space-y-1">
              {errorChecks.map((check, index) => (
                <li key={index}>
                  <span className="font-medium">{check.name}:</span> {check.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings that don't block access */}
      {warningChecks.length > 0 && errorChecks.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Notice</div>
            <ul className="space-y-1">
              {warningChecks.map((check, index) => (
                <li key={index}>
                  <span className="font-medium">{check.name}:</span> {check.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Retry button for non-critical failures */}
      {failedChecks.length > 0 && errorChecks.length === 0 && (
        <div className="text-center">
          <Button onClick={performSecurityChecks} variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Refresh Security Status
          </Button>
        </div>
      )}

      {/* Security status summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>Form access validation results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div
                    className={`
										p-1 rounded-full
										${
                      check.passed
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : check.severity === 'error'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                    }
									`}>
                    {check.icon}
                  </div>
                  <div>
                    <div className="font-medium">{check.name}</div>
                    {check.reason && (
                      <div className="text-sm text-muted-foreground">{check.reason}</div>
                    )}
                  </div>
                </div>
                <div
                  className={`
									px-2 py-1 rounded text-xs font-medium
									${
                    check.passed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }
								`}>
                  {check.passed ? 'PASS' : 'FAIL'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
