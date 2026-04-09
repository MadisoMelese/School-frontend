import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders with default props', () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>
    );

    expect(screen.getByText('SchoolOS')).toBeInTheDocument();
    expect(screen.getByText('School Management System')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    render(
      <AuthLayout title="Login" subtitle="Enter your credentials">
        <div>Form content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials')).toBeInTheDocument();
  });

  it('hides branding when showBranding is false', () => {
    render(
      <AuthLayout showBranding={false}>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.queryByText('SchoolOS')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <AuthLayout title="Login">
        <input type="email" placeholder="Email" />
      </AuthLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Authentication page');

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-label', 'Authentication form');
  });

  it('renders children correctly', () => {
    render(
      <AuthLayout>
        <button>Submit</button>
        <a href="/forgot">Forgot password?</a>
      </AuthLayout>
    );

    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('applies correct CSS classes for theme support', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    const mainDiv = container.querySelector('[role="main"]');
    expect(mainDiv).toHaveClass('dark:from-neutral-900');
    expect(mainDiv).toHaveClass('dark:to-neutral-800');
  });

  it('has responsive padding', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    const mainDiv = container.querySelector('[role="main"]');
    expect(mainDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  it('renders background decorations with aria-hidden', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    const decoration = container.querySelector('[aria-hidden="true"]');
    expect(decoration).toBeInTheDocument();
  });
});
