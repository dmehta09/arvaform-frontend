'use client';

import { DeviceViewport } from '@/lib/preview/device-breakpoints';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Props for the DeviceSimulator component
 */
interface DeviceSimulatorProps {
  /** Device viewport configuration */
  device: DeviceViewport;
  /** Theme mode */
  theme: 'light' | 'dark';
  /** Whether in fullscreen mode */
  isFullscreen?: boolean;
  /** Scale factor for the device frame */
  scale?: number;
  /** Maximum width for responsive scaling */
  maxWidth?: number;
  /** Children to render inside the device frame */
  children: React.ReactNode;
  /** Custom CSS classes */
  className?: string;
}

/**
 * DeviceSimulator component that displays content within a device frame
 *
 * Features:
 * - Accurate device dimensions and scaling
 * - Device-specific styling and frames
 * - Responsive scaling for different container sizes
 * - Theme-aware styling
 * - Fullscreen mode support
 * - Performance optimized with CSS transforms
 */
export function DeviceSimulator({
  device,
  theme,
  isFullscreen = false,
  scale = 1,
  maxWidth = 1200,
  children,
  className,
}: DeviceSimulatorProps) {
  // Calculate responsive scale if needed
  const responsiveScale = useMemo(() => {
    // Get available viewport dimensions
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (isFullscreen) {
      // In fullscreen mode, scale to fit the viewport properly
      const availableWidth = viewportWidth - 60; // Reduced margins for fullscreen
      const availableHeight = viewportHeight - 160; // Account for toolbar

      // Calculate scale to fit both width and height
      const scaleByWidth = availableWidth / device.width;
      const scaleByHeight = availableHeight / device.height;

      // Use the smaller scale to ensure everything fits, with better limits
      return Math.min(scaleByWidth, scaleByHeight, 0.85); // Cap at 85% for better fit
    }

    // For desktop devices, use a more reasonable scale for preview
    if (device.type === 'desktop') {
      // Get the available container width
      const containerWidth = maxWidth || viewportWidth;

      // For very large desktop devices (like QHD), use smaller scale
      if (device.width > 1920) {
        // QHD and larger displays - scale down significantly
        const targetWidth = Math.min(1000, containerWidth * 0.7);
        return Math.min(targetWidth / device.width, 0.4); // Cap at 40% for very large displays
      } else {
        // Standard desktop displays
        const targetWidth = Math.min(800, containerWidth * 0.8);
        return Math.min(targetWidth / device.width, 0.6); // Cap at 60% for standard displays
      }
    }

    // For mobile and tablet devices, use original scaling logic
    const deviceWidth = device.width + 40; // Add frame padding

    if (deviceWidth > viewportWidth) {
      return Math.max((viewportWidth - 80) / deviceWidth, 0.3); // Minimum 30% scale
    }

    return Math.min(scale, 1);
  }, [device.width, device.height, device.type, scale, maxWidth, isFullscreen]);

  // Generate device frame styles
  const frameStyles = useMemo(() => {
    const baseStyles = {
      width: `${device.width}px`,
      height: `${device.height}px`,
      transform: `scale(${responsiveScale})`,
      transformOrigin: isFullscreen ? 'center center' : 'top center',
    };

    return baseStyles;
  }, [device.width, device.height, responsiveScale, isFullscreen]);

  // Generate device-specific frame classes
  const frameClasses = useMemo(() => {
    const baseClasses = [
      'device-simulator-frame',
      'relative',
      'mx-auto',
      'overflow-hidden',
      'shadow-2xl',
      'transition-all',
      'duration-300',
    ];

    // Add device type specific styling
    switch (device.type) {
      case 'mobile':
        baseClasses.push(
          'rounded-[3rem]',
          'border-8',
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200',
          'bg-black/5',
        );
        break;
      case 'tablet':
        baseClasses.push(
          'rounded-[2rem]',
          'border-4',
          theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
          'bg-black/5',
        );
        break;
      case 'desktop':
        baseClasses.push(
          'rounded-lg',
          'border-2',
          theme === 'dark' ? 'border-gray-600' : 'border-gray-400',
          'bg-black/5',
        );
        break;
    }

    // Add theme-specific styling
    if (theme === 'dark') {
      baseClasses.push('shadow-black/50');
    } else {
      baseClasses.push('shadow-black/20');
    }

    // Add fullscreen mode styling
    if (isFullscreen) {
      baseClasses.push('!shadow-none', '!border-0', '!rounded-none');
    }

    return baseClasses.join(' ');
  }, [device.type, theme, isFullscreen]);

  // Generate content area classes
  const contentClasses = useMemo(() => {
    const baseClasses = ['device-simulator-content', 'w-full', 'h-full', 'overflow-hidden'];

    // Add device-specific content styling
    switch (device.type) {
      case 'mobile':
        baseClasses.push('rounded-[2.5rem]');
        break;
      case 'tablet':
        baseClasses.push('rounded-[1.5rem]');
        break;
      case 'desktop':
        baseClasses.push('rounded-md');
        break;
    }

    // Remove rounded corners in fullscreen
    if (isFullscreen) {
      baseClasses.push('!rounded-none');
    }

    // Add theme-specific content styling
    if (theme === 'dark') {
      baseClasses.push('bg-gray-900', 'text-white');
    } else {
      baseClasses.push('bg-white', 'text-gray-900');
    }

    return baseClasses.join(' ');
  }, [device.type, theme, isFullscreen]);

  // Render device decorations (like home button, notch, etc.)
  const renderDeviceDecorations = () => {
    if (isFullscreen || device.type === 'desktop') return null;

    return (
      <>
        {/* Mobile device decorations */}
        {device.type === 'mobile' && (
          <>
            {/* Notch/Dynamic Island for newer iPhones */}
            {device.name.includes('iPhone 14') && (
              <div
                className={cn(
                  'absolute top-0 left-1/2 transform -translate-x-1/2 z-10',
                  'w-32 h-6 rounded-b-2xl',
                  theme === 'dark' ? 'bg-gray-900' : 'bg-black',
                )}
              />
            )}

            {/* Home indicator for modern devices */}
            <div
              className={cn(
                'absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10',
                'w-32 h-1 rounded-full',
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400',
              )}
            />
          </>
        )}

        {/* Tablet decorations */}
        {device.type === 'tablet' && (
          <div
            className={cn(
              'absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10',
              'w-12 h-12 rounded-full border-2',
              theme === 'dark' ? 'border-gray-600' : 'border-gray-400',
            )}
          />
        )}
      </>
    );
  };

  return (
    <div
      className={cn(
        'device-simulator',
        isFullscreen
          ? 'w-full h-full flex items-center justify-center'
          : 'w-full flex justify-center',
        className,
      )}>
      {/* Device Frame */}
      <div className={frameClasses} style={frameStyles}>
        {/* Device Content */}
        <div className={contentClasses}>{children}</div>

        {/* Device Decorations */}
        {renderDeviceDecorations()}
      </div>

      {/* Scale indicator for development */}
      {process.env.NODE_ENV === 'development' && responsiveScale < 1 && (
        <div className="text-center mt-2 text-xs text-gray-500">
          Scale: {Math.round(responsiveScale * 100)}%
        </div>
      )}
    </div>
  );
}
