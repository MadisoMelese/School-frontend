import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation, NavItem } from '../../src/components/organisms/Navigation'
import { User } from '../../src/types'

describe('Navigation Integration Tests', () => {
  const mockNavItems: NavItem[] = [
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
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      href: '/profile',
    },
  ]

  const mockUser: User = {
    id: '1',
    email: 'student@example.com',
    name: 'John Doe',
    role: 'student',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockOnItemClick = vi.fn()
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    mockOnItemClick.mockClear()
    mockOnLogout.mockClear()
  })

  // Test 1: Renders BottomTabNavigation on mobile when enabled
  it('should render BottomTabNavigation on mobile when enabled', () => {
    const { container } = render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    expect(bottomNav).toBeInTheDocument()
  })

  // Test 2: Does not render BottomTabNavigation when disabled
  it('should not render BottomTabNavigation when disabled', () => {
    const { container } = render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={false}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    expect(bottomNav).not.toBeInTheDocument()
  })

  // Test 3: BottomTabNavigation receives correct props
  it('should pass correct props to BottomTabNavigation', () => {
    render(
      <Navigation
        items={mockNavItems}
        activeItem="grades"
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const gradesButton = screen.getByLabelText('Grades')
    expect(gradesButton).toHaveAttribute('aria-current', 'page')
  })

  // Test 4: BottomTabNavigation receives user role
  it('should pass user role to BottomTabNavigation for role-based filtering', () => {
    const roleBasedItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'Home',
        href: '/dashboard',
        roles: ['student', 'teacher', 'admin'],
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'Users',
        href: '/users',
        roles: ['admin'],
      },
    ]

    const { container } = render(
      <Navigation
        items={roleBasedItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    expect(bottomNav?.textContent).toContain('Dashboard')
    expect(bottomNav?.textContent).not.toContain('Users')
  })

  // Test 5: Clicking BottomTabNavigation item calls onItemClick
  it('should call onItemClick when BottomTabNavigation item is clicked', () => {
    render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const gradesButton = screen.getByLabelText('Grades')
    fireEvent.click(gradesButton)

    expect(mockOnItemClick).toHaveBeenCalledWith('grades')
  })

  // Test 6: BottomTabNavigation displays badges correctly
  it('should display badges in BottomTabNavigation', () => {
    const { container } = render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    const badges = bottomNav?.querySelectorAll('[role="status"]')
    expect(badges?.length).toBeGreaterThan(0)
  })

  // Test 7: Sidebar still renders on desktop
  it('should render sidebar on desktop regardless of BottomTabNavigation setting', () => {
    const { container } = render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const sidebar = container.querySelector('aside[role="navigation"]')
    expect(sidebar).toBeInTheDocument()
  })

  // Test 8: User menu still works with BottomTabNavigation
  it('should render user menu in sidebar even with BottomTabNavigation enabled', () => {
    render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const userMenuButton = screen.getByLabelText('User menu')
    expect(userMenuButton).toBeInTheDocument()
  })

  // Test 9: Logout works with BottomTabNavigation enabled
  it('should call onLogout when logout is clicked with BottomTabNavigation enabled', () => {
    render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const userMenuButton = screen.getByLabelText('User menu')
    fireEvent.click(userMenuButton)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockOnLogout).toHaveBeenCalled()
  })

  // Test 10: BottomTabNavigation limits items to 5
  it('should limit BottomTabNavigation to 5 items maximum', () => {
    const manyItems: NavItem[] = [
      ...mockNavItems,
      {
        id: 'settings',
        label: 'Settings',
        icon: 'Settings',
        href: '/settings',
      },
      {
        id: 'help',
        label: 'Help',
        icon: 'HelpCircle',
        href: '/help',
      },
    ]

    const { container } = render(
      <Navigation
        items={manyItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    const buttons = bottomNav?.querySelectorAll('button')
    expect(buttons).toHaveLength(5)
  })

  // Test 11: Active item state is maintained in BottomTabNavigation
  it('should maintain active item state in BottomTabNavigation', () => {
    const { rerender } = render(
      <Navigation
        items={mockNavItems}
        activeItem="dashboard"
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    let dashboardButton = screen.getByLabelText('Dashboard')
    expect(dashboardButton).toHaveAttribute('aria-current', 'page')

    rerender(
      <Navigation
        items={mockNavItems}
        activeItem="grades"
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    dashboardButton = screen.getByLabelText('Dashboard')
    const gradesButton = screen.getByLabelText('Grades')
    expect(dashboardButton).not.toHaveAttribute('aria-current', 'page')
    expect(gradesButton).toHaveAttribute('aria-current', 'page')
  })

  // Test 12: BottomTabNavigation is hidden on desktop (md breakpoint)
  it('should hide BottomTabNavigation on desktop with md:hidden class', () => {
    const { container } = render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    const wrapper = container.querySelector('.md\\:hidden')
    expect(wrapper).toBeInTheDocument()
  })

  // Test 13: Multiple role-based items are filtered correctly
  it('should filter multiple role-based items correctly', () => {
    const roleBasedItems: NavItem[] = [
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

    const studentUser: User = {
      ...mockUser,
      role: 'student',
    }

    const { container } = render(
      <Navigation
        items={roleBasedItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={studentUser}
        useBottomTabNavigation={true}
      />
    )

    const bottomNav = container.querySelector('nav[aria-label="Mobile bottom navigation"]')
    expect(bottomNav?.textContent).toContain('Dashboard')
    expect(bottomNav?.textContent).toContain('Grades')
    expect(bottomNav?.textContent).toContain('Messages')
    expect(bottomNav?.textContent).not.toContain('Attendance')
    expect(bottomNav?.textContent).not.toContain('Users')
  })

  // Test 14: BottomTabNavigation works without user
  it('should render BottomTabNavigation without user', () => {
    render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        useBottomTabNavigation={true}
      />
    )

    const dashboardButton = screen.getByLabelText('Dashboard')
    expect(dashboardButton).toBeInTheDocument()
  })

  // Test 15: Sidebar navigation items still work with BottomTabNavigation
  it('should allow clicking sidebar items even with BottomTabNavigation enabled', () => {
    render(
      <Navigation
        items={mockNavItems}
        onItemClick={mockOnItemClick}
        onLogout={mockOnLogout}
        user={mockUser}
        useBottomTabNavigation={true}
      />
    )

    // Click on sidebar item (first occurrence of Dashboard)
    const dashboardButtons = screen.getAllByLabelText('Dashboard')
    fireEvent.click(dashboardButtons[0])

    expect(mockOnItemClick).toHaveBeenCalledWith('dashboard')
  })
})
