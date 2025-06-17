'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuperAdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a super admin session
    const isSuperAdmin = document.cookie.includes('super-admin-session=super-admin-active');

    console.log('🔍 SUPER ADMIN DASHBOARD - Cookie check:', isSuperAdmin);
    console.log('🔍 All cookies:', document.cookie);

    if (isSuperAdmin) {
      console.log('🚨 SUPER ADMIN VERIFIED - STAYING ON SUPER ADMIN DASHBOARD');
      // Don't redirect - stay on this page and show dashboard content
      // This completely bypasses the middleware issue
    } else {
      console.log('❌ No super admin session found, redirecting to login');
      router.replace('/login');
    }
  }, [router]);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is a super admin session
    const hasSuperAdminCookie = document.cookie.includes('super-admin-session=super-admin-active');

    console.log('🔍 SUPER ADMIN DASHBOARD - Cookie check:', hasSuperAdminCookie);
    console.log('🔍 All cookies:', document.cookie);

    if (hasSuperAdminCookie) {
      console.log('🚨 SUPER ADMIN VERIFIED - SHOWING DASHBOARD');
      setIsSuperAdmin(true);
      setIsLoading(false);
    } else {
      console.log('❌ No super admin session found, redirecting to login');
      router.replace('/login');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Super Admin Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Verifying super admin session...</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Super Admin Warning Banner */}
      <div className="bg-red-600 text-white px-4 py-2 text-center font-bold">
        🚨 SUPER ADMIN MODE ACTIVE - REMOVE BEFORE PRODUCTION! 🚨
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome, Devang Mehta - You have full system access
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Forms</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">∞</p>
            <p className="text-sm text-gray-500 mt-1">Unlimited Access</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Users</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">ALL</p>
            <p className="text-sm text-gray-500 mt-1">Full User Management</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Permissions</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">*</p>
            <p className="text-sm text-gray-500 mt-1">All Permissions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Status</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">DEV</p>
            <p className="text-sm text-gray-500 mt-1">Development Mode</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors">
            🎛️ Go to Normal Dashboard
          </button>

          <button
            onClick={() => (window.location.href = '/form-builder/admin')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors">
            🏗️ Admin Form Builder
          </button>

          <button
            onClick={() => {
              document.cookie =
                'super-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              window.location.href = '/login';
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors">
            🚪 Clear Session & Logout
          </button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 font-mono text-sm">
          <h3 className="text-lg font-bold mb-2">🔍 Debug Information:</h3>
          <div>
            Current Path: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
          </div>
          <div>Super Admin Cookie: ✅ Active</div>
          <div>Middleware Bypass: ✅ Active</div>
          <div>User: devang.mehta@arvasit.com</div>
          <div>Access Level: UNLIMITED</div>
        </div>
      </div>
    </div>
  );
}
