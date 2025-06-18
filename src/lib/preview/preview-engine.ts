/**
 * Preview Engine for managing form preview state and operations
 * Implements performance-optimized real-time synchronization with React 19 patterns
 */

import { FormElement } from '@/types/form-builder.types';
import { DEFAULT_VIEWPORTS, DeviceType, DeviceViewport, getViewport } from './device-breakpoints';

export type PreviewMode = 'compact' | 'split' | 'fullscreen';
export type PreviewTheme = 'light' | 'dark' | 'system';
export type PreviewInteractionMode = 'view' | 'interact';

/**
 * Preview state interface with comprehensive configuration options
 */
export interface PreviewState {
  // Core preview configuration
  isActive: boolean;
  mode: PreviewMode;
  theme: PreviewTheme;
  interactionMode: PreviewInteractionMode;

  // Device simulation
  currentViewport: DeviceViewport;
  deviceType: DeviceType;
  isRotated: boolean;
  customViewport?: {
    width: number;
    height: number;
    name?: string;
  };

  // Display settings
  zoom: number;
  showRuler: boolean;
  showGrid: boolean;
  showAnnotations: boolean;
  showAccessibilityOutline: boolean;

  // Form state for preview
  formElements: FormElement[];
  formData: Record<string, unknown>;
  validationErrors: Record<string, string>;

  // Performance and debugging
  renderCount: number;
  lastUpdated: number;
  isLoading: boolean;
  error?: string;
}

/**
 * Preview actions for state management
 */
export interface PreviewActions {
  // Core preview controls
  setActive: (active: boolean) => void;
  setMode: (mode: PreviewMode) => void;
  setTheme: (theme: PreviewTheme) => void;
  setInteractionMode: (mode: PreviewInteractionMode) => void;

  // Device simulation
  setViewport: (viewportKey: string) => void;
  setDeviceType: (type: DeviceType) => void;
  rotateDevice: () => void;
  setCustomViewport: (width: number, height: number, name?: string) => void;

  // Display controls
  setZoom: (zoom: number) => void;
  toggleRuler: () => void;
  toggleGrid: () => void;
  toggleAnnotations: () => void;
  toggleAccessibilityOutline: () => void;

  // Form data management
  updateFormElements: (elements: FormElement[]) => void;
  updateFormData: (data: Record<string, unknown>) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  resetFormData: () => void;

  // Utility actions
  captureScreenshot: () => Promise<string | null>;
  exportPreviewConfig: () => string;
  importPreviewConfig: (config: string) => void;
  reset: () => void;
}

/**
 * Default preview state configuration
 */
export const DEFAULT_PREVIEW_STATE: PreviewState = {
  isActive: false,
  mode: 'split',
  theme: 'light',
  interactionMode: 'view',

  currentViewport: getViewport(DEFAULT_VIEWPORTS.desktop)!,
  deviceType: 'desktop',
  isRotated: false,

  zoom: 1,
  showRuler: false,
  showGrid: false,
  showAnnotations: false,
  showAccessibilityOutline: false,

  formElements: [],
  formData: {},
  validationErrors: {},

  renderCount: 0,
  lastUpdated: Date.now(),
  isLoading: false,
};

/**
 * Preview state reducer for managing complex state transitions
 */
export type PreviewAction =
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_MODE'; payload: PreviewMode }
  | { type: 'SET_THEME'; payload: PreviewTheme }
  | { type: 'SET_INTERACTION_MODE'; payload: PreviewInteractionMode }
  | { type: 'SET_VIEWPORT'; payload: string }
  | { type: 'SET_DEVICE_TYPE'; payload: DeviceType }
  | { type: 'ROTATE_DEVICE' }
  | { type: 'SET_CUSTOM_VIEWPORT'; payload: { width: number; height: number; name?: string } }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_RULER' }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_ANNOTATIONS' }
  | { type: 'TOGGLE_ACCESSIBILITY_OUTLINE' }
  | { type: 'UPDATE_FORM_ELEMENTS'; payload: FormElement[] }
  | { type: 'UPDATE_FORM_DATA'; payload: Record<string, unknown> }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, string> }
  | { type: 'RESET_FORM_DATA' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'INCREMENT_RENDER_COUNT' }
  | { type: 'RESET' };

/**
 * Preview state reducer function with optimized performance
 */
export function previewReducer(state: PreviewState, action: PreviewAction): PreviewState {
  switch (action.type) {
    case 'SET_ACTIVE':
      return {
        ...state,
        isActive: action.payload,
        lastUpdated: Date.now(),
      };

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        lastUpdated: Date.now(),
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        lastUpdated: Date.now(),
      };

    case 'SET_INTERACTION_MODE':
      return {
        ...state,
        interactionMode: action.payload,
        lastUpdated: Date.now(),
      };

    case 'SET_VIEWPORT': {
      const viewport = getViewport(action.payload);
      if (!viewport) return state;

      return {
        ...state,
        currentViewport: viewport,
        deviceType: viewport.type,
        isRotated: false,
        customViewport: undefined,
        lastUpdated: Date.now(),
      };
    }

    case 'SET_DEVICE_TYPE': {
      const defaultViewportKey = DEFAULT_VIEWPORTS[action.payload];
      const viewport = getViewport(defaultViewportKey);
      if (!viewport) return state;

      return {
        ...state,
        deviceType: action.payload,
        currentViewport: viewport,
        isRotated: false,
        customViewport: undefined,
        lastUpdated: Date.now(),
      };
    }

    case 'ROTATE_DEVICE':
      return {
        ...state,
        isRotated: !state.isRotated,
        currentViewport: {
          ...state.currentViewport,
          width: state.currentViewport.height,
          height: state.currentViewport.width,
          orientation: state.currentViewport.orientation === 'portrait' ? 'landscape' : 'portrait',
        },
        lastUpdated: Date.now(),
      };

    case 'SET_CUSTOM_VIEWPORT':
      return {
        ...state,
        customViewport: action.payload,
        currentViewport: {
          name: action.payload.name || 'Custom',
          type: 'desktop',
          width: action.payload.width,
          height: action.payload.height,
          orientation: action.payload.width > action.payload.height ? 'landscape' : 'portrait',
          icon: '🔧',
          description: `Custom (${action.payload.width}x${action.payload.height})`,
        },
        lastUpdated: Date.now(),
      };

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(3, action.payload)), // Clamp between 0.1x and 3x
        lastUpdated: Date.now(),
      };

    case 'TOGGLE_RULER':
      return {
        ...state,
        showRuler: !state.showRuler,
        lastUpdated: Date.now(),
      };

    case 'TOGGLE_GRID':
      return {
        ...state,
        showGrid: !state.showGrid,
        lastUpdated: Date.now(),
      };

    case 'TOGGLE_ANNOTATIONS':
      return {
        ...state,
        showAnnotations: !state.showAnnotations,
        lastUpdated: Date.now(),
      };

    case 'TOGGLE_ACCESSIBILITY_OUTLINE':
      return {
        ...state,
        showAccessibilityOutline: !state.showAccessibilityOutline,
        lastUpdated: Date.now(),
      };

    case 'UPDATE_FORM_ELEMENTS':
      return {
        ...state,
        formElements: action.payload,
        renderCount: state.renderCount + 1,
        lastUpdated: Date.now(),
      };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        lastUpdated: Date.now(),
      };

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload,
        lastUpdated: Date.now(),
      };

    case 'RESET_FORM_DATA':
      return {
        ...state,
        formData: {},
        validationErrors: {},
        lastUpdated: Date.now(),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        lastUpdated: Date.now(),
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        lastUpdated: Date.now(),
      };

    case 'INCREMENT_RENDER_COUNT':
      return {
        ...state,
        renderCount: state.renderCount + 1,
      };

    case 'RESET':
      return {
        ...DEFAULT_PREVIEW_STATE,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}

/**
 * Utility functions for preview operations
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Deep comparison function for form elements (performance optimized)
 */
export function areFormElementsEqual(elements1: FormElement[], elements2: FormElement[]): boolean {
  if (elements1.length !== elements2.length) return false;

  for (let i = 0; i < elements1.length; i++) {
    const el1 = elements1[i];
    const el2 = elements2[i];

    // Type guards to ensure elements exist
    if (!el1 || !el2) return false;

    if (
      el1.id !== el2.id ||
      el1.type !== el2.type ||
      JSON.stringify(el1.properties || {}) !== JSON.stringify(el2.properties || {}) ||
      JSON.stringify(el1.styling || {}) !== JSON.stringify(el2.styling || {})
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Generate unique preview session ID for analytics
 */
export function generatePreviewSessionId(): string {
  return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate form completion percentage for analytics
 */
export function calculateFormCompletion(
  formElements: FormElement[],
  formData: Record<string, unknown>,
): number {
  // Check for required elements based on the validation array or required property
  const requiredFields = formElements.filter((element) => {
    // Check direct required property
    if (element.required) return true;

    // Check validation rules for required rule
    return element.validation?.some((rule) => rule.type === 'required' && rule.enabled);
  });

  if (requiredFields.length === 0) return 0;

  const completedFields = requiredFields.filter(
    (element) => formData[element.id] !== undefined && formData[element.id] !== '',
  );

  return Math.round((completedFields.length / requiredFields.length) * 100);
}

/**
 * Export preview configuration as JSON string
 */
export function exportPreviewConfig(state: PreviewState): string {
  const config = {
    mode: state.mode,
    theme: state.theme,
    currentViewport: state.currentViewport,
    zoom: state.zoom,
    showRuler: state.showRuler,
    showGrid: state.showGrid,
    showAnnotations: state.showAnnotations,
    showAccessibilityOutline: state.showAccessibilityOutline,
    customViewport: state.customViewport,
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Import preview configuration from JSON string
 */
export function parsePreviewConfig(configString: string): Partial<PreviewState> | null {
  try {
    const config = JSON.parse(configString);
    return config;
  } catch (error) {
    console.error('Failed to parse preview configuration:', error);
    return null;
  }
}
