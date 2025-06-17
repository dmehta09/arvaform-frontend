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
  validation?: ValidationRules;
  styling?: ElementStyling;
  position: ElementPosition;
  properties?: Record<string, unknown>;
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
  | 'divider';

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
 * Validation rules for form elements
 */
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

/**
 * Element styling configuration
 */
export interface ElementStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
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
