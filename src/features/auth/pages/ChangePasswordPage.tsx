import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Card } from '@/components/molecules/Card';
import authService from '@/services/api/authService';
import { validatePassword } from '@/utils/validators';

/**
 * Change Password Page
 * Allows authenticated users to change their password
 * Features:
 * - Current password verification
 * - New password with strength validation
 * - Password confirmation
 * - Error handling with user-friendly messages
 * - Success notification
 */

// Validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .refine((password) => {
        const validation = validatePassword(password);
        return validation.isValid;
      }, 'Password must contain uppercase, lowercase, and numbers'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccess(true);
      reset();

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to change password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-8">
        <Card className="w-full max-w-md">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-success-600 dark:text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Password Changed Successfully
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your password has been updated. Redirecting to your profile...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Change Password
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
              Update your password to keep your account secure
            </p>
          </div>

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

            {/* Current Password Field */}
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" required>
                    Current Password
                  </Label>
                  <Input
                    {...field}
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    error={errors.currentPassword?.message}
                    aria-invalid={!!errors.currentPassword}
                    aria-describedby={
                      errors.currentPassword ? 'currentPassword-error' : undefined
                    }
                  />
                </div>
              )}
            />

            {/* New Password Field */}
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="newPassword" required>
                    New Password
                  </Label>
                  <Input
                    {...field}
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    disabled={isLoading}
                    error={errors.newPassword?.message}
                    helperText="Must contain uppercase, lowercase, and numbers"
                    aria-invalid={!!errors.newPassword}
                    aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                  />
                </div>
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" required>
                    Confirm Password
                  </Label>
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                    error={errors.confirmPassword?.message}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? 'confirmPassword-error' : undefined
                    }
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>

            {/* Cancel Button */}
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
