'use client';

import { cn } from '@/lib/utils';
import { FormElementType } from '@/types/form-builder.types';
import { useDroppable } from '@dnd-kit/core';
import React, { useMemo } from 'react';

/**
 * Props for the CanvasDropZone component
 */
interface CanvasDropZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  gridSize?: number;
  showGrid?: boolean;
  data?: Record<string, unknown>;
  minHeight?: string | number;
  onDropHover?: (isHovering: boolean) => void;
}

/**
 * CanvasDropZone provides a specialized drop zone for the form canvas
 * with grid support and precise positioning feedback
 */
export function CanvasDropZone({
  id,
  children,
  className = '',
  gridSize = 20,
  showGrid = false,
  data = {},
  minHeight = '100%',
  onDropHover,
}: CanvasDropZoneProps) {
  const { isOver, active, setNodeRef } = useDroppable({
    id,
    data: {
      ...data,
      type: 'canvas-drop-zone',
      accepts: data.accepts || 'all', // Accept all element types by default
    },
  });

  // Determine if the current drag element is accepted
  const isAccepted = useMemo(() => {
    if (!active) return true;

    const draggedElementType = active.data.current?.elementType as FormElementType;
    const acceptedTypes = data.accepts;

    if (!acceptedTypes || acceptedTypes === 'all') return true;
    if (!draggedElementType) return false;

    return Array.isArray(acceptedTypes) && acceptedTypes.includes(draggedElementType);
  }, [active, data.accepts]);

  // Notify parent of hover state changes
  React.useEffect(() => {
    onDropHover?.(isOver && isAccepted);
  }, [isOver, isAccepted, onDropHover]);

  // Calculate grid background pattern
  const gridStyles = useMemo(() => {
    if (!showGrid) return {};

    return {
      backgroundImage: `
        linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: `${gridSize}px ${gridSize}px`,
    };
  }, [showGrid, gridSize]);

  // Calculate dynamic classes based on drag state
  const dropZoneClasses = useMemo(() => {
    const baseClasses = ['relative w-full', 'transition-all duration-200 ease-in-out', className];

    // Active state (when any drag is happening)
    if (active) {
      baseClasses.push(
        'ring-2 ring-offset-2',
        isAccepted ? 'ring-blue-300 bg-blue-50/30' : 'ring-red-300 bg-red-50/30',
      );
    }

    // Over state (when dragged item is over this drop zone)
    if (isOver) {
      baseClasses.push(
        isAccepted ? 'ring-blue-500 bg-blue-100/50 shadow-lg' : 'ring-red-500 bg-red-100/50',
      );
    }

    // Default state
    if (!active) {
      baseClasses.push('bg-transparent');
    }

    return cn(baseClasses);
  }, [active, isOver, isAccepted, className]);

  return (
    <div
      ref={setNodeRef}
      className={dropZoneClasses}
      style={{
        minHeight,
        ...gridStyles,
      }}
      data-testid={`canvas-drop-zone-${id}`}
      aria-label="Canvas drop zone for form elements"
      role="region">
      {/* Drop feedback overlay */}
      {active && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {isOver && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'rounded-lg border-2 border-dashed',
                isAccepted ? 'border-blue-500 bg-blue-500/10' : 'border-red-500 bg-red-500/10',
              )}>
              <div
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'backdrop-blur-sm border',
                  isAccepted
                    ? 'bg-blue-500/90 border-blue-400 text-white'
                    : 'bg-red-500/90 border-red-400 text-white',
                )}>
                {isAccepted ? '✓ Drop element here' : '✗ Cannot drop here'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}

/**
 * Hook for managing canvas drop zone interactions
 */
export function useCanvasDropZone() {
  const [isHovering, setIsHovering] = React.useState(false);
  const [lastDropPosition, setLastDropPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleDropHover = React.useCallback((hovering: boolean) => {
    setIsHovering(hovering);
  }, []);

  const recordDropPosition = React.useCallback((x: number, y: number) => {
    setLastDropPosition({ x, y });
  }, []);

  return {
    isHovering,
    lastDropPosition,
    handleDropHover,
    recordDropPosition,
  };
}
