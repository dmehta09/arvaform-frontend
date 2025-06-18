'use client';

import { useFormBuilder } from '@/hooks/use-form-builder';
import { ElementProperties } from '@/types/element-properties.types';
import {
  DragData,
  DropResult,
  ElementStyling,
  FormBuilderEventPayload,
  FormElement,
  FormElementType,
  ValidationRule,
} from '@/types/form-builder.types';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback } from 'react';
import { DndDebugPanel } from './debug-dnd';
import { FormBuilderDndContext } from './dnd-context';
import { FormBuilderDragOverlay, useDragOverlay } from './dnd-overlay';
import { ElementLibrary } from './element-library';
import { ElementProperties as ElementPropertiesComponent } from './element-properties';
import { FormCanvas } from './form-canvas';

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
  const {
    elements,
    selectedElementId,
    addElement,
    selectElement,
    deselectElement,
    deleteElement,
    duplicateElement,
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    reorderElements,
    updateElementProperty,
    moveElement,
    updateElement,
  } = useFormBuilder({ formId });

  // Initialize drag overlay state
  const {
    activeElement,
    activeElementType,
    activeSource,
    setDraggedElement,
    setDraggedElementType,
    clearDraggedElement,
  } = useDragOverlay();

  const selectedElement = selectedElementId
    ? elements.find((el) => el.id === selectedElementId) || null
    : null;

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
   * Handle drag end event
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent, result: DropResult) => {
      console.log('Drag ended:', { event, result });

      // Clear drag overlay
      clearDraggedElement();

      // Handle successful drops
      if (result.success) {
        const dragData = event.active.data.current;

        if (dragData?.source === 'library' && dragData?.elementType && result.position) {
          // Adding new element from library
          addElement(dragData.elementType as FormElementType, result.position);
        } else if (dragData?.source === 'canvas' && result.position) {
          // Moving existing element on canvas
          const elementId = event.active.id;
          moveElement(elementId, result.position);
        } else if (event.over && event.active.id !== event.over.id) {
          // Reordering elements
          const oldIndex = elements.findIndex((el) => el.id === event.active.id);
          const newIndex = elements.findIndex((el) => el.id === event.over!.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            const newElements = arrayMove(elements, oldIndex, newIndex);
            reorderElements(newElements.map((el) => el.id));
          }
        }
      }

      // Notify parent component
      onFormChange?.(elements);
    },
    [clearDraggedElement, addElement, moveElement, elements, reorderElements, onFormChange],
  );

  /**
   * Handle drag cancel event
   */
  const handleDragCancel = useCallback(() => {
    console.log('Drag cancelled');
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
            // onElementClick={(elementType) => console.log('Element clicked:', elementType)}
            // onElementDoubleClick={(elementType) => {
            //   // Double-click to instantly add element to canvas
            //   console.log('Element double-clicked, adding to canvas:', elementType);
            // }}
            />
          </div>

          {/* Main canvas area */}
          <div className="form-builder-canvas flex-1">
            <FormCanvas
              elements={elements}
              selectedElementId={selectedElementId}
              canvasSize={{
                width: 800,
                height: 1200,
                minWidth: 400,
                minHeight: 600,
                maxWidth: 1200,
                maxHeight: 2400,
              }}
              zoom={zoom}
              showGrid={showGrid}
              gridSize={20}
              className="h-full"
              onElementSelect={selectElement}
              onElementDelete={deleteElement}
              onElementDuplicate={duplicateElement}
              onCanvasClick={deselectElement}
              onZoomChange={setZoom}
              onGridToggle={toggleGrid}
            />
          </div>

          {/* Properties panel */}
          <div className="form-builder-properties w-80 bg-white border-l">
            <ElementPropertiesComponent
              selectedElement={selectedElement}
              onPropertyChange={(
                elementId: string,
                property: keyof ElementProperties,
                value: unknown,
              ) => {
                const element = elements.find((el) => el.id.toString() === elementId);
                if (element) {
                  // Map property panel properties to FormElement structure
                  switch (property) {
                    case 'label':
                    case 'placeholder':
                    case 'required':
                      // These are direct properties on FormElement
                      updateElement(element.id, { [property]: value });
                      break;
                    case 'validation':
                      // Validation is a direct property on FormElement
                      updateElement(element.id, { validation: value as ValidationRule[] });
                      break;
                    case 'styling':
                      // Styling is a direct property on FormElement
                      updateElement(element.id, { styling: value as ElementStyling });
                      break;
                    case 'disabled':
                    case 'description':
                      // These go into the properties object
                      updateElementProperty(element.id, property, value);
                      break;
                    default:
                      // Fallback to properties object for other properties
                      updateElementProperty(element.id, property, value);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Drag Overlay for visual feedback during drag operations */}
        <FormBuilderDragOverlay
          activeElement={activeElement}
          activeElementType={activeElementType}
          activeSource={activeSource}
        />
      </FormBuilderDndContext>

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && <DndDebugPanel />}
    </div>
  );
}
