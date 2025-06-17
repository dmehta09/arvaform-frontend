'use client';

import {
  DragData,
  DropResult,
  FormBuilderEvent,
  FormBuilderEventPayload,
  FormElement,
} from '@/types/form-builder.types';
import {
  closestCenter,
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React, { useCallback } from 'react';

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
  // Use default sensors temporarily for testing
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

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
        const accepts = dropData.accepts;
        const isAccepted =
          accepts === 'all' || (Array.isArray(accepts) && accepts.includes(dragData.elementType));

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
      console.log('🟢 DRAG START DETECTED!', event.active.id);
      const dragData = extractDragData(event);
      console.log('🟢 Drag data:', dragData);

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
      console.log('🔵 DnD Context handleDragEnd:', {
        activeId: active.id,
        overId: over?.id,
        overData: over?.data?.current,
      });

      const result = createDropResult(event);
      console.log('🔵 Drop result:', result);

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
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      {children}
    </DndContext>
  );
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
