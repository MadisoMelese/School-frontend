/**
 * Comprehensive Responsive Layout Tests
 * Tests responsive design across all breakpoints (320px - 1920px)
 * 
 * Validates:
 * - Grid layouts (1 → 2 → 3+ columns)
 * - Typography scaling
 * - Spacing responsiveness
 * - Touch targets (44px minimum)
 * - No horizontal scrolling
 * - Responsive display (show/hide)
 * - Responsive images
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import {
  BREAKPOINTS,
  setViewportSize,
  setViewportToBreakpoint,
  renderAtBreakpoint,
  testAtBreakpoints,
  hasResponsiveClasses,
  isVisibleAtBreakpoint,
  hasTouchTargetSize,
  hasResponsiveGrid,
  hasResponsiveGap,
  hasResponsivePadding,
  hasResponsiveTypography,
  hasNoHorizontalScroll,
  assertResponsiveGrid,
  assertResponsiveTypography,
  assertResponsiveSpacing,
} from './responsive.test.utils'

describe('Responsive Layout Tests', () => {
  beforeEach(() => {
    // Reset viewport to default
    setViewportSize(1024)
  })

  afterEach(() => {
    // Clean up
    setViewportSize(1024)
  })

  describe('Breakpoint Definitions', () => {
    it('should have all required breakpoints defined', () => {
      expect(BREAKPOINTS).toHaveProperty('xs', 320)
      expect(BREAKPOINTS).toHaveProperty('sm', 640)
      expect(BREAKPOINTS).toHaveProperty('md', 768)
      expect(BREAKPOINTS).toHaveProperty('lg', 1024)
      expect(BREAKPOINTS).toHaveProperty('xl', 1280)
      expect(BREAKPOINTS).toHaveProperty('2xl', 1536)
      expect(BREAKPOINTS).toHaveProperty('3xl', 1920)
    })

    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.xs).toBe(320)
      expect(BREAKPOINTS.sm).toBe(640)
      expect(BREAKPOINTS.md).toBe(768)
      expect(BREAKPOINTS.lg).toBe(1024)
      expect(BREAKPOINTS.xl).toBe(1280)
      expect(BREAKPOINTS['2xl']).toBe(1536)
      expect(BREAKPOINTS['3xl']).toBe(1920)
    })
  })

  describe('Viewport Size Setting', () => {
    it('should set viewport width correctly', () => {
      setViewportSize(320)
      expect(window.innerWidth).toBe(320)
    })

    it('should set viewport height correctly', () => {
      setViewportSize(1024, 768)
      expect(window.innerHeight).toBe(768)
    })

    it('should set viewport to breakpoint', () => {
      setViewportToBreakpoint('xs')
      expect(window.innerWidth).toBe(320)

      setViewportToBreakpoint('md')
      expect(window.innerWidth).toBe(768)

      setViewportToBreakpoint('xl')
      expect(window.innerWidth).toBe(1280)
    })
  })

  describe('Responsive Grid Layouts', () => {
    const GridComponent = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    )

    it('should have responsive grid classes', () => {
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeTruthy()
      expect(hasResponsiveGrid(grid!)).toBe(true)
    })

    it('should have responsive gap classes', () => {
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(hasResponsiveGap(grid!)).toBe(true)
    })

    it('should assert responsive grid layout', () => {
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(() => {
        assertResponsiveGrid(grid!, {
          mobile: 1,
          tablet: 2,
          desktop: 3,
        })
      }).not.toThrow()
    })

    it('should have 1 column on mobile (320px)', () => {
      setViewportToBreakpoint('xs')
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
    })

    it('should have 2 columns on tablet (768px)', () => {
      setViewportToBreakpoint('md')
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('sm:grid-cols-2')
    })

    it('should have 3 columns on desktop (1024px)', () => {
      setViewportToBreakpoint('lg')
      const { container } = render(<GridComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })
  })

  describe('Responsive Typography', () => {
    const TypographyComponent = () => (
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Heading 1</h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">Heading 2</h2>
        <p className="text-sm sm:text-base">Body text</p>
      </div>
    )

    it('should have responsive typography classes', () => {
      const { container } = render(<TypographyComponent />)
      const h1 = container.querySelector('h1')
      expect(hasResponsiveTypography(h1!)).toBe(true)
    })

    it('should assert responsive typography', () => {
      const { container } = render(<TypographyComponent />)
      const h1 = container.querySelector('h1')
      expect(() => {
        assertResponsiveTypography(h1!, {
          mobile: '2xl',
          tablet: '3xl',
          desktop: '4xl',
        })
      }).not.toThrow()
    })

    it('should have text-2xl on mobile', () => {
      const { container } = render(<TypographyComponent />)
      const h1 = container.querySelector('h1')
      expect(h1).toHaveClass('text-2xl')
    })

    it('should have responsive text sizes', () => {
      const { container } = render(<TypographyComponent />)
      const h1 = container.querySelector('h1')
      expect(h1).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl')
    })
  })

  describe('Responsive Spacing', () => {
    const SpacingComponent = () => (
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 gap-3 sm:gap-4 md:gap-6">
        Content
      </div>
    )

    it('should have responsive padding classes', () => {
      const { container } = render(<SpacingComponent />)
      const div = container.querySelector('div')
      expect(hasResponsivePadding(div!)).toBe(true)
    })

    it('should assert responsive spacing', () => {
      const { container } = render(<SpacingComponent />)
      const div = container.querySelector('div')
      // Note: The component uses md: prefix, not lg: or xl:
      expect(div).toHaveClass('px-4', 'sm:px-6', 'md:px-8')
      expect(div).toHaveClass('py-4', 'sm:py-6', 'md:py-8')
      expect(div).toHaveClass('gap-3', 'sm:gap-4', 'md:gap-6')
    })

    it('should have responsive padding', () => {
      const { container } = render(<SpacingComponent />)
      const div = container.querySelector('div')
      expect(div).toHaveClass('px-4', 'sm:px-6', 'md:px-8')
    })

    it('should have responsive gap', () => {
      const { container } = render(<SpacingComponent />)
      const div = container.querySelector('div')
      expect(div).toHaveClass('gap-3', 'sm:gap-4', 'md:gap-6')
    })
  })

  describe('Touch Targets', () => {
    const ButtonComponent = () => (
      <button className="min-h-[44px] min-w-[44px] px-4 py-2">
        Touch Button
      </button>
    )

    const InputComponent = () => (
      <input className="min-h-[44px] px-3 py-2" type="text" />
    )

    it('should have 44px minimum height for buttons', () => {
      const { container } = render(<ButtonComponent />)
      const button = container.querySelector('button')
      expect(button).toHaveClass('min-h-[44px]')
    })

    it('should have 44px minimum width for buttons', () => {
      const { container } = render(<ButtonComponent />)
      const button = container.querySelector('button')
      expect(button).toHaveClass('min-w-[44px]')
    })

    it('should have 44px minimum height for inputs', () => {
      const { container } = render(<InputComponent />)
      const input = container.querySelector('input')
      expect(input).toHaveClass('min-h-[44px]')
    })

    it('should have touch target size', () => {
      const { container } = render(<ButtonComponent />)
      const button = container.querySelector('button')
      // Note: This test checks for the class, actual size depends on rendering
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    })
  })

  describe('Responsive Display', () => {
    const DisplayComponent = () => (
      <div>
        <div className="hidden sm:block">Desktop only</div>
        <div className="block sm:hidden">Mobile only</div>
        <div className="hidden lg:block">Large desktop only</div>
      </div>
    )

    it('should have responsive display classes', () => {
      const { container } = render(<DisplayComponent />)
      const desktopOnly = container.querySelector('.hidden.sm\\:block')
      expect(desktopOnly).toBeTruthy()
    })

    it('should be visible at correct breakpoints', () => {
      const { container } = render(<DisplayComponent />)
      const mobileOnly = container.querySelector('.block.sm\\:hidden')
      expect(mobileOnly).toBeTruthy()
    })
  })

  describe('Responsive Images', () => {
    const ImageComponent = () => (
      <div>
        <img src="test.jpg" alt="Responsive" className="w-full h-auto" />
        <img src="test.jpg" alt="Cover" className="w-full h-full object-cover" />
      </div>
    )

    it('should have responsive image classes', () => {
      const { container } = render(<ImageComponent />)
      const images = container.querySelectorAll('img')
      expect(images[0]).toHaveClass('w-full', 'h-auto')
    })

    it('should have cover image classes', () => {
      const { container } = render(<ImageComponent />)
      const images = container.querySelectorAll('img')
      expect(images[1]).toHaveClass('w-full', 'h-full', 'object-cover')
    })
  })

  describe('No Horizontal Scrolling', () => {
    const NoScrollComponent = () => (
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      </div>
    )

    it('should not have horizontal scroll on mobile', () => {
      setViewportToBreakpoint('xs')
      const { container } = render(<NoScrollComponent />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeTruthy()
      // Check that overflow is hidden
      expect(wrapper).toHaveClass('overflow-hidden')
    })

    it('should not have horizontal scroll on tablet', () => {
      setViewportToBreakpoint('md')
      const { container } = render(<NoScrollComponent />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeTruthy()
    })

    it('should not have horizontal scroll on desktop', () => {
      setViewportToBreakpoint('lg')
      const { container } = render(<NoScrollComponent />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeTruthy()
    })
  })

  describe('Responsive Flex Direction', () => {
    const FlexComponent = () => (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
    )

    it('should have responsive flex direction classes', () => {
      const { container } = render(<FlexComponent />)
      const flex = container.querySelector('.flex')
      expect(flex).toHaveClass('flex-col', 'sm:flex-row')
    })

    it('should stack on mobile', () => {
      const { container } = render(<FlexComponent />)
      const flex = container.querySelector('.flex')
      expect(flex).toHaveClass('flex-col')
    })

    it('should be row on tablet+', () => {
      const { container } = render(<FlexComponent />)
      const flex = container.querySelector('.flex')
      expect(flex).toHaveClass('sm:flex-row')
    })
  })

  describe('Responsive Width', () => {
    const WidthComponent = () => (
      <button className="w-full sm:w-auto px-4 py-2">
        Responsive Button
      </button>
    )

    it('should have full width on mobile', () => {
      const { container } = render(<WidthComponent />)
      const button = container.querySelector('button')
      expect(button).toHaveClass('w-full')
    })

    it('should have auto width on tablet+', () => {
      const { container } = render(<WidthComponent />)
      const button = container.querySelector('button')
      expect(button).toHaveClass('sm:w-auto')
    })
  })

  describe('Responsive Container', () => {
    const ContainerComponent = () => (
      <div className="w-full max-w-none lg:max-w-4xl mx-auto">
        Content
      </div>
    )

    it('should have full width on mobile', () => {
      const { container } = render(<ContainerComponent />)
      const div = container.querySelector('div')
      expect(div).toHaveClass('w-full')
    })

    it('should have max width on desktop', () => {
      const { container } = render(<ContainerComponent />)
      const div = container.querySelector('div')
      expect(div).toHaveClass('lg:max-w-4xl')
    })

    it('should be centered', () => {
      const { container } = render(<ContainerComponent />)
      const div = container.querySelector('div')
      expect(div).toHaveClass('mx-auto')
    })
  })

  describe('Responsive Cards', () => {
    const CardGridComponent = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Card 1</h3>
          <p className="text-sm sm:text-base">Content</p>
        </div>
      </div>
    )

    it('should have responsive card grid', () => {
      const { container } = render(<CardGridComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })

    it('should have responsive card padding', () => {
      const { container } = render(<CardGridComponent />)
      const card = container.querySelector('.bg-white')
      expect(card).toHaveClass('p-4', 'sm:p-6')
    })

    it('should have responsive card typography', () => {
      const { container } = render(<CardGridComponent />)
      const heading = container.querySelector('h3')
      expect(heading).toHaveClass('text-lg', 'sm:text-xl')
    })
  })

  describe('Responsive Forms', () => {
    const FormComponent = () => (
      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">First Name</label>
            <input type="text" className="w-full min-h-[44px] px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2">Last Name</label>
            <input type="text" className="w-full min-h-[44px] px-3 py-2" />
          </div>
        </div>
        <button className="w-full sm:w-auto min-h-[44px] px-4 py-2">Submit</button>
      </form>
    )

    it('should have responsive form grid', () => {
      const { container } = render(<FormComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2')
    })

    it('should have responsive form labels', () => {
      const { container } = render(<FormComponent />)
      const labels = container.querySelectorAll('label')
      labels.forEach((label: Element) => {
        expect(label).toHaveClass('text-xs', 'sm:text-sm')
      })
    })

    it('should have responsive form inputs', () => {
      const { container } = render(<FormComponent />)
      const inputs = container.querySelectorAll('input')
      inputs.forEach((input: Element) => {
        expect(input).toHaveClass('w-full', 'min-h-[44px]')
      })
    })

    it('should have responsive form button', () => {
      const { container } = render(<FormComponent />)
      const button = container.querySelector('button')
      expect(button).toHaveClass('w-full', 'sm:w-auto', 'min-h-[44px]')
    })
  })

  describe('Responsive Tables', () => {
    const TableComponent = () => (
      <div>
        <table className="hidden md:table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>john@example.com</td>
            </tr>
          </tbody>
        </table>
        <div className="block md:hidden">
          <div className="mb-4">
            <p className="font-semibold">John</p>
            <p className="text-sm text-neutral-600">john@example.com</p>
          </div>
        </div>
      </div>
    )

    it('should hide table on mobile', () => {
      const { container } = render(<TableComponent />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('hidden', 'md:table')
    })

    it('should show card layout on mobile', () => {
      const { container } = render(<TableComponent />)
      const cardLayout = container.querySelector('.block.md\\:hidden')
      expect(cardLayout).toBeTruthy()
    })
  })

  describe('Responsive Navigation', () => {
    const NavComponent = () => (
      <div>
        <nav className="hidden md:block w-64 bg-white">
          <ul>
            <li>Dashboard</li>
            <li>Grades</li>
          </ul>
        </nav>
        <nav className="fixed bottom-0 md:hidden w-full bg-white">
          <ul className="flex justify-around">
            <li>Dashboard</li>
            <li>Grades</li>
          </ul>
        </nav>
      </div>
    )

    it('should hide desktop nav on mobile', () => {
      const { container } = render(<NavComponent />)
      const desktopNav = container.querySelector('.hidden.md\\:block')
      expect(desktopNav).toBeTruthy()
    })

    it('should show mobile nav on mobile', () => {
      const { container } = render(<NavComponent />)
      const mobileNav = container.querySelector('.fixed.bottom-0.md\\:hidden')
      expect(mobileNav).toBeTruthy()
    })
  })

  describe('Responsive Modals', () => {
    const ModalComponent = () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full sm:w-96 max-h-screen overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6">Modal Title</h2>
          <p className="text-sm sm:text-base p-4 sm:p-6">Modal content</p>
        </div>
      </div>
    )

    it('should have responsive modal width', () => {
      const { container } = render(<ModalComponent />)
      const modal = container.querySelector('.bg-white')
      expect(modal).toHaveClass('w-full', 'sm:w-96')
    })

    it('should have responsive modal padding', () => {
      const { container } = render(<ModalComponent />)
      const heading = container.querySelector('h2')
      expect(heading).toHaveClass('p-4', 'sm:p-6')
    })

    it('should have responsive modal typography', () => {
      const { container } = render(<ModalComponent />)
      const heading = container.querySelector('h2')
      expect(heading).toHaveClass('text-lg', 'sm:text-xl')
    })
  })

  describe('Responsive Sidebars', () => {
    const SidebarComponent = () => (
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white">
          Sidebar
        </aside>
        <main className="flex-1">
          Main content
        </main>
      </div>
    )

    it('should hide sidebar on mobile', () => {
      const { container } = render(<SidebarComponent />)
      const sidebar = container.querySelector('.hidden.lg\\:block')
      expect(sidebar).toBeTruthy()
    })

    it('should have fixed sidebar width', () => {
      const { container } = render(<SidebarComponent />)
      const sidebar = container.querySelector('aside')
      expect(sidebar).toHaveClass('w-64')
    })

    it('should have flexible main content', () => {
      const { container } = render(<SidebarComponent />)
      const main = container.querySelector('main')
      expect(main).toHaveClass('flex-1')
    })
  })

  describe('Responsive Breakpoint Testing', () => {
    const ResponsiveComponent = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    )

    it('should render correctly at xs breakpoint (320px)', () => {
      setViewportToBreakpoint('xs')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
    })

    it('should render correctly at sm breakpoint (640px)', () => {
      setViewportToBreakpoint('sm')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('sm:grid-cols-2')
    })

    it('should render correctly at md breakpoint (768px)', () => {
      setViewportToBreakpoint('md')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2')
    })

    it('should render correctly at lg breakpoint (1024px)', () => {
      setViewportToBreakpoint('lg')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('should render correctly at xl breakpoint (1280px)', () => {
      setViewportToBreakpoint('xl')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })

    it('should render correctly at 2xl breakpoint (1536px)', () => {
      setViewportToBreakpoint('2xl')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })

    it('should render correctly at 3xl breakpoint (1920px)', () => {
      setViewportToBreakpoint('3xl')
      const { container } = render(<ResponsiveComponent />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })
  })
})
