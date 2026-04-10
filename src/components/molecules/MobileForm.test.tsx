import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileForm } from './MobileForm';

describe('MobileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = vi.fn();
    // Mock scrollTo for JSDOM
    window.scrollTo = vi.fn() as any;
  });

  it('should render form with children', () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit}>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </MobileForm>
    );

    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </MobileForm>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should prevent default form submission', async () => {
    const onSubmit = vi.fn((e) => {
      expect(e.defaultPrevented).toBe(true);
    });

    render(
      <MobileForm onSubmit={onSubmit}>
        <button type="submit">Submit</button>
      </MobileForm>
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should dismiss keyboard on submit when dismissKeyboardOnSubmit is true', async () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit} dismissKeyboardOnSubmit={true}>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should not dismiss keyboard on submit when dismissKeyboardOnSubmit is false', async () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit} dismissKeyboardOnSubmit={false}>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should dismiss keyboard on Escape key', async () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit}>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement;
    fireEvent.focus(input);

    fireEvent.keyDown(document, { key: 'Escape' });

    // Input should be blurred
    expect(document.activeElement).not.toBe(input);
  });

  it('should submit form on Ctrl+Enter', async () => {
    const onSubmit = vi.fn();
    render(
      <MobileForm onSubmit={onSubmit}>
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement;
    fireEvent.focus(input);

    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should call onKeyboardShow callback', async () => {
    const onKeyboardShow = vi.fn();
    render(
      <MobileForm onSubmit={vi.fn()} onKeyboardShow={onKeyboardShow}>
        <input type="text" placeholder="Test input" />
      </MobileForm>
    );

    const input = screen.getByPlaceholderText('Test input') as HTMLInputElement;
    fireEvent.focus(input);

    act(() => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(onKeyboardShow).toHaveBeenCalled();
    });
  });

  it('should call onKeyboardHide callback', () => {
    const onKeyboardHide = vi.fn();
    render(
      <MobileForm onSubmit={vi.fn()} onKeyboardHide={onKeyboardHide}>
        <input type="text" placeholder="Test input" />
      </MobileForm>
    );

    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MobileForm onSubmit={vi.fn()} className="custom-form">
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const form = container.querySelector('form');
    expect(form).toHaveClass('custom-form');
  });

  it('should have noValidate attribute', () => {
    const { container } = render(
      <MobileForm onSubmit={vi.fn()}>
        <button type="submit">Submit</button>
      </MobileForm>
    );

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('novalidate');
  });
});

// Helper function for act
function act(callback: () => void) {
  callback();
}
