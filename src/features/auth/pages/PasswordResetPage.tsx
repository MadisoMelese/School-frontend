import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { authService } from '@/services/api/authService';

/**
 * Password Reset Page
 * Two-step process:
 * 1. Request reset - user enters email
 * 2. Confirm reset - user enters token and new password
 */

// Step 1: Request password reset
const requestResetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type RequestResetFormData = z.infer<typeof requestResetSchema>;

// Step 2: Confirm password reset
const confirmResetSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ConfirmResetFormData = z.infer<typeof confirmResetSchema>;

export const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if token is in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep('confirm');
    }
  }, [searchParams]);

  // Request reset form
  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors, isSubmitting: isRequestSubmitting },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(requestResetSchema),
    mode: 'onBlur',
  });

  // Confirm reset form
  const {
    control: confirmControl,
    handleSubmit: handleConfirmSubmit,
    formState: { errors: confirmErrors, isSubmitting: isConfirmSubmitting },
  } = useForm<ConfirmResetFormData>({
    resolver: zodResolver(confirmResetSchema),
    mode: 'onBlur',
  });

  const onRequestSubmit = async (data: RequestResetFormData) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      await authService.requestPasswordReset({ email: data.email });
      setSuccessMessage('Check your email for password reset instructions.');
      // Keep showing the form for another attempt
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request password reset';
      setErrorMessage(errorMsg);
    }
  };

  const onConfirmSubmit = async (data: ConfirmResetFormData) => {
    if (!resetToken) {
      setErrorMessage('Reset token is missing');
      return;
    }

    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      await authService.confirmPasswordReset({
        resetToken,
        newPassword: data.newPassword,
      });
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset password';
      setErrorMessage(errorMsg);
    }
  };

  return (
    <AuthLayout
      title={step === 'request' ? 'Reset Password' : 'Create New Password'}
      subtitle={
        step === 'request'
          ? 'Enter your email to receive a password reset link'
          : 'Enter your new password'
      }
      showBranding={true}
    >
      {/* Error Message */}
      {errorMessage && (
        <div
          className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm mb-6"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="p-4 bg-success-50 border border-success-200 rounded-lg text-success-700 text-sm mb-6"
          role="alert"
          aria-live="polite"
        >
          {successMessage}
        </div>
      )}

      {/* Step 1: Request Reset */}
      {step === 'request' && (
        <form onSubmit={handleRequestSubmit(onRequestSubmit)} className="space-y-6" noValidate>
          <Controller
            name="email"
            control={requestControl}
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
                  disabled={isRequestSubmitting}
                  error={requestErrors.email?.message}
                  aria-invalid={!!requestErrors.email}
                  aria-describedby={requestErrors.email ? 'email-error' : undefined}
                />
              </div>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isRequestSubmitting}
            disabled={isRequestSubmitting}
            aria-busy={isRequestSubmitting}
          >
            {isRequestSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Remember your password?{' '}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Back to login
              </a>
            </p>
          </div>
        </form>
      )}

      {/* Step 2: Confirm Reset */}
      {step === 'confirm' && (
        <form onSubmit={handleConfirmSubmit(onConfirmSubmit)} className="space-y-6" noValidate>
          <Controller
            name="newPassword"
            control={confirmControl}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="newPassword" required>
                  New Password
                </Label>
                <Input
                  {...field}
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  disabled={isConfirmSubmitting}
                  error={confirmErrors.newPassword?.message}
                  aria-invalid={!!confirmErrors.newPassword}
                  aria-describedby={confirmErrors.newPassword ? 'newPassword-error' : undefined}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Password must contain: uppercase, lowercase, number, and special character (!@#$%^&*)
                </p>
              </div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={confirmControl}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  disabled={isConfirmSubmitting}
                  error={confirmErrors.confirmPassword?.message}
                  aria-invalid={!!confirmErrors.confirmPassword}
                  aria-describedby={confirmErrors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
              </div>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isConfirmSubmitting}
            disabled={isConfirmSubmitting}
            aria-busy={isConfirmSubmitting}
          >
            {isConfirmSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <a
                href="/password-reset"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Request new reset link
              </a>
            </p>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default PasswordResetPage;
