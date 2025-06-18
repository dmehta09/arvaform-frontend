'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TextInputProps } from '@/types/element-props.types';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { BaseElementWrapper, useBaseElement } from './base-element';

/**
 * Text Input Component
 * Supports various input types, validation, character count, and accessibility features
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const {
    inputType = 'text',
    minLength,
    maxLength,
    pattern,
    showCharacterCount = false,
    autoComplete,
    autoFocus = false,
    value: controlledValue,
    onChange,
    onBlur,
    onFocus,
    ...baseProps
  } = props;

  const { baseProps: elementProps, wrapperProps, hasError, isDisabled } = useBaseElement(baseProps);

  // Internal state for uncontrolled component
  const [internalValue, setInternalValue] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Character count calculation
  const characterCount = useMemo(() => {
    if (typeof value !== 'string') return 0;
    return value.length;
  }, [value]);

  // Validation state
  const isOverLimit = maxLength ? characterCount > maxLength : false;
  const isUnderLimit = minLength ? characterCount < minLength : false;

  // Handle value changes
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Call external onChange if provided
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Handle password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Handle clear button
  const handleClear = useCallback(() => {
    const newValue = '';

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  }, [isControlled, onChange]);

  // Determine actual input type
  const actualInputType = useMemo(() => {
    if (inputType === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return inputType;
  }, [inputType, showPassword]);

  // Determine if clear button should be shown
  const showClearButton = useMemo(() => {
    return (
      (inputType === 'search' || inputType === 'text') && value && value.length > 0 && !isDisabled
    );
  }, [inputType, value, isDisabled]);

  return (
    <BaseElementWrapper {...wrapperProps}>
      <div className="relative">
        {/* Main input field */}
        <Input
          {...elementProps}
          ref={ref}
          type={actualInputType}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            elementProps.className,
            // Add padding for icons
            (inputType === 'password' || showClearButton) && 'pr-10',
            inputType === 'search' && 'pl-10',
            // Visual states
            isOverLimit && 'border-destructive focus:border-destructive',
            isFocused && 'ring-2 ring-ring ring-offset-2',
            // Character count spacing
            showCharacterCount && 'pb-6',
          )}
          aria-describedby={cn(
            elementProps['aria-describedby'],
            showCharacterCount && `${elementProps.id}-count`,
          )}
        />

        {/* Search icon */}
        {inputType === 'search' && (
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Password visibility toggle */}
        {inputType === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            disabled={isDisabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}>
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}

        {/* Clear button */}
        {showClearButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={handleClear}
            disabled={isDisabled}
            aria-label="Clear input"
            tabIndex={-1}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        {/* Character count */}
        {showCharacterCount && (
          <div
            id={`${elementProps.id}-count`}
            className={cn(
              'absolute bottom-1 right-2 text-xs',
              isOverLimit ? 'text-destructive' : 'text-muted-foreground',
            )}
            aria-live="polite"
            aria-atomic="true">
            {characterCount}
            {maxLength && (
              <>
                <span aria-hidden="true">/</span>
                <span className="sr-only"> of </span>
                {maxLength}
              </>
            )}
          </div>
        )}
      </div>

      {/* Additional validation messages */}
      {(isOverLimit || isUnderLimit) && !hasError && (
        <div className="text-sm text-muted-foreground mt-1">
          {isOverLimit && `Too long. Maximum ${maxLength} characters allowed.`}
          {isUnderLimit && `Too short. Minimum ${minLength} characters required.`}
        </div>
      )}
    </BaseElementWrapper>
  );
});

TextInput.displayName = 'TextInput';

// Default values are handled in the component destructuring;

export default TextInput;
