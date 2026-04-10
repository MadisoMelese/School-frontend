import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  it('renders page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} onChange={vi.fn()} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays current page info', () => {
    render(<Pagination currentPage={2} totalPages={5} onChange={vi.fn()} showInfo={true} />);

    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
  });

  it('calls onChange when page number is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onChange={onChange} />);

    fireEvent.click(screen.getByText('3'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange when next button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onChange={onChange} />);

    const nextButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'Next page');
    fireEvent.click(nextButton!);

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange when previous button is clicked', () => {
    const onChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onChange={onChange} />);

    const prevButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'Previous page');
    fireEvent.click(prevButton!);

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onChange={vi.fn()} />);

    const prevButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onChange={vi.fn()} />);

    const nextButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'Next page');
    expect(nextButton).toBeDisabled();
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={2} totalPages={5} onChange={vi.fn()} />);

    const currentPageButton = screen.getByText('2').closest('button');
    expect(currentPageButton).toHaveClass('bg-primary-500');
  });

  it('shows ellipsis for large page ranges', () => {
    render(<Pagination currentPage={1} totalPages={20} onChange={vi.fn()} maxVisiblePages={5} />);

    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('hides info when showInfo is false', () => {
    render(<Pagination currentPage={1} totalPages={5} onChange={vi.fn()} showInfo={false} />);

    expect(screen.queryByText(/Page 1 of 5/)).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Pagination currentPage={2} totalPages={5} onChange={vi.fn()} />);

    const currentPageButton = screen.getByText('2').closest('button');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('navigates with keyboard', () => {
    const onChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onChange={onChange} />);

    const pageButton = screen.getByText('3').closest('button');
    fireEvent.keyDown(pageButton!, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={5} onChange={vi.fn()} className="custom-class" />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });
});
