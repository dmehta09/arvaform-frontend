'use client';

import { FormRenderer } from '@/components/form-renderer/form-renderer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFormPreview } from '@/hooks/use-form-preview';
import { devices } from '@/lib/preview/device-breakpoints';
import { FormElement } from '@/types/form-builder.types';
import { Download, Eye, EyeOff, RotateCcw, Share2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DeviceSimulator } from './device-simulator';
import { PreviewToolbar } from './preview-toolbar';

/**
 * Props for the FormPreview component
 */
interface FormPreviewProps {
  /** Form elements to preview */
  elements: FormElement[];
  /** Currently selected device viewport */
  selectedDevice: string;
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Preview mode */
  mode: 'static' | 'interactive';
  /** Whether to show the preview toolbar */
  showToolbar?: boolean;
  /** Whether the preview is in fullscreen mode */
  isFullscreen?: boolean;
  /** Callback when device changes */
  onDeviceChange: (deviceId: string) => void;
  /** Callback when theme changes */
  onThemeChange: (theme: 'light' | 'dark') => void;
  /** Callback when mode changes */
  onModeChange: (mode: 'static' | 'interactive') => void;
  /** Callback when fullscreen toggles */
  onFullscreenToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormPreview component that renders forms with device simulation and real-time updates
 *
 * Features:
 * - Real-time preview updates as builder changes
 * - Device simulation (mobile/tablet/desktop)
 * - Interactive vs static preview modes
 * - Theme switching (light/dark)
 * - Preview sharing and screenshot capabilities
 * - Performance optimization with React 19 patterns
 */
export function FormPreview({
  elements,
  selectedDevice,
  theme,
  mode,
  showToolbar = true,
  isFullscreen = false,
  onDeviceChange,
  onThemeChange,
  onModeChange,
  onFullscreenToggle,
  className,
}: FormPreviewProps) {
  // Preview state management
  const {
    isVisible,
    updatePreviewData,
    toggleVisibility,
    resetPreview,
    captureScreenshot,
    generateShareUrl,
  } = useFormPreview({
    elements,
    device: selectedDevice,
    theme,
    mode,
  });

  // Local state for form interaction
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current device viewport configuration
  const currentDevice = useMemo(() => {
    const foundDevice = devices.find((device) => device.id === selectedDevice);
    if (!foundDevice) {
      // Fallback to the first device if selected device is not found
      const fallbackDevice = devices[0];
      if (!fallbackDevice) {
        // Create a default device if devices array is empty
        return {
          name: 'Default Desktop',
          type: 'desktop' as const,
          width: 1920,
          height: 1080,
          orientation: 'landscape' as const,
          icon: '🖥️',
          description: 'Default Desktop (1920x1080)',
        };
      }
      // Remove the id property to match DeviceViewport interface
      const { id: _, ...deviceViewport } = fallbackDevice;
      return deviceViewport;
    }
    // Remove the id property to match DeviceViewport interface
    const { id: _, ...deviceViewport } = foundDevice;
    return deviceViewport;
  }, [selectedDevice]);

  // Handle form data changes in interactive mode
  const handleFormDataChange = useCallback(
    (data: Record<string, unknown>) => {
      if (mode === 'interactive') {
        setFormData(data);
        updatePreviewData(data);
      }
    },
    [mode, updatePreviewData],
  );

  // Handle form submission in interactive mode
  const handleFormSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (mode !== 'interactive') return;

      setIsSubmitting(true);
      try {
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Preview form submitted:', data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode],
  );

  // Handle screenshot capture
  const handleScreenshot = useCallback(async () => {
    try {
      await captureScreenshot({
        filename: `form-preview-${selectedDevice}-${theme}`,
        format: 'png',
        scale: 2,
      });
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }, [captureScreenshot, selectedDevice, theme]);

  // Handle share URL generation
  const handleShare = useCallback(async () => {
    try {
      const shareUrl = generateShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
      console.log('Share URL copied to clipboard:', shareUrl);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
    }
  }, [generateShareUrl]);

  // Handle preview reset
  const handleReset = useCallback(() => {
    setFormData({});
    resetPreview();
  }, [resetPreview]);

  // Generate preview content
  const renderPreviewContent = () => {
    if (elements.length === 0) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No elements to preview</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Add some form elements to see how your form will look to users
            </p>
          </div>
        </div>
      );
    }

    return (
      <FormRenderer
        elements={elements}
        initialData={formData}
        onDataChange={handleFormDataChange}
        onSubmit={handleFormSubmit}
        mode={mode === 'interactive' ? 'interact' : 'view'}
        showProgress={mode === 'interactive'}
        showAnalytics={mode === 'interactive'}
        disabled={isSubmitting}
        className="w-full"
      />
    );
  };

  // Generate additional toolbar actions
  const toolbarActions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleVisibility}
        title={isVisible ? 'Hide preview' : 'Show preview'}>
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        title="Reset preview"
        disabled={!mode || mode !== 'interactive'}>
        <RotateCcw className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={handleScreenshot} title="Capture screenshot">
        <Download className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare} title="Share preview">
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <EyeOff className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 mb-3">Preview is hidden</p>
          <Button onClick={toggleVisibility} variant="outline" size="sm">
            Show Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`form-preview flex flex-col h-full ${className}`}>
      {/* Preview Toolbar */}
      {showToolbar && (
        <div className="flex-shrink-0">
          <PreviewToolbar
            selectedDevice={selectedDevice}
            theme={theme}
            mode={mode}
            isFullscreen={isFullscreen}
            onDeviceChange={onDeviceChange}
            onThemeChange={onThemeChange}
            onModeChange={onModeChange}
            onFullscreenToggle={onFullscreenToggle}
            additionalActions={toolbarActions}
          />
        </div>
      )}

      {/* Device Simulator - Use remaining space */}
      <div
        className={`flex-1 flex items-center justify-center overflow-hidden ${isFullscreen ? 'p-1' : 'p-4'}`}>
        <div
          className={`${isFullscreen ? 'w-full h-full flex items-center justify-center' : 'w-full max-w-full flex justify-center'}`}>
          <DeviceSimulator
            device={currentDevice}
            theme={theme}
            isFullscreen={isFullscreen}
            maxWidth={
              isFullscreen ? (typeof window !== 'undefined' ? window.innerWidth - 40 : 1920) : 1400
            }
            className={`${isFullscreen ? 'flex-shrink-0' : 'w-full max-w-full'}`}>
            <ScrollArea className="h-full w-full">
              <div className={`${isFullscreen ? 'p-3' : 'p-6'} min-h-[400px]`}>
                {renderPreviewContent()}
              </div>
            </ScrollArea>
          </DeviceSimulator>
        </div>
      </div>

      {/* Preview Analytics (for development) */}
      {process.env.NODE_ENV === 'development' && !isFullscreen && (
        <div className="flex-shrink-0 p-4">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-xs text-blue-700">
              <strong>Preview Debug:</strong> Device: {currentDevice.name}, Theme: {theme}, Mode:{' '}
              {mode}, Elements: {elements.length}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
