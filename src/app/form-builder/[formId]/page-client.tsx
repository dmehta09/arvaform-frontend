'use client';

import { FormBuilder } from '@/components/form-builder/form-builder';
import type { FormElement } from '@/types/form-builder.types';

interface FormBuilderPageClientProps {
  formId: string;
}

/**
 * Client component wrapper for the form builder
 * Handles event handlers and client-side interactions
 */
export function FormBuilderPageClient({ formId }: FormBuilderPageClientProps) {
  /**
   * Handle form changes
   */
  const handleFormChange = (elements: FormElement[]) => {
    console.log('Form changed:', elements);
    // Auto-save logic will be implemented in future tasks
  };

  /**
   * Handle element selection
   */
  const handleElementSelected = (elementId: string) => {
    console.log('Element selected:', elementId);
    // Property panel updates will be handled in future tasks
  };

  return (
    <FormBuilder
      formId={formId}
      className="h-full"
      onFormChange={handleFormChange}
      onElementSelected={handleElementSelected}
    />
  );
}
