'use client';

import { cn } from '@/lib/utils';
import { FormElement } from '@/types/form-builder.types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback, useMemo, useState } from 'react';

/**
 * Props for the ElementContainer component
 */
interface ElementContainerProps {
  element: FormElement;
  isSelected?: boolean;
  className?: string;
  onSelect?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  children?: React.ReactNode;
}

/**
 * ElementContainer wraps individual form elements with selection,
 * manipulation controls, and drag capabilities
 */
export function ElementContainer({
  element,
  isSelected = false,
  className = '',
  onSelect,
  onDelete,
  onDuplicate,
  children,
}: ElementContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Setup draggable functionality
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: {
      type: 'element',
      element,
    },
  });

  // Calculate transform styles
  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  /**
   * Handle element selection
   */
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect],
  );

  /**
   * Handle element deletion
   */
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.();
    },
    [onDelete],
  );

  /**
   * Handle element duplication
   */
  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDuplicate?.();
    },
    [onDuplicate],
  );

  /**
   * Handle mouse enter for hover effects
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (isSelected) {
      setShowControls(true);
    }
  }, [isSelected]);

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowControls(false);
  }, []);

  // Calculate container classes based on state
  const containerClasses = useMemo(
    () =>
      cn(
        'relative group',
        'transition-all duration-200 ease-in-out',
        'cursor-pointer',
        // Selection styles
        isSelected && ['ring-2 ring-blue-500 ring-offset-2', 'bg-blue-50/50'],
        // Hover styles
        isHovered && !isSelected && ['ring-1 ring-gray-300 ring-offset-1', 'bg-gray-50/30'],
        // Dragging styles
        isDragging && ['opacity-50', 'scale-105', 'shadow-lg', 'z-50'],
        className,
      ),
    [isSelected, isHovered, isDragging, className],
  );

  // Calculate element classes
  const elementClasses = useMemo(
    () =>
      cn(
        'relative p-3 rounded-lg',
        'border border-gray-200',
        'bg-white',
        'transition-all duration-200',
        // Interactive states
        'hover:shadow-sm',
        isSelected && 'shadow-md',
        isDragging && 'shadow-xl',
      ),
    [isSelected, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      className={containerClasses}
      style={style}
      data-element-id={element.id}
      data-element-type={element.type}
      data-draggable="true"
      onClick={handleSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}>
      {/* Element content */}
      <div className={elementClasses}>
        {/* Element type indicator */}
        <div className="absolute top-1 left-1">
          <div className="text-xs font-mono text-gray-400 bg-gray-100 px-1 rounded">
            {element.type}
          </div>
        </div>

        {/* Drag handle */}
        <div
          className={cn(
            'absolute top-1 right-1 opacity-0 transition-opacity',
            'cursor-grab active:cursor-grabbing',
            (isHovered || isSelected) && 'opacity-100',
          )}
          {...listeners}>
          <div className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </div>
        </div>

        {/* Element preview or children */}
        <div className="mt-6">{children || <ElementPreview element={element} />}</div>

        {/* Selection controls */}
        {showControls && isSelected && (
          <ElementControls onDelete={handleDelete} onDuplicate={handleDuplicate} />
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
      )}
    </div>
  );
}

/**
 * Element preview component for displaying element content
 */
interface ElementPreviewProps {
  element: FormElement;
}

function ElementPreview({ element }: ElementPreviewProps) {
  const getPreviewContent = () => {
    switch (element.type) {
      case 'text':
      case 'email':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{element.label}</label>
            <input
              type={element.type}
              placeholder={element.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{element.label}</label>
            <textarea
              placeholder={element.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>
        );

      case 'dropdown':
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{element.label}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled>
              <option>{element.placeholder || 'Select an option'}</option>
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-gray-300" disabled />
            <label className="text-sm font-medium text-gray-700">{element.label}</label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{element.label}</label>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <input type="radio" name={`preview-${element.id}`} disabled />
                <span className="text-sm text-gray-600">Option 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" name={`preview-${element.id}`} disabled />
                <span className="text-sm text-gray-600">Option 2</span>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-sm text-gray-500 italic">{element.type} field preview</div>;
    }
  };

  return <div className="pointer-events-none">{getPreviewContent()}</div>;
}

/**
 * Element controls for manipulation actions
 */
interface ElementControlsProps {
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
}

function ElementControls({ onDelete, onDuplicate }: ElementControlsProps) {
  return (
    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
        {/* Duplicate button */}
        <button
          onClick={onDuplicate}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Duplicate element">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete element">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
