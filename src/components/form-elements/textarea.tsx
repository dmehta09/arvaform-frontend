'use client';

import { Textarea as UITextarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { TextareaProps } from '@/types/element-props.types';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { BaseElementWrapper, useBaseElement } from './base-element';

/**
 * Textarea Component
 * Supports auto-resize, character count, and word count features
 */
export const TextareaComponent = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    rows = 3,
    maxRows,
    resize = 'vertical',
    minLength,
    maxLength,
    wordCountDisplay = false,
    autoResize = false,
    value: controlledValue,
    onChange,
    onBlur,
    onFocus,
    ...baseProps
  } = props;

  const { baseProps: elementProps, wrapperProps, hasError } = useBaseElement(baseProps);

  // Internal state
  const [internalValue, setInternalValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? (controlledValue as string) : internalValue;

  // Auto-resize functionality
  const adjustHeight = useCallback(() => {
    if (!autoResize || !textareaRef.current) return;

    const textarea = textareaRef.current;
    textarea.style.height = 'auto';

    const newHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;
    const maxHeightInRows = maxRows ? maxRows * lineHeight : Infinity;

    textarea.style.height = `${Math.min(newHeight, maxHeightInRows)}px`;
  }, [autoResize, maxRows]);

  // Handle value changes
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;

      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Call external onChange
      onChange?.(newValue);

      // Adjust height after state update
      requestAnimationFrame(() => adjustHeight());
    },
    [isControlled, onChange, adjustHeight],
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

  // Character and word counts
  const characterCount = value?.length || 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  // Validation states
  const isOverCharLimit = maxLength ? characterCount > maxLength : false;
  const isUnderCharLimit = minLength ? characterCount < minLength : false;

  // Auto-resize on mount and value changes
  useEffect(() => {
    if (autoResize) {
      adjustHeight();
    }
  }, [value, adjustHeight, autoResize]);

  return (
    <BaseElementWrapper {...wrapperProps}>
      <div className="relative">
        <UITextarea
          {...elementProps}
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={rows}
          minLength={minLength}
          maxLength={maxLength}
          className={cn(
            elementProps.className,
            resize === 'none' && 'resize-none',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            isOverCharLimit && 'border-destructive',
            isFocused && 'ring-2 ring-ring ring-offset-2',
            (wordCountDisplay || maxLength) && 'pb-6',
          )}
          style={{
            maxHeight: maxRows ? `${maxRows * 1.5}em` : undefined,
            ...elementProps.style,
          }}
        />

        {/* Character/Word count display */}
        {(wordCountDisplay || maxLength) && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {wordCountDisplay && (
              <span className="mr-2">
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </span>
            )}
            {maxLength && (
              <span className={isOverCharLimit ? 'text-destructive' : ''}>
                {characterCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Additional validation messages */}
      {(isOverCharLimit || isUnderCharLimit) && !hasError && (
        <div className="text-sm text-muted-foreground mt-1">
          {isOverCharLimit && `Too long. Maximum ${maxLength} characters allowed.`}
          {isUnderCharLimit && `Too short. Minimum ${minLength} characters required.`}
        </div>
      )}
    </BaseElementWrapper>
  );
});

TextareaComponent.displayName = 'TextareaComponent';

export default TextareaComponent;
