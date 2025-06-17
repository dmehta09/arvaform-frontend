// Debug script for super admin functionality
// Run this in browser console to manually test super admin access

function debugSuperAdmin() {
  console.log('🔍 Current cookies:', document.cookie);

  // Set super admin cookie
  const cookieString =
    'super-admin-session=super-admin-active; path=/; max-age=86400; SameSite=lax';
  document.cookie = cookieString;

  console.log('🚨 Set super admin cookie:', cookieString);
  console.log('🔍 Cookies after setting:', document.cookie);
  console.log(
    '🔍 Cookie verification:',
    document.cookie.includes('super-admin-session=super-admin-active'),
  );

  // Try redirect to dashboard
  setTimeout(() => {
    console.log('🚀 Redirecting to dashboard...');
    window.location.href = '/dashboard';
  }, 500);
}

function clearSuperAdmin() {
  document.cookie = 'super-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  console.log('🧹 Cleared super admin cookie');
  console.log('🔍 Cookies after clearing:', document.cookie);
}

// Export functions for console use
window.debugSuperAdmin = debugSuperAdmin;
window.clearSuperAdmin = clearSuperAdmin;

console.log('🚀 Debug functions loaded:');
console.log('- debugSuperAdmin() - Set cookie and redirect');
console.log('- clearSuperAdmin() - Clear super admin cookie');
