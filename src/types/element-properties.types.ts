/**
 * Element Properties Types - 2025 Edition
 * Comprehensive type definitions for the property panel system
 * with validation, styling, and conditional logic support
 */

import { ElementStyling, FormElementType, ValidationRule } from '@/types/form-builder.types';
import { z } from 'zod';

/**
 * Base interface for all element properties
 */
export interface BaseElementProperties {
  id: string;
  label: string;
  placeholder?: string;
  required: boolean;
  disabled: boolean;
  description?: string;
  className?: string;
}

/**
 * Comprehensive element properties combining all aspects
 */
export interface ElementProperties extends BaseElementProperties {
  elementType: string;
  validation: ValidationRule[];
  styling: ElementStyling;
  conditional?: {
    showIf?: string;
    hideIf?: string;
    requiredIf?: string;
  };
  customAttributes?: Record<string, unknown>;
}

/**
 * Property panel tab types
 */
export type PropertyPanelTab = 'general' | 'validation' | 'styling' | 'conditional';

/**
 * Property change event data
 */
export interface PropertyChangeEvent {
  elementId: string;
  property: keyof ElementProperties;
  value: unknown;
  tab: PropertyPanelTab;
}

/**
 * Property panel state
 */
export interface PropertyPanelState {
  selectedElementId: string | null;
  activeTab: PropertyPanelTab;
  isOpen: boolean;
  properties: Record<string, ElementProperties>;
}

/**
 * Form field types for dynamic property forms
 */
export type PropertyFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'range'
  | 'multiselect';

/**
 * Configuration for dynamic property form fields
 */
export interface PropertyFieldConfig {
  key: keyof ElementProperties;
  type: PropertyFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  validation?: z.ZodSchema;
  dependsOn?: string;
  showIf?: (properties: ElementProperties) => boolean;
}

/**
 * Property form section configuration
 */
export interface PropertyFormSection {
  title: string;
  description?: string;
  fields: PropertyFieldConfig[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Element type specific property configurations
 */
export interface ElementTypeConfig {
  type: string;
  name: string;
  icon?: string;
  sections: {
    general: PropertyFormSection[];
    validation: PropertyFormSection[];
    styling: PropertyFormSection[];
    conditional?: PropertyFormSection[];
  };
}

/**
 * Property panel event handlers
 */
export interface PropertyPanelHandlers {
  onPropertyChange: (event: PropertyChangeEvent) => void;
  onTabChange: (tab: PropertyPanelTab) => void;
  onElementSelect: (elementId: string) => void;
  onPanelToggle: (isOpen: boolean) => void;
  onPropertiesReset: (elementId: string) => void;
  onPropertiesCopy: (elementId: string) => void;
  onPropertiesPaste: (elementId: string, properties: Partial<ElementProperties>) => void;
}

/**
 * Result of property validation
 */
export interface PropertyValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * Pre-defined property templates for quick setup
 */
export interface PropertyTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  properties: Partial<ElementProperties>;
  tags?: string[];
  category?: string;
}

/**
 * Context value for the property panel provider
 */
export interface PropertyPanelContextValue {
  state: PropertyPanelState;
  handlers: PropertyPanelHandlers;
  templates: PropertyTemplate[];
  elementConfigs: Record<string, ElementTypeConfig>;
  updateProperty: (elementId: string, property: keyof ElementProperties, value: unknown) => void;
  getElementProperties: (elementId: string) => ElementProperties | undefined;
  validateProperties: (elementId: string) => PropertyValidationResult;
}

/**
 * Base configuration for a single property control
 */
export interface BasePropertyConfig {
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea' | 'range';
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  section: 'general' | 'validation' | 'styling' | 'logic';
}

/**
 * Text input property configuration
 */
export interface TextPropertyConfig extends BasePropertyConfig {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: string;
}

/**
 * Number input property configuration
 */
export interface NumberPropertyConfig extends BasePropertyConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

/**
 * Boolean (switch) property configuration
 */
export interface BooleanPropertyConfig extends BasePropertyConfig {
  type: 'boolean';
  defaultValue?: boolean;
}

/**
 * Select (dropdown) property configuration
 */
export interface SelectPropertyConfig extends BasePropertyConfig {
  type: 'select';
  options: Array<{ value: string; label: string; description?: string }>;
  multiple?: boolean;
  defaultValue?: string | string[];
}

/**
 * Color picker property configuration
 */
export interface ColorPropertyConfig extends BasePropertyConfig {
  type: 'color';
  format: 'hex' | 'rgb' | 'hsl';
  defaultValue?: string;
  presets?: string[];
}

/**
 * Textarea property configuration
 */
export interface TextareaPropertyConfig extends BasePropertyConfig {
  type: 'textarea';
  minLength?: number;
  maxLength?: number;
  rows?: number;
  defaultValue?: string;
}

/**
 * Range slider property configuration
 */
export interface RangePropertyConfig extends BasePropertyConfig {
  type: 'range';
  min: number;
  max: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
}

/**
 * Union type for all possible property configurations
 */
export type PropertyConfig =
  | TextPropertyConfig
  | NumberPropertyConfig
  | BooleanPropertyConfig
  | SelectPropertyConfig
  | ColorPropertyConfig
  | TextareaPropertyConfig
  | RangePropertyConfig;

/**
 * Property schema definition for each element type
 */
export interface ElementPropertySchema {
  elementType: FormElementType;
  properties: Record<string, PropertyConfig>;
  sections: PropertySection[];
  validation?: z.ZodSchema;
}

/**
 * UI section within the property panel
 */
export interface PropertySection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  collapsed?: boolean;
  properties: string[];
}

/**
 * Custom validation function definition
 */
export interface CustomValidation {
  id: string;
  name: string;
  description: string;
  function: string; // JavaScript function code
  errorMessage: string;
}

/**
 * Conditional logic configuration for an element
 */
export interface ConditionalLogic {
  id: string;
  elementId: string;
  conditions: LogicCondition[];
  actions: LogicAction[];
  operator: 'AND' | 'OR';
  enabled: boolean;
}

/**
 * A single condition within a conditional logic rule
 */
export interface LogicCondition {
  id: string;
  sourceElementId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty';
  value: string | number | boolean;
}

/**
 * An action to be performed if a conditional logic rule is met
 */
export interface LogicAction {
  id: string;
  type:
    | 'show'
    | 'hide'
    | 'enable'
    | 'disable'
    | 'require'
    | 'optional'
    | 'set_value'
    | 'clear_value';
  value?: string | number | boolean;
}

/**
 * Represents a validation error for a property
 */
export interface PropertyValidationError {
  property: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * Represents a validation warning for a property
 */
export interface PropertyValidationWarning {
  property: string;
  message: string;
  code: string;
  suggestion?: string;
}

/**
 * Configuration for the property panel itself
 */
export interface PropertyPanelConfig {
  width: number;
  collapsible: boolean;
  position: 'left' | 'right';
  themes: PropertyPanelTheme[];
  features: {
    bulkEdit: boolean;
    templates: boolean;
    importExport: boolean;
    realTimePreview: boolean;
    undoRedo: boolean;
  };
}

/**
 * Theme definition for the property panel
 */
export interface PropertyPanelTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    border: string;
    accent: string;
  };
}

/**
 * Configuration for property inheritance between elements
 */
export interface PropertyInheritance {
  parentElementId?: string;
  inheritedProperties: string[];
  overriddenProperties: string[];
  allowOverride: boolean;
}

/**
 * Configuration for the property search feature
 */
export interface PropertySearchConfig {
  enabled: boolean;
  searchableFields: string[];
  fuzzySearch: boolean;
  resultLimit: number;
}

// Type guard functions

export function isTextProperty(config: PropertyConfig): config is TextPropertyConfig {
  return config.type === 'text';
}

export function isNumberProperty(config: PropertyConfig): config is NumberPropertyConfig {
  return config.type === 'number';
}

export function isBooleanProperty(config: PropertyConfig): config is BooleanPropertyConfig {
  return config.type === 'boolean';
}

export function isSelectProperty(config: PropertyConfig): config is SelectPropertyConfig {
  return config.type === 'select';
}

export function isColorProperty(config: PropertyConfig): config is ColorPropertyConfig {
  return config.type === 'color';
}

export function isTextareaProperty(config: PropertyConfig): config is TextareaPropertyConfig {
  return config.type === 'textarea';
}

export function isRangeProperty(config: PropertyConfig): config is RangePropertyConfig {
  return config.type === 'range';
}
