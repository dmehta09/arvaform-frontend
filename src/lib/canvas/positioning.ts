/**
 * Canvas positioning utilities for form builder
 * Provides functions for element positioning, grid snapping, and spatial calculations
 */

import { CanvasSize, ElementPosition, FormElement } from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Position constraints for canvas elements
 */
export interface PositionConstraints {
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

/**
 * Spatial region definition
 */
export interface SpatialRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Snap a position to the nearest grid intersection
 */
export function snapToGrid(position: ElementPosition, gridSize: number = 20): ElementPosition {
  return {
    ...position,
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Constrain position within canvas bounds
 */
export function constrainToCanvas(
  position: ElementPosition,
  canvasSize: CanvasSize,
  elementSize: { width: number; height: number } = { width: 0, height: 0 },
): ElementPosition {
  const maxX = Math.max(0, canvasSize.width - elementSize.width);
  const maxY = Math.max(0, canvasSize.height - elementSize.height);

  return {
    ...position,
    x: Math.max(0, Math.min(position.x, maxX)),
    y: Math.max(0, Math.min(position.y, maxY)),
  };
}

/**
 * Apply position constraints
 */
export function applyConstraints(
  position: ElementPosition,
  constraints: PositionConstraints,
): ElementPosition {
  let constrainedPosition = { ...position };

  // Apply bounds constraints
  if (constraints.minX !== undefined) {
    constrainedPosition.x = Math.max(constrainedPosition.x, constraints.minX);
  }
  if (constraints.maxX !== undefined) {
    constrainedPosition.x = Math.min(constrainedPosition.x, constraints.maxX);
  }
  if (constraints.minY !== undefined) {
    constrainedPosition.y = Math.max(constrainedPosition.y, constraints.minY);
  }
  if (constraints.maxY !== undefined) {
    constrainedPosition.y = Math.min(constrainedPosition.y, constraints.maxY);
  }

  // Apply grid snapping
  if (constraints.snapToGrid && constraints.gridSize) {
    constrainedPosition = snapToGrid(constrainedPosition, constraints.gridSize);
  }

  return constrainedPosition;
}

/**
 * Calculate the center position of an element within canvas
 */
export function centerInCanvas(
  elementSize: { width: number; height: number },
  canvasSize: CanvasSize,
): ElementPosition {
  return {
    x: Math.max(0, (canvasSize.width - elementSize.width) / 2),
    y: Math.max(0, (canvasSize.height - elementSize.height) / 2),
    order: 0,
  };
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: ElementPosition, pos2: ElementPosition): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find nearest grid intersection to a position
 */
export function findNearestGridPoint(
  position: { x: number; y: number },
  gridSize: number,
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Check if two elements overlap
 */
export function elementsOverlap(
  element1: { position: ElementPosition; size: { width: number; height: number } },
  element2: { position: ElementPosition; size: { width: number; height: number } },
): boolean {
  const rect1 = {
    left: element1.position.x,
    right: element1.position.x + element1.size.width,
    top: element1.position.y,
    bottom: element1.position.y + element1.size.height,
  };

  const rect2 = {
    left: element2.position.x,
    right: element2.position.x + element2.size.width,
    top: element2.position.y,
    bottom: element2.position.y + element2.size.height,
  };

  return !(
    rect1.right <= rect2.left ||
    rect2.right <= rect1.left ||
    rect1.bottom <= rect2.top ||
    rect2.bottom <= rect1.top
  );
}

/**
 * Calculate bounding box for multiple elements
 */
export function calculateBoundingBox(elements: FormElement[]): SpatialRegion | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((element) => {
    const pos = element.position;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Align elements based on alignment type
 */
export function alignElements(
  elements: FormElement[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
): Map<UniqueIdentifier, ElementPosition> {
  if (elements.length < 2) return new Map();

  const boundingBox = calculateBoundingBox(elements);
  if (!boundingBox) return new Map();

  const newPositions = new Map<UniqueIdentifier, ElementPosition>();

  elements.forEach((element) => {
    const currentPos = element.position;
    const newPos = { ...currentPos };

    switch (alignment) {
      case 'left':
        newPos.x = boundingBox.x;
        break;
      case 'center':
        newPos.x = boundingBox.x + boundingBox.width / 2;
        break;
      case 'right':
        newPos.x = boundingBox.x + boundingBox.width;
        break;
      case 'top':
        newPos.y = boundingBox.y;
        break;
      case 'middle':
        newPos.y = boundingBox.y + boundingBox.height / 2;
        break;
      case 'bottom':
        newPos.y = boundingBox.y + boundingBox.height;
        break;
    }

    newPositions.set(element.id, newPos);
  });

  return newPositions;
}

/**
 * Distribute elements evenly
 */
export function distributeElements(
  elements: FormElement[],
  direction: 'horizontal' | 'vertical',
): Map<UniqueIdentifier, ElementPosition> {
  if (elements.length < 3) return new Map();

  const sortedElements = [...elements].sort((a, b) => {
    if (direction === 'horizontal') {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });

  const first = sortedElements[0];
  const last = sortedElements[sortedElements.length - 1];
  if (!first || !last) return new Map();

  const totalSpace =
    direction === 'horizontal'
      ? last.position.x - first.position.x
      : last.position.y - first.position.y;

  const spacing = totalSpace / (sortedElements.length - 1);
  const newPositions = new Map<UniqueIdentifier, ElementPosition>();

  sortedElements.forEach((element, index) => {
    if (index === 0 || index === sortedElements.length - 1) {
      // Keep first and last elements in place
      return;
    }

    const newPos = { ...element.position };
    if (direction === 'horizontal') {
      newPos.x = first.position.x + spacing * index;
    } else {
      newPos.y = first.position.y + spacing * index;
    }

    newPositions.set(element.id, newPos);
  });

  return newPositions;
}

/**
 * Calculate optimal insertion point for new element
 */
export function calculateInsertionPoint(
  clientY: number,
  elements: FormElement[],
  containerRect: DOMRect,
): { index: number; y: number } {
  const relativeY = clientY - containerRect.top;

  // Sort elements by their vertical position
  const sortedElements = [...elements].sort((a, b) => a.position.y - b.position.y);

  // Find insertion point based on Y position
  for (let i = 0; i < sortedElements.length; i++) {
    const element = sortedElements[i];
    if (!element) continue;

    if (relativeY < element.position.y) {
      return {
        index: i,
        y: Math.max(0, element.position.y - 10), // 10px gap
      };
    }
  }

  // Insert at the end
  const lastElement = sortedElements[sortedElements.length - 1];
  return {
    index: sortedElements.length,
    y: lastElement ? lastElement.position.y + 80 : 20, // 80px spacing for new elements
  };
}

/**
 * Find elements within a spatial region
 */
export function findElementsInRegion(
  elements: FormElement[],
  region: SpatialRegion,
): FormElement[] {
  return elements.filter((element) => {
    const pos = element.position;
    return (
      pos.x >= region.x &&
      pos.x <= region.x + region.width &&
      pos.y >= region.y &&
      pos.y <= region.y + region.height
    );
  });
}

/**
 * Calculate viewport-relative position from canvas position
 */
export function canvasToViewport(
  canvasPosition: ElementPosition,
  zoom: number,
  scrollOffset: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: canvasPosition.x * zoom - scrollOffset.x,
    y: canvasPosition.y * zoom - scrollOffset.y,
  };
}

/**
 * Calculate canvas position from viewport position
 */
export function viewportToCanvas(
  viewportPosition: { x: number; y: number },
  zoom: number,
  scrollOffset: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (viewportPosition.x + scrollOffset.x) / zoom,
    y: (viewportPosition.y + scrollOffset.y) / zoom,
  };
}
