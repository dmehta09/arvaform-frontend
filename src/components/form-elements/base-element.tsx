'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BaseElementProps } from '@/types/element-props.types';
import { AlertCircle, Info } from 'lucide-react';
import React, { forwardRef, ReactNode } from 'react';

/**
 * Base element wrapper that provides common functionality for all form elements
 * Handles labels, errors, helper text, accessibility, and styling
 */
export interface BaseElementWrapperProps {
  /** Element label */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Custom class names */
  className?: string;
  /** Unique identifier for accessibility */
  id: string;
  /** Children elements */
  children: ReactNode;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Display mode */
  mode?: 'builder' | 'preview' | 'live';
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Props that are injected into the child element by BaseElementWrapper
 */
interface InjectedProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  disabled?: boolean;
}

/**
 * Base element wrapper component
 * Provides consistent layout and accessibility for all form elements
 */
export const BaseElementWrapper = forwardRef<HTMLDivElement, BaseElementWrapperProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      className,
      id,
      children,
      disabled = false,
      mode = 'live',
      'data-testid': dataTestId,
      ...props
    },
    ref,
  ) => {
    const hasError = Boolean(error);
    const helperId = helperText ? `${id}-helper` : undefined;
    const errorId = hasError ? `${id}-error` : undefined;
    const descriptionId = [helperId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          disabled && 'opacity-50 cursor-not-allowed',
          mode === 'builder' &&
            'border border-dashed border-gray-300 p-2 rounded-md hover:border-gray-400 transition-colors',
          className,
        )}
        data-testid={dataTestId}
        {...props}>
        {/* Label */}
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            hasError && 'text-destructive',
            disabled && 'cursor-not-allowed opacity-70',
          )}>
          {label}
          {required && (
            <span
              className="text-destructive ml-1"
              aria-label="required"
              title="This field is required">
              *
            </span>
          )}
        </Label>

        {/* Form element */}
        <div className="relative">
          {React.isValidElement<InjectedProps>(children)
            ? React.cloneElement(children, {
                id,
                'aria-describedby': descriptionId,
                'aria-invalid': hasError,
                'aria-required': required,
                disabled,
              })
            : children}
        </div>

        {/* Helper text */}
        {helperText && (
          <div id={helperId} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{helperText}</span>
          </div>
        )}

        {/* Error message */}
        {hasError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription id={errorId} role="alert" aria-live="polite">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Builder mode indicators */}
        {mode === 'builder' && (
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-bl-md">
            {label || 'Untitled Element'}
          </div>
        )}
      </div>
    );
  },
);

BaseElementWrapper.displayName = 'BaseElementWrapper';

/**
 * Hook for common element functionality
 * Provides standardized props and handlers for form elements
 */
export function useBaseElement<T extends BaseElementProps>(props: T) {
  const {
    id,
    label,
    placeholder,
    required = false,
    disabled = false,
    error,
    helperText,
    mode = 'live',
    className,
    style,
    onChange,
    onBlur,
    onFocus,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  // Generate accessible descriptions
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const generatedDescribedBy =
    [ariaDescribedBy, helperId, errorId].filter(Boolean).join(' ') || undefined;

  // Base props for all form elements
  const baseProps = {
    id,
    placeholder,
    disabled,
    className: cn(
      'transition-colors',
      error && 'border-destructive focus:border-destructive',
      disabled && 'cursor-not-allowed opacity-50',
      className,
    ),
    style,
    'aria-label': ariaLabel || label,
    'aria-describedby': generatedDescribedBy,
    'aria-invalid': Boolean(error),
    'aria-required': required,
    'data-testid': dataTestId,
    onChange,
    onBlur,
    onFocus,
  };

  // Wrapper props for the container
  const wrapperProps = {
    label,
    required,
    error,
    helperText,
    id,
    disabled,
    mode,
    'data-testid': dataTestId ? `${dataTestId}-wrapper` : undefined,
  };

  return {
    baseProps,
    wrapperProps,
    hasError: Boolean(error),
    isDisabled: disabled,
    isRequired: required,
    ...rest,
  };
}

/**
 * Higher-order component for creating form elements with consistent behavior
 */
export function withBaseElement<P extends BaseElementProps>(Component: React.ComponentType<P>) {
  const WrappedComponent = forwardRef<HTMLElement, P>((props, ref) => {
    const { wrapperProps, ...elementProps } = useBaseElement(props);

    return (
      <BaseElementWrapper {...wrapperProps}>
        <Component {...(elementProps as unknown as P)} ref={ref} />
      </BaseElementWrapper>
    );
  });

  WrappedComponent.displayName = `withBaseElement(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Utility function for creating consistent field IDs
 */
export function createFieldId(prefix: string, suffix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const base = `${prefix}-${timestamp}-${random}`;
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * Utility function for handling form element errors
 */
export function formatElementError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An error occurred';
}

/**
 * Utility function for generating accessibility announcements
 */
export function createAriaAnnouncement(
  elementType: string,
  label: string,
  required: boolean,
  error?: string,
): string {
  const parts = [elementType, label];

  if (required) {
    parts.push('required');
  }

  if (error) {
    parts.push(`error: ${error}`);
  }

  return parts.join(', ');
}
