/**
 * Dashboard Layout Component
 *
 * Provides the main layout structure for the dashboard pages
 * with navigation, header, and content areas following Next.js 15 patterns.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ArvaForm',
  description: 'Manage your forms, submissions, and analytics',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
