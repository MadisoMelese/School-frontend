import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomTabNavigation, BottomTabItem } from '../../../src/components/organisms/BottomTabNavigation'

describe('BottomTabNavigation Component', () => {
  const mockItems: BottomTabItem[] = [
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
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Settings',
      href: '/settings',
    },
  ]

  const mockOnItemClick = vi.fn()

  beforeEach(() => {
    mockOnItemClick.mockClear()
  })

  // Test 1: Renders navigation with correct number of items (max 5)
  it('should render maximum 5 items in bottom tab navigation', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    const buttons = nav?.querySelectorAll('button')
    expect(buttons).toHaveLength(5)
  })

  // Test 2: Renders all items when less than 5 items provided
  it('should render all items when less than 5 items provided', () => {
    const fewItems = mockItems.slice(0, 3)
    const { container } = render(
      <BottomTabNavigation
        items={fewItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    const buttons = nav?.querySelectorAll('button')
    expect(buttons).toHaveLength(3)
  })

  // Test 3: Displays correct labels for each tab
  it('should display correct labels for each tab', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Grades')).toBeInTheDocument()
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  // Test 4: Highlights active tab with primary color
  it('should highlight active tab with primary color', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        activeItem="grades"
        onItemClick={mockOnItemClick}
      />
    )

    const gradesButton = screen.getByLabelText('Grades')
    expect(gradesButton).toHaveClass('text-primary-600')
  })

  // Test 5: Non-active tabs have neutral color
  it('should display non-active tabs with neutral color', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        activeItem="grades"
        onItemClick={mockOnItemClick}
      />
    )

    const dashboardButton = screen.getByLabelText('Dashboard')
    expect(dashboardButton).toHaveClass('text-neutral-600')
  })

  // Test 6: Calls onItemClick when tab is clicked
  it('should call onItemClick when tab is clicked', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const gradesButton = screen.getByLabelText('Grades')
    fireEvent.click(gradesButton)

    expect(mockOnItemClick).toHaveBeenCalledWith('grades')
    expect(mockOnItemClick).toHaveBeenCalledTimes(1)
  })

  // Test 7: Displays badge with correct count
  it('should display badge with correct count', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
  })

  // Test 8: Displays "99+" for badges with count > 99
  it('should display "99+" for badges with count greater than 99', () => {
    const itemsWithHighBadge = [
      ...mockItems.slice(0, 4),
      {
        ...mockItems[4],
        badge: 150,
      },
    ]

    render(
      <BottomTabNavigation
        items={itemsWithHighBadge}
        onItemClick={mockOnItemClick}
      />
    )

    const badge = screen.getByText('99+')
    expect(badge).toBeInTheDocument()
  })

  // Test 9: Does not display badge when badge count is 0
  it('should not display badge when badge count is 0', () => {
    const itemsWithZeroBadge = [
      ...mockItems.slice(0, 3),
      {
        ...mockItems[3],
        badge: 0,
      },
    ]

    render(
      <BottomTabNavigation
        items={itemsWithZeroBadge}
        onItemClick={mockOnItemClick}
      />
    )

    const badges = screen.queryAllByRole('status')
    expect(badges).toHaveLength(0)
  })

  // Test 10: Filters items based on user role
  it('should filter items based on user role', () => {
    const roleBasedItems: BottomTabItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'Home',
        href: '/dashboard',
        roles: ['student', 'teacher', 'parent', 'admin'],
      },
      {
        id: 'grades',
        label: 'Grades',
        icon: 'BookOpen',
        href: '/grades',
        roles: ['student', 'parent'],
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: 'Calendar',
        href: '/attendance',
        roles: ['teacher', 'admin'],
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: 'Mail',
        href: '/messages',
        roles: ['student', 'teacher', 'parent', 'admin'],
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'Users',
        href: '/users',
        roles: ['admin'],
      },
    ]

    render(
      <BottomTabNavigation
        items={roleBasedItems}
        onItemClick={mockOnItemClick}
        userRole="student"
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Grades')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.queryByText('Attendance')).not.toBeInTheDocument()
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
  })

  // Test 11: Shows all items when no role restrictions
  it('should show all items when no role restrictions are set', () => {
    const unrestricted: BottomTabItem[] = [
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
    ]

    render(
      <BottomTabNavigation
        items={unrestricted}
        onItemClick={mockOnItemClick}
        userRole="student"
      />
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Grades')).toBeInTheDocument()
    expect(screen.getByText('Attendance')).toBeInTheDocument()
  })

  // Test 12: Has correct accessibility attributes
  it('should have correct accessibility attributes', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    )

    const nav = screen.getByRole('navigation', { name: /mobile bottom navigation/i })
    expect(nav).toBeInTheDocument()

    const activeButton = screen.getByLabelText('Dashboard')
    expect(activeButton).toHaveAttribute('aria-current', 'page')

    const inactiveButton = screen.getByLabelText('Grades')
    expect(inactiveButton).not.toHaveAttribute('aria-current')
  })

  // Test 13: Has sticky positioning at bottom
  it('should have sticky positioning at bottom of screen', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
  })

  // Test 14: Has minimum tap target size (44px)
  it('should have minimum tap target size of 44px', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const buttons = container.querySelectorAll('button')
    buttons.forEach((button) => {
      expect(button).toHaveClass('min-h-16')
    })
  })

  // Test 15: Handles empty items array gracefully
  it('should handle empty items array gracefully', () => {
    const { container } = render(
      <BottomTabNavigation
        items={[]}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    const buttons = nav?.querySelectorAll('button')
    expect(buttons).toHaveLength(0)
  })

  // Test 16: Multiple clicks on same item
  it('should handle multiple clicks on the same item', () => {
    render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const gradesButton = screen.getByLabelText('Grades')
    fireEvent.click(gradesButton)
    fireEvent.click(gradesButton)
    fireEvent.click(gradesButton)

    expect(mockOnItemClick).toHaveBeenCalledTimes(3)
    expect(mockOnItemClick).toHaveBeenCalledWith('grades')
  })

  // Test 17: Switches active state when different items are clicked
  it('should switch active state when different items are clicked', () => {
    const { rerender } = render(
      <BottomTabNavigation
        items={mockItems}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
      />
    )

    let dashboardButton = screen.getByLabelText('Dashboard')
    expect(dashboardButton).toHaveClass('text-primary-600')

    rerender(
      <BottomTabNavigation
        items={mockItems}
        activeItem="grades"
        onItemClick={mockOnItemClick}
      />
    )

    dashboardButton = screen.getByLabelText('Dashboard')
    const gradesButton = screen.getByLabelText('Grades')
    expect(dashboardButton).toHaveClass('text-neutral-600')
    expect(gradesButton).toHaveClass('text-primary-600')
  })

  // Test 18: Renders with correct z-index for layering
  it('should render with correct z-index for layering', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('z-40')
  })

  // Test 19: Respects safe area insets for notched devices
  it('should respect safe area insets for notched devices', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('safe-bottom')
  })

  // Test 20: Displays correct border styling
  it('should display correct border styling', () => {
    const { container } = render(
      <BottomTabNavigation
        items={mockItems}
        onItemClick={mockOnItemClick}
      />
    )

    const nav = container.querySelector('nav')
    expect(nav).toHaveClass('border-t', 'border-neutral-200')
  })
})
