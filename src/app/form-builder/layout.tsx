import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Form Builder - ArvaForm',
  description: 'Drag-and-drop form builder for creating custom forms',
};

interface FormBuilderLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for the form builder section
 * Provides consistent layout and styling for all form builder pages
 */
export default function FormBuilderLayout({ children }: FormBuilderLayoutProps) {
  return (
    <div className="form-builder-layout min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-600">Create and customize forms with drag-and-drop</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Preview
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Save Form
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
