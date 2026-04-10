import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import authService from '@/services/api/authService';

/**
 * Password Reset Page
 * Allows users to request a password reset link
 * Features:
 * - Email input with validation
 * - Sends reset link to registered email
 * - Success message with instructions
 * - Error handling with user-friendly messages
 */

// Validation schema
const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.requestPasswordReset({ email: data.email });

      setSuccess(true);
      setSubmittedEmail(data.email);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset link. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="Password reset instructions sent"
        showBranding={true}
      >
        <div className="space-y-6">
          {/* Success Message */}
          <div
            className="p-4 bg-success-50 border border-success-200 rounded-lg text-success-700 text-sm"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium mb-1">Reset link sent successfully</p>
            <p>
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>. Please
              check your email and follow the instructions to reset your password.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-lg space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <p className="font-medium">What to do next:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your email inbox</li>
              <li>Click the reset link in the email</li>
              <li>Enter your new password</li>
              <li>Sign in with your new password</li>
            </ol>
          </div>

          {/* Didn't receive email */}
          <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            <p>
              Didn&apos;t receive the email?{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Try again
              </button>
            </p>
          </div>

          {/* Back to login */}
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/login')}>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
      showBranding={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Error Message */}
        {error && (
          <div
            className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
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
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to login */}
        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            Remember your password?{' '}
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default PasswordResetPage;
