'use client';

/**
 * ElementRenderer - Renders individual form elements in preview mode
 * Supports interactive testing and validation display
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormElement } from '@/types/form-builder.types';
import { getElementAccessibilityAttributes } from '@/utils/preview-helpers';
import { useCallback, useState } from 'react';

interface ElementRendererProps {
  element: FormElement;
  value?: unknown;
  error?: string;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  mode?: 'view' | 'interact';
  className?: string;
}

/**
 * ElementRenderer component that renders form elements in preview mode
 */
export function ElementRenderer({
  element,
  value,
  error,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  mode = 'view',
  className,
}: ElementRendererProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Get accessibility attributes for the element
  const accessibilityAttrs = getElementAccessibilityAttributes(element);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Handle value changes
  const handleChange = useCallback(
    (newValue: unknown) => {
      if (mode === 'interact' && !disabled) {
        onChange?.(newValue);
      }
    },
    [mode, disabled, onChange],
  );

  // Render element label
  const renderLabel = () => {
    if (!element.label) return null;

    return (
      <Label
        htmlFor={`element-${element.id}`}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          element.required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
        )}>
        {element.label}
      </Label>
    );
  };

  // Render error message
  const renderError = () => {
    if (!error) return null;

    return (
      <p className="text-sm text-red-600 mt-1" role="alert">
        {error}
      </p>
    );
  };

  // Render help text if available
  const renderHelpText = () => {
    const helpText = element.properties?.helpText as string;
    if (!helpText) return null;

    return <p className="text-sm text-gray-600 mt-1">{helpText}</p>;
  };

  // Get common input props
  const getCommonProps = () => ({
    id: `element-${element.id}`,
    disabled: disabled || mode === 'view',
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: cn(
      'transition-all duration-200',
      isFocused && 'ring-2 ring-blue-500 ring-opacity-20',
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      mode === 'view' && 'cursor-default bg-gray-50',
    ),
    ...accessibilityAttrs,
  });

  // Render the actual form element based on type
  const renderFormElement = () => {
    const stringValue = value ? String(value) : '';

    switch (element.type) {
      case 'text':
        return (
          <Input
            {...getCommonProps()}
            type="text"
            value={stringValue}
            placeholder={element.placeholder}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'email':
        return (
          <Input
            {...getCommonProps()}
            type="email"
            value={stringValue}
            placeholder={element.placeholder || 'Enter your email'}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'phone':
        return (
          <Input
            {...getCommonProps()}
            type="tel"
            value={stringValue}
            placeholder={element.placeholder || 'Enter your phone number'}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            {...getCommonProps()}
            type="number"
            value={stringValue}
            placeholder={element.placeholder}
            onChange={(e) => handleChange(Number(e.target.value) || 0)}
          />
        );

      case 'date':
        return (
          <Input
            {...getCommonProps()}
            type="date"
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...getCommonProps()}
            value={stringValue}
            placeholder={element.placeholder}
            onChange={(e) => handleChange(e.target.value)}
            rows={(element.properties?.rows as number) || 4}
          />
        );

      case 'dropdown': {
        const options = (element.properties?.options as string[]) || [];
        return (
          <Select
            disabled={disabled || mode === 'view'}
            value={stringValue}
            onValueChange={handleChange}>
            <SelectTrigger {...getCommonProps()}>
              <SelectValue placeholder={element.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'radio': {
        const options = (element.properties?.options as string[]) || [];
        return (
          <RadioGroup
            value={stringValue}
            onValueChange={handleChange}
            disabled={disabled || mode === 'view'}
            className="flex flex-col space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${element.id}-${index}`}
                  className={cn(
                    error && 'border-red-500',
                    isFocused && 'ring-2 ring-blue-500 ring-opacity-20',
                  )}
                />
                <Label
                  htmlFor={`${element.id}-${index}`}
                  className="text-sm font-normal cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      }

      case 'checkbox': {
        const isChecked = Boolean(value);
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`element-${element.id}`}
              checked={isChecked}
              onCheckedChange={handleChange}
              disabled={disabled || mode === 'view'}
              className={cn(
                error && 'border-red-500',
                isFocused && 'ring-2 ring-blue-500 ring-opacity-20',
              )}
            />
            <Label htmlFor={`element-${element.id}`} className="text-sm font-normal cursor-pointer">
              {(element.properties?.checkboxLabel as string) || element.label}
            </Label>
          </div>
        );
      }

      case 'heading':
        return (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{element.label}</h3>
            {element.properties?.description ? (
              <p className="text-sm text-gray-600">{String(element.properties.description)}</p>
            ) : null}
          </div>
        );

      case 'section':
        return (
          <div className="space-y-2">
            <h4 className="text-base font-medium text-gray-800">{element.label}</h4>
            {element.properties?.description ? (
              <p className="text-sm text-gray-600">{String(element.properties.description)}</p>
            ) : null}
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            {element.label && (
              <h5 className="text-sm font-medium text-gray-700 text-center">{element.label}</h5>
            )}
            <hr className="border-gray-200" />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-600">Unsupported element type: {element.type}</p>
          </div>
        );
    }
  };

  // For non-input elements (heading, section, divider), render them directly
  if (['heading', 'section', 'divider'].includes(element.type)) {
    return <div className={cn('space-y-2', className)}>{renderFormElement()}</div>;
  }

  // For input elements, render with label, input, and error
  return (
    <div className={cn('space-y-2', className)}>
      {renderLabel()}
      {renderFormElement()}
      {renderHelpText()}
      {renderError()}
    </div>
  );
}
