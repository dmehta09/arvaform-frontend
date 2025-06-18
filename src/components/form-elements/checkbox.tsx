'use client';

import { Checkbox as UICheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CheckboxProps, OptionDefinition } from '@/types/element-props.types';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { BaseElementWrapper, useBaseElement } from './base-element';

/**
 * Single Checkbox Component
 */
const SingleCheckbox = forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id: string;
  }
>(({ checked = false, indeterminate = false, onCheckedChange, disabled, className, id }, ref) => (
  <UICheckbox
    ref={ref}
    id={id}
    checked={indeterminate ? 'indeterminate' : checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    className={cn('h-4 w-4', className)}
  />
));

SingleCheckbox.displayName = 'SingleCheckbox';

/**
 * Checkbox Group Component
 */
const CheckboxGroup = forwardRef<
  HTMLDivElement,
  {
    options: OptionDefinition[];
    value?: string[];
    onChange?: (value: string[]) => void;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
    columns?: number;
    showDescriptions?: boolean;
    className?: string;
    id: string;
    minSelections?: number;
    maxSelections?: number;
  }
>(
  (
    {
      options,
      value = [],
      onChange,
      disabled,
      orientation = 'vertical',
      columns,
      showDescriptions = false,
      className,
      id,
      minSelections,
      maxSelections,
    },
    ref,
  ) => {
    const handleOptionChange = useCallback(
      (optionValue: string, checked: boolean) => {
        if (disabled) return;

        let newValue: string[];
        if (checked) {
          // Adding a selection
          if (maxSelections && value.length >= maxSelections) {
            return; // Don't allow more selections than max
          }
          newValue = [...value, optionValue];
        } else {
          // Removing a selection
          newValue = value.filter((v) => v !== optionValue);
        }

        onChange?.(newValue);
      },
      [value, onChange, disabled, maxSelections],
    );

    const gridClassName = useMemo(() => {
      if (columns && columns > 1) {
        return `grid grid-cols-${columns} gap-4`;
      }
      return orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3';
    }, [orientation, columns]);

    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        role="group"
        aria-labelledby={`${id}-label`}>
        <div className={gridClassName}>
          {options.map((option, index) => {
            const optionId = `${id}-option-${index}`;
            const isChecked = value.includes(option.value);
            const isDisabled = disabled || option.disabled;

            return (
              <div key={option.value} className="flex items-start space-x-2">
                <UICheckbox
                  id={optionId}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleOptionChange(option.value, checked as boolean)
                  }
                  disabled={isDisabled}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={optionId}
                    className={cn(
                      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                    )}>
                    {option.label}
                  </label>
                  {showDescriptions && option.description && (
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection count indicator */}
        {(minSelections || maxSelections) && (
          <div className="text-xs text-muted-foreground">
            {value.length} selected
            {minSelections && ` (minimum: ${minSelections})`}
            {maxSelections && ` (maximum: ${maxSelections})`}
          </div>
        )}
      </div>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';

/**
 * Main Checkbox Component
 * Supports both single checkbox and checkbox groups
 */
export const CheckboxComponent = forwardRef<HTMLElement, CheckboxProps>((props, ref) => {
  const {
    isGroup = false,
    options = [],
    minSelections,
    maxSelections,
    orientation = 'vertical',
    columns,
    showDescriptions = false,
    indeterminate = false,
    value: controlledValue,
    onChange,
    ...baseProps
  } = props;

  const { baseProps: elementProps, wrapperProps, isDisabled } = useBaseElement(baseProps);

  // Internal state for uncontrolled components
  const [internalSingleValue, setInternalSingleValue] = useState<boolean>(false);
  const [internalGroupValue, setInternalGroupValue] = useState<string[]>([]);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;

  // Handle single checkbox changes
  const handleSingleChange = useCallback(
    (checked: boolean) => {
      if (!isControlled) {
        setInternalSingleValue(checked);
      }
      onChange?.(checked);
    },
    [isControlled, onChange],
  );

  // Handle checkbox group changes
  const handleGroupChange = useCallback(
    (selectedValues: string[]) => {
      if (!isControlled) {
        setInternalGroupValue(selectedValues);
      }
      onChange?.(selectedValues);
    },
    [isControlled, onChange],
  );

  // Validation for checkbox groups
  const validationError = useMemo(() => {
    if (!isGroup || !Array.isArray(controlledValue || internalGroupValue)) return undefined;

    const currentValue = isControlled ? (controlledValue as string[]) : internalGroupValue;

    if (minSelections && currentValue.length < minSelections) {
      return `Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`;
    }

    if (maxSelections && currentValue.length > maxSelections) {
      return `Please select no more than ${maxSelections} option${maxSelections > 1 ? 's' : ''}`;
    }

    return undefined;
  }, [isGroup, controlledValue, internalGroupValue, minSelections, maxSelections, isControlled]);

  // Add validation error to wrapper props
  const finalWrapperProps = {
    ...wrapperProps,
    error: wrapperProps.error || validationError,
  };

  if (isGroup && options.length > 0) {
    return (
      <BaseElementWrapper {...finalWrapperProps}>
        <CheckboxGroup
          ref={ref as React.Ref<HTMLDivElement>}
          id={elementProps.id}
          options={options}
          value={isControlled ? (controlledValue as string[]) : internalGroupValue}
          onChange={handleGroupChange}
          disabled={isDisabled}
          orientation={orientation}
          columns={columns}
          showDescriptions={showDescriptions}
          minSelections={minSelections}
          maxSelections={maxSelections}
          className={elementProps.className}
        />
      </BaseElementWrapper>
    );
  }

  // Single checkbox
  return (
    <BaseElementWrapper {...finalWrapperProps}>
      <div className="flex items-center space-x-2">
        <SingleCheckbox
          ref={ref as React.Ref<HTMLButtonElement>}
          id={elementProps.id}
          checked={isControlled ? (controlledValue as boolean) : internalSingleValue}
          indeterminate={indeterminate}
          onCheckedChange={handleSingleChange}
          disabled={isDisabled}
          className={elementProps.className}
        />
        <label
          htmlFor={elementProps.id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            isDisabled && 'opacity-50 cursor-not-allowed',
          )}>
          {wrapperProps.label}
        </label>
      </div>
    </BaseElementWrapper>
  );
});

CheckboxComponent.displayName = 'CheckboxComponent';

export default CheckboxComponent;
