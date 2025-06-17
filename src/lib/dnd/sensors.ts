import { DragSensorConfig } from '@/types/form-builder.types';
import {
  KeyboardSensor as DndKitKeyboardSensor,
  MouseSensor as DndKitMouseSensor,
  TouchSensor as DndKitTouchSensor,
  KeyboardCoordinateGetter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Custom mouse sensor with activation constraints
 * Prevents accidental drag operations by requiring minimum movement
 */
class MouseSensor extends DndKitMouseSensor {
  static override activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: MouseEvent }) => {
        return shouldHandleEvent(event.target as Element);
      },
    },
  ];
}

/**
 * Custom touch sensor with activation constraints
 * Provides proper touch support with delay and tolerance
 */
class TouchSensor extends DndKitTouchSensor {
  static override activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: TouchEvent }) => {
        return shouldHandleEvent(event.target as Element);
      },
    },
  ];
}

/**
 * Custom keyboard sensor for accessibility
 * Enables keyboard navigation for drag-and-drop operations
 */
class KeyboardSensor extends DndKitKeyboardSensor {
  static override activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: KeyboardEvent }) => {
        return shouldHandleKeyboardEvent(event);
      },
    },
  ];
}

/**
 * Determines if the event should be handled by the sensor
 * Filters out events from non-draggable elements
 */
function shouldHandleEvent(element: Element | null): boolean {
  let node = element;

  while (node) {
    // Skip if the element is a form control
    if (isInteractiveElement(node)) {
      return false;
    }

    // Allow if the element is draggable
    if (isDraggableElement(node)) {
      return true;
    }

    // Check if we should ignore this element
    if ((node as HTMLElement).dataset?.noDrag === 'true') {
      return false;
    }

    node = node.parentElement;
  }

  return false;
}

/**
 * Determines if a keyboard event should initiate drag
 */
function shouldHandleKeyboardEvent(event: KeyboardEvent): boolean {
  const { code, target } = event;

  // Only handle specific keys
  if (code !== 'Space' && code !== 'Enter') {
    return false;
  }

  // Check if the target is draggable
  return shouldHandleEvent(target as Element);
}

/**
 * Checks if an element is interactive (should not be dragged)
 */
function isInteractiveElement(element: Element): boolean {
  const interactiveTags = new Set(['button', 'input', 'textarea', 'select', 'option', 'a']);

  const tagName = element.tagName.toLowerCase();

  // Check tag name
  if (interactiveTags.has(tagName)) {
    return true;
  }

  // Check for contenteditable
  if (element.getAttribute('contenteditable') === 'true') {
    return true;
  }

  // Check for interactive roles
  const role = element.getAttribute('role');
  const interactiveRoles = new Set([
    'button',
    'link',
    'textbox',
    'combobox',
    'listbox',
    'menu',
    'menuitem',
    'tab',
  ]);

  return role ? interactiveRoles.has(role) : false;
}

/**
 * Checks if an element is draggable
 */
function isDraggableElement(element: Element): boolean {
  const htmlElement = element as HTMLElement;

  // Check for data-draggable attribute
  if (htmlElement.dataset?.draggable === 'true') {
    return true;
  }

  // Check for draggable CSS class
  if (element.classList.contains('draggable')) {
    return true;
  }

  // Check for drag handle
  if (htmlElement.dataset?.dragHandle === 'true') {
    return true;
  }

  return false;
}

/**
 * Default sensor configuration
 */
export const defaultSensorConfig: DragSensorConfig = {
  mouse: {
    activationConstraint: {
      distance: 8, // Require 8px movement before drag starts
    },
  },
  touch: {
    activationConstraint: {
      delay: 150, // 150ms delay for touch
      tolerance: 8, // 8px tolerance during delay
    },
  },
  keyboard: {
    coordinateGetter: 'sortableKeyboardCoordinates',
  },
};

/**
 * Custom keyboard coordinate getter for form builder
 * Provides grid-based movement for precise positioning
 */
export function formBuilderKeyboardCoordinates(
  event: KeyboardEvent,
  args: Parameters<KeyboardCoordinateGetter>[1],
): ReturnType<KeyboardCoordinateGetter> {
  const { collisionRect } = args.context;

  if (collisionRect) {
    const { code } = event;
    const gridSize = 20; // 20px grid for keyboard navigation

    switch (code) {
      case 'ArrowRight':
        return {
          x: collisionRect.left + gridSize,
          y: collisionRect.top,
        };
      case 'ArrowLeft':
        return {
          x: collisionRect.left - gridSize,
          y: collisionRect.top,
        };
      case 'ArrowDown':
        return {
          x: collisionRect.left,
          y: collisionRect.top + gridSize,
        };
      case 'ArrowUp':
        return {
          x: collisionRect.left,
          y: collisionRect.top - gridSize,
        };
    }
  }

  // Fallback to default sortable keyboard coordinates
  return sortableKeyboardCoordinates(event, args);
}

/**
 * Hook to create configured sensors for the form builder
 */
export function useFormBuilderSensors(config: Partial<DragSensorConfig> = {}) {
  const sensorConfig = { ...defaultSensorConfig, ...config };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: sensorConfig.mouse.activationConstraint,
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: sensorConfig.touch.activationConstraint,
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter:
      sensorConfig.keyboard.coordinateGetter === 'sortableKeyboardCoordinates'
        ? sortableKeyboardCoordinates
        : formBuilderKeyboardCoordinates,
  });

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  return sensors;
}

/**
 * Hook to create sensors optimized for mobile devices
 */
export function useMobileSensors() {
  return useFormBuilderSensors({
    touch: {
      activationConstraint: {
        delay: 100, // Shorter delay for mobile
        tolerance: 12, // Higher tolerance for mobile
      },
    },
  });
}

/**
 * Hook to create sensors optimized for desktop devices
 */
export function useDesktopSensors() {
  return useFormBuilderSensors({
    mouse: {
      activationConstraint: {
        distance: 5, // Lower distance for desktop precision
      },
    },
  });
}

/**
 * Utility to detect if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Hook to automatically select appropriate sensors based on device
 */
export function useAdaptiveSensors() {
  const isMobile = isMobileDevice();

  // Create both sensors to avoid conditional hook calls
  const mobileSensors = useMobileSensors();
  const desktopSensors = useDesktopSensors();

  // Return appropriate sensors based on device type
  return isMobile ? mobileSensors : desktopSensors;
}
