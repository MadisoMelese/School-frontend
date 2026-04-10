import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortalLayout } from './PortalLayout';

// Mock the hooks and components
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false),
}));

vi.mock('@components/organisms/Header', () => ({
  Header: ({ title }: { title?: string }) => <div>{title || 'Header'}</div>,
}));

vi.mock('@components/molecules/Breadcrumb', () => ({
  Breadcrumb: ({ items }: { items: any[] }) => (
    <div>
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </div>
  ),
}));

describe('PortalLayout', () => {
  it('renders with default props', () => {
    render(
      <PortalLayout>
        <div>Portal content</div>
      </PortalLayout>
    );

    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <PortalLayout title="Student Portal" description="View your grades">
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByRole('heading', { name: 'Student Portal' })).toBeInTheDocument();
    expect(screen.getByText('View your grades')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Grades' }];

    render(
      <PortalLayout breadcrumbs={breadcrumbs}>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
  });

  it('renders sidebar content when provided', () => {
    render(
      <PortalLayout sidebarContent={<div>Sidebar menu</div>}>
        <div>Main content</div>
      </PortalLayout>
    );

    expect(screen.getByText('Sidebar menu')).toBeInTheDocument();
  });

  it('hides sidebar when showSidebar is false', () => {
    const { container } = render(
      <PortalLayout showSidebar={false} sidebarContent={<div>Sidebar</div>}>
        <div>Content</div>
      </PortalLayout>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <PortalLayout sidebarContent={<div>Menu</div>}>
        <div>Content</div>
      </PortalLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Portal content');

    const complementary = screen.getByRole('complementary');
    expect(complementary).toHaveAttribute('aria-label', 'Portal navigation');
  });

  it('renders children correctly', () => {
    render(
      <PortalLayout>
        <button>Action</button>
        <p>Some content</p>
      </PortalLayout>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Some content')).toBeInTheDocument();
  });

  it('has theme support classes', () => {
    const { container } = render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const mainDiv = container.querySelector('[role="main"]');
    expect(mainDiv).toHaveClass('scrollbar-thin');
  });

  it('renders header with banner role', () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
