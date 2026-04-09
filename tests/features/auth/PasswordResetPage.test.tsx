import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PasswordResetPage } from '@/features/auth/pages/PasswordResetPage';
import * as authService from '@/services/api/authService';

// Mock the auth service
vi.mock('@/services/api/authService', () => ({
  default: {
    requestPasswordReset: vi.fn(),
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

const renderPasswordResetPage = () => {
  return render(
    <BrowserRouter>
      <PasswordResetPage />
    </BrowserRouter>
  );
};

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password reset form with email field', () => {
    renderPasswordResetPage();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('displays validation error for empty email', async () => {
    const user = userEvent.setup();
    renderPasswordResetPage();

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('displays success message after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.requestPasswordReset).mockResolvedValue({
      message: 'Reset link sent',
    });

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/reset link sent successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.requestPasswordReset).mockRejectedValue(
      new Error('Email not found')
    );

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'nonexistent@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });

  it('displays back to sign in link', () => {
    renderPasswordResetPage();

    const backLink = screen.getByRole('link', { name: /sign in/i });
    expect(backLink).toHaveAttribute('href', '/login');
  });

  it('displays instructions after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.requestPasswordReset).mockResolvedValue({
      message: 'Reset link sent',
    });

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/check your email inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/click the reset link in the email/i)).toBeInTheDocument();
    });
  });

  it('allows retry after error', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.default.requestPasswordReset)
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({ message: 'Reset link sent' });

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });

    // Clear and retry
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText(/reset link sent successfully/i)).toBeInTheDocument();
    });
  });

  it('renders title and subtitle', () => {
    renderPasswordResetPage();

    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your email to receive a reset link/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
