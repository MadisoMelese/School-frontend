import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form } from './Form';

describe('Form Component', () => {
  const mockFields = [
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      required: true,
    },
  ];

  it('renders submit button with custom text', () => {
    const onSubmit = vi.fn();
    render(<Form fields={mockFields} onSubmit={onSubmit} submitText="Login" />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders cancel button when onCancel is provided', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(
      <Form fields={mockFields} onSubmit={onSubmit} onCancel={onCancel} cancelText="Cancel" />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays global error message', () => {
    const onSubmit = vi.fn();
    const errorMsg = 'Authentication failed';
    render(<Form fields={mockFields} onSubmit={onSubmit} error={errorMsg} />);

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('disables submit button when loading', () => {
    const onSubmit = vi.fn();
    render(<Form fields={mockFields} onSubmit={onSubmit} loading={true} />);

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('handles select field type', () => {
    const selectFields = [
      {
        name: 'role',
        label: 'Role',
        type: 'select' as const,
        options: [
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Teacher' },
        ],
      },
    ];

    const onSubmit = vi.fn();
    render(<Form fields={selectFields} onSubmit={onSubmit} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('handles textarea field type', () => {
    const textareaFields = [
      {
        name: 'message',
        label: 'Message',
        type: 'textarea' as const,
        rows: 4,
      },
    ];

    const onSubmit = vi.fn();
    render(<Form fields={textareaFields} onSubmit={onSubmit} />);

    const textarea = screen.getByLabelText('Message');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<Form fields={mockFields} onSubmit={onSubmit} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('renders form element', () => {
    const onSubmit = vi.fn();
    const { container } = render(<Form fields={mockFields} onSubmit={onSubmit} />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('novalidate');
  });
});
