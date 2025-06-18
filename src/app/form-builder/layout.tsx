'use client';

import { createContext, useContext, useState } from 'react';

// Remove the metadata export since this is now a client component
// Metadata will be handled in the page components instead

interface FormBuilderLayoutProps {
  children: React.ReactNode;
}

interface PreviewContextType {
  isPreviewMode: boolean;
  togglePreview: () => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const usePreviewMode = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreviewMode must be used within a PreviewProvider');
  }
  return context;
};

/**
 * Layout for the form builder section
 * Provides consistent layout and styling for all form builder pages
 * Now supports preview mode toggle functionality
 */
export default function FormBuilderLayout({ children }: FormBuilderLayoutProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const togglePreview = () => {
    setIsPreviewMode((prev) => !prev);
  };

  return (
    <PreviewContext.Provider value={{ isPreviewMode, togglePreview }}>
      <div className="form-builder-layout min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
                <p className="text-sm text-gray-600">
                  {isPreviewMode
                    ? 'Preview your form as users will see it'
                    : 'Create and customize forms with drag-and-drop'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePreview}
                  className={`px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isPreviewMode
                      ? 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}>
                  {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </button>
                {!isPreviewMode && (
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Save Form
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </PreviewContext.Provider>
  );
}
