'use client';

/**
 * useSharing Hook for ArvaForm
 *
 * Modern React hook for managing form sharing functionality:
 * - Social media sharing with platform-specific optimizations
 * - Embed code generation with multiple formats
 * - QR code generation and customization
 * - Web Share API integration with fallbacks
 * - Copy to clipboard with modern API
 * - Analytics tracking and error handling
 *
 * Following 2025 React patterns and best practices
 */

import {
  safeGenerateEmbedCode,
  type EmbedConfig,
  type EmbedOptions,
  type EmbedType,
} from '@/lib/sharing/embed-generator';
import {
  copyToClipboard,
  generateAllSocialShares,
  generateSocialShareUrl,
  nativeShare,
  trackSocialShare,
  validateSocialShareConfig,
  type SocialShareConfig,
} from '@/lib/sharing/social-templates';
import { Form } from '@/types/form.types';
import { useCallback, useEffect, useState } from 'react';

export interface SharingState {
  // Loading states
  isGenerating: boolean;
  isSharing: boolean;
  isCopying: boolean;

  // Share URLs
  shareUrls: Record<string, string>;
  directUrl: string;

  // Embed codes
  embedCodes: Record<EmbedType, string>;

  // QR code
  qrCodeDataUrl: string | null;

  // Errors
  errors: string[];

  // Config states
  socialConfig: SocialShareConfig | null;
  embedConfig: EmbedConfig | null;
}

export interface SharingOptions {
  // Form data
  form: Form;

  // Customization
  customDomain?: string;
  trackingCampaign?: string;

  // Callbacks
  onShare?: (platform: string, url: string) => void;
  onEmbed?: (type: EmbedType, code: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (action: string, data: unknown) => void;
}

export interface SharingActions {
  // Social sharing
  generateSocialShares: () => Promise<void>;
  shareOnPlatform: (platform: string) => Promise<boolean>;
  shareNative: () => Promise<boolean>;

  // Embed codes
  generateEmbedCodes: () => Promise<void>;
  generateSingleEmbed: (type: EmbedType, options?: Partial<EmbedOptions>) => Promise<string | null>;

  // QR code
  generateQRCode: (data: string, options?: Record<string, unknown>) => Promise<string | null>;

  // Clipboard
  copyToClipboard: (text: string) => Promise<boolean>;
  copyShareUrl: (platform: string) => Promise<boolean>;
  copyEmbedCode: (type: EmbedType) => Promise<boolean>;

  // Configuration
  updateSocialConfig: (updates: Partial<SocialShareConfig>) => void;
  updateEmbedConfig: (updates: Partial<EmbedConfig>) => void;

  // Reset
  reset: () => void;
  clearErrors: () => void;
}

const initialState: SharingState = {
  isGenerating: false,
  isSharing: false,
  isCopying: false,
  shareUrls: {},
  directUrl: '',
  embedCodes: {} as Record<EmbedType, string>,
  qrCodeDataUrl: null,
  errors: [],
  socialConfig: null,
  embedConfig: null,
};

/**
 * Main sharing hook
 */
export function useSharing(options: SharingOptions): SharingState & SharingActions {
  const { form, customDomain, trackingCampaign, onShare, onEmbed, onError, onSuccess } = options;

  const [state, setState] = useState<SharingState>(initialState);

  /**
   * Adds an error to the state
   */
  const addError = useCallback(
    (error: string) => {
      setState((prev) => ({
        ...prev,
        errors: [...prev.errors, error],
      }));
      onError?.(error);
    },
    [onError],
  );

  /**
   * Clears all errors
   */
  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: [] }));
  }, []);

  /**
   * Updates social sharing configuration
   */
  const updateSocialConfig = useCallback((updates: Partial<SocialShareConfig>) => {
    setState((prev) => ({
      ...prev,
      socialConfig: prev.socialConfig ? { ...prev.socialConfig, ...updates } : null,
    }));
  }, []);

  /**
   * Updates embed configuration
   */
  const updateEmbedConfig = useCallback((updates: Partial<EmbedConfig>) => {
    setState((prev) => ({
      ...prev,
      embedConfig: prev.embedConfig ? { ...prev.embedConfig, ...updates } : null,
    }));
  }, []);

  /**
   * Generates all social media share URLs
   */
  const generateSocialShares = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true }));
    clearErrors();

    try {
      const socialConfig: SocialShareConfig = {
        formId: form.id,
        slug: form.slug,
        title: form.title,
        description: form.description || `Fill out ${form.title}`,
        customDomain,
        utm: {
          source: 'social',
          medium: 'share',
          campaign: trackingCampaign || 'form_share',
        },
      };

      // Validate configuration
      const errors = validateSocialShareConfig(socialConfig);
      if (errors.length > 0) {
        errors.forEach(addError);
        return;
      }

      // Generate share URLs
      const shareUrls = generateAllSocialShares(socialConfig);
      const directUrl = shareUrls.direct || shareUrls.facebook || '';

      setState((prev) => ({
        ...prev,
        socialConfig,
        shareUrls,
        directUrl,
      }));

      onSuccess?.('social_shares_generated', { shareUrls, directUrl });
    } catch (error) {
      addError(error instanceof Error ? error.message : 'Failed to generate social shares');
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [form, customDomain, trackingCampaign, addError, clearErrors, onSuccess]);

  /**
   * Shares on a specific platform
   */
  const shareOnPlatform = useCallback(
    async (platform: string): Promise<boolean> => {
      if (!state.socialConfig) {
        addError('Social configuration not available');
        return false;
      }

      setState((prev) => ({ ...prev, isSharing: true }));

      try {
        const shareUrl = generateSocialShareUrl(platform, state.socialConfig);

        // Track the share
        trackSocialShare(platform, form.id);

        // Open share URL
        window.open(shareUrl, '_blank', 'noopener,noreferrer');

        onShare?.(platform, shareUrl);
        onSuccess?.('platform_share', { platform, shareUrl });

        return true;
      } catch (error) {
        addError(
          `Failed to share on ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        return false;
      } finally {
        setState((prev) => ({ ...prev, isSharing: false }));
      }
    },
    [state.socialConfig, form.id, addError, onShare, onSuccess],
  );

  /**
   * Uses native Web Share API
   */
  const shareNative = useCallback(async (): Promise<boolean> => {
    if (!state.socialConfig) {
      addError('Social configuration not available');
      return false;
    }

    setState((prev) => ({ ...prev, isSharing: true }));

    try {
      const success = await nativeShare(state.socialConfig);

      if (success) {
        trackSocialShare('native', form.id);
        onShare?.('native', state.directUrl);
        onSuccess?.('native_share', { url: state.directUrl });
      }

      return success;
    } catch (error) {
      addError(`Native share failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setState((prev) => ({ ...prev, isSharing: false }));
    }
  }, [state.socialConfig, state.directUrl, form.id, addError, onShare, onSuccess]);

  /**
   * Generates all embed codes
   */
  const generateEmbedCodes = useCallback(async () => {
    setState((prev) => ({ ...prev, isGenerating: true }));
    clearErrors();

    try {
      const baseConfig: EmbedConfig = {
        formId: form.id,
        slug: form.slug,
        type: 'iframe', // Will be overridden
        embedOptions: {
          width: '100%',
          height: '600px',
          responsive: true,
          autoResize: true,
          theme: 'auto',
        },
        tracking: {
          utmSource: 'embed',
          utmMedium: 'iframe',
          utmCampaign: trackingCampaign || 'form_embed',
        },
        customDomain,
      };

      const embedTypes: EmbedType[] = ['iframe', 'javascript', 'popup', 'direct'];
      const embedCodes: Record<EmbedType, string> = {} as Record<EmbedType, string>;

      for (const type of embedTypes) {
        const config = {
          ...baseConfig,
          type,
          popupOptions:
            type === 'popup'
              ? {
                  ...baseConfig.embedOptions,
                  trigger: 'click' as const,
                  buttonText: `Open ${form.title}`,
                }
              : undefined,
        };

        const result = safeGenerateEmbedCode(config);
        if (result.code) {
          embedCodes[type] = result.code;
        } else {
          result.errors.forEach(addError);
        }
      }

      setState((prev) => ({
        ...prev,
        embedConfig: baseConfig,
        embedCodes,
      }));

      onSuccess?.('embed_codes_generated', { embedCodes });
    } catch (error) {
      addError(error instanceof Error ? error.message : 'Failed to generate embed codes');
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [form, customDomain, trackingCampaign, addError, clearErrors, onSuccess]);

  /**
   * Generates a single embed code with custom options
   */
  const generateSingleEmbed = useCallback(
    async (type: EmbedType, options?: Partial<EmbedOptions>): Promise<string | null> => {
      try {
        const config: EmbedConfig = {
          formId: form.id,
          slug: form.slug,
          type,
          embedOptions: {
            width: '100%',
            height: '600px',
            responsive: true,
            autoResize: true,
            theme: 'auto',
            ...options,
          },
          tracking: {
            utmSource: 'embed',
            utmMedium: type,
            utmCampaign: trackingCampaign || 'form_embed',
          },
          customDomain,
          popupOptions:
            type === 'popup'
              ? {
                  trigger: 'click' as const,
                  buttonText: `Open ${form.title}`,
                  ...options,
                }
              : undefined,
        };

        const result = safeGenerateEmbedCode(config);
        if (result.code) {
          onEmbed?.(type, result.code);
          return result.code;
        } else {
          result.errors.forEach(addError);
          return null;
        }
      } catch (error) {
        addError(error instanceof Error ? error.message : 'Failed to generate embed code');
        return null;
      }
    },
    [form, customDomain, trackingCampaign, addError, onEmbed],
  );

  /**
   * Generates QR code (placeholder implementation)
   */
  const generateQRCode = useCallback(
    async (data: string, _options?: Record<string, unknown>): Promise<string | null> => {
      setState((prev) => ({ ...prev, isGenerating: true }));

      try {
        // This would integrate with the QR code generator component
        // For now, return a placeholder
        const qrCodeDataUrl = `data:image/png;base64,placeholder-qr-code-for-${encodeURIComponent(data)}`;

        setState((prev) => ({ ...prev, qrCodeDataUrl }));
        onSuccess?.('qr_code_generated', { data, dataUrl: qrCodeDataUrl });

        return qrCodeDataUrl;
      } catch (error) {
        addError(error instanceof Error ? error.message : 'Failed to generate QR code');
        return null;
      } finally {
        setState((prev) => ({ ...prev, isGenerating: false }));
      }
    },
    [addError, onSuccess],
  );

  /**
   * Copies text to clipboard
   */
  const copyToClipboardAction = useCallback(
    async (text: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, isCopying: true }));

      try {
        const success = await copyToClipboard(text);
        if (success) {
          onSuccess?.('copied_to_clipboard', { text: text.substring(0, 100) });
        } else {
          addError('Failed to copy to clipboard');
        }
        return success;
      } catch (error) {
        addError(error instanceof Error ? error.message : 'Failed to copy to clipboard');
        return false;
      } finally {
        setState((prev) => ({ ...prev, isCopying: false }));
      }
    },
    [addError, onSuccess],
  );

  /**
   * Copies share URL for a platform
   */
  const copyShareUrl = useCallback(
    async (platform: string): Promise<boolean> => {
      const url = state.shareUrls[platform];
      if (!url) {
        addError(`Share URL not available for ${platform}`);
        return false;
      }
      return copyToClipboardAction(url);
    },
    [state.shareUrls, addError, copyToClipboardAction],
  );

  /**
   * Copies embed code for a type
   */
  const copyEmbedCode = useCallback(
    async (type: EmbedType): Promise<boolean> => {
      const code = state.embedCodes[type];
      if (!code) {
        addError(`Embed code not available for ${type}`);
        return false;
      }
      return copyToClipboardAction(code);
    },
    [state.embedCodes, addError, copyToClipboardAction],
  );

  /**
   * Resets all state
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Auto-generate social shares when form changes
  useEffect(() => {
    if (form.id && form.slug) {
      generateSocialShares();
    }
    // Note: generateSocialShares is intentionally excluded from dependencies
    // to prevent infinite loops - it's stable enough for this use case
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id, form.slug]);

  return {
    // State
    ...state,

    // Actions
    generateSocialShares,
    shareOnPlatform,
    shareNative,
    generateEmbedCodes,
    generateSingleEmbed,
    generateQRCode,
    copyToClipboard: copyToClipboardAction,
    copyShareUrl,
    copyEmbedCode,
    updateSocialConfig,
    updateEmbedConfig,
    reset,
    clearErrors,
  };
}

export default useSharing;
