import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login Page
 * Allows users to authenticate with email and password
 * Features:
 * - Email/password form with validation
 * - Error handling with user-friendly messages
 * - Loading state during authentication
 * - Redirect to dashboard on successful login
 * - Links to password reset and signup
 */

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: 'madisomelese2@gmail.com',
      password: '@madisha5423$$',
      rememberMe: false,
    },
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('accessToken');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Redirect after successful login
  useEffect(() => {
    if (user && user.role) {
      const from = location.state?.from?.pathname || `/${user.role}`;
      navigate(from);
    }
  }, [user, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null);
      await login(data.email, data.password);
      // Navigation will happen via the useEffect above when user is set
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      showBranding={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Global Error Message */}
        {(submitError || authError) && (
          <div
            className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
            role="alert"
            aria-live="polite"
          >
            {submitError || authError}
          </div>
        )}

        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
                error={errors.email?.message}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                {...field}
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                error={errors.password?.message}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
            </div>
          )}
        />

        {/* Remember Me Checkbox */}
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={field.value || false}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                disabled={isLoading}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-primary-400 dark:focus:ring-primary-400 cursor-pointer"
                aria-label="Remember me on this device"
              />
              <Label htmlFor="rememberMe" className="ml-2 cursor-pointer">
                Remember me on this device
              </Label>
            </div>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Additional Links */}
        <div className="space-y-3">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
