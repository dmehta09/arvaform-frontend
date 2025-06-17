import { Suspense } from 'react';
import { FormBuilderPageClient } from '../[formId]/page-client';

/**
 * Loading component for the form builder
 */
function FormBuilderLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading admin form builder...</p>
      </div>
    </div>
  );
}

/**
 * Super Admin Form Builder Page
 * Provides direct access to form builder with admin formId without authentication
 */
export default function AdminFormBuilderPage() {
  // Hardcoded admin formId for super-admin access
  const adminFormId = 'admin-demo-form';

  return (
    <div className="form-builder-page h-full">
      {/* Admin indicator */}
      <div className="bg-red-100 text-red-800 text-center py-2 text-sm font-medium">
        🔧 Admin Mode - Form Builder Demo (ID: {adminFormId})
      </div>

      <Suspense fallback={<FormBuilderLoading />}>
        <FormBuilderPageClient formId={adminFormId} />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'Admin Form Builder - ArvaForm',
  description: 'Super admin access to form builder for development and testing',
};
