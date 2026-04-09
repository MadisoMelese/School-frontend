import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BottomTabNavigation } from './BottomTabNavigation';

// Mock useHeaderVisibility
vi.mock('../../hooks/useHeaderVisibility', () => ({
  useHeaderVisibility: vi.fn(() => ({
    isHeaderVisible: true,
    scrollDirection: 'up',
    scrollY: 0,
    isMobile: true,
  })),
}));

import { useHeaderVisibility } from '../../hooks/useHeaderVisibility';

describe('BottomTabNavigation Component with Scroll Hiding', () => {
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
      badge: 3,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      href: '/profile',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all navigation items', () => {
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="dashboard"
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('should highlight active item', () => {
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="grades"
      />,
    );

    const gradesButton = screen.getByLabelText('Grades');
    expect(gradesButton).toHaveClass('text-primary-600');
  });

  it('should call onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="dashboard"
      />,
    );

    const gradesButton = screen.getByLabelText('Grades');
    fireEvent.click(gradesButton);

    expect(onItemClick).toHaveBeenCalledWith('grades');
  });

  it('should display badge count when present', () => {
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="dashboard"
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should filter items by user role', () => {
    const itemsWithRoles = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'Home',
        href: '/dashboard',
        roles: ['student', 'teacher'],
      },
      {
        id: 'admin',
        label: 'Admin',
        icon: 'Settings',
        href: '/admin',
        roles: ['admin'],
      },
    ];

    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={itemsWithRoles}
        onItemClick={onItemClick}
        userRole="student"
      />,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should apply scroll hiding class when header is hidden', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={true}
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-full');
  });

  it('should not apply scroll hiding class when header is visible', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: true,
      scrollDirection: 'up',
      scrollY: 0,
      isMobile: true,
    });

    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={true}
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-0');
  });

  it('should disable scroll hiding when enableScrollHiding is false', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={false}
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-0');
  });

  it('should pass scroll threshold to useHeaderVisibility', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        scrollHideThreshold={100}
      />,
    );

    expect(mockUseHeaderVisibility).toHaveBeenCalledWith(100);
  });

  it('should use default scroll threshold of 50', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation items={mockItems} onItemClick={onItemClick} />,
    );

    expect(mockUseHeaderVisibility).toHaveBeenCalledWith(50);
  });

  it('should have smooth transition animation', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={true}
      />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('transition-transform');
    expect(nav).toHaveClass('duration-300');
    expect(nav).toHaveClass('ease-in-out');
  });

  it('should have proper z-index for fixed positioning', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation items={mockItems} onItemClick={onItemClick} />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('z-40');
  });

  it('should have proper border styling', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation items={mockItems} onItemClick={onItemClick} />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('border-t');
    expect(nav).toHaveClass('border-neutral-200');
  });

  it('should have safe area bottom padding', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation items={mockItems} onItemClick={onItemClick} />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('safe-bottom');
  });

  it('should display badge with 99+ for large counts', () => {
    const itemsWithLargeBadge = [
      {
        id: 'messages',
        label: 'Messages',
        icon: 'Mail',
        href: '/messages',
        badge: 150,
      },
    ];

    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={itemsWithLargeBadge}
        onItemClick={onItemClick}
      />,
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const onItemClick = vi.fn();
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="dashboard"
      />,
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Mobile bottom navigation');

    const dashboardButton = screen.getByLabelText('Dashboard');
    expect(dashboardButton).toHaveAttribute('aria-current', 'page');
  });

  it('should handle empty items array', () => {
    const onItemClick = vi.fn();
    const { container } = render(
      <BottomTabNavigation items={[]} onItemClick={onItemClick} />,
    );

    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('should update active item when prop changes', () => {
    const onItemClick = vi.fn();
    const { rerender } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="dashboard"
      />,
    );

    let dashboardButton = screen.getByLabelText('Dashboard');
    expect(dashboardButton).toHaveClass('text-primary-600');

    rerender(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        activeItem="grades"
      />,
    );

    dashboardButton = screen.getByLabelText('Dashboard');
    expect(dashboardButton).not.toHaveClass('text-primary-600');

    const gradesButton = screen.getByLabelText('Grades');
    expect(gradesButton).toHaveClass('text-primary-600');
  });

  it('should handle scroll hiding state changes', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;

    // Initially visible
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: true,
      scrollDirection: 'up',
      scrollY: 0,
      isMobile: true,
    });

    const onItemClick = vi.fn();
    const { container, rerender } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={true}
      />,
    );

    let nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-0');

    // Change to hidden
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    rerender(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={onItemClick}
        enableScrollHiding={true}
      />,
    );

    nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-full');
  });
});
