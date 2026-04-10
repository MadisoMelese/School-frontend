import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Navigation } from './Navigation';

describe('Navigation Component with Scroll Hiding', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    username: 'john.doe',
    role: 'student' as const,
    avatar: 'https://example.com/avatar.jpg',
    isBlocked: false,
    isVerified: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'Home',
      href: '/dashboard',
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: 'BookOpen',
      href: '/grades',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: 'Calendar',
      href: '/attendance',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'Mail',
      href: '/messages',
      badge: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navigation items', () => {
    const onItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />);

    const dashboardItems = screen.getAllByText('Dashboard');
    expect(dashboardItems.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Grades').length).toBeGreaterThan(0);
  });

  it('should call onItemClick when navigation item is clicked', () => {
    const onItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />);

    const dashboardButtons = screen.getAllByText('Dashboard');
    fireEvent.click(dashboardButtons[0]);

    expect(onItemClick).toHaveBeenCalledWith('dashboard');
  });

  it('should highlight active item', () => {
    const onItemClick = vi.fn();
    render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        activeItem="grades"
      />
    );

    const gradesButtons = screen.getAllByText('Grades');
    expect(gradesButtons[0].closest('button')).toHaveClass('bg-primary-50');
  });

  it('should display badge count for items', () => {
    const onItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />);

    const badgeItems = screen.getAllByText('2');
    expect(badgeItems.length).toBeGreaterThan(0);
  });

  it('should render bottom tab navigation on mobile', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        useBottomTabNavigation={true}
      />
    );

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]');
    expect(bottomNav).toBeInTheDocument();
  });

  it('should not render bottom tab navigation when disabled', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        useBottomTabNavigation={false}
      />
    );

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]');
    expect(bottomNav).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    const sidebar = container.querySelector('aside[role="navigation"]');
    expect(sidebar).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should toggle sidebar on mobile menu button click', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('translate-x-0');
  });

  it('should close sidebar when navigation item is clicked', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    // Open sidebar
    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    // Click navigation item (use first Dashboard which is in sidebar)
    const dashboardButtons = screen.getAllByText('Dashboard');
    fireEvent.click(dashboardButtons[0]);

    // Sidebar should be closed
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should display overlay when sidebar is open on mobile', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    const overlay = container.querySelector('div[aria-hidden="true"]');
    expect(overlay).toBeInTheDocument();
  });

  it('should close sidebar when overlay is clicked', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    // Open sidebar
    const menuButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(menuButton);

    // Click overlay
    const overlay = container.querySelector('div[aria-hidden="true"]');
    fireEvent.click(overlay!);

    // Sidebar should be closed
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('should display SchoolOS logo', () => {
    const onItemClick = vi.fn();
    render(<Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />);

    const logos = screen.getAllByText('SchoolOS');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('should have proper z-index layering', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('z-50');
  });

  it('should have smooth sidebar transition', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} />
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('transition-transform');
    expect(sidebar).toHaveClass('duration-300');
  });

  it('should support custom scroll hiding threshold', () => {
    const onItemClick = vi.fn();
    render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        enableScrollHiding={true}
        scrollHideThreshold={75}
      />
    );

    // Component should render without errors
    const dashboardItems = screen.getAllByText('Dashboard');
    expect(dashboardItems.length).toBeGreaterThan(0);
  });

  it('should disable scroll hiding when enableScrollHiding is false', () => {
    const onItemClick = vi.fn();
    render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        enableScrollHiding={false}
      />
    );

    // Component should render without errors
    const dashboardItems = screen.getAllByText('Dashboard');
    expect(dashboardItems.length).toBeGreaterThan(0);
  });

  it('should pass scroll hiding props to BottomTabNavigation', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <Navigation
        items={mockItems}
        onItemClick={onItemClick}
        onLogout={vi.fn()}
        useBottomTabNavigation={true}
        enableScrollHiding={true}
        scrollHideThreshold={100}
      />
    );

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]');
    expect(bottomNav).toBeInTheDocument();
  });

  it('should render with user information', () => {
    const onItemClick = vi.fn();
    render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={vi.fn()} user={mockUser} />
    );

    // User info should be in the sidebar
    const userNames = screen.getAllByText('John Doe');
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('should call onLogout when logout button is clicked', () => {
    const onLogout = vi.fn();
    const onItemClick = vi.fn();
    render(
      <Navigation items={mockItems} onItemClick={onItemClick} onLogout={onLogout} user={mockUser} />
    );

    const userMenuButtons = screen.getAllByText('John Doe');
    const userMenuButton = userMenuButtons[0].closest('button');
    fireEvent.click(userMenuButton!);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(onLogout).toHaveBeenCalled();
  });
});
