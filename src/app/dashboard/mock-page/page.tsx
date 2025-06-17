/**
 * Mock Dashboard Page - Showcases UI with Sample Data
 * This page demonstrates the dashboard UI implementation using mock data
 * without requiring real API connections or authentication.
 */

import { MockFormDashboard } from '@/components/dashboard/mock-form-dashboard';

export default function MockDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard <span className="text-sm font-normal text-gray-500">(Mock Data)</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, John Doe! This is a preview of your form dashboard with sample data.
        </p>
      </div>

      <MockFormDashboard />
    </div>
  );
}

export const metadata = {
  title: 'Mock Dashboard - ArvaForm',
  description: 'Preview of the ArvaForm dashboard with sample data',
};
