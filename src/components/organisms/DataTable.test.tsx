import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';

describe('DataTable Component', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  ];

  const mockColumns = [
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email' },
    { key: 'status' as const, label: 'Status' },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('displays column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('handles sorting when column is sortable', () => {
    const onSort = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onSort={onSort} />);

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    expect(onSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('displays loading skeleton when loading', () => {
    render(<DataTable columns={mockColumns} data={[]} loading={true} pageSize={2} />);
    const skeletons = screen.getAllByRole('row');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when error prop is provided', () => {
    const errorMsg = 'Failed to load data';
    render(<DataTable columns={mockColumns} data={[]} error={errorMsg} />);
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('displays empty state when no data', () => {
    render(<DataTable columns={mockColumns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles pagination', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        onPageChange={onPageChange}
        pageSize={2}
        totalItems={3}
      />
    );

    // Pagination should be rendered
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeInTheDocument();
  });

  it('handles search/filter', () => {
    const onFilter = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onFilter={onFilter} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(onFilter).toHaveBeenCalledWith('john');
  });

  it('renders custom cell content with render function', () => {
    const customColumns = [
      {
        key: 'name' as const,
        label: 'Name',
        render: (value: string) => `Mr. ${value}`,
      },
      { key: 'email' as const, label: 'Email' },
    ];

    render(<DataTable columns={customColumns} data={mockData} />);
    expect(screen.getByText('Mr. John Doe')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Data table');
  });

  it('displays pagination when total pages > 1', () => {
    render(<DataTable columns={mockColumns} data={mockData} pageSize={1} totalItems={3} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeInTheDocument();
  });
});
