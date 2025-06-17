'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Props for the InsertionIndicator component
 */
interface InsertionIndicatorProps {
  orientation: 'horizontal' | 'vertical';
  position?: 'before' | 'after';
  className?: string;
  animated?: boolean;
  thickness?: number;
  color?: 'blue' | 'green' | 'purple';
}

/**
 * InsertionIndicator provides visual feedback showing where
 * elements will be placed during drag operations
 */
export function InsertionIndicator({
  orientation,
  position = 'before',
  className = '',
  animated = true,
  thickness = 2,
  color = 'blue',
}: InsertionIndicatorProps) {
  // Calculate indicator styles based on orientation and position
  const indicatorClasses = useMemo(() => {
    const baseClasses = [
      'absolute pointer-events-none',
      'transition-all duration-200 ease-in-out',
      animated && 'animate-pulse',
    ];

    // Color classes
    const colorClasses = {
      blue: 'bg-blue-500 shadow-blue-500/50',
      green: 'bg-green-500 shadow-green-500/50',
      purple: 'bg-purple-500 shadow-purple-500/50',
    };

    baseClasses.push(colorClasses[color]);

    // Orientation and position specific classes
    if (orientation === 'horizontal') {
      baseClasses.push(
        'left-0 right-0 rounded-full shadow-lg',
        position === 'before' ? '-top-1' : '-bottom-1',
      );
    } else {
      baseClasses.push(
        'top-0 bottom-0 rounded-full shadow-lg',
        position === 'before' ? '-left-1' : '-right-1',
      );
    }

    return cn(baseClasses, className);
  }, [orientation, position, animated, color, className]);

  // Calculate indicator styles
  const indicatorStyles = useMemo(() => {
    if (orientation === 'horizontal') {
      return {
        height: `${thickness}px`,
        zIndex: 50,
      };
    } else {
      return {
        width: `${thickness}px`,
        zIndex: 50,
      };
    }
  }, [orientation, thickness]);

  return (
    <div
      className={indicatorClasses}
      style={indicatorStyles}
      data-testid={`insertion-indicator-${orientation}-${position}`}
      role="presentation"
      aria-hidden="true">
      {/* Indicator dots for enhanced visibility */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex space-x-1">
          <div
            className={cn(
              'w-1 h-1 rounded-full',
              color === 'blue' && 'bg-blue-600',
              color === 'green' && 'bg-green-600',
              color === 'purple' && 'bg-purple-600',
              animated && 'animate-bounce',
            )}
          />
          <div
            className={cn(
              'w-1 h-1 rounded-full',
              color === 'blue' && 'bg-blue-600',
              color === 'green' && 'bg-green-600',
              color === 'purple' && 'bg-purple-600',
              animated && 'animate-bounce [animation-delay:0.1s]',
            )}
          />
          <div
            className={cn(
              'w-1 h-1 rounded-full',
              color === 'blue' && 'bg-blue-600',
              color === 'green' && 'bg-green-600',
              color === 'purple' && 'bg-purple-600',
              animated && 'animate-bounce [animation-delay:0.2s]',
            )}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * DropTargetIndicator shows where elements can be dropped
 */
interface DropTargetIndicatorProps {
  isActive: boolean;
  isAccepted: boolean;
  className?: string;
}

export function DropTargetIndicator({
  isActive,
  isAccepted,
  className = '',
}: DropTargetIndicatorProps) {
  const indicatorClasses = useMemo(
    () =>
      cn(
        'absolute inset-0 pointer-events-none',
        'border-2 border-dashed rounded-lg',
        'transition-all duration-200',
        isAccepted ? 'border-blue-500 bg-blue-50/30' : 'border-red-500 bg-red-50/30',
        className,
      ),
    [isAccepted, className],
  );

  if (!isActive) return null;

  return (
    <div className={indicatorClasses}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            'backdrop-blur-sm border',
            isAccepted
              ? 'bg-blue-500/90 border-blue-400 text-white'
              : 'bg-red-500/90 border-red-400 text-white',
          )}>
          {isAccepted ? '✓ Drop here' : '✗ Invalid drop'}
        </div>
      </div>
    </div>
  );
}

/**
 * ElementBoundaryIndicator shows the boundaries of draggable elements
 */
interface ElementBoundaryIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export function ElementBoundaryIndicator({
  isVisible,
  className = '',
}: ElementBoundaryIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none',
        'border border-blue-300 rounded',
        'bg-blue-50/20',
        'transition-opacity duration-200',
        className,
      )}>
      {/* Corner handles */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
    </div>
  );
}
