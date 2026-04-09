import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ChangePasswordPage } from '@/features/auth/pages/ChangePasswordPage';
import * as authService from '@/services/api/authService';

// Mock the auth service
vi.mock('@/services/api/authService', () => ({
  default: {
    changePassword: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderChangePasswordPage = () => {
  return render(
    <BrowserRouter>
      <ChangePasswordPage />
    </BrowserRouter>
  );
};

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders change password form with all fields', () => {
    renderChangePasswordPage();

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('displays validation error for empty current password', async () => {
    const user = userEvent.setup();
    renderChangePasswordPage();

    const submitButton = screen.getByRole('button', { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for empty new password', async () => {
    const user = userEvent.setup();
    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    await user.type(currentPasswordInput, 'OldPassword123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for weak new password', async () => {
    const user = userEvent.setup();
    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);

    await user.type(currentPasswordInput, 'OldPassword123');
    await user.type(newPasswordInput, 'weak');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('displays validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(currentPasswordInput, 'OldPassword123');
    await user.type(newPasswordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'DifferentPassword123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('displays validation error when new password same as current', async () => {
    const user = userEvent.setup();
    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    const samePassword = 'SamePassword123';

    await user.type(currentPasswordInput, samePassword);
    await user.type(newPasswordInput, samePassword);
    await user.type(confirmPasswordInput, samePassword);
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/new password must be different from current password/i)
      ).toBeInTheDocument();
    });
  });

  it('displays success message after successful password change', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.changePassword).mockResolvedValue({
      message: 'Password changed successfully',
    });

    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(currentPasswordInput, 'OldPassword123');
    await user.type(newPasswordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.changePassword).mockRejectedValue(
      new Error('Current password is incorrect')
    );

    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(currentPasswordInput, 'WrongPassword123');
    await user.type(newPasswordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument();
    });
  });

  it('disables form while submitting', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.changePassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'Success' }), 100))
    );

    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /update password/i });

    await user.type(currentPasswordInput, 'OldPassword123');
    await user.type(newPasswordInput, 'NewPassword123');
    await user.type(confirmPasswordInput, 'NewPassword123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('displays cancel button', () => {
    renderChangePasswordPage();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    renderChangePasswordPage();

    expect(screen.getByText(/change password/i)).toBeInTheDocument();
    expect(screen.getByText(/update your password to keep your account secure/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderChangePasswordPage();

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
