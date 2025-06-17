/**
 * Dashboard Page - Protected route using DAL
 * Authentication is handled server-side using Data Access Layer
 */

import { FormDashboard } from '@/components/dashboard/form-dashboard';
import { requireAuth } from '@/lib/dal';

export default async function DashboardPage() {
  // This will redirect to /login if user is not authenticated
  const user = await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user.name}! Manage your forms and view analytics.
        </p>
      </div>

      <FormDashboard />
    </div>
  );
}
