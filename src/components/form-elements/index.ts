// Form Elements Export Index
// Provides centralized access to all form element components
import { CheckboxComponent } from './checkbox';
import { EmailInput } from './email-input';
import { TextInput } from './text-input';
import { TextareaComponent } from './textarea';

export { BaseElementWrapper, useBaseElement, withBaseElement } from './base-element';
export { CheckboxComponent as Checkbox } from './checkbox';
export { EmailInput } from './email-input';
export { TextInput } from './text-input';
export { TextareaComponent as Textarea } from './textarea';

// Type exports
export type { BaseElementWrapperProps } from './base-element';

export type {
  BaseElementProps,
  CheckboxProps,
  EmailInputProps,
  OptionDefinition,
  TextareaProps,
  TextInputProps,
} from '@/types/element-props.types';

// Element registry for form builder
export const FORM_ELEMENTS = {
  text: TextInput,
  email: EmailInput,
  checkbox: CheckboxComponent,
  textarea: TextareaComponent,
} as const;

export type FormElementType = keyof typeof FORM_ELEMENTS;
