'use client';

import { useAutoSave } from '@/hooks/use-auto-save';
import { useFormBuilder } from '@/hooks/use-form-builder';
import { useUndoRedo } from '@/hooks/use-undo-redo';
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
import type { Theme } from '@/types/theme.types';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Palette } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DndDebugPanel } from './debug-dnd';
import { FormBuilderDndContext } from './dnd-context';
import { FormBuilderDragOverlay, useDragOverlay } from './dnd-overlay';
import { ElementLibrary } from './element-library';
import { ElementProperties as ElementPropertiesComponent } from './element-properties';
import { FormCanvas } from './form-canvas';
import { FormPreview } from './form-preview';
import { ThemePanel } from './theme-panel';

/**
 * Props for the FormBuilder component
 */
interface FormBuilderProps {
  formId: string;
  className?: string;
  isPreviewMode?: boolean;
  onFormChange?: (elements: FormElement[]) => void;
  onElementSelected?: (elementId: string) => void;
}

/**
 * Main FormBuilder component that provides the complete drag-and-drop
 * form building experience. Integrates DnD context, canvas, and state management.
 * Now supports preview mode for testing forms.
 */
export function FormBuilder({
  formId,
  className = '',
  isPreviewMode = false,
  onFormChange,
  onElementSelected,
}: FormBuilderProps) {
  // Preview state management
  const [previewDevice, setPreviewDevice] = useState('desktop1080');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [previewMode, setPreviewMode] = useState<'static' | 'interactive'>('interactive');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Theme panel state
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);

  // Initialize form builder state
  const formBuilderState = useFormBuilder({ formId });
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
  } = formBuilderState;

  // Initialize auto-save functionality
  const autoSave = useAutoSave(formBuilderState.state, {
    formId,
    interval: 30000, // 30 seconds
    debounceMs: 1000, // 1 second
    enabled: !isPreviewMode, // Disable auto-save in preview mode
  });

  // Initialize undo/redo functionality
  const undoRedo = useUndoRedo(formBuilderState.state, {
    maxHistorySize: 100,
    enableKeyboardShortcuts: !isPreviewMode, // Disable shortcuts in preview mode
  });

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

  // Log initialization for development
  useEffect(() => {
    console.log('Form builder initialized with auto-save and undo/redo:', {
      autoSaveEnabled: autoSave.isEnabled,
      undoRedoAvailable: { canUndo: undoRedo.canUndo, canRedo: undoRedo.canRedo },
    });
  }, [autoSave.isEnabled, undoRedo.canUndo, undoRedo.canRedo]);

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

  /**
   * Handle theme panel toggle
   */
  const handleThemeToggle = useCallback(() => {
    setIsThemePanelOpen(!isThemePanelOpen);
  }, [isThemePanelOpen]);

  /**
   * Handle theme changes
   */
  const handleThemeChange = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
  }, []);

  // Effect to inject theme variables into the document head
  useEffect(() => {
    if (!currentTheme) return;

    const themeStyleId = 'arva-form-theme-styles';
    let styleTag = document.getElementById(themeStyleId) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = themeStyleId;
      document.head.appendChild(styleTag);
    }

    const generateCssVariables = (theme: Theme): string => {
      const lines: string[] = [];
      const tokens = theme.tokens;

      const traverse = (obj: object, path: string[]) => {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = path.concat(key);
          if (typeof value === 'string' || typeof value === 'number') {
            lines.push(`--${newPath.join('-')}: ${value};`);
          } else if (typeof value === 'object' && value !== null) {
            traverse(value, newPath);
          }
        });
      };

      traverse(tokens, ['arva']); // Using a prefix 'arva' to avoid conflicts
      return `:root {\n  ${lines.join('\n  ')}\n}`;
    };

    styleTag.innerHTML = generateCssVariables(currentTheme);
  }, [currentTheme]);

  // Render preview mode
  if (isPreviewMode) {
    return (
      <div className={`form-builder-preview h-full ${className}`}>
        <FormPreview
          elements={elements}
          selectedDevice={previewDevice}
          theme={previewTheme}
          mode={previewMode}
          isFullscreen={isFullscreen}
          onDeviceChange={setPreviewDevice}
          onThemeChange={setPreviewTheme}
          onModeChange={setPreviewMode}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          className="h-full"
        />
      </div>
    );
  }

  // Render builder mode
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
            {/* Canvas toolbar */}
            <div className="canvas-toolbar bg-white border-b px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Canvas Tools:</span>
                <button
                  onClick={toggleGrid}
                  className={`px-3 py-1 text-xs rounded ${
                    showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  Grid
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleThemeToggle}
                  className={`flex items-center gap-2 px-3 py-1 text-xs rounded transition-colors ${
                    isThemePanelOpen
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  <Palette className="w-4 h-4" />
                  Theme
                </button>
              </div>
            </div>

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
            {!isThemePanelOpen ? (
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
            ) : (
              <ThemePanel
                isOpen={isThemePanelOpen}
                onClose={() => setIsThemePanelOpen(false)}
                onThemeChange={handleThemeChange}
                className="h-full"
              />
            )}
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
