'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { OAuthButtons } from './oauth-buttons';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // Prevent hydration mismatch by ensuring client-side rendering after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      console.log('🔍 LOGIN FORM SUBMIT:', data); // Debug log

      // TODO: REMOVE SUPER ADMIN NOTICE BEFORE PRODUCTION!
      if (data.email === 'devang.mehta@arvasit.com') {
        console.warn('🚨 ATTEMPTING SUPER ADMIN LOGIN - REMOVE BEFORE PRODUCTION!');
      }
      // END TODO: Remove super admin notice

      console.log('📞 CALLING auth.login() hook...'); // Debug log
      const result = await login(data);
      console.log('✅ LOGIN SUCCESS:', result); // Debug log

      reset();
      onSuccess?.();

      // TODO: REMOVE SUPER ADMIN REDIRECT LOGIC BEFORE PRODUCTION!
      // Check if this is super admin login and handle redirect differently
      const isSuperAdminLogin =
        result.user && 'isSuperAdmin' in result.user && result.user.isSuperAdmin;

      if (isSuperAdminLogin) {
        console.log('🚨 SUPER ADMIN REDIRECT - Using window.location for immediate redirect');
        // Small delay to ensure cookie is set before redirect
        setTimeout(() => {
          // Debug: Check if cookie is actually set
          console.log('🔍 ALL COOKIES BEFORE REDIRECT:', document.cookie);
          console.log('🔍 SUPER ADMIN COOKIE:', document.cookie.includes('super-admin-session'));

          // Force redirect via super admin route to bypass middleware issues
          console.log('🚀 ATTEMPTING SUPER ADMIN REDIRECT VIA INTERMEDIATE ROUTE...');

          // Method 1: Use intermediate super admin route
          console.log('🔄 Using super-admin-dashboard route...');
          window.location.assign('/super-admin-dashboard');

          // Method 2: Fallback after delay
          setTimeout(() => {
            if (
              !window.location.pathname.includes('/dashboard') &&
              !window.location.pathname.includes('/super-admin-dashboard')
            ) {
              console.log('🔄 First redirect failed, trying direct dashboard...');
              window.location.href = '/dashboard';
            }
          }, 1000);

          // Method 3: Ultimate fallback
          setTimeout(() => {
            if (
              !window.location.pathname.includes('/dashboard') &&
              !window.location.pathname.includes('/super-admin-dashboard')
            ) {
              console.log('🔄 All redirects failed, forcing page reload...');
              window.location.replace('/dashboard');
            }
          }, 2000);
        }, 300); // Increased delay to ensure cookie is set
        return;
      }
      // END TODO: Remove super admin redirect logic

      // Normal redirect for regular users
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ LOGIN ERROR:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400">Sign in to your account to continue</p>
        </div>

        {/* OAuth Buttons */}
        <OAuthButtons disabled={isHydrated ? isLoading : false} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`pl-10 h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isHydrated ? isLoading : false}
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isHydrated ? isLoading : false}
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isHydrated ? isLoading : false}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
            disabled={isHydrated ? isLoading || !isValid : !isValid}
            aria-label="Sign in to your account">
            {isHydrated && isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
