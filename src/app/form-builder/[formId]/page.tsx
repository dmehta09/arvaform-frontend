import { Suspense } from 'react';
import { FormBuilderPageClient } from './page-client';

interface FormBuilderPageProps {
  params: Promise<{
    formId: string;
  }>;
}

/**
 * Loading component for the form builder
 */
function FormBuilderLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading form builder...</p>
      </div>
    </div>
  );
}

/**
 * Form builder page for editing individual forms
 * Server component that handles params and delegates to client component
 */
export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  // Handle async params properly for Next.js 15
  const { formId } = await params;

  return (
    <div className="form-builder-page h-full">
      <Suspense fallback={<FormBuilderLoading />}>
        <FormBuilderPageClient formId={formId} />
      </Suspense>
    </div>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: FormBuilderPageProps) {
  const { formId } = await params;

  return {
    title: `Edit Form ${formId} - ArvaForm Builder`,
    description: `Edit and customize form ${formId} using the drag-and-drop form builder`,
  };
}
