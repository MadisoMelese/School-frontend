import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';

const filters = [
  {
    id: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    id: 'date',
    label: 'Date',
    type: 'date' as const,
  },
  {
    id: 'search',
    label: 'Search',
    type: 'text' as const,
  },
];

describe('FilterBar Component', () => {
  it('renders all filters', () => {
    render(<FilterBar filters={filters} onChange={vi.fn()} />);

    // Check for filter inputs/buttons
    expect(screen.getByRole('button', { name: /Status/i })).toBeInTheDocument();
  });

  it('calls onChange when filter value changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} onChange={onChange} />);

    // Click on status dropdown
    fireEvent.click(screen.getByRole('button', { name: /Status/i }));
    fireEvent.click(screen.getByText('Active'));

    expect(onChange).toHaveBeenCalledWith('status', 'active');
  });

  it('shows reset button when filters have active values', () => {
    const filtersWithValues = [
      {
        ...filters[0],
        value: 'active',
      },
    ];

    render(<FilterBar filters={filtersWithValues} onChange={vi.fn()} showReset={true} />);

    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });

  it('hides reset button when no filters are active', () => {
    render(<FilterBar filters={filters} onChange={vi.fn()} showReset={true} />);

    expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const onReset = vi.fn();
    const filtersWithValues = [
      {
        ...filters[0],
        value: 'active',
      },
    ];

    render(
      <FilterBar
        filters={filtersWithValues}
        onChange={vi.fn()}
        onReset={onReset}
        showReset={true}
      />
    );

    fireEvent.click(screen.getByText('Reset Filters'));
    expect(onReset).toHaveBeenCalled();
  });

  it('does not show reset button when showReset is false', () => {
    const filtersWithValues = [
      {
        ...filters[0],
        value: 'active',
      },
    ];

    render(<FilterBar filters={filtersWithValues} onChange={vi.fn()} showReset={false} />);

    expect(screen.queryByText('Reset Filters')).not.toBeInTheDocument();
  });

  it('renders select filter', () => {
    render(<FilterBar filters={[filters[0]]} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Status/i })).toBeInTheDocument();
  });

  it('renders date filter', () => {
    render(<FilterBar filters={[filters[1]]} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Date/i })).toBeInTheDocument();
  });

  it('renders text filter', () => {
    render(<FilterBar filters={[filters[2]]} onChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FilterBar filters={filters} onChange={vi.fn()} className="custom-class" />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('handles multiple filter changes', () => {
    const onChange = vi.fn();
    render(<FilterBar filters={filters} onChange={onChange} />);

    // Change status filter
    fireEvent.click(screen.getByRole('button', { name: /Status/i }));
    fireEvent.click(screen.getByText('Active'));

    expect(onChange).toHaveBeenCalledWith('status', 'active');
  });
});
