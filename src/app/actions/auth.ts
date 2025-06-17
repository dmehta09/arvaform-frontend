'use server';

import { logout as dalLogout } from '@/lib/dal';
import { revalidatePath } from 'next/cache';

/**
 * Server Actions for Authentication
 * Following Next.js 15 best practices with DAL integration
 */

/**
 * Logout user and clear all authentication cookies
 * This is a Server Action that can be called from client components
 */
export async function logoutAction() {
  try {
    // Use DAL logout function which clears cookies and redirects
    await dalLogout();
  } catch (error) {
    console.error('Logout failed:', error);
    // Even if logout fails, try to clear local state
    revalidatePath('/');
    throw new Error('Logout failed');
  }
}

/**
 * Revalidate authentication state
 * Call this after login/logout to refresh server-side data
 */
export async function revalidateAuth() {
  revalidatePath('/');
  revalidatePath('/dashboard');
}
