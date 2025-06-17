'use client';

import { cn } from '@/lib/utils';
import { FormElementType } from '@/types/form-builder.types';
import { useDroppable } from '@dnd-kit/core';
import React, { useMemo } from 'react';

/**
 * Props for the DropZone component
 */
interface DropZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  overClassName?: string;
  data?: Record<string, unknown>;
  showIndicators?: boolean;
  placeholder?: React.ReactNode;
  minHeight?: string;
}

/**
 * DropZone component provides a droppable area with visual feedback
 * during drag operations. Supports validation of accepted element types
 * and provides clear visual indicators for valid/invalid drop targets.
 */
export function DropZone({
  id,
  children,
  className = '',
  activeClassName = '',
  overClassName = '',
  data = {},
  showIndicators = true,
  placeholder,
  minHeight = '100px',
}: DropZoneProps) {
  const { isOver, active, setNodeRef } = useDroppable({
    id,
    data: {
      ...data,
      type: 'dropzone',
    },
  });

  // Determine if the current drag element is accepted
  const isAccepted = useMemo(() => {
    if (!active) return true;

    const draggedElementType = active.data.current?.elementType;
    return draggedElementType ? true : false;
  }, [active]);

  // Calculate dynamic classes based on state
  const dropZoneClasses = useMemo(() => {
    const baseClasses = [
      'relative',
      'transition-all',
      'duration-200',
      'ease-in-out',
      'flex-1',
      className,
    ];

    // Active state (when any drag is happening)
    if (active) {
      baseClasses.push(
        'border-2',
        'border-dashed',
        isAccepted ? 'border-blue-300 bg-blue-50/50' : 'border-red-300 bg-red-50/50',
        activeClassName,
      );
    }

    // Over state (when dragged item is over this drop zone)
    if (isOver) {
      baseClasses.push(
        isAccepted
          ? 'border-blue-500 bg-blue-100/70 shadow-lg scale-[1.02]'
          : 'border-red-500 bg-red-100/70',
        overClassName,
      );
    }

    // Default state
    if (!active) {
      baseClasses.push('border', 'border-gray-200', 'hover:border-gray-300', 'hover:bg-gray-50/30');
    }

    return cn(baseClasses);
  }, [active, isOver, isAccepted, className, activeClassName, overClassName]);

  // Show placeholder when empty and dragging
  const showPlaceholder = useMemo(() => {
    return !children && active && isAccepted && placeholder;
  }, [children, active, isAccepted, placeholder]);

  return (
    <div
      ref={setNodeRef}
      className={dropZoneClasses}
      style={{ minHeight }}
      data-testid={`drop-zone-${id}`}
      aria-label={`Drop zone for any elements`}
      role="region">
      {/* Visual indicators */}
      {showIndicators && active && <DropZoneIndicators isOver={isOver} isAccepted={isAccepted} />}

      {/* Content */}
      <div className={cn('flex-1 flex', 'gap-2 p-2')}>{children}</div>

      {/* Placeholder */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* Insertion indicator */}
      {isOver && isAccepted && <InsertionIndicator orientation="vertical" />}
    </div>
  );
}

/**
 * Visual indicators for drop zone state
 */
interface DropZoneIndicatorsProps {
  isOver: boolean;
  isAccepted: boolean;
}

function DropZoneIndicators({ isOver, isAccepted }: DropZoneIndicatorsProps) {
  if (!isOver) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        'flex items-center justify-center',
        'rounded-lg',
        isAccepted ? 'bg-blue-500/10' : 'bg-red-500/10',
      )}>
      <div
        className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          'border backdrop-blur-sm',
          isAccepted
            ? 'bg-blue-500/90 border-blue-400 text-white'
            : 'bg-red-500/90 border-red-400 text-white',
        )}>
        {isAccepted ? '✓ Drop here' : '✗ Not allowed'}
      </div>
    </div>
  );
}

/**
 * Insertion indicator showing where the element will be placed
 */
interface InsertionIndicatorProps {
  orientation: 'horizontal' | 'vertical';
}

function InsertionIndicator({ orientation }: InsertionIndicatorProps) {
  return (
    <div
      className={cn(
        'absolute bg-blue-500 opacity-80 rounded-full shadow-lg',
        'animate-pulse',
        orientation === 'horizontal'
          ? 'left-0 top-1/2 -translate-y-1/2 w-1 h-8'
          : 'top-0 left-1/2 -translate-x-1/2 h-1 w-8',
      )}
    />
  );
}

/**
 * Specialized drop zone for form canvas
 */
interface CanvasDropZoneProps extends Omit<DropZoneProps, 'children'> {
  children: React.ReactNode;
  gridSize?: number;
  showGrid?: boolean;
}

export function CanvasDropZone({
  children,
  gridSize = 20,
  showGrid = true,
  className = '',
  ...props
}: CanvasDropZoneProps) {
  const gridClasses = useMemo(() => {
    if (!showGrid) return '';

    return cn(
      'bg-grid-pattern',
      // Add custom CSS variable for grid size
      `[--grid-size:${gridSize}px]`,
    );
  }, [showGrid, gridSize]);

  return (
    <DropZone
      {...props}
      className={cn(
        'min-h-[600px] w-full',
        'bg-white border-2 border-gray-200 rounded-lg',
        gridClasses,
        className,
      )}
      placeholder={
        <div className="text-center text-gray-400 p-8">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-lg font-medium mb-1">Drop elements here</p>
          <p className="text-sm">Drag form elements from the sidebar to start building</p>
        </div>
      }>
      {children}
    </DropZone>
  );
}

/**
 * Specialized drop zone for element containers
 */
interface ElementContainerDropZoneProps extends DropZoneProps {
  elementType: FormElementType;
  isSelected?: boolean;
}

export function ElementContainerDropZone({
  elementType,
  isSelected = false,
  className = '',
  children,
  ...props
}: ElementContainerDropZoneProps) {
  return (
    <DropZone
      {...props}
      className={cn(
        'min-h-[60px] border rounded-md',
        'transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 border-blue-300',
        className,
      )}
      placeholder={
        <div className="text-center text-gray-400 py-4">
          <p className="text-sm">Drop {elementType} elements here</p>
        </div>
      }>
      {children}
    </DropZone>
  );
}

/**
 * Hook for managing drop zone state
 */
export function useDropZone(id: string, accepts: FormElementType[] = []) {
  const { isOver, active, setNodeRef } = useDroppable({
    id,
    data: {
      accepts,
      type: 'custom-dropzone',
    },
  });

  const isAccepted = useMemo(() => {
    if (!active || accepts.length === 0) return true;

    const draggedElementType = active.data.current?.elementType;
    return draggedElementType ? accepts.includes(draggedElementType) : false;
  }, [active, accepts]);

  return {
    isOver,
    active,
    isAccepted,
    setNodeRef,
    isDragging: !!active,
  };
}
