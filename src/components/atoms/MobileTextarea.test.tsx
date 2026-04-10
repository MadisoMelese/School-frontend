import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileTextarea } from './MobileTextarea';

describe('MobileTextarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('should render textarea with label', () => {
    render(<MobileTextarea label="Message" />);

    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render textarea with error message', () => {
    render(<MobileTextarea label="Message" error="Message is required" />);

    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('should render textarea with helper text', () => {
    render(<MobileTextarea label="Message" helperText="Maximum 500 characters" />);

    expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
  });

  it('should have minimum height of 120px', () => {
    const { container } = render(<MobileTextarea label="Test" />);
    const textarea = container.querySelector('textarea');

    expect(textarea).toHaveClass('min-h-[120px]');
  });

  it('should auto-focus on mount when autoFocusOnMount is true', () => {
    render(<MobileTextarea label="Test" autoFocusOnMount={true} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(document.activeElement).toBe(textarea);
  });

  it('should not auto-focus on mount when autoFocusOnMount is false', () => {
    render(<MobileTextarea label="Test" autoFocusOnMount={false} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(document.activeElement).not.toBe(textarea);
  });

  it('should scroll into view on focus when scrollIntoViewOnFocus is true', () => {
    const { container } = render(<MobileTextarea label="Test" scrollIntoViewOnFocus={true} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
  });

  it('should not scroll into view on focus when scrollIntoViewOnFocus is false', () => {
    const { container } = render(<MobileTextarea label="Test" scrollIntoViewOnFocus={false} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
  });

  it('should call onKeyboardDismiss on blur', () => {
    const onKeyboardDismiss = vi.fn();
    const { container } = render(
      <MobileTextarea label="Test" onKeyboardDismiss={onKeyboardDismiss} />
    );

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);

    expect(onKeyboardDismiss).toHaveBeenCalled();
  });

  it('should dismiss keyboard on Escape key', () => {
    const onKeyboardDismiss = vi.fn();
    const { container } = render(
      <MobileTextarea label="Test" onKeyboardDismiss={onKeyboardDismiss} />
    );

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(onKeyboardDismiss).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(textarea);
  });

  it('should dismiss keyboard on Ctrl+Enter', () => {
    const onKeyboardDismiss = vi.fn();
    const { container } = render(
      <MobileTextarea label="Test" onKeyboardDismiss={onKeyboardDismiss} />
    );

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    expect(onKeyboardDismiss).toHaveBeenCalled();
  });

  it('should auto-resize textarea based on content', () => {
    const { container } = render(<MobileTextarea label="Test" autoResize={true} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const initialHeight = textarea.style.height;

    fireEvent.change(textarea, {
      target: { value: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5' },
    });

    fireEvent.input(textarea);

    // Height should have changed
    expect(textarea.style.height).not.toBe(initialHeight);
  });

  it('should not auto-resize when autoResize is false', () => {
    const { container } = render(<MobileTextarea label="Test" autoResize={false} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    const initialHeight = textarea.style.height;

    fireEvent.change(textarea, {
      target: { value: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5' },
    });

    fireEvent.input(textarea);

    // Height should not change
    expect(textarea.style.height).toBe(initialHeight);
  });

  it('should have aria-invalid when error is present', () => {
    const { container } = render(<MobileTextarea label="Message" error="Message is required" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('should have aria-invalid false when no error', () => {
    const { container } = render(<MobileTextarea label="Message" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'false');
  });

  it('should have aria-describedby for error', () => {
    const { container } = render(<MobileTextarea label="Message" error="Message is required" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('aria-describedby');
  });

  it('should have aria-describedby for helper text', () => {
    const { container } = render(
      <MobileTextarea label="Message" helperText="Maximum 500 characters" />
    );

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('aria-describedby');
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<MobileTextarea label="Test" disabled={true} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
  });

  it('should have resize-none class', () => {
    const { container } = render(<MobileTextarea label="Test" />);
    const textarea = container.querySelector('textarea');

    expect(textarea).toHaveClass('resize-none');
  });

  it('should call onFocus callback', () => {
    const onFocus = vi.fn();
    const { container } = render(<MobileTextarea label="Test" onFocus={onFocus} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);

    expect(onFocus).toHaveBeenCalled();
  });

  it('should call onBlur callback', () => {
    const onBlur = vi.fn();
    const { container } = render(<MobileTextarea label="Test" onBlur={onBlur} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.focus(textarea);
    fireEvent.blur(textarea);

    expect(onBlur).toHaveBeenCalled();
  });

  it('should call onKeyDown callback', () => {
    const onKeyDown = vi.fn();
    const { container } = render(<MobileTextarea label="Test" onKeyDown={onKeyDown} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.keyDown(textarea, { key: 'a' });

    expect(onKeyDown).toHaveBeenCalled();
  });

  it('should support placeholder', () => {
    const { container } = render(<MobileTextarea label="Test" placeholder="Enter your message" />);

    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
  });

  it('should support value prop', () => {
    const { container } = render(<MobileTextarea label="Test" value="Initial value" readOnly />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial value');
  });
});
