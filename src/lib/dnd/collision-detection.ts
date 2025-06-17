import { CollisionDetectionConfig } from '@/types/form-builder.types';
import {
  ClientRect,
  closestCenter,
  closestCorners,
  CollisionDetection,
  DroppableContainer,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
} from '@dnd-kit/core';

/**
 * Default collision detection configuration
 */
export const defaultCollisionConfig: CollisionDetectionConfig = {
  strategy: 'closestCenter',
  tolerance: 0,
  enableSnapToGrid: true,
  gridSize: 20,
};

/**
 * Custom collision detection for form builder
 * Provides enhanced collision detection with snap-to-grid functionality
 */
export function formBuilderCollisionDetection(
  config: Partial<CollisionDetectionConfig> = {},
): CollisionDetection {
  const finalConfig = { ...defaultCollisionConfig, ...config };

  return (args) => {
    const { active, droppableContainers, droppableRects, collisionRect } = args;

    // Don't perform collision detection if there's no active item
    if (!active || !collisionRect) {
      return [];
    }

    // Get base collision detection strategy
    const baseStrategy = getCollisionStrategy(finalConfig.strategy);
    let collisions = baseStrategy(args);

    // Apply tolerance filtering if specified
    if (finalConfig.tolerance > 0) {
      collisions = applyTolerance(collisions, finalConfig.tolerance, collisionRect, droppableRects);
    }

    // Apply snap-to-grid if enabled
    if (finalConfig.enableSnapToGrid) {
      collisions = applySnapToGrid(collisions, finalConfig.gridSize, droppableRects);
    }

    const droppableContainersMap = new Map(
      droppableContainers.map((container) => [container.id, container]),
    );

    // Sort collisions by priority (form elements vs containers)
    collisions = sortCollisionsByPriority(collisions, droppableContainersMap);

    return collisions;
  };
}

/**
 * Get collision detection strategy by name
 */
function getCollisionStrategy(strategy: CollisionDetectionConfig['strategy']): CollisionDetection {
  switch (strategy) {
    case 'closestCenter':
      return closestCenter;
    case 'closestCorners':
      return closestCorners;
    case 'pointerWithin':
      return pointerWithin;
    case 'rectIntersection':
      return rectIntersection;
    default:
      return closestCenter;
  }
}

/**
 * Apply tolerance filtering to collision results
 */
function applyTolerance(
  collisions: ReturnType<CollisionDetection>,
  tolerance: number,
  collisionRect: ClientRect,
  droppableRects: Map<UniqueIdentifier, ClientRect>,
): ReturnType<CollisionDetection> {
  if (tolerance === 0 || !collisions) return collisions;

  return collisions.filter((collision) => {
    // Calculate distance from collision rect center to drop zone center
    const collisionCenterX = collisionRect.left + collisionRect.width / 2;
    const collisionCenterY = collisionRect.top + collisionRect.height / 2;

    const dropZoneRect = droppableRects.get(collision.id);
    if (!dropZoneRect) return false;

    const dropZoneCenterX = dropZoneRect.left + dropZoneRect.width / 2;
    const dropZoneCenterY = dropZoneRect.top + dropZoneRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(collisionCenterX - dropZoneCenterX, 2) +
        Math.pow(collisionCenterY - dropZoneCenterY, 2),
    );

    return distance <= tolerance;
  });
}

/**
 * Apply snap-to-grid positioning to collision results
 */
function applySnapToGrid(
  collisions: ReturnType<CollisionDetection>,
  gridSize: number,
  droppableRects: Map<UniqueIdentifier, ClientRect>,
): ReturnType<CollisionDetection> {
  return collisions.map((collision) => {
    const rect = droppableRects.get(collision.id);
    if (!rect) return collision;

    // Snap position to grid
    const snappedLeft = Math.round(rect.left / gridSize) * gridSize;
    const snappedTop = Math.round(rect.top / gridSize) * gridSize;

    return {
      ...collision,
      data: {
        ...collision.data,
        snappedPosition: {
          x: snappedLeft,
          y: snappedTop,
        },
      },
    };
  });
}

/**
 * Sort collisions by priority
 * Form elements have higher priority than containers
 */
function sortCollisionsByPriority(
  collisions: ReturnType<CollisionDetection>,
  droppableContainers: Map<UniqueIdentifier, DroppableContainer>,
): ReturnType<CollisionDetection> {
  return collisions.sort((a, b) => {
    const aContainer = droppableContainers.get(a.id);
    const bContainer = droppableContainers.get(b.id);

    // Prioritize form elements over containers
    const aIsElement = aContainer?.data?.current?.type === 'element';
    const bIsElement = bContainer?.data?.current?.type === 'element';

    if (aIsElement && !bIsElement) return -1;
    if (!aIsElement && bIsElement) return 1;

    // If both are the same type, prioritize by distance (closer first)
    return (a.data?.distance || 0) - (b.data?.distance || 0);
  });
}

/**
 * Enhanced collision detection for nested drop zones
 * Handles complex nested container scenarios
 */
export function nestedCollisionDetection(
  config: Partial<CollisionDetectionConfig> = {},
): CollisionDetection {
  const finalConfig = { ...defaultCollisionConfig, ...config };

  return (args) => {
    const { active, droppableContainers, droppableRects, collisionRect } = args;

    if (!active || !collisionRect) {
      return [];
    }

    const droppableContainersMap = new Map(
      droppableContainers.map((container) => [container.id, container]),
    );

    // First, get all potential collisions
    const baseStrategy = getCollisionStrategy(finalConfig.strategy);
    let collisions = baseStrategy(args);

    // Filter out invalid drop targets based on nesting rules
    collisions = filterInvalidNestedTargets(collisions, active.id, droppableContainersMap);

    // Apply tolerance and snap-to-grid
    if (finalConfig.tolerance > 0) {
      collisions = applyTolerance(collisions, finalConfig.tolerance, collisionRect, droppableRects);
    }

    if (finalConfig.enableSnapToGrid) {
      collisions = applySnapToGrid(collisions, finalConfig.gridSize, droppableRects);
    }

    // Sort by nesting priority
    collisions = sortByNestingPriority(collisions, droppableContainersMap);

    return collisions;
  };
}

/**
 * Filter out invalid nested drop targets
 */
function filterInvalidNestedTargets(
  collisions: ReturnType<CollisionDetection>,
  activeId: UniqueIdentifier,
  droppableContainers: Map<UniqueIdentifier, DroppableContainer>,
): ReturnType<CollisionDetection> {
  return collisions.filter((collision) => {
    const container = droppableContainers.get(collision.id);
    const containerData = container?.data?.current;

    // Don't allow dropping on self
    if (collision.id === activeId) {
      return false;
    }

    // Don't allow dropping on children (prevents circular nesting)
    if (isDescendantOf(collision.id, activeId, droppableContainers)) {
      return false;
    }

    // Check if the container accepts this type of element
    const activeContainer = droppableContainers.get(activeId);
    const activeElementType = activeContainer?.data?.current?.elementType;

    if (containerData?.accepts && activeElementType) {
      return containerData.accepts.includes(activeElementType);
    }

    return true;
  });
}

/**
 * Check if a container is a descendant of another container
 */
function isDescendantOf(
  containerId: UniqueIdentifier,
  ancestorId: UniqueIdentifier,
  droppableContainers: Map<UniqueIdentifier, DroppableContainer>,
): boolean {
  const container = droppableContainers.get(containerId);
  const parentId = container?.data?.current?.parentId;

  if (!parentId) return false;
  if (parentId === ancestorId) return true;

  return isDescendantOf(parentId, ancestorId, droppableContainers);
}

/**
 * Sort collisions by nesting priority (deeper and smaller containers first)
 */
function sortByNestingPriority(
  collisions: ReturnType<CollisionDetection>,
  droppableContainers: Map<UniqueIdentifier, DroppableContainer>,
): ReturnType<CollisionDetection> {
  if (!collisions) return [];

  return collisions.sort((a, b) => {
    const aDepth = getContainerDepth(a.id, droppableContainers);
    const bDepth = getContainerDepth(b.id, droppableContainers);

    if (aDepth !== bDepth) {
      return bDepth - aDepth; // Deeper containers first
    }

    // If same depth, prefer smaller containers (more precise targets)
    const aContainer = droppableContainers.get(a.id);
    const bContainer = droppableContainers.get(b.id);
    const aRect = aContainer?.rect.current;
    const bRect = bContainer?.rect.current;
    const aArea = (aRect?.width || 0) * (aRect?.height || 0);
    const bArea = (bRect?.width || 0) * (bRect?.height || 0);

    return aArea - bArea;
  });
}

/**
 * Get the nesting depth of a container
 */
function getContainerDepth(
  containerId: UniqueIdentifier,
  droppableContainers: Map<UniqueIdentifier, DroppableContainer>,
): number {
  const container = droppableContainers.get(containerId);
  const parentId = container?.data?.current?.parentId;

  if (!parentId) return 0;

  return 1 + getContainerDepth(parentId, droppableContainers);
}

/**
 * Collision detection optimized for touch devices
 */
export function touchOptimizedCollisionDetection(
  config: Partial<CollisionDetectionConfig> = {},
): CollisionDetection {
  const finalConfig = {
    ...defaultCollisionConfig,
    tolerance: 15, // Larger tolerance for touch
    ...config,
  };

  return formBuilderCollisionDetection(finalConfig);
}

/**
 * Collision detection optimized for precise mouse interactions
 */
export function preciseCollisionDetection(
  config: Partial<CollisionDetectionConfig> = {},
): CollisionDetection {
  const finalConfig = {
    ...defaultCollisionConfig,
    strategy: 'closestCorners' as const,
    tolerance: 5, // Smaller tolerance for precision
    gridSize: 10, // Smaller grid for fine positioning
    ...config,
  };

  return formBuilderCollisionDetection(finalConfig);
}

/**
 * Get appropriate collision detection based on device type
 */
export function getAdaptiveCollisionDetection(
  isMobile: boolean,
  config: Partial<CollisionDetectionConfig> = {},
): CollisionDetection {
  return isMobile ? touchOptimizedCollisionDetection(config) : preciseCollisionDetection(config);
}
