'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { OAuthButtons } from './oauth-buttons';

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Registration form validation schema
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

// Password strength checker
const getPasswordStrength = (password: string) => {
  const requirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[0-9]/, text: 'One number' },
    { regex: /[^a-zA-Z0-9]/, text: 'One special character' },
  ];

  const passed = requirements.filter((req) => req.regex.test(password));
  const strength = (passed.length / requirements.length) * 100;

  return {
    score: passed.length,
    total: requirements.length,
    percentage: strength,
    requirements: requirements.map((req) => ({
      ...req,
      passed: req.regex.test(password),
    })),
  };
};

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password', '');
  const passwordStrength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement actual registration API call
      // This will be connected to the backend authentication in E1-T010
      console.log('Registration attempt:', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success response
      reset();
      onSuccess?.();
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create your account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Get started with ArvaForm for free</p>
        </div>

        {/* OAuth Buttons */}
        <OAuthButtons disabled={isLoading} />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
              Or register with email
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300">
                First name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  {...register('firstName')}
                  id="firstName"
                  placeholder="John"
                  className={`pl-10 h-11 ${errors.firstName ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                  autoComplete="given-name"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
              </div>
              {errors.firstName && (
                <p
                  id="firstName-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Last name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  {...register('lastName')}
                  id="lastName"
                  placeholder="Doe"
                  className={`pl-10 h-11 ${errors.lastName ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                  autoComplete="family-name"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
              </div>
              {errors.lastName && (
                <p
                  id="lastName-error"
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

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
                disabled={isLoading}
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
                placeholder="Create a strong password"
                className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isLoading}
                autoComplete="new-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : 'password-strength'}
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

            {/* Password Strength Indicator */}
            {watchedPassword && (
              <div id="password-strength" className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.percentage < 40
                          ? 'bg-red-500'
                          : passwordStrength.percentage < 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {passwordStrength.score}/{passwordStrength.total}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {passwordStrength.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      {req.passed ? (
                        <Check className="h-3 w-3 text-green-500" />
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
              </div>
            )}

            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
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

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                {...register('acceptTerms')}
                id="acceptTerms"
                disabled={isLoading}
                aria-invalid={errors.acceptTerms ? 'true' : 'false'}
                aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
            {errors.acceptTerms && (
              <p
                id="terms-error"
                className="text-sm text-red-600 dark:text-red-400 ml-6"
                role="alert">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
            disabled={isLoading || !isValid}
            aria-label="Create your account">
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
