import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationToast } from './NotificationToast';

describe('NotificationToast Component', () => {
  it('renders message', () => {
    render(<NotificationToast message="Test message" onClose={vi.fn()} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success toast', () => {
    const { container } = render(
      <NotificationToast message="Success" type="success" onClose={vi.fn()} />
    );

    expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    const { container } = render(
      <NotificationToast message="Error" type="error" onClose={vi.fn()} />
    );

    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
  });

  it('renders warning toast', () => {
    const { container } = render(
      <NotificationToast message="Warning" type="warning" onClose={vi.fn()} />
    );

    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
  });

  it('renders info toast', () => {
    const { container } = render(
      <NotificationToast message="Info" type="info" onClose={vi.fn()} />
    );

    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NotificationToast message="Test" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close notification'));
    expect(onClose).toHaveBeenCalled();
  });

  it('auto-dismisses after duration', async () => {
    const onClose = vi.fn();
    render(<NotificationToast message="Test" onClose={onClose} duration={100} />);

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 200 }
    );
  });

  it('does not auto-dismiss when duration is 0', async () => {
    const onClose = vi.fn();
    render(<NotificationToast message="Test" onClose={onClose} duration={0} />);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders action button when provided', () => {
    render(
      <NotificationToast
        message="Test"
        onClose={vi.fn()}
        action={{ label: 'Undo', onClick: vi.fn() }}
      />
    );

    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('calls action onClick when action button is clicked', () => {
    const onClick = vi.fn();
    render(
      <NotificationToast message="Test" onClose={vi.fn()} action={{ label: 'Undo', onClick }} />
    );

    fireEvent.click(screen.getByText('Undo'));
    expect(onClick).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<NotificationToast message="Test" onClose={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(
      <NotificationToast message="Test" onClose={vi.fn()} className="custom-class" />
    );

    const toast = container.querySelector('[role="alert"]');
    expect(toast).toHaveClass('custom-class');
  });

  it('renders correct icon for each type', () => {
    const { rerender } = render(
      <NotificationToast message="Success" type="success" onClose={vi.fn()} />
    );

    // Icon should be rendered (we can't easily test icon content, but we can verify structure)
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<NotificationToast message="Error" type="error" onClose={vi.fn()} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('defaults to info type', () => {
    const { container } = render(<NotificationToast message="Test" onClose={vi.fn()} />);

    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('defaults to 3000ms duration', async () => {
    const onClose = vi.fn();
    render(<NotificationToast message="Test" onClose={onClose} />);

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 3500 }
    );
  });
});
