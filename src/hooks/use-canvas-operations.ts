'use client';

import { CanvasSize, ElementPosition, FormElement } from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useCallback, useMemo, useState } from 'react';

/**
 * Configuration for canvas operations
 */
interface CanvasOperationsConfig {
  canvasSize: CanvasSize;
  gridSize?: number;
  snapToGrid?: boolean;
  multiSelectEnabled?: boolean;
}

/**
 * Canvas operations return type
 */
interface CanvasOperationsReturn {
  // Selection state
  selectedElementIds: Set<UniqueIdentifier>;
  lastSelectedId: UniqueIdentifier | null;
  selectionBounds: DOMRect | null;

  // Selection operations
  selectElement: (elementId: UniqueIdentifier, addToSelection?: boolean) => void;
  selectMultiple: (elementIds: UniqueIdentifier[]) => void;
  deselectElement: (elementId: UniqueIdentifier) => void;
  clearSelection: () => void;
  isSelected: (elementId: UniqueIdentifier) => boolean;

  // Position operations
  moveElement: (elementId: UniqueIdentifier, delta: { x: number; y: number }) => ElementPosition;
  moveSelectedElements: (delta: { x: number; y: number }) => Map<UniqueIdentifier, ElementPosition>;
  snapToGrid: (position: ElementPosition) => ElementPosition;
  getElementPosition: (elementId: UniqueIdentifier) => ElementPosition | null;

  // Canvas operations
  centerElement: (elementId: UniqueIdentifier) => void;
  centerSelection: () => void;
  alignElements: (alignment: AlignmentType) => void;
  distributeElements: (distribution: DistributionType) => void;

  // Utility functions
  isElementVisible: (elementId: UniqueIdentifier) => boolean;
  getElementsInRegion: (region: DOMRect) => UniqueIdentifier[];
  calculateInsertionPoint: (clientY: number, elements: FormElement[]) => InsertionPoint;
}

/**
 * Alignment types for element alignment operations
 */
type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

/**
 * Distribution types for element distribution operations
 */
type DistributionType = 'horizontal' | 'vertical';

/**
 * Insertion point for drag and drop operations
 */
interface InsertionPoint {
  index: number;
  position: 'before' | 'after';
  y: number;
}

/**
 * Custom hook for comprehensive canvas operations
 * Provides element selection, positioning, and manipulation functionality
 */
export function useCanvasOperations(
  elements: FormElement[],
  config: CanvasOperationsConfig,
): CanvasOperationsReturn {
  const [selectedElementIds, setSelectedElementIds] = useState<Set<UniqueIdentifier>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<UniqueIdentifier | null>(null);

  /**
   * Calculate selection bounds
   */
  const selectionBounds = useMemo(() => {
    if (selectedElementIds.size === 0) return null;

    const selectedElements = elements.filter((el) => selectedElementIds.has(el.id));
    if (selectedElements.length === 0) return null;

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    selectedElements.forEach((element) => {
      const pos = element.position;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    return new DOMRect(minX, minY, maxX - minX, maxY - minY);
  }, [selectedElementIds, elements]);

  /**
   * Select an element
   */
  const selectElement = useCallback(
    (elementId: UniqueIdentifier, addToSelection = false) => {
      setSelectedElementIds((prev) => {
        const newSelection = new Set(addToSelection && config.multiSelectEnabled ? prev : []);
        newSelection.add(elementId);
        return newSelection;
      });
      setLastSelectedId(elementId);
    },
    [config.multiSelectEnabled],
  );

  /**
   * Select multiple elements
   */
  const selectMultiple = useCallback(
    (elementIds: UniqueIdentifier[]) => {
      if (!config.multiSelectEnabled) {
        if (elementIds.length > 0) {
          const lastElement = elementIds[elementIds.length - 1];
          if (lastElement) {
            selectElement(lastElement);
          }
        }
        return;
      }

      setSelectedElementIds(new Set(elementIds));
      const lastElementId = elementIds.length > 0 ? elementIds[elementIds.length - 1] : null;
      setLastSelectedId(lastElementId || null);
    },
    [config.multiSelectEnabled, selectElement],
  );

  /**
   * Deselect a specific element
   */
  const deselectElement = useCallback(
    (elementId: UniqueIdentifier) => {
      setSelectedElementIds((prev) => {
        const newSelection = new Set(prev);
        newSelection.delete(elementId);
        return newSelection;
      });

      if (lastSelectedId === elementId) {
        setLastSelectedId(null);
      }
    },
    [lastSelectedId],
  );

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedElementIds(new Set());
    setLastSelectedId(null);
  }, []);

  /**
   * Check if an element is selected
   */
  const isSelected = useCallback(
    (elementId: UniqueIdentifier) => {
      return selectedElementIds.has(elementId);
    },
    [selectedElementIds],
  );

  /**
   * Snap position to grid
   */
  const snapToGrid = useCallback(
    (position: ElementPosition): ElementPosition => {
      if (!config.snapToGrid || !config.gridSize) return position;

      const gridSize = config.gridSize;
      return {
        ...position,
        x: Math.round(position.x / gridSize) * gridSize,
        y: Math.round(position.y / gridSize) * gridSize,
      };
    },
    [config.snapToGrid, config.gridSize],
  );

  /**
   * Move a single element
   */
  const moveElement = useCallback(
    (elementId: UniqueIdentifier, delta: { x: number; y: number }): ElementPosition => {
      const element = elements.find((el) => el.id === elementId);
      if (!element) throw new Error(`Element ${elementId} not found`);

      const newPosition = {
        ...element.position,
        x: element.position.x + delta.x,
        y: element.position.y + delta.y,
      };

      return config.snapToGrid ? snapToGrid(newPosition) : newPosition;
    },
    [elements, snapToGrid, config.snapToGrid],
  );

  /**
   * Move all selected elements
   */
  const moveSelectedElements = useCallback(
    (delta: { x: number; y: number }): Map<UniqueIdentifier, ElementPosition> => {
      const results = new Map<UniqueIdentifier, ElementPosition>();

      selectedElementIds.forEach((elementId) => {
        try {
          const newPosition = moveElement(elementId, delta);
          results.set(elementId, newPosition);
        } catch (error) {
          console.warn(`Failed to move element ${elementId}:`, error);
        }
      });

      return results;
    },
    [selectedElementIds, moveElement],
  );

  /**
   * Get element position
   */
  const getElementPosition = useCallback(
    (elementId: UniqueIdentifier): ElementPosition | null => {
      const element = elements.find((el) => el.id === elementId);
      return element ? element.position : null;
    },
    [elements],
  );

  /**
   * Center element in viewport
   */
  const centerElement = useCallback((elementId: UniqueIdentifier) => {
    const element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, []);

  /**
   * Center selection in viewport
   */
  const centerSelection = useCallback(() => {
    if (selectedElementIds.size === 0) return;

    const firstSelectedId = Array.from(selectedElementIds)[0];
    if (firstSelectedId) {
      centerElement(firstSelectedId);
    }
  }, [selectedElementIds, centerElement]);

  /**
   * Align selected elements
   */
  const alignElements = useCallback(
    (alignment: AlignmentType) => {
      if (selectedElementIds.size < 2) return;

      const selectedElements = elements.filter((el) => selectedElementIds.has(el.id));
      if (selectedElements.length < 2) return;

      let referenceValue: number;

      switch (alignment) {
        case 'left':
          referenceValue = Math.min(...selectedElements.map((el) => el.position.x));
          break;
        case 'right':
          referenceValue = Math.max(...selectedElements.map((el) => el.position.x));
          break;
        case 'center':
          referenceValue =
            selectedElements.reduce((sum, el) => sum + el.position.x, 0) / selectedElements.length;
          break;
        case 'top':
          referenceValue = Math.min(...selectedElements.map((el) => el.position.y));
          break;
        case 'bottom':
          referenceValue = Math.max(...selectedElements.map((el) => el.position.y));
          break;
        case 'middle':
          referenceValue =
            selectedElements.reduce((sum, el) => sum + el.position.y, 0) / selectedElements.length;
          break;
      }

      // This would trigger updates in the parent component
      console.log('Align elements to', alignment, 'at', referenceValue);
    },
    [selectedElementIds, elements],
  );

  /**
   * Distribute selected elements
   */
  const distributeElements = useCallback(
    (distribution: DistributionType) => {
      if (selectedElementIds.size < 3) return;

      const selectedElements = elements.filter((el) => selectedElementIds.has(el.id));
      if (selectedElements.length < 3) return;

      // Sort elements by position
      const sortedElements = selectedElements.sort((a, b) => {
        return distribution === 'horizontal'
          ? a.position.x - b.position.x
          : a.position.y - b.position.y;
      });

      // Calculate distribution
      const firstElement = sortedElements[0];
      const lastElement = sortedElements[sortedElements.length - 1];

      if (!firstElement || !lastElement) return;

      const totalDistance =
        distribution === 'horizontal'
          ? lastElement.position.x - firstElement.position.x
          : lastElement.position.y - firstElement.position.y;

      const spacing = totalDistance / (sortedElements.length - 1);

      // This would trigger updates in the parent component
      console.log('Distribute elements', distribution, 'with spacing', spacing);
    },
    [selectedElementIds, elements],
  );

  /**
   * Check if element is visible in current viewport
   */
  const isElementVisible = useCallback((elementId: UniqueIdentifier): boolean => {
    const element = document.querySelector(`[data-element-id="${elementId}"]`);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.left >= 0 &&
      rect.right <= window.innerWidth
    );
  }, []);

  /**
   * Get elements within a specific region
   */
  const getElementsInRegion = useCallback(
    (region: DOMRect): UniqueIdentifier[] => {
      return elements
        .filter((element) => {
          const pos = element.position;
          return (
            pos.x >= region.left &&
            pos.x <= region.right &&
            pos.y >= region.top &&
            pos.y <= region.bottom
          );
        })
        .map((element) => element.id);
    },
    [elements],
  );

  /**
   * Calculate insertion point for drag and drop
   */
  const calculateInsertionPoint = useCallback(
    (clientY: number, elementsToCheck: FormElement[]): InsertionPoint => {
      const sortedElements = elementsToCheck.sort((a, b) => a.position.y - b.position.y);

      for (let i = 0; i < sortedElements.length; i++) {
        const element = sortedElements[i];
        if (!element) continue;

        const elementRect = document
          .querySelector(`[data-element-id="${element.id}"]`)
          ?.getBoundingClientRect();

        if (elementRect) {
          const midPoint = elementRect.top + elementRect.height / 2;

          if (clientY < midPoint) {
            return {
              index: i,
              position: 'before',
              y: elementRect.top,
            };
          }
        }
      }

      // Insert at the end
      if (sortedElements.length === 0) {
        return {
          index: 0,
          position: 'after',
          y: clientY,
        };
      }

      const lastElement = sortedElements[sortedElements.length - 1];
      if (!lastElement) {
        return {
          index: sortedElements.length,
          position: 'after',
          y: clientY,
        };
      }
      const lastElementRect = document
        .querySelector(`[data-element-id="${lastElement.id}"]`)
        ?.getBoundingClientRect();

      return {
        index: sortedElements.length,
        position: 'after',
        y: lastElementRect?.bottom || clientY,
      };
    },
    [],
  );

  return {
    // Selection state
    selectedElementIds,
    lastSelectedId,
    selectionBounds,

    // Selection operations
    selectElement,
    selectMultiple,
    deselectElement,
    clearSelection,
    isSelected,

    // Position operations
    moveElement,
    moveSelectedElements,
    snapToGrid,
    getElementPosition,

    // Canvas operations
    centerElement,
    centerSelection,
    alignElements,
    distributeElements,

    // Utility functions
    isElementVisible,
    getElementsInRegion,
    calculateInsertionPoint,
  };
}
