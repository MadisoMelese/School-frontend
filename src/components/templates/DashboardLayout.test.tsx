import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardLayout } from './DashboardLayout';

// Mock the hooks and components
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false),
}));

vi.mock('@store/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    sidebarOpen: true,
    setSidebarOpen: vi.fn(),
  })),
}));

vi.mock('@components/organisms/Header', () => ({
  Header: ({ title }: { title?: string }) => <div>{title || 'Header'}</div>,
}));

vi.mock('@components/organisms/Navigation', () => ({
  Navigation: () => <div>Navigation</div>,
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(
      <DashboardLayout>
        <div>Dashboard content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <DashboardLayout title="Dashboard" description="Welcome back">
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Main content');

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders sidebar on desktop', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies responsive classes', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const mainDiv = container.querySelector('[role="main"]');
    expect(mainDiv).toHaveClass('scrollbar-thin');
  });

  it('renders children correctly', () => {
    render(
      <DashboardLayout>
        <button>Action</button>
        <p>Some content</p>
      </DashboardLayout>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Some content')).toBeInTheDocument();
  });

  it('has theme support classes', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const mainDiv = container.querySelector('[role="main"]');
    expect(mainDiv).toHaveClass('scrollbar-thin');
  });

  it('renders safe area for mobile', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    const safeArea = container.querySelector('[aria-hidden="true"]');
    expect(safeArea).toBeInTheDocument();
  });
});
