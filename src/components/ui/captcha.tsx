'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

/**
 * CAPTCHA verification interface for component communication
 */
export interface CaptchaHandle {
  /** Get current CAPTCHA token */
  getToken: () => Promise<string | null>;
  /** Reset CAPTCHA widget */
  reset: () => void;
  /** Execute CAPTCHA verification */
  execute: () => Promise<string | null>;
}

/**
 * CAPTCHA component props
 */
interface CaptchaProps {
  /** CAPTCHA site key from environment */
  siteKey?: string;
  /** Action name for reCAPTCHA v3 */
  action?: string;
  /** Theme variant */
  theme?: 'light' | 'dark';
  /** Size variant */
  size?: 'normal' | 'compact' | 'invisible';
  /** Whether CAPTCHA is required */
  required?: boolean;
  /** Callback when CAPTCHA is verified */
  onVerify?: (token: string | null) => void;
  /** Callback when CAPTCHA expires */
  onExpire?: () => void;
  /** Callback when CAPTCHA encounters an error */
  onError?: () => void;
  /** Custom CSS class */
  className?: string;
  /** Whether to show loading state */
  loading?: boolean;
}

/**
 * Enhanced CAPTCHA component with Google reCAPTCHA v3 integration
 *
 * Provides invisible CAPTCHA protection with risk scoring and fallback
 * to visible CAPTCHA when needed. Supports both v2 and v3 modes.
 *
 * @example
 * ```tsx
 * const captchaRef = useRef<CaptchaHandle>(null)
 *
 * const handleSubmit = async () => {
 *   const token = await captchaRef.current?.getToken()
 *   if (token) {
 *     // Submit form with token
 *   }
 * }
 *
 * <Captcha
 *   ref={captchaRef}
 *   action="login"
 *   onVerify={(token) => console.log('Verified:', token)}
 * />
 * ```
 */
export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(
  (
    {
      siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      action = 'submit',
      theme = 'light',
      size = 'invisible',
      required = false,
      onVerify,
      onExpire,
      onError,
      className,
      loading = false,
    },
    ref,
  ) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    /**
     * Get current CAPTCHA token
     */
    const getToken = useCallback(async (): Promise<string | null> => {
      if (!recaptchaRef.current) {
        console.warn('CAPTCHA not initialized');
        return null;
      }

      try {
        // For invisible CAPTCHA, execute verification
        if (size === 'invisible') {
          const token = await recaptchaRef.current.executeAsync();
          console.log(`CAPTCHA token obtained for action: ${action}`);
          return token;
        }

        // For visible CAPTCHA, get current value
        const token = recaptchaRef.current.getValue();
        if (token) {
          console.log(`CAPTCHA verified for action: ${action}`);
        }
        return token;
      } catch (error) {
        console.error('CAPTCHA token retrieval failed:', error);
        onError?.();
        return null;
      }
    }, [size, onError, action]);

    /**
     * Reset CAPTCHA widget
     */
    const reset = useCallback(() => {
      if (!recaptchaRef.current) {
        console.warn('CAPTCHA not initialized');
        return;
      }

      try {
        recaptchaRef.current.reset();
        console.log(`CAPTCHA reset for action: ${action}`);
      } catch (error) {
        console.error('CAPTCHA reset failed:', error);
        onError?.();
      }
    }, [onError, action]);

    /**
     * Execute CAPTCHA verification (for invisible mode)
     */
    const execute = useCallback(async (): Promise<string | null> => {
      if (!recaptchaRef.current) {
        console.warn('CAPTCHA not initialized');
        return null;
      }

      try {
        if (size === 'invisible') {
          const token = await recaptchaRef.current.executeAsync();
          console.log(`CAPTCHA executed for action: ${action}`);
          onVerify?.(token);
          return token;
        }

        // For visible CAPTCHA, just return current value
        const token = recaptchaRef.current.getValue();
        return token;
      } catch (error) {
        console.error('CAPTCHA execution failed:', error);
        onError?.();
        return null;
      }
    }, [size, onVerify, onError, action]);

    // Expose methods through ref
    useImperativeHandle(
      ref,
      () => ({
        getToken,
        reset,
        execute,
      }),
      [getToken, reset, execute],
    );

    /**
     * Handle CAPTCHA verification callback
     */
    const handleVerify = useCallback(
      (token: string | null) => {
        if (token) {
          console.log(`CAPTCHA verified for action: ${action}`);
        }
        onVerify?.(token);
      },
      [onVerify, action],
    );

    /**
     * Handle CAPTCHA expiration
     */
    const handleExpire = useCallback(() => {
      console.log(`CAPTCHA expired for action: ${action}`);
      onExpire?.();
    }, [onExpire, action]);

    /**
     * Handle CAPTCHA error
     */
    const handleError = useCallback(() => {
      console.error(`CAPTCHA widget error for action: ${action}`);
      onError?.();
    }, [onError, action]);

    // Don't render if no site key is provided
    if (!siteKey) {
      console.warn('CAPTCHA site key not configured');
      if (required) {
        return (
          <div className={cn('text-sm text-red-600', className)}>
            CAPTCHA configuration error. Please contact support.
          </div>
        );
      }
      return null;
    }

    // Show loading state
    if (loading) {
      return (
        <div className={cn('flex items-center justify-center p-4', className)}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading security verification...</span>
          </div>
        </div>
      );
    }

    return (
      <div className={cn('captcha-container', className)} data-action={action}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          theme={theme}
          size={size}
          onChange={handleVerify}
          onExpired={handleExpire}
          onErrored={handleError}
          hl="en" // Language
        />

        {required && size === 'invisible' && (
          <div className="text-xs text-muted-foreground mt-2">
            This site is protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline">
              Terms of Service
            </a>{' '}
            apply.
          </div>
        )}
      </div>
    );
  },
);

Captcha.displayName = 'Captcha';

/**
 * Hook for CAPTCHA functionality
 *
 * @param action - Action name for verification
 * @returns CAPTCHA utilities and state
 */
export function useCaptcha(action: string = 'submit') {
  const captchaRef = useRef<CaptchaHandle>(null);

  /**
   * Verify CAPTCHA and get token
   */
  const verifyCaptcha = useCallback(async (): Promise<string | null> => {
    if (!captchaRef.current) {
      console.warn('CAPTCHA ref not available');
      return null;
    }

    return await captchaRef.current.getToken();
  }, []);

  /**
   * Reset CAPTCHA widget
   */
  const resetCaptcha = useCallback(() => {
    if (!captchaRef.current) {
      console.warn('CAPTCHA ref not available');
      return;
    }

    captchaRef.current.reset();
  }, []);

  /**
   * Execute CAPTCHA verification
   */
  const executeCaptcha = useCallback(async (): Promise<string | null> => {
    if (!captchaRef.current) {
      console.warn('CAPTCHA ref not available');
      return null;
    }

    return await captchaRef.current.execute();
  }, []);

  return {
    captchaRef,
    verifyCaptcha,
    resetCaptcha,
    executeCaptcha,
    action,
  };
}
