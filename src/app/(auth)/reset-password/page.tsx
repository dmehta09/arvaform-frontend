'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Reset password form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password', '');

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'At least 8 characters' },
      { regex: /[a-z]/, text: 'One lowercase letter' },
      { regex: /[A-Z]/, text: 'One uppercase letter' },
      { regex: /[0-9]/, text: 'One number' },
    ];

    return {
      requirements: requirements.map((req) => ({
        ...req,
        passed: req.regex.test(password),
      })),
    };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        // TODO: Implement actual token validation API call
        // This will be connected to the backend in E1-T010
        console.log('Validating reset token:', token);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock validation (in real app, this would be an API call)
        setIsValidToken(true);
      } catch (err) {
        console.error('Token validation error:', err);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement actual password reset API call
      // This will be connected to the backend in E1-T010
      console.log('Password reset with token:', token);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidToken === null) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <X className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Invalid reset link
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/forgot-password" className="block w-full">
            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Request new reset link
            </Button>
          </Link>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Password reset successful
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>

        <Link href="/login" className="block w-full">
          <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium">
            Sign in to your account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Reset your password
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Enter your new password below</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* New Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700 dark:text-slate-300">
            New password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password Requirements */}
          {watchedPassword && (
            <div id="password-requirements" className="space-y-1">
              {passwordStrength.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  {req.passed ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-slate-400" />
                  )}
                  <span
                    className={
                      req.passed ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
                    }>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {errors.password && (
            <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm new password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              className={`pl-10 pr-10 h-11 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              className="text-sm text-red-600 dark:text-red-400"
              role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
          disabled={isLoading || !isValid}
          aria-label="Reset password">
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
