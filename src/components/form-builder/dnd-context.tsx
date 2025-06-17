'use client';

import { getAdaptiveCollisionDetection } from '@/lib/dnd/collision-detection';
import { isMobileDevice, useFormBuilderSensors } from '@/lib/dnd/sensors';
import {
  DragData,
  DropResult,
  FormBuilderEvent,
  FormBuilderEventPayload,
  FormElement,
} from '@/types/form-builder.types';
import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import React, { useCallback, useMemo } from 'react';

/**
 * Props for the FormBuilderDndContext component
 */
interface FormBuilderDndContextProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent, dragData: DragData) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent, result: DropResult) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
  onFormBuilderEvent?: (event: FormBuilderEventPayload) => void;
}

/**
 * FormBuilderDndContext provides comprehensive drag-and-drop functionality
 * for the form builder with accessibility support and optimized performance
 */
export function FormBuilderDndContext({
  children,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
  onDragCancel,
  onFormBuilderEvent,
}: FormBuilderDndContextProps) {
  // Auto-detect device type for optimized sensors
  const isMobile = useMemo(() => isMobileDevice(), []);

  // Create adaptive sensors based on device type
  const sensors = useFormBuilderSensors();

  // Create adaptive collision detection
  const collisionDetection = useMemo(() => getAdaptiveCollisionDetection(isMobile), [isMobile]);

  /**
   * Extract drag data from the drag event
   */
  const extractDragData = useCallback((event: DragStartEvent): DragData => {
    const { active } = event;
    const data = active.data.current;

    return {
      elementType: data?.elementType,
      elementId: active.id,
      source: data?.source || 'canvas',
      element: data?.element,
    };
  }, []);

  /**
   * Create drop result from drag end event
   */
  const createDropResult = useCallback(
    (event: DragEndEvent): DropResult => {
      const { active, over } = event;

      if (!over) {
        return {
          success: false,
          error: 'No valid drop target',
        };
      }

      const dropData = over.data.current;
      const dragData = extractDragData(event as DragStartEvent);

      // Validate drop operation
      if (dropData?.accepts && dragData.elementType) {
        const isAccepted = dropData.accepts.includes(dragData.elementType);
        if (!isAccepted) {
          return {
            success: false,
            error: `Element type '${dragData.elementType}' not accepted by drop target`,
          };
        }
      }

      return {
        success: true,
        elementId: active.id,
        position: dropData?.position || {
          x: event.delta.x,
          y: event.delta.y,
          order: dropData?.order || 0,
        },
      };
    },
    [extractDragData],
  );

  /**
   * Emit form builder events
   */
  const emitEvent = useCallback(
    (type: FormBuilderEvent, elementId?: UniqueIdentifier, element?: FormElement) => {
      if (!onFormBuilderEvent) return;

      const payload: FormBuilderEventPayload = {
        type,
        elementId,
        element,
        timestamp: Date.now(),
      };

      onFormBuilderEvent(payload);
    },
    [onFormBuilderEvent],
  );

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const dragData = extractDragData(event);

      // Emit event
      emitEvent('element-selected', event.active.id, dragData.element);

      // Call external handler
      onDragStart?.(event, dragData);

      // Add visual feedback
      document.body.classList.add('dragging');
    },
    [extractDragData, emitEvent, onDragStart],
  );

  /**
   * Handle drag move event
   */
  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      onDragMove?.(event);
    },
    [onDragMove],
  );

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      onDragOver?.(event);
    },
    [onDragOver],
  );

  /**
   * Handle drag end event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const result = createDropResult(event);

      // Remove visual feedback
      document.body.classList.remove('dragging');

      if (result.success && over) {
        // Emit appropriate event based on source
        const dragData = extractDragData(event as DragStartEvent);
        const eventType = dragData.source === 'library' ? 'element-added' : 'element-moved';
        emitEvent(eventType, active.id, dragData.element);
      }

      // Call external handler
      onDragEnd?.(event, result);
    },
    [createDropResult, extractDragData, emitEvent, onDragEnd],
  );

  /**
   * Handle drag cancel event
   */
  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      // Remove visual feedback
      document.body.classList.remove('dragging');

      // Emit event
      emitEvent('element-deselected', event.active.id);

      // Call external handler
      onDragCancel?.(event);
    },
    [emitEvent, onDragCancel],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[snapCenterToCursor]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            const dragData = extractDragData({ active } as DragStartEvent);
            return `Started dragging ${dragData.elementType || 'element'} ${active.id}.`;
          },
          onDragOver({ active, over }) {
            if (over) {
              return `Dragging ${active.id} over droppable area ${over.id}.`;
            }
            return `Dragging ${active.id}.`;
          },
          onDragEnd({ active, over }) {
            if (over) {
              return `Dropped ${active.id} on droppable area ${over.id}.`;
            }
            return `Dragging ${active.id} was cancelled.`;
          },
          onDragCancel({ active }) {
            return `Dragging ${active.id} was cancelled.`;
          },
        },
      }}>
      {children}
    </DndContext>
  );
}

/**
 * Hook to use the form builder DnD context
 * Provides access to drag and drop state and utilities
 */
export function useFormBuilderDnd() {
  // This can be extended with additional utilities
  // For now, we'll just provide the context functions
  return {
    isMobile: isMobileDevice(),
  };
}

/**
 * Error boundary for drag and drop operations
 */
interface DndErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface DndErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for handling DnD errors gracefully
 */
export class DndErrorBoundary extends React.Component<
  DndErrorBoundaryProps,
  DndErrorBoundaryState
> {
  constructor(props: DndErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): DndErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Drag and drop error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Drag & Drop Error</h3>
            <p className="text-red-700 mb-4">
              An error occurred while handling drag and drop operations.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
