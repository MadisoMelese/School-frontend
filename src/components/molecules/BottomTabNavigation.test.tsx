import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomTabNavigation, BottomTabItem } from './BottomTabNavigation';

describe('BottomTabNavigation', () => {
  const mockItems: BottomTabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      roles: ['student', 'teacher', 'parent', 'admin'],
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: 'BookOpen',
      roles: ['student', 'teacher', 'parent'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: 'Calendar',
      roles: ['student', 'teacher'],
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'MessageSquare',
      roles: ['student', 'teacher', 'parent', 'admin'],
      badge: 3,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      roles: ['student', 'teacher', 'parent', 'admin'],
    },
  ];

  const mockOnItemClick = vi.fn();

  beforeEach(() => {
    mockOnItemClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders all navigation items', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      mockItems.forEach((item) => {
        expect(screen.getByLabelText(item.label)).toBeInTheDocument();
      });
    });

    it('renders with correct ARIA attributes', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const nav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(nav).toBeInTheDocument();

      const activeButton = screen.getByLabelText('Dashboard');
      expect(activeButton).toHaveAttribute('aria-current', 'page');
    });

    it('renders labels by default', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      mockItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('hides labels when showLabels is false', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
          showLabels={false}
        />
      );

      mockItems.forEach((item) => {
        expect(screen.queryByText(item.label)).not.toBeInTheDocument();
      });
    });
  });

  describe('Active State', () => {
    it('highlights active item', () => {
      render(
        <BottomTabNavigation items={mockItems} activeItem="grades" onItemClick={mockOnItemClick} />
      );

      const gradesButton = screen.getByLabelText('Grades');
      expect(gradesButton).toHaveAttribute('aria-current', 'page');
      expect(gradesButton).toHaveClass('text-primary-600');
    });

    it('shows inactive items with neutral color', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const gradesButton = screen.getByLabelText('Grades');
      expect(gradesButton).not.toHaveAttribute('aria-current', 'page');
      expect(gradesButton).toHaveClass('text-neutral-600');
    });

    it('updates active state when activeItem prop changes', () => {
      const { rerender } = render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.getByLabelText('Dashboard')).toHaveAttribute('aria-current', 'page');

      rerender(
        <BottomTabNavigation
          items={mockItems}
          activeItem="messages"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.getByLabelText('Dashboard')).not.toHaveAttribute('aria-current', 'page');
      expect(screen.getByLabelText('Messages')).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Badge Display', () => {
    it('displays badge with notification count', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-danger-500');
    });

    it('displays "99+" for badges over 99', () => {
      const itemsWithHighBadge = [
        ...mockItems.slice(0, 3),
        { ...mockItems[3], badge: 150 },
        mockItems[4],
      ];

      render(
        <BottomTabNavigation
          items={itemsWithHighBadge}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('does not display badge when badge is 0 or undefined', () => {
      const itemsNoBadge = mockItems.map((item) => ({ ...item, badge: 0 }));

      render(
        <BottomTabNavigation
          items={itemsNoBadge}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('has correct ARIA label for badge', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const badge = screen.getByRole('status', { name: /3 unread/i });
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onItemClick when item is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const gradesButton = screen.getByLabelText('Grades');
      await user.click(gradesButton);

      expect(mockOnItemClick).toHaveBeenCalledWith('grades');
      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
    });

    it('calls onItemClick with correct item id', async () => {
      const user = userEvent.setup();
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const messagesButton = screen.getByLabelText('Messages');
      await user.click(messagesButton);

      expect(mockOnItemClick).toHaveBeenCalledWith('messages');
    });

    it('supports keyboard navigation with arrow keys', async () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const dashboardButton = screen.getByLabelText('Dashboard');
      dashboardButton.focus();

      // Press right arrow to move to next item
      fireEvent.keyDown(dashboardButton, { key: 'ArrowRight' });
      expect(mockOnItemClick).toHaveBeenCalledWith('grades');

      // Press left arrow to move to previous item
      mockOnItemClick.mockClear();
      const gradesButton = screen.getByLabelText('Grades');
      fireEvent.keyDown(gradesButton, { key: 'ArrowLeft' });
      expect(mockOnItemClick).toHaveBeenCalledWith('dashboard');
    });

    it('wraps around when navigating with arrow keys', async () => {
      render(
        <BottomTabNavigation items={mockItems} activeItem="profile" onItemClick={mockOnItemClick} />
      );

      const profileButton = screen.getByLabelText('Profile');
      profileButton.focus();

      // Press right arrow from last item should go to first
      fireEvent.keyDown(profileButton, { key: 'ArrowRight' });
      expect(mockOnItemClick).toHaveBeenCalledWith('dashboard');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', async () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const dashboardButton = screen.getByLabelText('Dashboard');
      dashboardButton.focus();
      expect(dashboardButton).toHaveFocus();
    });

    it('has visible focus indicator', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const gradesButton = screen.getByLabelText('Grades');
      expect(gradesButton).toHaveClass('focus:ring-2');
      expect(gradesButton).toHaveClass('focus:ring-primary-500');
    });

    it('provides aria-label for each item', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      mockItems.forEach((item) => {
        const button = screen.getByLabelText(item.label);
        expect(button).toHaveAttribute('aria-label', item.label);
      });
    });

    it('uses custom ariaLabel when provided', () => {
      const itemsWithCustomLabel = [
        { ...mockItems[0], ariaLabel: 'Go to Dashboard' },
        ...mockItems.slice(1),
      ];

      render(
        <BottomTabNavigation
          items={itemsWithCustomLabel}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const button = screen.getByLabelText('Go to Dashboard');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Touch-Friendly Design', () => {
    it('has minimum 44px height for touch targets', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('h-16'); // 16 * 4px = 64px (exceeds 44px minimum)
    });

    it('has adequate padding for touch targets', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('px-2', 'py-2');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('is hidden on desktop (md and above)', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('md:hidden');
    });

    it('applies custom className', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
          className="custom-class"
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-class');
    });
  });

  describe('Scroll Behavior', () => {
    it('does not hide on scroll by default', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
          hideOnScroll={false}
        />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('translate-y-0');
    });

    it('accepts hideOnScroll prop', () => {
      const { rerender } = render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
          hideOnScroll={false}
        />
      );

      let nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('translate-y-0');

      rerender(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
          hideOnScroll={true}
        />
      );

      nav = screen.getByRole('navigation');
      // Component should still be visible initially
      expect(nav).toHaveClass('translate-y-0');
    });
  });

  describe('Empty State', () => {
    it('renders with empty items array', () => {
      render(
        <BottomTabNavigation items={[]} activeItem="dashboard" onItemClick={mockOnItemClick} />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('Multiple Items', () => {
    it('handles maximum 5 items correctly', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('handles more than 5 items', () => {
      const manyItems = [
        ...mockItems,
        {
          id: 'settings',
          label: 'Settings',
          icon: 'Settings',
          roles: ['student', 'teacher', 'parent', 'admin'],
        },
      ];

      render(
        <BottomTabNavigation
          items={manyItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });
  });

  describe('State Persistence', () => {
    it('maintains active state across re-renders', () => {
      const { rerender } = render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="messages"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.getByLabelText('Messages')).toHaveAttribute('aria-current', 'page');

      rerender(
        <BottomTabNavigation
          items={mockItems}
          activeItem="messages"
          onItemClick={mockOnItemClick}
        />
      );

      expect(screen.getByLabelText('Messages')).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Animation Classes', () => {
    it('applies animation classes to active indicator', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const dashboardButton = screen.getByLabelText('Dashboard');
      const indicator = dashboardButton.querySelector('div[aria-hidden="true"]');

      expect(indicator).toHaveClass('animate-in');
      expect(indicator).toHaveClass('fade-in');
      expect(indicator).toHaveClass('slide-in-from-bottom-2');
    });

    it('applies scale animation to active icon', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const dashboardButton = screen.getByLabelText('Dashboard');
      const svg = dashboardButton.querySelector('svg');

      // Check that the SVG has the scale class
      expect(svg?.className.baseVal).toContain('scale-110');
    });

    it('applies normal scale to inactive icons', () => {
      render(
        <BottomTabNavigation
          items={mockItems}
          activeItem="dashboard"
          onItemClick={mockOnItemClick}
        />
      );

      const gradesButton = screen.getByLabelText('Grades');
      const svg = gradesButton.querySelector('svg');

      // Check that the SVG has the scale-100 class
      expect(svg?.className.baseVal).toContain('scale-100');
    });
  });
});
