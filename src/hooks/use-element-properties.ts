import { getElementValidationSchema } from '@/lib/property-forms/property-schemas';
import {
  createRealTimeValidator,
  validateElementProperties,
} from '@/lib/property-forms/property-validations';
import type {
  ElementProperties,
  PropertyChangeEvent,
  PropertyPanelState,
  PropertyPanelTab,
  PropertyValidationResult,
} from '@/types/element-properties.types';
import type { ValidationRule } from '@/types/form-builder.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Actions for property panel state management
 */
type PropertyPanelAction =
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'SET_ACTIVE_TAB'; tab: PropertyPanelTab }
  | { type: 'TOGGLE_PANEL'; isOpen?: boolean }
  | {
      type: 'UPDATE_PROPERTY';
      elementId: string;
      property: keyof ElementProperties;
      value: unknown;
    }
  | { type: 'SET_PROPERTIES'; elementId: string; properties: ElementProperties }
  | { type: 'RESET_PROPERTIES'; elementId: string }
  | {
      type: 'BULK_UPDATE';
      updates: Array<{ elementId: string; property: keyof ElementProperties; value: unknown }>;
    };

/**
 * Initial state for property panel
 */
const initialState: PropertyPanelState = {
  selectedElementId: null,
  activeTab: 'general',
  isOpen: true,
  properties: {},
};

/**
 * Reducer for property panel state management
 */
function propertyPanelReducer(
  state: PropertyPanelState,
  action: PropertyPanelAction,
): PropertyPanelState {
  switch (action.type) {
    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.elementId,
        activeTab: action.elementId ? 'general' : state.activeTab,
        isOpen: action.elementId ? true : state.isOpen,
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.tab,
      };

    case 'TOGGLE_PANEL':
      return {
        ...state,
        isOpen: action.isOpen ?? !state.isOpen,
      };

    case 'UPDATE_PROPERTY': {
      const { elementId, property, value } = action;
      const currentProperties =
        state.properties[elementId] ||
        ({
          id: elementId,
          elementType: 'text-input',
          label: '',
          required: false,
          disabled: false,
          validation: [],
          styling: {},
        } as ElementProperties);

      return {
        ...state,
        properties: {
          ...state.properties,
          [elementId]: {
            ...currentProperties,
            [property]: value,
          },
        },
      };
    }

    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: {
          ...state.properties,
          [action.elementId]: action.properties,
        },
      };

    case 'RESET_PROPERTIES': {
      const newProperties = { ...state.properties };
      delete newProperties[action.elementId];
      return {
        ...state,
        properties: newProperties,
      };
    }

    case 'BULK_UPDATE': {
      const newProperties = { ...state.properties };

      action.updates.forEach(({ elementId, property, value }) => {
        if (newProperties[elementId]) {
          newProperties[elementId] = {
            ...newProperties[elementId],
            [property]: value,
          };
        }
      });

      return {
        ...state,
        properties: newProperties,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom hook for managing element properties
 */
export function useElementProperties(initialProperties?: Record<string, ElementProperties>) {
  // State management with reducer
  const [state, dispatch] = useReducer(propertyPanelReducer, {
    ...initialState,
    properties: initialProperties || {},
  });

  // Get current element properties
  const currentElement = useMemo(() => {
    return state.selectedElementId ? state.properties[state.selectedElementId] : null;
  }, [state.selectedElementId, state.properties]);

  // Create real-time validator for current element
  const validator = useMemo(() => {
    return currentElement ? createRealTimeValidator(currentElement.elementType) : null;
  }, [currentElement]);

  // React Hook Form setup for current element
  const form = useForm({
    resolver: currentElement
      ? zodResolver(getElementValidationSchema(currentElement.elementType))
      : undefined,
    values: currentElement || undefined,
    mode: 'onChange',
  });

  // Sync form with current element changes
  useEffect(() => {
    if (currentElement) {
      form.reset(currentElement);
    }
  }, [currentElement, form]);

  // Event handlers
  const selectElement = useCallback((elementId: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', elementId });
  }, []);

  const setActiveTab = useCallback((tab: PropertyPanelTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab });
  }, []);

  const togglePanel = useCallback((isOpen?: boolean) => {
    dispatch({ type: 'TOGGLE_PANEL', isOpen });
  }, []);

  const updateProperty = useCallback(
    (elementId: string, property: keyof ElementProperties, value: unknown) => {
      // Validate property in real-time
      if (validator && elementId === state.selectedElementId) {
        const validation = validator.validateField(property, value);
        if (!validation.isValid) {
          console.warn(`Property validation failed for ${property}:`, validation.error);
        }
      }

      dispatch({ type: 'UPDATE_PROPERTY', elementId, property, value });
    },
    [validator, state.selectedElementId],
  );

  const setElementProperties = useCallback((elementId: string, properties: ElementProperties) => {
    dispatch({ type: 'SET_PROPERTIES', elementId, properties });
  }, []);

  const resetElementProperties = useCallback((elementId: string) => {
    dispatch({ type: 'RESET_PROPERTIES', elementId });
  }, []);

  const bulkUpdateProperties = useCallback(
    (updates: Array<{ elementId: string; property: keyof ElementProperties; value: unknown }>) => {
      dispatch({ type: 'BULK_UPDATE', updates });
    },
    [],
  );

  // Property validation
  const validateElement = useCallback(
    (elementId: string): PropertyValidationResult => {
      const properties = state.properties[elementId];
      if (!properties) {
        return {
          isValid: false,
          errors: { general: ['Element not found'] },
        };
      }

      return validateElementProperties(elementId, properties);
    },
    [state.properties],
  );

  const validateCurrentElement = useCallback((): PropertyValidationResult => {
    if (!state.selectedElementId || !currentElement) {
      return {
        isValid: false,
        errors: { general: ['No element selected'] },
      };
    }

    return validateElementProperties(state.selectedElementId, currentElement);
  }, [state.selectedElementId, currentElement]);

  // Property change event handler
  const handlePropertyChange = useCallback(
    (event: PropertyChangeEvent) => {
      const { elementId, property, value, tab } = event;

      // Update the property
      updateProperty(elementId, property, value);

      // Switch to the appropriate tab if needed
      if (tab !== state.activeTab) {
        setActiveTab(tab);
      }
    },
    [updateProperty, setActiveTab, state.activeTab],
  );

  // Form submission handler
  const handleFormSubmit = useCallback(
    (data: ElementProperties) => {
      if (state.selectedElementId) {
        setElementProperties(state.selectedElementId, data);
      }
    },
    [state.selectedElementId, setElementProperties],
  );

  // Property templates
  const applyTemplate = useCallback(
    (elementId: string, templateProperties: Partial<ElementProperties>) => {
      const currentProperties = state.properties[elementId];
      if (currentProperties) {
        const mergedProperties = {
          ...currentProperties,
          ...templateProperties,
          id: elementId, // Preserve the element ID
        };
        setElementProperties(elementId, mergedProperties);
      }
    },
    [state.properties, setElementProperties],
  );

  // Copy/paste functionality
  const copyProperties = useCallback(
    (elementId: string): ElementProperties | null => {
      return state.properties[elementId] || null;
    },
    [state.properties],
  );

  const pasteProperties = useCallback(
    (targetElementId: string, properties: Partial<ElementProperties>) => {
      const currentProperties = state.properties[targetElementId];
      if (currentProperties) {
        const mergedProperties = {
          ...currentProperties,
          ...properties,
          id: targetElementId, // Preserve target element ID
        };
        setElementProperties(targetElementId, mergedProperties);
      }
    },
    [state.properties, setElementProperties],
  );

  // Property history for undo/redo (simplified)
  const propertyHistory = useMemo(() => {
    // This could be expanded to include full undo/redo functionality
    return {
      canUndo: false,
      canRedo: false,
      undo: () => {
        /* Implementation for undo */
      },
      redo: () => {
        /* Implementation for redo */
      },
    };
  }, []);

  // Validation rules management
  const addValidationRule = useCallback(
    (elementId: string, rule: Omit<ValidationRule, 'id'>) => {
      const currentProperties = state.properties[elementId];
      if (currentProperties) {
        const newRule: ValidationRule = {
          ...rule,
          id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        const updatedValidation = [...currentProperties.validation, newRule];
        updateProperty(elementId, 'validation', updatedValidation);
      }
    },
    [state.properties, updateProperty],
  );

  const removeValidationRule = useCallback(
    (elementId: string, ruleId: string) => {
      const currentProperties = state.properties[elementId];
      if (currentProperties) {
        const updatedValidation = currentProperties.validation.filter((rule) => rule.id !== ruleId);
        updateProperty(elementId, 'validation', updatedValidation);
      }
    },
    [state.properties, updateProperty],
  );

  const updateValidationRule = useCallback(
    (elementId: string, ruleId: string, updates: Partial<ValidationRule>) => {
      const currentProperties = state.properties[elementId];
      if (currentProperties) {
        const updatedValidation = currentProperties.validation.map((rule) =>
          rule.id === ruleId ? { ...rule, ...updates } : rule,
        );
        updateProperty(elementId, 'validation', updatedValidation);
      }
    },
    [state.properties, updateProperty],
  );

  return {
    // State
    state,
    currentElement,
    form,

    // Element selection and navigation
    selectElement,
    setActiveTab,
    togglePanel,

    // Property management
    updateProperty,
    setElementProperties,
    resetElementProperties,
    bulkUpdateProperties,

    // Validation
    validateElement,
    validateCurrentElement,
    validator,

    // Event handling
    handlePropertyChange,
    handleFormSubmit,

    // Templates and clipboard
    applyTemplate,
    copyProperties,
    pasteProperties,

    // History
    propertyHistory,

    // Validation rules
    addValidationRule,
    removeValidationRule,
    updateValidationRule,

    // Computed properties
    isElementSelected: !!state.selectedElementId,
    hasUnsavedChanges: form.formState.isDirty,
    validationErrors: form.formState.errors,
  };
}
