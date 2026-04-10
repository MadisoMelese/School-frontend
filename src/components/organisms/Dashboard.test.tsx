import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard Component', () => {
  const mockWidgets = [
    {
      id: 'grades',
      title: 'Recent Grades',
      type: 'card' as const,
      content: <div>Grade content</div>,
    },
    {
      id: 'attendance',
      title: 'Attendance',
      type: 'stats' as const,
      content: <div>Attendance content</div>,
      size: 'medium' as const,
    },
    {
      id: 'exams',
      title: 'Upcoming Exams',
      type: 'list' as const,
      content: <div>Exams content</div>,
      size: 'large' as const,
    },
  ];

  it('renders dashboard widgets', () => {
    render(<Dashboard widgets={mockWidgets} />);

    expect(screen.getByText('Recent Grades')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Exams')).toBeInTheDocument();
  });

  it('displays widget content', () => {
    render(<Dashboard widgets={mockWidgets} />);

    expect(screen.getByText('Grade content')).toBeInTheDocument();
    expect(screen.getByText('Attendance content')).toBeInTheDocument();
    expect(screen.getByText('Exams content')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading', () => {
    render(<Dashboard widgets={[]} loading={true} />);

    const skeletons = screen.getAllByRole('region');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error message when error prop is provided', () => {
    const errorMsg = 'Failed to load dashboard';
    render(<Dashboard widgets={[]} error={errorMsg} />);

    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  it('displays empty state when no widgets', () => {
    render(<Dashboard widgets={[]} />);

    expect(screen.getByText('No widgets available')).toBeInTheDocument();
  });

  it('displays loading state for individual widgets', () => {
    const widgetsWithLoading = [
      {
        id: 'loading-widget',
        title: 'Loading Widget',
        type: 'card' as const,
        content: <div>Content</div>,
        loading: true,
      },
    ];

    render(<Dashboard widgets={widgetsWithLoading} />);

    expect(screen.getByText('Loading Widget')).toBeInTheDocument();
  });

  it('displays error state for individual widgets', () => {
    const widgetsWithError = [
      {
        id: 'error-widget',
        title: 'Error Widget',
        type: 'card' as const,
        content: <div>Content</div>,
        error: 'Widget failed to load',
      },
    ];

    render(<Dashboard widgets={widgetsWithError} />);

    expect(screen.getByText('Widget failed to load')).toBeInTheDocument();
  });

  it('applies correct size classes to widgets', () => {
    const { container } = render(<Dashboard widgets={mockWidgets} />);

    const largeWidget = container.querySelector('[class*="md:col-span-2"]');
    expect(largeWidget).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Dashboard widgets={mockWidgets} />);

    const regions = screen.getAllByRole('region');
    expect(regions.length).toBeGreaterThan(0);
  });
});
