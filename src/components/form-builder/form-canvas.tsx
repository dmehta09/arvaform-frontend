'use client';

import { cn } from '@/lib/utils';
import { CanvasSize, FormElement } from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CanvasDropZone } from './canvas-drop-zone';
import { CanvasGrid } from './canvas-grid';
import { ElementContainer } from './element-container';

/**
 * Props for the FormCanvas component
 */
interface FormCanvasProps {
  elements: FormElement[];
  selectedElementId?: UniqueIdentifier;
  canvasSize: CanvasSize;
  zoom: number;
  showGrid?: boolean;
  gridSize?: number;
  className?: string;
  onElementSelect?: (elementId: UniqueIdentifier) => void;
  onElementsReorder?: (elementIds: UniqueIdentifier[]) => void;
  onElementDelete?: (elementId: UniqueIdentifier) => void;
  onElementDuplicate?: (elementId: UniqueIdentifier) => void;
  onCanvasClick?: () => void;
  onZoomChange?: (zoom: number) => void;
  onGridToggle?: () => void;
}

/**
 * FormCanvas serves as the primary workspace for form building
 * with precise drop targeting, element positioning, and smooth animations
 */
export function FormCanvas({
  elements,
  selectedElementId,
  canvasSize,
  zoom = 1,
  showGrid = true,
  gridSize = 20,
  className = '',
  onElementSelect,
  onElementsReorder,
  onElementDelete,
  onElementDuplicate,
  onCanvasClick,
  onZoomChange,
  onGridToggle,
}: FormCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Calculate canvas styles with zoom
  const canvasStyles = useMemo(
    () => ({
      width: canvasSize.width,
      height: canvasSize.height,
      transform: `scale(${zoom})`,
      transformOrigin: 'top left',
    }),
    [canvasSize, zoom],
  );

  // Sort elements by their position order
  const sortedElements = useMemo(() => {
    return [...elements].sort((a, b) => (a.position.order ?? 0) - (b.position.order ?? 0));
  }, [elements]);

  /**
   * Handle element selection
   */
  const handleElementSelect = useCallback(
    (elementId: UniqueIdentifier) => {
      onElementSelect?.(elementId);
    },
    [onElementSelect],
  );

  /**
   * Handle element deletion with keyboard shortcuts
   */
  const handleElementDelete = useCallback(
    (elementId: UniqueIdentifier) => {
      onElementDelete?.(elementId);
    },
    [onElementDelete],
  );

  /**
   * Handle element duplication with keyboard shortcuts
   */
  const handleElementDuplicate = useCallback(
    (elementId: UniqueIdentifier) => {
      onElementDuplicate?.(elementId);
    },
    [onElementDuplicate],
  );

  /**
   * Handle canvas click to deselect elements
   */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking on the canvas itself, not on elements
      if (e.target === e.currentTarget) {
        onCanvasClick?.();
      }
    },
    [onCanvasClick],
  );

  /**
   * Handle keyboard navigation and shortcuts
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedElementId) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          handleElementDelete(selectedElementId);
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleElementDuplicate(selectedElementId);
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Move element up in order
            const currentIndex = sortedElements.findIndex((el) => el.id === selectedElementId);
            if (currentIndex > 0) {
              const newIds = [...sortedElements.map((el) => el.id)];
              const temp = newIds[currentIndex]!;
              newIds[currentIndex] = newIds[currentIndex - 1]!;
              newIds[currentIndex - 1] = temp;
              onElementsReorder?.(newIds);
            }
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Move element down in order
            const currentIndex = sortedElements.findIndex((el) => el.id === selectedElementId);
            if (currentIndex < sortedElements.length - 1) {
              const newIds = [...sortedElements.map((el) => el.id)];
              const temp = newIds[currentIndex]!;
              newIds[currentIndex] = newIds[currentIndex + 1]!;
              newIds[currentIndex + 1] = temp;
              onElementsReorder?.(newIds);
            }
          }
          break;
      }
    },
    [
      selectedElementId,
      sortedElements,
      handleElementDelete,
      handleElementDuplicate,
      onElementsReorder,
    ],
  );

  // Canvas container classes
  const canvasClasses = useMemo(
    () =>
      cn(
        'relative overflow-auto bg-white',
        'border border-gray-200 rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'transition-all duration-200',
        className,
      ),
    [className],
  );

  // Canvas content classes
  const canvasContentClasses = useMemo(
    () =>
      cn('relative min-h-full', 'transition-transform duration-200', showGrid && 'bg-grid-pattern'),
    [showGrid],
  );

  return (
    <div
      ref={canvasRef}
      className={canvasClasses}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Form canvas - drag elements here to build your form">
      {/* Canvas content with zoom and grid */}
      <div className={canvasContentClasses} style={canvasStyles}>
        {/* Grid overlay */}
        {showGrid && <CanvasGrid size={gridSize} canvasSize={canvasSize} zoom={zoom} />}

        {/* Main drop zone for the canvas */}
        <CanvasDropZone
          id="main-canvas"
          className="form-builder-canvas w-full min-h-full p-4"
          showGrid={false} // Grid is handled by the canvas itself
          data={{
            accepts: 'all', // Accept all element types
            type: 'canvas',
          }}>
          {/* Element containers */}
          <SortableContext
            items={elements.map((el) => el.id)}
            strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedElements.map((element) => (
                <ElementContainer
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  onSelect={() => handleElementSelect(element.id)}
                  onDelete={() => handleElementDelete(element.id)}
                  onDuplicate={() => handleElementDuplicate(element.id)}
                />
              ))}
            </div>
          </SortableContext>

          {/* Empty state when no elements */}
          {sortedElements.length === 0 && (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">Start building your form</h3>
                <p className="text-sm">Drag elements from the sidebar to create your form</p>
              </div>
            </div>
          )}
        </CanvasDropZone>
      </div>

      {/* Canvas controls overlay */}
      <div className="absolute top-2 right-2 flex gap-2">
        {/* Zoom controls */}
        <div className="flex items-center bg-white/90 backdrop-blur-sm rounded">
          <button
            onClick={() => onZoomChange?.(zoom - 0.1)}
            className="p-1 hover:bg-gray-200 rounded-l"
            title="Zoom out">
            -
          </button>
          <div className="px-2 py-1 text-xs font-mono border-l border-r">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => onZoomChange?.(zoom + 0.1)}
            className="p-1 hover:bg-gray-200 rounded-r"
            title="Zoom in">
            +
          </button>
        </div>

        {/* Grid toggle */}
        <button
          onClick={() => {
            onGridToggle?.();
          }}
          className="p-1 bg-white/90 backdrop-blur-sm rounded hover:bg-gray-200"
          title="Toggle grid">
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      {/* Canvas info overlay */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
        {sortedElements.length} element{sortedElements.length !== 1 ? 's' : ''}
        {selectedElementId && ' • 1 selected'}
      </div>
    </div>
  );
}

/**
 * Hook for canvas operations
 */
export function useFormCanvas() {
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const scrollToElement = useCallback((elementId: UniqueIdentifier) => {
    const element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const centerCanvas = useCallback(() => {
    setViewport({ x: 0, y: 0 });
  }, []);

  return {
    viewport,
    setViewport,
    isDragging,
    setIsDragging,
    scrollToElement,
    centerCanvas,
  };
}
