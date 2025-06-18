'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EmailInputProps } from '@/types/element-props.types';
import { AlertCircle, Check } from 'lucide-react';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { useBaseElement } from './base-element';

/**
 * Email Input Component
 * Provides email validation, domain filtering, and accessibility features
 */
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>((props, ref) => {
  const {
    allowedDomains,
    blockedDomains,
    validateOnBlur = true,
    autoComplete = 'email',
    value: controlledValue,
    onChange,
    onBlur,
    onFocus,
    ...baseProps
  } = props;

  const { baseProps: elementProps, wrapperProps, hasError, isDisabled } = useBaseElement(baseProps);

  // Internal state
  const [internalValue, setInternalValue] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Email validation regex
  const emailRegex = useMemo(
    () =>
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    [],
  );

  // Validate email format
  const validateEmail = useCallback(
    (email: string): string | null => {
      if (!email) return null;

      // Basic format validation
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
      }

      // Extract domain
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) return 'Invalid email format';

      // Check blocked domains
      if (blockedDomains?.some((blocked) => domain.includes(blocked.toLowerCase()))) {
        return `Email addresses from ${domain} are not allowed`;
      }

      // Check allowed domains
      if (
        allowedDomains?.length &&
        !allowedDomains.some((allowed) => domain.includes(allowed.toLowerCase()))
      ) {
        return `Email addresses must be from: ${allowedDomains.join(', ')}`;
      }

      return null;
    },
    [emailRegex, allowedDomains, blockedDomains],
  );

  // Handle value changes
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Clear validation error on change
      setValidationError('');

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

  // Handle blur events
  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      const validationResult = validateEmail(value);
      if (validationResult) {
        setValidationError(validationResult);
      }
    }
    onBlur?.();
  }, [validateOnBlur, value, validateEmail, onBlur]);

  const showValidationIcon = value && value.length > 0 && !isFocused;

  return (
    <div className={cn(wrapperProps)}>
      <Input
        ref={ref}
        {...elementProps}
        {...wrapperProps}
        type="email"
        autoComplete={autoComplete}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'w-full',
          'border-input',
          'bg-background',
          'text-sm',
          'ring-offset-background',
          'focus:ring-ring',
          'focus:border-primary',
          {
            'border-destructive': hasError,
            'text-destructive': hasError,
          },
          {
            'text-muted-foreground': isDisabled,
          },
          showValidationIcon && 'ring-1 ring-destructive',
        )}
        placeholder="name@example.com"
        disabled={isDisabled}
      />
      {showValidationIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4 text-primary" aria-hidden="true" />
          )}
        </div>
      )}
      {validationError && <p className="text-xs text-destructive">{validationError}</p>}
    </div>
  );
});

EmailInput.displayName = 'EmailInput';
