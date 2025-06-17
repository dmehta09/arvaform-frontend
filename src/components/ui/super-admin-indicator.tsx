'use client';

import { useAuth } from '@/hooks/use-auth';
import { Shield, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Super Admin Indicator Component
 *
 * TODO: REMOVE THIS ENTIRE COMPONENT BEFORE PRODUCTION!
 * This component displays a warning banner when logged in as super admin
 * and provides functionality to clear the super admin session.
 */
export function SuperAdminIndicator() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // TODO: REMOVE THIS SUPER ADMIN CHECK BEFORE PRODUCTION!
  const isSuperAdmin = user && 'isSuperAdmin' in user && user.isSuperAdmin;

  if (!isSuperAdmin || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleClearSession = () => {
    // Clear super admin cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'super-admin-session=; path=/; max-age=0';
      // Reload page to clear session
      window.location.reload();
    }
  };

  return (
    <div className="bg-red-600 text-white px-4 py-2 relative">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Shield className="h-5 w-5" />
          <div>
            <span className="font-semibold">🚨 SUPER ADMIN MODE ACTIVE</span>
            <span className="ml-2 text-red-100">
              You are logged in as super admin ({user.email}). Remove before production!
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearSession}
            className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm font-medium transition-colors">
            Clear Session
          </button>
          <button
            onClick={handleDismiss}
            className="text-red-200 hover:text-white transition-colors"
            aria-label="Dismiss warning">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
// END TODO: Remove entire super admin indicator component
