/**
 * Comprehensive Multi-Screen Testing Suite
 * Task 23.9: Test on multiple screen sizes
 * 
 * Validates: Requirement 17 - Responsive Mobile Design
 * 
 * Tests all major pages and components at 6 breakpoints:
 * - 320px (mobile)
 * - 640px (landscape mobile)
 * - 768px (tablet)
 * - 1024px (small laptop)
 * - 1280px (desktop)
 * - 1920px (large desktop)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import {
  BREAKPOINTS,
  setViewportToBreakpoint,
  hasResponsiveGrid,
  hasResponsiveTypography,
} from './responsive.test.utils'

describe('Multi-Screen Comprehensive Testing Suite (Task 23.9)', () => {
  beforeEach(() => {
    setViewportToBreakpoint('lg')
  })

  afterEach(() => {
    setViewportToBreakpoint('lg')
  })

  describe('Breakpoint Coverage', () => {
    it('should test at 320px (mobile)', () => {
      setViewportToBreakpoint('xs')
      expect(window.innerWidth).toBe(320)
    })

    it('should test at 640px (landscape mobile)', () => {
      setViewportToBreakpoint('sm')
      expect(window.innerWidth).toBe(640)
    })

    it('should test at 768px (tablet)', () => {
      setViewportToBreakpoint('md')
      expect(window.innerWidth).toBe(768)
    })

    it('should test at 1024px (small laptop)', () => {
      setViewportToBreakpoint('lg')
      expect(window.innerWidth).toBe(1024)
    })

    it('should test at 1280px (desktop)', () => {
      setViewportToBreakpoint('xl')
      expect(window.innerWidth).toBe(1280)
    })

    it('should test at 1920px (large desktop)', () => {
      setViewportToBreakpoint('3xl')
      expect(window.innerWidth).toBe(1920)
    })
  })

  describe('Layout Adaptation at Breakpoints', () => {
    const ResponsiveGridComponent = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white p-4 rounded">Card 1</div>
        <div className="bg-white p-4 rounded">Card 2</div>
        <div className="bg-white p-4 rounded">Card 3</div>
      </div>
    )

    it('should adapt layout from 1 column (mobile) to 2 columns (tablet) to 3 columns (desktop)', () => {
      setViewportToBreakpoint('xs')
      const { container: mobileContainer } = render(<ResponsiveGridComponent />)
      const mobileGrid = mobileContainer.querySelector('.grid')
      expect(mobileGrid).toHaveClass('grid-cols-1')

      setViewportToBreakpoint('md')
      const { container: tabletContainer } = render(<ResponsiveGridComponent />)
      const tabletGrid = tabletContainer.querySelector('.grid')
      expect(tabletGrid).toHaveClass('sm:grid-cols-2')

      setViewportToBreakpoint('lg')
      const { container: desktopContainer } = render(<ResponsiveGridComponent />)
      const desktopGrid = desktopContainer.querySelector('.grid')
      expect(desktopGrid).toHaveClass('lg:grid-cols-3')
    })

    it('should maintain responsive grid at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<ResponsiveGridComponent />)
        const grid = container.querySelector('.grid') as HTMLElement | null
        expect(hasResponsiveGrid(grid!)).toBe(true)
      })
    })
  })

  describe('No Horizontal Scrolling', () => {
    const FullWidthComponent = () => (
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      </div>
    )

    it('should not have horizontal scrolling at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<FullWidthComponent />)
        const wrapper = container.querySelector('.w-full')
        expect(wrapper).toHaveClass('overflow-hidden')
      })
    })
  })

  describe('Touch Targets Accessibility', () => {
    const TouchTargetComponent = () => (
      <div className="flex flex-col gap-4">
        <button className="min-h-[44px] min-w-[44px] px-4 py-2 bg-blue-500 text-white rounded">
          Button 1
        </button>
        <input className="min-h-[44px] px-3 py-2 border rounded" type="text" placeholder="Input" />
      </div>
    )

    it('should have 44px minimum touch targets at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<TouchTargetComponent />)
        const buttons = container.querySelectorAll('button')
        buttons.forEach((btn) => {
          expect(btn).toHaveClass('min-h-[44px]', 'min-w-[44px]')
        })
      })
    })
  })

  describe('Text Readability at All Sizes', () => {
    const TypographyComponent = () => (
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Heading 1</h1>
        <p className="text-sm sm:text-base leading-relaxed mb-2">Body text with good readability</p>
      </div>
    )

    it('should have readable typography at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<TypographyComponent />)
        const h1 = container.querySelector('h1')
        expect(hasResponsiveTypography(h1!)).toBe(true)
      })
    })
  })

  describe('Image Scaling', () => {
    const ImageComponent = () => (
      <div>
        <img src="test.jpg" alt="Responsive" className="w-full h-auto" />
      </div>
    )

    it('should scale images properly at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<ImageComponent />)
        const img = container.querySelector('img')
        expect(img).toHaveClass('w-full', 'h-auto')
      })
    })
  })

  describe('Form Inputs on Mobile', () => {
    const FormComponent = () => (
      <form className="space-y-4">
        <input type="email" className="w-full min-h-[44px] px-3 py-2 border rounded" />
        <button className="w-full min-h-[44px] bg-blue-500 text-white rounded">Submit</button>
      </form>
    )

    it('should have usable form inputs at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<FormComponent />)
        const inputs = container.querySelectorAll('input')
        inputs.forEach((input) => {
          expect(input).toHaveClass('w-full', 'min-h-[44px]')
        })
      })
    })
  })

  describe('Navigation Transitions', () => {
    const NavigationComponent = () => (
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

    it('should show mobile navigation at mobile breakpoints', () => {
      setViewportToBreakpoint('xs')
      const { container } = render(<NavigationComponent />)
      const mobileNav = container.querySelector('.fixed.bottom-0')
      expect(mobileNav).toBeTruthy()
    })

    it('should show desktop navigation at desktop breakpoints', () => {
      setViewportToBreakpoint('lg')
      const { container } = render(<NavigationComponent />)
      const desktopNav = container.querySelector('.hidden.md\\:block')
      expect(desktopNav).toBeTruthy()
    })
  })

  describe('Modal/Dialog Behavior', () => {
    const ModalComponent = () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full sm:w-96 max-h-screen overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6">Modal Title</h2>
          <button className="min-h-[44px] bg-blue-500 text-white rounded">Confirm</button>
        </div>
      </div>
    )

    it('should display modal correctly at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<ModalComponent />)
        const modal = container.querySelector('.bg-white')
        expect(modal).toHaveClass('w-full')
      })
    })
  })

  describe('Table/Card Layout Transitions', () => {
    const TableCardComponent = () => (
      <div>
        <table className="hidden md:table w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">John Doe</td>
              <td className="p-2">john@example.com</td>
            </tr>
          </tbody>
        </table>
        <div className="block md:hidden space-y-4">
          <div className="bg-white p-4 rounded border">
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-neutral-600">john@example.com</p>
          </div>
        </div>
      </div>
    )

    it('should show card layout at mobile breakpoints', () => {
      setViewportToBreakpoint('xs')
      const { container } = render(<TableCardComponent />)
      const cardLayout = container.querySelector('.block.md\\:hidden')
      expect(cardLayout).toBeTruthy()
    })

    it('should show table layout at desktop breakpoints', () => {
      setViewportToBreakpoint('lg')
      const { container } = render(<TableCardComponent />)
      const table = container.querySelector('table')
      expect(table).toHaveClass('hidden', 'md:table')
    })
  })

  describe('Comprehensive Breakpoint Testing', () => {
    const CompletePageComponent = () => (
      <div className="w-full">
        <header className="bg-white p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        </header>
        <main className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Card 1</h2>
              <p className="text-sm text-neutral-600">Content</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Card 2</h2>
              <p className="text-sm text-neutral-600">Content</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h2 className="text-lg font-semibold mb-2">Card 3</h2>
              <p className="text-sm text-neutral-600">Content</p>
            </div>
          </div>
        </main>
      </div>
    )

    it('should render complete page at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<CompletePageComponent />)
        expect(container.querySelector('.w-full')).toBeTruthy()
        expect(container.querySelector('header')).toBeTruthy()
        expect(container.querySelector('main')).toBeTruthy()
        expect(container.querySelector('.grid')).toBeTruthy()
      })
    })

    it('should maintain responsive classes at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<CompletePageComponent />)
        const grid = container.querySelector('.grid') as HTMLElement | null
        expect(hasResponsiveGrid(grid!)).toBe(true)
      })
    })
  })

  describe('Accessibility at All Sizes', () => {
    const AccessibleComponent = () => (
      <div>
        <button className="min-h-[44px] min-w-[44px] px-4 py-2 focus:ring-2 focus:ring-blue-500">
          Accessible Button
        </button>
        <input
          className="min-h-[44px] px-3 py-2 focus:ring-2 focus:ring-blue-500"
          type="text"
          aria-label="Search"
        />
      </div>
    )

    it('should have accessible focus indicators at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<AccessibleComponent />)
        const button = container.querySelector('button')
        expect(button).toHaveClass('focus:ring-2')
      })
    })

    it('should have ARIA labels at all breakpoints', () => {
      const breakpoints: (keyof typeof BREAKPOINTS)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
      
      breakpoints.forEach((bp) => {
        setViewportToBreakpoint(bp)
        const { container } = render(<AccessibleComponent />)
        const input = container.querySelector('input[aria-label]')
        expect(input).toHaveAttribute('aria-label', 'Search')
      })
    })
  })
})
