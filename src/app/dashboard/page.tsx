/**
 * Dashboard Page for ArvaForm
 *
 * Protected route that displays user information and dashboard content.
 * Tests the authentication state management implementation.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/providers/auth-provider';
import { Loader2, LogOut, User } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, logout, isAuthenticated } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically via middleware
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.firstName}!</h1>
          <p className="text-muted-foreground">Here&apos;s your ArvaForm dashboard</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Information Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Information</CardTitle>
            <User className="ml-auto h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className="capitalize">{user.status}</span>
              </div>
              {user.lastLoginAt && (
                <div>
                  <span className="font-medium">Last Login:</span>{' '}
                  {new Date(user.lastLoginAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forms Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No forms created yet</p>
          </CardContent>
        </Card>

        {/* Submissions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No submissions received</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button className="h-20 flex-col space-y-2">
            <span>Create Form</span>
            <span className="text-xs opacity-70">Build a new form</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <span>View Analytics</span>
            <span className="text-xs opacity-70">See form performance</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <span>Manage Users</span>
            <span className="text-xs opacity-70">Team management</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <span>Settings</span>
            <span className="text-xs opacity-70">Account settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
