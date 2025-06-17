/**
 * Drop calculations for form builder canvas
 * Handles drag and drop calculations, insertion points, and collision detection
 */

import { ElementPosition, FormElement, FormElementType } from '@/types/form-builder.types';
import { DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';

/**
 * Drop zone acceptance type - can accept specific element types or all types
 */
export type DropZoneAccepts = FormElementType[] | 'all';

/**
 * Drop zone information
 */
export interface DropZoneInfo {
  id: UniqueIdentifier;
  type: 'canvas' | 'container' | 'element';
  accepts: DropZoneAccepts;
  rect: DOMRect;
  priority: number; // Higher priority zones take precedence
}

/**
 * Insertion point for element dropping
 */
export interface InsertionPoint {
  containerId: UniqueIdentifier;
  index: number;
  position: ElementPosition;
  isValid: boolean;
  feedback: string;
}

/**
 * Drop feedback information
 */
export interface DropFeedback {
  isValid: boolean;
  message: string;
  insertionPoint?: InsertionPoint;
  visualIndicator?: {
    type: 'line' | 'highlight' | 'box';
    position: { x: number; y: number };
    size?: { width: number; height: number };
  };
}

/**
 * Calculate the best drop zone for a dragged element
 */
export function calculateBestDropZone(
  dragOverEvent: DragOverEvent,
  dropZones: DropZoneInfo[],
  draggedElementType: FormElementType,
): DropZoneInfo | null {
  const { x, y } = dragOverEvent.delta;
  const activeRect = dragOverEvent.active.rect.current.translated;
  if (!activeRect) return null;

  const draggedCenter = {
    x: activeRect.left + activeRect.width / 2 + x,
    y: activeRect.top + activeRect.height / 2 + y,
  };

  // Filter drop zones that accept this element type
  const validDropZones = dropZones.filter((zone) => {
    return (
      zone.accepts === 'all' ||
      (Array.isArray(zone.accepts) && zone.accepts.includes(draggedElementType))
    );
  });

  if (validDropZones.length === 0) return null;

  // Find zones that contain the drag center point
  const containingZones = validDropZones.filter((zone) => {
    return (
      draggedCenter.x >= zone.rect.left &&
      draggedCenter.x <= zone.rect.right &&
      draggedCenter.y >= zone.rect.top &&
      draggedCenter.y <= zone.rect.bottom
    );
  });

  if (containingZones.length === 0) return null;

  // Return the zone with highest priority
  return containingZones.reduce((best, current) => {
    return current.priority > best.priority ? current : best;
  });
}

/**
 * Calculate insertion point within a container
 */
export function calculateInsertionPoint(
  dropPosition: { x: number; y: number },
  containerElements: FormElement[],
  containerRect: DOMRect,
): InsertionPoint {
  const relativeY = dropPosition.y - containerRect.top;

  // Sort elements by their vertical position and order
  const sortedElements = [...containerElements].sort((a, b) => {
    // Primary sort by Y position
    const yDiff = a.position.y - b.position.y;
    if (Math.abs(yDiff) > 5) return yDiff; // 5px tolerance for same row

    // Secondary sort by order for elements in same row
    return (a.position.order ?? 0) - (b.position.order ?? 0);
  });

  // Find insertion point
  for (let i = 0; i < sortedElements.length; i++) {
    const element = sortedElements[i];
    if (!element) continue;

    const elementCenterY = element.position.y + 40; // Assuming ~80px element height

    if (relativeY < elementCenterY) {
      // Insert before this element
      return {
        containerId: 'main-canvas',
        index: i,
        position: {
          x: 20, // Standard left margin
          y: Math.max(20, element.position.y - 10), // 10px gap above
          order: i,
        },
        isValid: true,
        feedback: `Insert before ${element.type} element`,
      };
    }
  }

  // Insert at the end
  const lastElement = sortedElements[sortedElements.length - 1];
  const newY = lastElement ? lastElement.position.y + 90 : 20; // 90px spacing between elements

  return {
    containerId: 'main-canvas',
    index: sortedElements.length,
    position: {
      x: 20,
      y: newY,
      order: sortedElements.length,
    },
    isValid: true,
    feedback: 'Insert at end of form',
  };
}

/**
 * Calculate drop feedback for visual indicators
 */
export function calculateDropFeedback(
  dragOverEvent: DragOverEvent,
  elements: FormElement[],
  draggedElementType: FormElementType,
): DropFeedback {
  const { over, active } = dragOverEvent;

  if (!over || !active) {
    return {
      isValid: false,
      message: 'No valid drop zone',
    };
  }

  const dropZoneData = over.data.current;
  const acceptedTypes = dropZoneData?.accepts as DropZoneAccepts | undefined;

  // Check if element type is accepted
  const isTypeAccepted =
    acceptedTypes === 'all' ||
    (Array.isArray(acceptedTypes) && acceptedTypes.includes(draggedElementType));

  if (!isTypeAccepted) {
    return {
      isValid: false,
      message: `${draggedElementType} elements cannot be dropped here`,
    };
  }

  // Calculate insertion point for valid drops
  const clientY = active.rect.current.translated?.top ?? 0;
  const containerRect = {
    ...over.rect,
    x: over.rect.left,
    y: over.rect.top,
    toJSON: () => over.rect,
  } as DOMRect;

  const insertionPoint = calculateInsertionPoint(
    { x: clientY, y: clientY },
    elements,
    containerRect,
  );

  return {
    isValid: true,
    message: insertionPoint.feedback,
    insertionPoint,
    visualIndicator: {
      type: 'line',
      position: {
        x: insertionPoint.position.x,
        y: insertionPoint.position.y,
      },
      size: {
        width: containerRect.width - 40, // Full width minus margins
        height: 2,
      },
    },
  };
}

/**
 * Check if two elements would collide after positioning
 */
export function checkCollision(
  element1: FormElement,
  element2: FormElement,
  tolerance: number = 10,
): boolean {
  const rect1 = {
    left: element1.position.x,
    right: element1.position.x + 300, // Assumed element width
    top: element1.position.y,
    bottom: element1.position.y + 80, // Assumed element height
  };

  const rect2 = {
    left: element2.position.x,
    right: element2.position.x + 300,
    top: element2.position.y,
    bottom: element2.position.y + 80,
  };

  // Add tolerance to prevent collision
  return !(
    rect1.right + tolerance <= rect2.left ||
    rect2.right + tolerance <= rect1.left ||
    rect1.bottom + tolerance <= rect2.top ||
    rect2.bottom + tolerance <= rect1.top
  );
}

/**
 * Find optimal position for new element to avoid collisions
 */
export function findOptimalPosition(
  newElement: { type: FormElementType },
  existingElements: FormElement[],
): ElementPosition {
  const elementHeight = 80;
  const margin = 20;
  const verticalSpacing = 20;

  // Start at top-left with margin
  const bestPosition: ElementPosition = {
    x: margin,
    y: margin,
    order: existingElements.length,
  };

  // If no existing elements, return default position
  if (existingElements.length === 0) {
    return bestPosition;
  }

  // Sort existing elements by Y position
  const sortedElements = [...existingElements].sort((a, b) => a.position.y - b.position.y);

  // Find first available vertical position
  let currentY = margin;

  for (const element of sortedElements) {
    // Check if there's space before this element
    if (currentY + elementHeight + verticalSpacing <= element.position.y) {
      bestPosition.y = currentY;
      break;
    }

    // Move to position after this element
    currentY = element.position.y + elementHeight + verticalSpacing;
  }

  // If no space found before existing elements, place after the last one
  if (bestPosition.y === margin && sortedElements.length > 0) {
    const lastElement = sortedElements[sortedElements.length - 1];
    if (lastElement) {
      bestPosition.y = lastElement.position.y + elementHeight + verticalSpacing;
    }
  }

  return bestPosition;
}

/**
 * Calculate snap-to-position for precise element placement
 */
export function calculateSnapPosition(
  targetPosition: { x: number; y: number },
  existingElements: FormElement[],
  snapThreshold: number = 10,
): { x: number; y: number; snapped: boolean } {
  let snappedX = targetPosition.x;
  let snappedY = targetPosition.y;
  let hasSnapped = false;

  // Check for horizontal alignment opportunities
  for (const element of existingElements) {
    const elementX = element.position.x;
    const elementY = element.position.y;

    // Snap to X alignment
    if (Math.abs(targetPosition.x - elementX) <= snapThreshold) {
      snappedX = elementX;
      hasSnapped = true;
    }

    // Snap to Y alignment
    if (Math.abs(targetPosition.y - elementY) <= snapThreshold) {
      snappedY = elementY;
      hasSnapped = true;
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    snapped: hasSnapped,
  };
}

/**
 * Calculate reorder positions when elements are moved
 */
export function calculateReorderPositions(
  draggedElementId: UniqueIdentifier,
  targetIndex: number,
  elements: FormElement[],
): Map<UniqueIdentifier, ElementPosition> {
  const newPositions = new Map<UniqueIdentifier, ElementPosition>();
  const elementHeight = 80;
  const verticalSpacing = 20;
  const leftMargin = 20;

  // Filter out the dragged element
  const otherElements = elements.filter((el) => el.id !== draggedElementId);
  const draggedElement = elements.find((el) => el.id === draggedElementId);

  if (!draggedElement) return newPositions;

  // Create new ordered list
  const reorderedElements = [...otherElements];
  reorderedElements.splice(targetIndex, 0, draggedElement);

  // Calculate new positions
  reorderedElements.forEach((element, index) => {
    const newPosition: ElementPosition = {
      x: leftMargin,
      y: 20 + index * (elementHeight + verticalSpacing),
      order: index,
    };

    newPositions.set(element.id, newPosition);
  });

  return newPositions;
}

/**
 * Validate drop operation
 */
export function validateDrop(
  draggedElementType: FormElementType,
  targetZone: DropZoneInfo,
): {
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
} {
  // Check if element type is accepted
  const isAccepted =
    targetZone.accepts === 'all' ||
    (Array.isArray(targetZone.accepts) && targetZone.accepts.includes(draggedElementType));

  if (!isAccepted) {
    return {
      isValid: false,
      reason: `${draggedElementType} elements are not allowed in this zone`,
      suggestions: [`Try dropping in the main canvas area`],
    };
  }

  // Additional validation rules can be added here
  // For example: maximum elements per container, required fields, etc.

  return { isValid: true };
}

/**
 * Get visual feedback for insertion indicator
 */
export function getInsertionIndicatorStyle(
  insertionPoint: InsertionPoint,
  containerWidth: number,
): React.CSSProperties {
  return {
    position: 'absolute',
    left: insertionPoint.position.x,
    top: insertionPoint.position.y - 1, // Center the line
    width: containerWidth - insertionPoint.position.x * 2,
    height: 2,
    backgroundColor: '#3b82f6', // Blue color
    borderRadius: 1,
    zIndex: 1000,
    transition: 'all 0.2s ease-in-out',
  };
}
