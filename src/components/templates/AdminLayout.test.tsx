import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLayout } from './AdminLayout';

// Mock the hooks and components
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false),
}));

vi.mock('@components/organisms/Header', () => ({
  Header: ({ title }: { title?: string }) => <div>{title || 'Header'}</div>,
}));

vi.mock('lucide-react', () => ({
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">X</div>,
}));

describe('AdminLayout', () => {
  const mockMenuItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Users', href: '/admin/users', badge: 5 },
    {
      label: 'Settings',
      href: '/admin/settings',
      submenu: [
        { label: 'General', href: '/admin/settings/general' },
        { label: 'Security', href: '/admin/settings/security' },
      ],
    },
  ];

  it('renders with default props', () => {
    render(
      <AdminLayout>
        <div>Admin content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <AdminLayout title="User Management" description="Manage system users">
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByRole('heading', { name: 'User Management' })).toBeInTheDocument();
    expect(screen.getByText('Manage system users')).toBeInTheDocument();
  });

  it('renders menu items', () => {
    render(
      <AdminLayout menuItems={mockMenuItems}>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays badge on menu items', () => {
    render(
      <AdminLayout menuItems={mockMenuItems}>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('toggles submenu on click', () => {
    render(
      <AdminLayout menuItems={mockMenuItems}>
        <div>Content</div>
      </AdminLayout>
    );

    const settingsLink = screen.getByText('Settings').closest('a');
    fireEvent.click(settingsLink!);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Admin content');

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Admin navigation');
  });

  it('renders children correctly', () => {
    render(
      <AdminLayout>
        <button>Action</button>
        <p>Some content</p>
      </AdminLayout>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Some content')).toBeInTheDocument();
  });

  it('has theme support classes', () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('dark:bg-neutral-800');
  });

  it('marks current page as active', () => {
    render(
      <AdminLayout menuItems={mockMenuItems} currentPath="/admin/users">
        <div>Content</div>
      </AdminLayout>
    );

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveClass('bg-primary-100');
  });

  it('renders header with banner role', () => {
    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders menu items with proper role', () => {
    render(
      <AdminLayout menuItems={mockMenuItems}>
        <div>Content</div>
      </AdminLayout>
    );

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});
