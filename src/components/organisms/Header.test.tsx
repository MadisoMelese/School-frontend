import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Header } from './Header';

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

describe('Header Component with Scroll Hiding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with title', () => {
    render(<Header title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render with default title', () => {
    render(<Header />);
    expect(screen.getByText('SchoolOS')).toBeInTheDocument();
  });

  it('should apply scroll hiding class when header is hidden', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    const { container } = render(<Header enableScrollHiding={true} title="Test" />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('-translate-y-full');
  });

  it('should not apply scroll hiding class when header is visible', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: true,
      scrollDirection: 'up',
      scrollY: 0,
      isMobile: true,
    });

    const { container } = render(<Header enableScrollHiding={true} title="Test" />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('translate-y-0');
  });

  it('should disable scroll hiding when enableScrollHiding is false', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    const { container } = render(<Header enableScrollHiding={false} title="Test" />);
    const header = container.querySelector('header');

    // Should always show translate-y-0 when disabled
    expect(header).toHaveClass('translate-y-0');
  });

  it('should pass scroll threshold to useHeaderVisibility', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    render(<Header scrollHideThreshold={100} />);

    expect(mockUseHeaderVisibility).toHaveBeenCalledWith(100);
  });

  it('should use default scroll threshold of 50', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    render(<Header />);

    expect(mockUseHeaderVisibility).toHaveBeenCalledWith(50);
  });

  it('should have smooth transition animation', () => {
    const { container } = render(<Header enableScrollHiding={true} />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('transition-transform');
    expect(header).toHaveClass('duration-300');
    expect(header).toHaveClass('ease-in-out');
  });

  it('should have proper z-index for sticky positioning', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('z-30');
  });

  it('should have proper border styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('border-b');
    expect(header).toHaveClass('border-neutral-200');
  });

  it('should have shadow styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('shadow-sm');
  });

  it('should render menu toggle button', () => {
    render(<Header onMenuToggle={vi.fn()} />);
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('should call onMenuToggle when menu button is clicked', () => {
    const onMenuToggle = vi.fn();
    render(<Header onMenuToggle={onMenuToggle} />);

    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);

    expect(onMenuToggle).toHaveBeenCalled();
  });

  it('should render notifications button', () => {
    render(<Header />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('should display notifications count', () => {
    const notifications = [
      {
        id: '1',
        title: 'New Grade',
        message: 'Your grade has been posted',
        timestamp: new Date(),
        read: false,
        type: 'success' as const,
      },
      {
        id: '2',
        title: 'Attendance',
        message: 'Attendance marked',
        timestamp: new Date(),
        read: true,
        type: 'info' as const,
      },
    ];

    render(<Header notifications={notifications} />);
    expect(screen.getByText('1')).toBeInTheDocument(); // Unread count
  });

  it('should display notification dropdown when bell icon is clicked', () => {
    const notifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: new Date(),
        read: false,
        type: 'info' as const,
      },
    ];

    render(<Header notifications={notifications} />);

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('should display "No notifications" when empty', () => {
    render(<Header notifications={[]} />);

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('should call onNotificationClick when notification is clicked', () => {
    const onNotificationClick = vi.fn();
    const notifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'This is a test',
        timestamp: new Date(),
        read: false,
        type: 'info' as const,
      },
    ];

    render(<Header notifications={notifications} onNotificationClick={onNotificationClick} />);

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    const notificationItem = screen.getByText('Test Notification');
    fireEvent.click(notificationItem);

    expect(onNotificationClick).toHaveBeenCalledWith('1');
  });

  it('should call onThemeToggle when theme button is clicked', () => {
    const onThemeToggle = vi.fn();
    render(<Header onThemeToggle={onThemeToggle} />);

    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);

    expect(onThemeToggle).toHaveBeenCalled();
  });

  it('should render theme toggle button when onThemeToggle is provided', () => {
    render(<Header onThemeToggle={vi.fn()} />);
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('should have proper sticky positioning', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });

  it('should have proper background color', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');

    expect(header).toHaveClass('bg-white');
  });

  it('should render with custom title', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should support scroll hiding with custom threshold', () => {
    const mockUseHeaderVisibility = useHeaderVisibility as any;
    render(<Header enableScrollHiding={true} scrollHideThreshold={75} title="Test" />);

    expect(mockUseHeaderVisibility).toHaveBeenCalledWith(75);
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

    const { container, rerender } = render(<Header enableScrollHiding={true} title="Test" />);

    let header = container.querySelector('header');
    expect(header).toHaveClass('translate-y-0');

    // Change to hidden
    mockUseHeaderVisibility.mockReturnValue({
      isHeaderVisible: false,
      scrollDirection: 'down',
      scrollY: 100,
      isMobile: true,
    });

    rerender(<Header enableScrollHiding={true} title="Test" />);

    header = container.querySelector('header');
    expect(header).toHaveClass('-translate-y-full');
  });
});
