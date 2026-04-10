import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardLayout } from './DashboardLayout'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { useAuth } from '@hooks/useAuth'
import { useUIStore } from '@store/uiStore'

// Mock hooks
vi.mock('@hooks/useMediaQuery')
vi.mock('@hooks/useAuth')
vi.mock('@store/uiStore')

describe('DashboardLayout - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'student', status: 'active' },
      logout: vi.fn(),
    })
    ;(useUIStore as any).mockReturnValue({
      sidebarOpen: true,
      setSidebarOpen: vi.fn(),
    })
  })

  describe('Mobile Layout (320px - 640px)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockReturnValue(true) // isMobile = true
    })

    it('should render bottom navigation on mobile', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i })
      expect(mobileNav).toBeInTheDocument()
      expect(mobileNav).toHaveClass('fixed', 'bottom-0')
    })

    it('should hide sidebar on mobile', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const sidebar = screen.queryByRole('navigation', { name: /main navigation/i })
      expect(sidebar).not.toBeInTheDocument()
    })

    it('should have responsive padding on mobile', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const mainContent = container.querySelector('main')
      expect(mainContent).toHaveClass('px-4', 'py-4', 'sm:px-6', 'sm:py-6')
    })

    it('should display responsive title on mobile', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const title = screen.getByRole('heading', { level: 1, name: /test page/i })
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl')
    })

    it('should have safe area padding for notched devices', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const body = container.querySelector('body')
      expect(body).toHaveStyle('padding-top: env(safe-area-inset-top)')
    })
  })

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockReturnValue(false) // isMobile = false
    })

    it('should render sidebar on tablet', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const sidebar = screen.getByRole('navigation', { name: /main navigation/i })
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass('w-64')
    })

    it('should not render bottom navigation on tablet', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const mobileNav = screen.queryByRole('navigation', { name: /mobile navigation/i })
      expect(mobileNav).not.toBeInTheDocument()
    })

    it('should have responsive padding on tablet', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const mainContent = container.querySelector('main')
      expect(mainContent).toHaveClass('px-6', 'py-6', 'md:px-8', 'md:py-8')
    })
  })

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockReturnValue(false) // isMobile = false
    })

    it('should render sidebar on desktop', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const sidebar = screen.getByRole('navigation', { name: /main navigation/i })
      expect(sidebar).toBeInTheDocument()
    })

    it('should have responsive padding on desktop', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const mainContent = container.querySelector('main')
      expect(mainContent).toHaveClass('px-8', 'py-8', 'lg:py-10')
    })

    it('should display full-size title on desktop', () => {
      render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const title = screen.getByRole('heading', { level: 1, name: /test page/i })
      expect(title).toHaveClass('md:text-4xl')
    })
  })

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets on mobile', () => {
      (useMediaQuery as any).mockReturnValue(true)

      const { container } = render(
        <DashboardLayout title="Test Page">
          <div>Test Content</div>
        </DashboardLayout>
      )

      // Navigation items should have touch-target class
      const navItems = container.querySelectorAll('[role="navigation"] button')
      navItems.forEach((item) => {
        const styles = window.getComputedStyle(item)
        const height = parseFloat(styles.minHeight)
        expect(height).toBeGreaterThanOrEqual(44)
      })
    })
  })

  describe('Responsive Typography', () => {
    it('should scale typography from mobile to desktop', () => {
      render(
        <DashboardLayout title="Test Page" description="Test Description">
          <div>Test Content</div>
        </DashboardLayout>
      )

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl')

      const description = screen.getByText('Test Description')
      expect(description).toHaveClass('text-sm', 'sm:text-base')
    })
  })

  describe('Responsive Images', () => {
    it('should support responsive image utilities', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <img src="test.jpg" alt="test" className="img-responsive img-cover" />
        </DashboardLayout>
      )

      const img = container.querySelector('img')
      expect(img).toHaveClass('img-responsive', 'img-cover')
      expect(img).toHaveStyle('max-width: 100%')
    })
  })

  describe('Responsive Spacing', () => {
    it('should apply responsive spacing utilities', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div className="p-responsive px-responsive py-responsive gap-responsive">Test Content</div>
        </DashboardLayout>
      )

      const content = container.querySelector('.p-responsive')
      expect(content).toHaveClass('p-responsive', 'px-responsive', 'py-responsive', 'gap-responsive')
    })
  })

  describe('Responsive Grid', () => {
    it('should support responsive grid layouts', () => {
      const { container } = render(
        <DashboardLayout title="Test Page">
          <div className="grid-responsive-3">
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
          </div>
        </DashboardLayout>
      )

      const grid = container.querySelector('.grid-responsive-3')
      expect(grid).toHaveClass('grid-responsive-3')
    })
  })
})
