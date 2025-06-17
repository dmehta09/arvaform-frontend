'use client';

import { useFormBuilder } from '@/hooks/use-form-builder';
import {
  DragData,
  DropResult,
  FormBuilderEventPayload,
  FormElement,
  FormElementType,
} from '@/types/form-builder.types';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useCallback } from 'react';
import { FormBuilderDndContext } from './dnd-context';
import { FormBuilderDragOverlay, useDragOverlay } from './dnd-overlay';
import { CanvasDropZone } from './drop-zone';
import { ElementLibrary } from './element-library';

/**
 * Props for the FormBuilder component
 */
interface FormBuilderProps {
  formId: string;
  className?: string;
  onFormChange?: (elements: FormElement[]) => void;
  onElementSelected?: (elementId: string) => void;
}

/**
 * Main FormBuilder component that provides the complete drag-and-drop
 * form building experience. Integrates DnD context, canvas, and state management.
 */
export function FormBuilder({
  formId,
  className = '',
  onFormChange,
  onElementSelected,
}: FormBuilderProps) {
  // Initialize form builder state
  const { elements, selectedElementId, addElement, selectElement, deselectElement } =
    useFormBuilder({ formId });

  // Initialize drag overlay state
  const {
    activeElement,
    activeElementType,
    activeSource,
    setDraggedElement,
    setDraggedElementType,
    clearDraggedElement,
  } = useDragOverlay();

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent, dragData: DragData) => {
      console.log('Drag started:', dragData);

      // Set drag overlay state
      if (dragData.element) {
        setDraggedElement(dragData.element, dragData.source);
      } else if (dragData.elementType) {
        setDraggedElementType(dragData.elementType, dragData.source);
      }
    },
    [setDraggedElement, setDraggedElementType],
  );

  /**
   * Handle drag end event - core drop logic
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent, result: DropResult) => {
      // Clear drag overlay
      clearDraggedElement();

      if (!result.success || !result.position) {
        console.log('Drop failed:', result.error);
        return;
      }

      const dragData = event.active.data.current;

      if (dragData?.source === 'library' && dragData?.elementType) {
        // Adding new element from library
        const newElement = addElement(dragData.elementType as FormElementType, result.position);
        onElementSelected?.(newElement.id.toString());
        onFormChange?.(elements);
      } else if (dragData?.source === 'canvas') {
        // Moving existing element on canvas
        console.log('Moving element:', event.active.id, 'to:', result.position);
        onFormChange?.(elements);
      }
    },
    [addElement, elements, onElementSelected, onFormChange, clearDraggedElement],
  );

  /**
   * Handle drag cancel event
   */
  const handleDragCancel = useCallback(() => {
    clearDraggedElement();
  }, [clearDraggedElement]);

  /**
   * Handle form builder events
   */
  const handleFormBuilderEvent = useCallback(
    (event: FormBuilderEventPayload) => {
      switch (event.type) {
        case 'element-selected':
          if (event.elementId) {
            selectElement(event.elementId);
            onElementSelected?.(event.elementId.toString());
          }
          break;
        case 'element-deselected':
          deselectElement();
          break;
        default:
          console.log('Form builder event:', event);
      }
    },
    [selectElement, deselectElement, onElementSelected],
  );

  return (
    <div className={`form-builder ${className}`}>
      <FormBuilderDndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        onFormBuilderEvent={handleFormBuilderEvent}>
        <div className="form-builder-layout flex h-full">
          {/* Element Library Sidebar */}
          <div className="form-builder-sidebar w-80 bg-gray-50 border-r">
            <ElementLibrary
              onElementClick={(elementType) => console.log('Element clicked:', elementType)}
              onElementDoubleClick={(elementType) => {
                // Double-click to instantly add element to canvas
                console.log('Element double-clicked, adding to canvas:', elementType);
              }}
            />
          </div>

          {/* Main canvas area */}
          <div className="form-builder-canvas flex-1 p-6">
            <CanvasDropZone id="main-canvas">
              {elements.map((element) => (
                <div
                  key={element.id}
                  className="form-element-container p-2 border border-gray-300 rounded bg-white mb-2"
                  data-element-id={element.id}
                  onClick={() => selectElement(element.id)}
                  style={{
                    outline: selectedElementId === element.id ? '2px solid #3b82f6' : 'none',
                  }}>
                  <div className="text-sm font-medium text-gray-700">{element.label}</div>
                  <div className="text-xs text-gray-500">Type: {element.type}</div>
                </div>
              ))}
            </CanvasDropZone>
          </div>

          {/* Properties panel (placeholder for future tasks) */}
          <div className="form-builder-properties w-80 bg-gray-50 border-l p-4">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <p className="text-sm text-gray-600">Property panel to be implemented in next task</p>
          </div>
        </div>

        {/* Drag Overlay for visual feedback during drag operations */}
        <FormBuilderDragOverlay
          activeElement={activeElement}
          activeElementType={activeElementType}
          activeSource={activeSource}
        />
      </FormBuilderDndContext>
    </div>
  );
}
