import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('renders search input', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search..." />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar value="test" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'search term' } });

    expect(onChange).toHaveBeenCalledWith('search term');
  });

  it('debounces onSearch callback', async () => {
    const onSearch = vi.fn();
    render(<SearchBar value="" onChange={vi.fn()} onSearch={onSearch} debounceDelay={300} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'search' } });

    expect(onSearch).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('search');
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when value is not empty and clearable is true', () => {
    render(<SearchBar value="test" onChange={vi.fn()} clearable={true} />);

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} clearable={true} />);

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} clearable={true} />);

    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('clears search when Escape key is pressed', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('disables input when disabled prop is true', () => {
    render(<SearchBar value="" onChange={vi.fn()} disabled={true} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not show clear button when clearable is false', () => {
    render(<SearchBar value="test" onChange={vi.fn()} clearable={false} />);

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('role', 'search');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar value="" onChange={vi.fn()} className="custom-class" />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('respects custom debounce delay', async () => {
    const onSearch = vi.fn();
    render(<SearchBar value="" onChange={vi.fn()} onSearch={onSearch} debounceDelay={100} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'search' } });

    await waitFor(
      () => {
        expect(onSearch).toHaveBeenCalledWith('search');
      },
      { timeout: 200 }
    );
  });
});
