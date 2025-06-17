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
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback } from 'react';
import { DndDebugPanel } from './debug-dnd';
import { FormBuilderDndContext } from './dnd-context';
import { FormBuilderDragOverlay, useDragOverlay } from './dnd-overlay';
import { ElementLibrary } from './element-library';
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
      console.log('🟡 FormBuilder handleDragEnd:', { event, result });

      // Clear drag overlay
      clearDraggedElement();

      if (!result.success || !result.position) {
        console.log('❌ Drop failed:', result.error);
        return;
      }

      const dragData = event.active.data.current;
      console.log('🟢 Drop successful, dragData:', dragData);

      if (dragData?.source === 'library' && dragData?.elementType) {
        console.log('✨ Adding new element from library:', dragData.elementType);
        // Adding new element from library
        const newElement = addElement(dragData.elementType as FormElementType, result.position);
        console.log('🎉 New element added:', newElement);
        onElementSelected?.(newElement.id.toString());
        onFormChange?.(elements);
      } else if (dragData?.source === 'canvas') {
        // Moving existing element on canvas
        console.log('🔄 Moving element:', event.active.id, 'to:', result.position);
        onFormChange?.(elements);
      } else if (event.over && event.active.id !== event.over.id) {
        // Reordering elements
        const oldIndex = elements.findIndex((el) => el.id === event.active.id);
        const newIndex = elements.findIndex((el) => el.id === event.over!.id);
        const newOrder = arrayMove(elements, oldIndex, newIndex);
        reorderElements(newOrder.map((el) => el.id));
      }
    },
    [addElement, elements, onElementSelected, onFormChange, clearDraggedElement, reorderElements],
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

      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && <DndDebugPanel />}
    </div>
  );
}
