'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * CAPTCHA verification interface
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
 * CAPTCHA configuration
 */
interface CaptchaConfig {
  siteKey: string;
  enabled: boolean;
  scoreThreshold: number;
}

/**
 * Hook for CAPTCHA functionality with enhanced security features
 *
 * Provides a unified interface for CAPTCHA operations regardless of the
 * underlying implementation (Google reCAPTCHA v3, hCaptcha, etc.)
 *
 * @param action - Action name for verification context
 * @returns CAPTCHA utilities and state
 */
export function useCaptcha(action: string = 'submit') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const captchaRef = useRef<CaptchaHandle | null>(null);

  /**
   * Get CAPTCHA configuration from environment
   */
  const getConfig = useCallback((): CaptchaConfig => {
    return {
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      enabled: process.env.NEXT_PUBLIC_CAPTCHA_ENABLED === 'true',
      scoreThreshold: parseFloat(process.env.NEXT_PUBLIC_CAPTCHA_THRESHOLD || '0.5'),
    };
  }, []);

  /**
   * Check if CAPTCHA is required for the current context
   */
  const isCaptchaRequired = useCallback((): boolean => {
    const config = getConfig();

    // Skip if not enabled
    if (!config.enabled || !config.siteKey) {
      return false;
    }

    // Always require for sensitive actions
    const sensitiveActions = ['login', 'register', 'password-reset', 'payment'];
    return sensitiveActions.includes(action);
  }, [action, getConfig]);

  /**
   * Verify CAPTCHA and get token
   */
  const verifyCaptcha = useCallback(async (): Promise<string | null> => {
    if (!isCaptchaRequired()) {
      console.log('CAPTCHA not required for action:', action);
      return 'bypass';
    }

    if (!captchaRef.current) {
      console.warn('CAPTCHA ref not available');
      setError('CAPTCHA not initialized');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await captchaRef.current.getToken();

      if (token) {
        setVerified(true);
        console.log('CAPTCHA verification successful for action:', action);
      } else {
        setError('CAPTCHA verification failed');
      }

      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CAPTCHA verification failed';
      setError(errorMessage);
      console.error('CAPTCHA verification error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [action, isCaptchaRequired]);

  /**
   * Reset CAPTCHA widget and state
   */
  const resetCaptcha = useCallback(() => {
    if (captchaRef.current) {
      captchaRef.current.reset();
    }

    setVerified(false);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Execute CAPTCHA verification (for invisible mode)
   */
  const executeCaptcha = useCallback(async (): Promise<string | null> => {
    if (!isCaptchaRequired()) {
      return 'bypass';
    }

    if (!captchaRef.current) {
      console.warn('CAPTCHA ref not available');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await captchaRef.current.execute();

      if (token) {
        setVerified(true);
      }

      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CAPTCHA execution failed';
      setError(errorMessage);
      console.error('CAPTCHA execution error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isCaptchaRequired]);

  /**
   * Validate CAPTCHA token on the server
   */
  const validateCaptcha = useCallback(
    async (token: string): Promise<boolean> => {
      if (!token || token === 'bypass') {
        return true;
      }

      try {
        const response = await fetch('/api/captcha/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            action,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.success === true;
      } catch (err) {
        console.error('Server-side CAPTCHA validation failed:', err);
        return false;
      }
    },
    [action],
  );

  /**
   * Get human-readable status message
   */
  const getStatusMessage = useCallback((): string | null => {
    if (loading) return 'Verifying security...';
    if (error) return error;
    if (verified) return 'Security verification complete';
    if (!isCaptchaRequired()) return 'Security verification not required';
    return 'Security verification required';
  }, [loading, error, verified, isCaptchaRequired]);

  return {
    // Refs and state
    captchaRef,
    loading,
    error,
    verified,

    // Core operations
    verifyCaptcha,
    resetCaptcha,
    executeCaptcha,
    validateCaptcha,

    // Configuration
    action,
    isRequired: isCaptchaRequired(),
    config: getConfig(),

    // Status
    statusMessage: getStatusMessage(),
  };
}

/**
 * Simplified CAPTCHA hook for basic usage
 *
 * @param action - Action name for verification
 * @returns Basic CAPTCHA operations
 */
export function useSimpleCaptcha(action: string = 'submit') {
  const { captchaRef, verifyCaptcha, resetCaptcha, loading, error, verified, isRequired } =
    useCaptcha(action);

  return {
    captchaRef,
    verify: verifyCaptcha,
    reset: resetCaptcha,
    loading,
    error,
    verified,
    required: isRequired,
  };
}
