'use client';

import { FormElement } from '@/types/form-builder.types';
import { capturePreviewScreenshot, generatePreviewShareUrl } from '@/utils/preview-helpers';
import { useCallback, useState } from 'react';

/**
 * Props for the useFormPreview hook
 */
interface UseFormPreviewProps {
  elements: FormElement[];
  device: string;
  theme: 'light' | 'dark';
  mode: 'static' | 'interactive';
}

/**
 * Return type for the useFormPreview hook
 */
interface UseFormPreviewReturn {
  previewData: Record<string, unknown>;
  isVisible: boolean;
  updatePreviewData: (data: Record<string, unknown>) => void;
  toggleVisibility: () => void;
  resetPreview: () => void;
  captureScreenshot: (options?: {
    filename?: string;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    scale?: number;
  }) => Promise<string | null>;
  generateShareUrl: () => string;
}

/**
 * Custom hook for managing form preview state and functionality
 *
 * Features:
 * - Preview data management
 * - Visibility control
 * - Screenshot capture
 * - Share URL generation
 * - Real-time updates
 */
export function useFormPreview({
  elements,
  device,
  theme,
}: UseFormPreviewProps): UseFormPreviewReturn {
  // Preview state
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});
  const [isVisible, setIsVisible] = useState(true);

  // Update preview data
  const updatePreviewData = useCallback((data: Record<string, unknown>) => {
    setPreviewData(data);
  }, []);

  // Toggle preview visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Reset preview to initial state
  const resetPreview = useCallback(() => {
    setPreviewData({});
  }, []);

  // Capture screenshot of preview
  const captureScreenshot = useCallback(
    async (
      options: {
        filename?: string;
        format?: 'png' | 'jpeg' | 'webp';
        quality?: number;
        scale?: number;
      } = {},
    ) => {
      const previewElement = document.querySelector('.form-preview') as HTMLElement;

      if (!previewElement) {
        console.warn('Preview element not found for screenshot');
        return null;
      }

      return await capturePreviewScreenshot(previewElement, {
        filename: options.filename || `form-preview-${device}-${theme}`,
        format: options.format || 'png',
        quality: options.quality || 0.9,
        scale: options.scale || 2,
      });
    },
    [device, theme],
  );

  // Generate shareable URL for preview
  const generateShareUrl = useCallback(() => {
    // Create a minimal viewport for sharing
    const viewport = {
      name: 'Default',
      type: 'desktop' as const,
      width: 800,
      height: 600,
      orientation: 'landscape' as const,
      icon: '🖥️',
      description: 'Default viewport',
    };

    return generatePreviewShareUrl(elements, viewport, theme);
  }, [elements, theme]);

  return {
    previewData,
    isVisible,
    updatePreviewData,
    toggleVisibility,
    resetPreview,
    captureScreenshot,
    generateShareUrl,
  };
}
