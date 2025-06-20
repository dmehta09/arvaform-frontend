import { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Base interface for all form elements
 */
export interface FormElement {
  id: UniqueIdentifier;
  type: FormElementType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation: ValidationRule[];
  styling: ElementStyling;
  position: ElementPosition;
  properties?: Record<string, unknown>;
  conditionalLogic?: Record<string, unknown>;
  multiple?: boolean;
  accept?: string;
}

/**
 * Available form element types
 */
export type FormElementType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'textarea'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'section'
  | 'heading'
  | 'divider'
  | 'file';

/**
 * Element position information
 */
export interface ElementPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
  order: number;
}

/**
 * Validation rule types supported by the property panel
 */
export type ValidationRuleType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'number'
  | 'min'
  | 'max'
  | 'custom';

/**
 * Individual validation rule configuration
 */
export interface ValidationRule {
  id: string;
  type: ValidationRuleType;
  value?: string | number;
  message?: string;
  enabled: boolean;
}

/**
 * Styling configuration for elements
 */
export interface ElementStyling {
  // Layout & Spacing
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  padding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Colors
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  focusColor?: string;

  // Borders & Radius
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: string;

  // Effects
  boxShadow?: string;
  opacity?: number;
}

/**
 * Form builder state
 */
export interface FormBuilderState {
  formId: string;
  title: string;
  description?: string;
  elements: FormElement[];
  selectedElementId?: UniqueIdentifier;
  isDragging: boolean;
  draggedElement?: FormElement;
  dropZones: DropZone[];
  canvasSize: CanvasSize;
  zoom: number;
  showGrid: boolean;
  history: FormBuilderHistory;
}

/**
 * Drop zone configuration
 */
export interface DropZone {
  id: UniqueIdentifier;
  type: 'element' | 'container';
  accepts: FormElementType[];
  position: ElementPosition;
  isActive: boolean;
  isOver: boolean;
}

/**
 * Canvas size configuration
 */
export interface CanvasSize {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

/**
 * Form builder history for undo/redo
 */
export interface FormBuilderHistory {
  past: FormBuilderState[];
  present: FormBuilderState;
  future: FormBuilderState[];
  maxHistorySize: number;
}

/**
 * Drag and drop operation data
 */
export interface DragData {
  elementType?: FormElementType;
  elementId?: UniqueIdentifier;
  source: 'library' | 'canvas';
  element?: FormElement;
}

/**
 * Drop operation result
 */
export interface DropResult {
  success: boolean;
  elementId?: UniqueIdentifier;
  position?: ElementPosition;
  error?: string;
}

/**
 * Canvas operation types
 */
export type CanvasOperation =
  | 'add-element'
  | 'move-element'
  | 'delete-element'
  | 'update-element'
  | 'select-element'
  | 'deselect-element'
  | 'copy-element'
  | 'paste-element';

/**
 * Canvas operation payload
 */
export interface CanvasOperationPayload {
  type: CanvasOperation;
  elementId?: UniqueIdentifier;
  element?: FormElement;
  position?: ElementPosition;
  properties?: Record<string, unknown>;
}

/**
 * Collision detection configuration
 */
export interface CollisionDetectionConfig {
  strategy: 'closestCenter' | 'closestCorners' | 'pointerWithin' | 'rectIntersection';
  tolerance: number;
  enableSnapToGrid: boolean;
  gridSize: number;
}

/**
 * Sensor configuration for drag operations
 */
export interface DragSensorConfig {
  mouse: {
    activationConstraint: {
      distance: number;
    };
  };
  touch: {
    activationConstraint: {
      delay: number;
      tolerance: number;
    };
  };
  keyboard: {
    coordinateGetter: 'sortableKeyboardCoordinates' | 'keyboardCoordinates';
  };
}

/**
 * Form builder event types
 */
export type FormBuilderEvent =
  | 'element-added'
  | 'element-moved'
  | 'element-deleted'
  | 'element-updated'
  | 'element-selected'
  | 'element-deselected'
  | 'form-saved'
  | 'form-loaded'
  | 'undo'
  | 'redo';

/**
 * Form builder event payload
 */
export interface FormBuilderEventPayload {
  type: FormBuilderEvent;
  elementId?: UniqueIdentifier;
  element?: FormElement;
  timestamp: number;
  userId?: string;
}

/**
 * Error types for drag and drop operations
 */
export type DragDropError =
  | 'invalid-drop-target'
  | 'element-not-found'
  | 'operation-failed'
  | 'permission-denied'
  | 'validation-failed';

/**
 * Error payload for drag and drop operations
 */
export interface DragDropErrorPayload {
  type: DragDropError;
  message: string;
  elementId?: UniqueIdentifier;
  operation?: CanvasOperation;
  timestamp: number;
}
