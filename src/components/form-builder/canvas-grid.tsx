'use client';

import { cn } from '@/lib/utils';
import { CanvasSize } from '@/types/form-builder.types';
import React, { useMemo } from 'react';

/**
 * Props for the CanvasGrid component
 */
interface CanvasGridProps {
  size: number;
  canvasSize: CanvasSize;
  zoom: number;
  visible?: boolean;
  opacity?: number;
  color?: string;
  className?: string;
}

/**
 * CanvasGrid provides an optional grid overlay for precise element alignment
 * with responsive sizing based on zoom level
 */
export function CanvasGrid({
  size,
  canvasSize,
  zoom,
  visible = true,
  opacity = 0.1,
  color = '#000000',
  className = '',
}: CanvasGridProps) {
  // Calculate grid styles based on size and zoom
  const gridStyles = useMemo(() => {
    const adjustedSize = size * zoom;

    return {
      backgroundImage: `
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${adjustedSize}px ${adjustedSize}px`,
      opacity: visible ? opacity : 0,
      width: canvasSize.width,
      height: canvasSize.height,
    };
  }, [size, zoom, color, opacity, visible, canvasSize]);

  // Grid container classes
  const gridClasses = useMemo(
    () => cn('absolute inset-0 pointer-events-none', 'transition-opacity duration-200', className),
    [className],
  );

  // Don't render if not visible
  if (!visible) return null;

  return (
    <div className={gridClasses} style={gridStyles} data-testid="canvas-grid" aria-hidden="true">
      {/* Grid origin indicator */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-gray-400 opacity-50" />

      {/* Major grid lines every 5 units */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${color} 2px, transparent 2px),
            linear-gradient(90deg, ${color} 2px, transparent 2px)
          `,
          backgroundSize: `${size * 5 * zoom}px ${size * 5 * zoom}px`,
          opacity: opacity * 0.5,
        }}
      />
    </div>
  );
}

/**
 * Hook for managing grid settings
 */
export function useCanvasGrid(initialSize: number = 20) {
  const [gridSize, setGridSize] = React.useState(initialSize);
  const [isVisible, setIsVisible] = React.useState(true);
  const [opacity, setOpacity] = React.useState(0.1);

  const toggleGrid = React.useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const updateGridSize = React.useCallback((newSize: number) => {
    setGridSize(Math.max(5, Math.min(100, newSize))); // Clamp between 5 and 100
  }, []);

  const updateOpacity = React.useCallback((newOpacity: number) => {
    setOpacity(Math.max(0.05, Math.min(1, newOpacity))); // Clamp between 0.05 and 1
  }, []);

  return {
    gridSize,
    isVisible,
    opacity,
    toggleGrid,
    updateGridSize,
    updateOpacity,
    setGridSize,
    setIsVisible,
    setOpacity,
  };
}
