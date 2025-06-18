'use client';

import { cn } from '@/lib/utils';
import { FormElement, FormElementType } from '@/types/form-builder.types';
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

/**
 * Props for the FormBuilderDragOverlay component
 */
interface FormBuilderDragOverlayProps {
  activeElement?: FormElement | null;
  activeElementType?: FormElementType | null;
  activeSource?: 'library' | 'canvas';
}

/**
 * Drag overlay component that provides visual feedback during drag operations
 * Displays a ghost image of the dragged element with smooth animations
 */
export function FormBuilderDragOverlay({
  activeElement,
  activeElementType,
  activeSource,
}: FormBuilderDragOverlayProps) {
  // Custom drop animation with enhanced visual effects
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DragOverlay dropAnimation={dropAnimation} className="drag-overlay">
      {(activeElement || activeElementType) && (
        <DragPreview
          element={activeElement}
          elementType={activeElementType}
          source={activeSource}
        />
      )}
    </DragOverlay>
  );
}

/**
 * Props for the DragPreview component
 */
interface DragPreviewProps {
  element?: FormElement | null;
  elementType?: FormElementType | null;
  source?: 'library' | 'canvas';
}

/**
 * Drag preview component that renders the dragged element
 */
function DragPreview({ element, elementType, source }: DragPreviewProps) {
  // Use element data if available, otherwise use element type
  const displayElement = element || (elementType ? createPreviewElement(elementType) : null);

  if (!displayElement) return null;

  return (
    <div
      className={cn(
        'drag-preview',
        'bg-white border-2 border-blue-500 rounded-lg shadow-lg',
        'transform-gpu transition-transform duration-200',
        'pointer-events-none select-none',
        'max-w-xs', // Limit width for better dragging experience
        source === 'library' ? 'border-green-500' : 'border-blue-500',
      )}
      style={{
        transform: CSS.Transform.toString({
          x: 0,
          y: 0,
          scaleX: 0.95, // Slightly smaller during drag
          scaleY: 0.95,
        }),
      }}>
      <div className="p-4">
        {/* Element preview content */}
        <ElementPreview element={displayElement} />

        {/* Source indicator */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {source === 'library' ? 'From Library' : 'Moving Element'}
          </div>
          <div
            className={cn(
              'px-2 py-1 rounded text-xs font-medium',
              source === 'library' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800',
            )}>
            {displayElement.type}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Create a preview element from element type
 */
function createPreviewElement(elementType: FormElementType): FormElement {
  const elementConfigs: Record<FormElementType, Partial<FormElement>> = {
    text: {
      label: 'Text Input',
      placeholder: 'Enter text...',
    },
    email: {
      label: 'Email Address',
      placeholder: 'Enter email address...',
    },
    phone: {
      label: 'Phone Number',
      placeholder: 'Enter phone number...',
    },
    number: {
      label: 'Number',
      placeholder: 'Enter number...',
    },
    date: {
      label: 'Date',
      placeholder: 'Select date...',
    },
    textarea: {
      label: 'Text Area',
      placeholder: 'Enter detailed text...',
    },
    dropdown: {
      label: 'Dropdown',
      placeholder: 'Select option...',
    },
    radio: {
      label: 'Radio Group',
      placeholder: 'Select one option...',
    },
    checkbox: {
      label: 'Checkbox',
      placeholder: 'Check options...',
    },
    section: {
      label: 'Section Header',
      placeholder: 'Section title...',
    },
    heading: {
      label: 'Heading',
      placeholder: 'Enter heading...',
    },
    divider: {
      label: 'Divider',
      placeholder: 'Visual separator',
    },
  };

  const config = elementConfigs[elementType] || {};

  return {
    id: 'preview',
    type: elementType,
    label: config.label || 'Form Element',
    placeholder: config.placeholder || 'Enter value...',
    required: false,
    position: { x: 0, y: 0, order: 0 },
    validation: [],
    styling: {},
    properties: {},
    ...config,
  };
}

/**
 * Element preview renderer
 */
interface ElementPreviewProps {
  element: FormElement;
}

function ElementPreview({ element }: ElementPreviewProps) {
  const renderPreview = () => {
    switch (element.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={element.type === 'number' ? 'number' : 'text'}
              placeholder={element.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              readOnly
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              readOnly
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              placeholder={element.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              readOnly
            />
          </div>
        );

      case 'dropdown':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>{element.placeholder}</option>
            </select>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-1">
              <label className="flex items-center text-sm">
                <input type="radio" name="preview" className="mr-2" />
                Option 1
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="preview" className="mr-2" />
                Option 2
              </label>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-1">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Option 1
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" />
                Option 2
              </label>
            </div>
          </div>
        );

      case 'section':
        return (
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900">{element.label}</h3>
            <p className="text-sm text-gray-600">Section content goes here</p>
          </div>
        );

      case 'heading':
        return <h2 className="text-xl font-bold text-gray-900">{element.label}</h2>;

      case 'divider':
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-500 text-center">{element.label}</div>
            <hr className="border-gray-300" />
          </div>
        );

      default:
        return (
          <div className="p-2 bg-gray-100 border border-gray-300 rounded text-center text-sm text-gray-600">
            {element.label || element.type}
          </div>
        );
    }
  };

  return <div className="element-preview">{renderPreview()}</div>;
}

/**
 * Hook for managing drag overlay state
 */
export function useDragOverlay() {
  const [activeElement, setActiveElement] = React.useState<FormElement | null>(null);
  const [activeElementType, setActiveElementType] = React.useState<FormElementType | null>(null);
  const [activeSource, setActiveSource] = React.useState<'library' | 'canvas' | undefined>();

  const setDraggedElement = React.useCallback(
    (element: FormElement | null, source?: 'library' | 'canvas') => {
      setActiveElement(element);
      setActiveElementType(element?.type || null);
      setActiveSource(source);
    },
    [],
  );

  const setDraggedElementType = React.useCallback(
    (elementType: FormElementType | null, source?: 'library' | 'canvas') => {
      setActiveElement(null);
      setActiveElementType(elementType);
      setActiveSource(source);
    },
    [],
  );

  const clearDraggedElement = React.useCallback(() => {
    setActiveElement(null);
    setActiveElementType(null);
    setActiveSource(undefined);
  }, []);

  return {
    activeElement,
    activeElementType,
    activeSource,
    setDraggedElement,
    setDraggedElementType,
    clearDraggedElement,
  };
}
