import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

vi.mock('lucide-react', () => ({
  ChevronRight: () => <span data-testid="chevron">›</span>,
}));

describe('Breadcrumb', () => {
  it('renders breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Grades' },
    ];

    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Current' }];

    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders text for items without href', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Current' }];

    render(<Breadcrumb items={items} />);

    const currentItem = screen.getByText('Current');
    expect(currentItem.tagName).toBe('SPAN');
  });

  it('marks last item as current page', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Current' }];

    render(<Breadcrumb items={items} />);

    const currentItem = screen.getByText('Current');
    expect(currentItem).toHaveAttribute('aria-current', 'page');
  });

  it('renders separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Grades' },
    ];

    render(<Breadcrumb items={items} />);

    const chevrons = screen.getAllByTestId('chevron');
    expect(chevrons.length).toBe(2); // One less than items
  });

  it('has proper accessibility attributes', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Current' }];

    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });

  it('applies custom className', () => {
    const items = [{ label: 'Home', href: '/' }];
    const { container } = render(<Breadcrumb items={items} className="custom-class" />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('renders empty when no items provided', () => {
    const { container } = render(<Breadcrumb items={[]} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(0);
  });

  it('has theme support classes', () => {
    const items = [{ label: 'Home', href: '/' }, { label: 'Current' }];

    const { container } = render(<Breadcrumb items={items} />);

    const link = container.querySelector('a');
    expect(link).toHaveClass('dark:text-primary-400');
  });
});
