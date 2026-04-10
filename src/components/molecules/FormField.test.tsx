import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField Component', () => {
  it('renders label and input', () => {
    render(<FormField label="Email" name="email" value="" onChange={vi.fn()} />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays required indicator when required prop is true', () => {
    render(<FormField label="Email" name="email" value="" onChange={vi.fn()} required />);

    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<FormField label="Email" name="email" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(onChange).toHaveBeenCalledWith('test@example.com');
  });

  it('displays error message when error prop is provided', () => {
    render(
      <FormField label="Email" name="email" value="" onChange={vi.fn()} error="Invalid email" />
    );

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={vi.fn()}
        helperText="Enter your email address"
      />
    );

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<FormField label="Email" name="email" value="" onChange={vi.fn()} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('sets correct input type', () => {
    render(
      <FormField label="Password" name="password" type="password" value="" onChange={vi.fn()} />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  it('sets placeholder text', () => {
    render(
      <FormField label="Email" name="email" value="" onChange={vi.fn()} placeholder="Enter email" />
    );

    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <FormField label="Email" name="email" value="" onChange={vi.fn()} required error="Invalid" />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
