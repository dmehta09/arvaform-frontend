'use client';

import {
  CanvasSize,
  ElementPosition,
  FormBuilderHistory,
  FormBuilderState,
  FormElement,
  FormElementType,
} from '@/types/form-builder.types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Configuration for the form builder hook
 */
interface UseFormBuilderConfig {
  formId: string;
  initialElements?: FormElement[];
  canvasSize?: Partial<CanvasSize>;
  maxHistorySize?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

/**
 * Form builder hook return type
 */
interface UseFormBuilderReturn {
  // State
  state: FormBuilderState;
  elements: FormElement[];
  selectedElementId: UniqueIdentifier | undefined;
  isDragging: boolean;
  canvasSize: CanvasSize;
  zoom: number;
  showGrid: boolean;

  // Element operations
  addElement: (elementType: FormElementType, position: ElementPosition) => FormElement;
  updateElement: (elementId: UniqueIdentifier, updates: Partial<FormElement>) => void;
  deleteElement: (elementId: UniqueIdentifier) => void;
  moveElement: (elementId: UniqueIdentifier, newPosition: ElementPosition) => void;
  duplicateElement: (elementId: UniqueIdentifier) => FormElement | null;

  // Selection operations
  selectElement: (elementId: UniqueIdentifier) => void;
  deselectElement: () => void;
  getSelectedElement: () => FormElement | undefined;

  // Canvas operations
  setCanvasSize: (size: Partial<CanvasSize>) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  resetCanvas: () => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Utility functions
  getElementById: (elementId: UniqueIdentifier) => FormElement | undefined;
  getElementIndex: (elementId: UniqueIdentifier) => number;
  reorderElements: (elementIds: UniqueIdentifier[]) => void;

  // State management
  saveToHistory: () => void;
  clearHistory: () => void;
  exportState: () => FormBuilderState;
  importState: (state: Partial<FormBuilderState>) => void;
}

/**
 * Default canvas size configuration
 */
const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 800,
  height: 1200,
  minWidth: 320,
  minHeight: 600,
  maxWidth: 1200,
  maxHeight: 2400,
};

/**
 * Generate unique ID for form elements
 */
function generateElementId(): UniqueIdentifier {
  return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial form builder state
 */
function createInitialState(config: UseFormBuilderConfig): FormBuilderState {
  const canvasSize = { ...DEFAULT_CANVAS_SIZE, ...config.canvasSize };

  const initialState: FormBuilderState = {
    formId: config.formId,
    title: 'New Form',
    description: '',
    elements: config.initialElements || [],
    selectedElementId: undefined,
    isDragging: false,
    draggedElement: undefined,
    dropZones: [],
    canvasSize,
    zoom: 1,
    showGrid: true,
    history: {
      past: [],
      present: {} as FormBuilderState, // Will be set after creation
      future: [],
      maxHistorySize: config.maxHistorySize || 50,
    },
  };

  // Set present state reference
  initialState.history.present = initialState;

  return initialState;
}

/**
 * Custom hook for managing form builder state and operations
 * Provides comprehensive state management with undo/redo, element management,
 * and canvas operations for the drag-and-drop form builder.
 */
export function useFormBuilder(config: UseFormBuilderConfig): UseFormBuilderReturn {
  const [state, setState] = useState<FormBuilderState>(() => createInitialState(config));
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!config.autoSave) return;

    const interval = config.autoSaveInterval || 30000; // 30 seconds default

    const saveState = () => {
      // Emit auto-save event (can be handled by parent component)
      console.log('Auto-saving form builder state:', state.formId);
    };

    autoSaveTimeoutRef.current = setTimeout(saveState, interval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state, config.autoSave, config.autoSaveInterval]);

  /**
   * Update state and manage history
   */
  const updateStateWithHistory = useCallback(
    (updater: (prevState: FormBuilderState) => Partial<FormBuilderState>) => {
      setState((prevState) => {
        const updates = updater(prevState);
        const newState = { ...prevState, ...updates };

        // Avoid adding to history if state hasn't changed
        if (
          JSON.stringify(newState.elements) === JSON.stringify(prevState.elements) &&
          newState.title === prevState.title &&
          newState.description === prevState.description
        ) {
          return prevState;
        }

        const newHistory: FormBuilderHistory = {
          past: [...prevState.history.past, prevState.history.present].slice(
            -prevState.history.maxHistorySize,
          ),
          present: newState,
          future: [],
          maxHistorySize: prevState.history.maxHistorySize,
        };

        return { ...newState, history: newHistory };
      });
    },
    [],
  );

  /**
   * Add a new element to the form
   */
  const addElement = useCallback(
    (elementType: FormElementType, position: ElementPosition): FormElement => {
      const newElement: FormElement = {
        id: generateElementId(),
        type: elementType,
        label: `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} Field`,
        placeholder: `Enter ${elementType}...`,
        required: false,
        position,
        validation: {
          required: false,
        },
        styling: {},
        properties: {},
      };

      updateStateWithHistory((prevState) => ({
        ...prevState,
        elements: [...prevState.elements, newElement],
        selectedElementId: newElement.id,
      }));

      return newElement;
    },
    [updateStateWithHistory],
  );

  /**
   * Update an existing element
   */
  const updateElement = useCallback(
    (elementId: UniqueIdentifier, updates: Partial<FormElement>) => {
      updateStateWithHistory((prevState) => ({
        ...prevState,
        elements: prevState.elements.map((element) =>
          element.id === elementId ? { ...element, ...updates } : element,
        ),
      }));
    },
    [updateStateWithHistory],
  );

  /**
   * Delete an element
   */
  const deleteElement = useCallback(
    (elementId: UniqueIdentifier) => {
      updateStateWithHistory((prevState) => ({
        ...prevState,
        elements: prevState.elements.filter((element) => element.id !== elementId),
        selectedElementId:
          prevState.selectedElementId === elementId ? undefined : prevState.selectedElementId,
      }));
    },
    [updateStateWithHistory],
  );

  /**
   * Move an element to a new position
   */
  const moveElement = useCallback(
    (elementId: UniqueIdentifier, newPosition: ElementPosition) => {
      updateStateWithHistory((prevState) => ({
        ...prevState,
        elements: prevState.elements.map((element) =>
          element.id === elementId ? { ...element, position: newPosition } : element,
        ),
      }));
    },
    [updateStateWithHistory],
  );

  /**
   * Duplicate an element
   */
  const duplicateElement = useCallback(
    (elementId: UniqueIdentifier): FormElement | null => {
      const elementToDuplicate = state.elements.find((el) => el.id === elementId);
      if (!elementToDuplicate) return null;

      const newElement: FormElement = {
        ...elementToDuplicate,
        id: generateElementId(),
        position: {
          ...elementToDuplicate.position,
          order: elementToDuplicate.position.order + 1,
        },
      };

      updateStateWithHistory((prevState) => {
        const index = prevState.elements.findIndex((el) => el.id === elementId);
        const newElements = [...prevState.elements];
        newElements.splice(index + 1, 0, newElement);
        return {
          ...prevState,
          elements: newElements,
          selectedElementId: newElement.id,
        };
      });

      return newElement;
    },
    [state.elements, updateStateWithHistory],
  );

  /**
   * Select an element
   */
  const selectElement = useCallback((elementId: UniqueIdentifier) => {
    setState((prevState) => ({
      ...prevState,
      selectedElementId: elementId,
    }));
  }, []);

  /**
   * Deselect element
   */
  const deselectElement = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      selectedElementId: undefined,
    }));
  }, []);

  /**
   * Get selected element
   */
  const getSelectedElement = useCallback((): FormElement | undefined => {
    if (!state.selectedElementId) return undefined;
    return state.elements.find((el) => el.id === state.selectedElementId);
  }, [state.selectedElementId, state.elements]);

  /**
   * Set canvas size
   */
  const setCanvasSize = useCallback((size: Partial<CanvasSize>) => {
    setState((prevState) => ({
      ...prevState,
      canvasSize: { ...prevState.canvasSize, ...size },
    }));
  }, []);

  /**
   * Set zoom level
   */
  const setZoom = useCallback((zoom: number) => {
    setState((prevState) => ({
      ...prevState,
      zoom: Math.max(0.1, Math.min(3, zoom)), // Constrain zoom between 0.1x and 3x
    }));
  }, []);

  /**
   * Toggle grid visibility
   */
  const toggleGrid = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      showGrid: !prevState.showGrid,
    }));
  }, []);

  /**
   * Reset canvas to initial state
   */
  const resetCanvas = useCallback(() => {
    updateStateWithHistory((prevState) => ({
      ...prevState,
      elements: [],
      selectedElementId: undefined,
      canvasSize: DEFAULT_CANVAS_SIZE,
      zoom: 1,
      showGrid: true,
    }));
  }, [updateStateWithHistory]);

  /**
   * Undo last operation
   */
  const undo = useCallback(() => {
    setState((prevState) => {
      if (prevState.history.past.length === 0) return prevState;

      const previousState = prevState.history.past[prevState.history.past.length - 1];
      if (!previousState) return prevState;
      const newPast = prevState.history.past.slice(0, prevState.history.past.length - 1);

      const newState: FormBuilderState = {
        ...previousState,
        history: {
          past: newPast,
          present: previousState,
          future: [prevState.history.present, ...prevState.history.future],
          maxHistorySize: prevState.history.maxHistorySize,
        },
      };

      return newState;
    });
  }, []);

  /**
   * Redo last undone operation
   */
  const redo = useCallback(() => {
    setState((prevState) => {
      if (prevState.history.future.length === 0) return prevState;

      const nextState = prevState.history.future[0];
      if (!nextState) return prevState;
      const newFuture = prevState.history.future.slice(1);

      const newState: FormBuilderState = {
        ...nextState,
        history: {
          past: [...prevState.history.past, prevState.history.present],
          present: nextState,
          future: newFuture,
          maxHistorySize: prevState.history.maxHistorySize,
        },
      };

      return newState;
    });
  }, []);

  /**
   * Get element by ID
   */
  const getElementById = useCallback(
    (elementId: UniqueIdentifier): FormElement | undefined => {
      return state.elements.find((el) => el.id === elementId);
    },
    [state.elements],
  );

  /**
   * Get element index in the array
   */
  const getElementIndex = useCallback(
    (elementId: UniqueIdentifier): number => {
      return state.elements.findIndex((el) => el.id === elementId);
    },
    [state.elements],
  );

  /**
   * Reorder elements
   */
  const reorderElements = useCallback(
    (elementIds: UniqueIdentifier[]) => {
      updateStateWithHistory((prevState) => {
        const elementMap = new Map(prevState.elements.map((el) => [el.id, el]));
        const reorderedElements = elementIds
          .map((id) => elementMap.get(id))
          .filter((el): el is FormElement => el !== undefined)
          .map((el, index) => ({
            ...el,
            position: { ...el.position, order: index },
          }));

        return {
          ...prevState,
          elements: reorderedElements,
        };
      });
    },
    [updateStateWithHistory],
  );

  /**
   * Save current state to history manually
   */
  const saveToHistory = useCallback(() => {
    updateStateWithHistory((prevState) => prevState);
  }, [updateStateWithHistory]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      history: {
        ...prevState.history,
        past: [],
        future: [],
      },
    }));
  }, []);

  /**
   * Export current state
   */
  const exportState = useCallback(() => state, [state]);

  /**
   * Import state
   */
  const importState = useCallback((newState: Partial<FormBuilderState>) => {
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  }, []);

  // Computed values
  const canUndo = useMemo(() => state.history.past.length > 0, [state.history.past.length]);
  const canRedo = useMemo(() => state.history.future.length > 0, [state.history.future.length]);

  return {
    // State
    state,
    elements: state.elements,
    selectedElementId: state.selectedElementId,
    isDragging: state.isDragging,
    canvasSize: state.canvasSize,
    zoom: state.zoom,
    showGrid: state.showGrid,

    // Element operations
    addElement,
    updateElement,
    deleteElement,
    moveElement,
    duplicateElement,

    // Selection operations
    selectElement,
    deselectElement,
    getSelectedElement,

    // Canvas operations
    setCanvasSize,
    setZoom,
    toggleGrid,
    resetCanvas,

    // History operations
    undo,
    redo,
    canUndo,
    canRedo,

    // Utility functions
    getElementById,
    getElementIndex,
    reorderElements,

    // State management
    saveToHistory,
    clearHistory,
    exportState,
    importState,
  };
}
