/**
 * Responsive Layout Testing Utilities
 * Helpers for testing responsive designs at different breakpoints
 */

import { render, RenderOptions } from '@testing-library/react'
import React from 'react'

/**
 * Breakpoint definitions for testing
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Set viewport size for testing
 * @param width - Viewport width in pixels
 * @param height - Viewport height in pixels (default: 768)
 */
export function setViewportSize(width: number, height: number = 768): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

/**
 * Set viewport to a specific breakpoint
 * @param breakpoint - Breakpoint name (xs, sm, md, lg, xl, 2xl, 3xl)
 */
export function setViewportToBreakpoint(breakpoint: Breakpoint): void {
  const width = BREAKPOINTS[breakpoint]
  setViewportSize(width)
}

/**
 * Render component at a specific breakpoint
 * @param component - React component to render
 * @param breakpoint - Breakpoint name
 * @param options - Additional render options
 */
export function renderAtBreakpoint(
  component: React.ReactElement,
  breakpoint: Breakpoint,
  options?: RenderOptions
) {
  setViewportToBreakpoint(breakpoint)
  return render(component, options)
}

/**
 * Test component at multiple breakpoints
 * @param component - React component to render
 * @param breakpoints - Array of breakpoints to test
 * @param testFn - Test function to run at each breakpoint
 */
export async function testAtBreakpoints(
  component: React.ReactElement,
  breakpoints: Breakpoint[],
  testFn: (breakpoint: Breakpoint, container: HTMLElement) => void | Promise<void>
): Promise<void> {
  for (const breakpoint of breakpoints) {
    const { container, unmount } = renderAtBreakpoint(component, breakpoint)
    await testFn(breakpoint, container)
    unmount()
  }
}

/**
 * Check if element has responsive classes
 * @param element - HTML element
 * @param classes - Array of class names to check
 */
export function hasResponsiveClasses(element: HTMLElement, classes: string[]): boolean {
  const classList = element.className
  return classes.every((cls) => classList.includes(cls))
}

/**
 * Get computed style value
 * @param element - HTML element
 * @param property - CSS property name
 */
export function getComputedStyleValue(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * Check if element is visible at breakpoint
 * @param element - HTML element
 * @param breakpoint - Breakpoint name
 */
export function isVisibleAtBreakpoint(element: HTMLElement, breakpoint: Breakpoint): boolean {
  setViewportToBreakpoint(breakpoint)
  const display = getComputedStyleValue(element, 'display')
  return display !== 'none'
}

/**
 * Check if element has minimum touch target size (44px)
 * @param element - HTML element
 */
export function hasTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.height >= 44 && rect.width >= 44
}

/**
 * Check if element has responsive grid classes
 * @param element - HTML element
 */
export function hasResponsiveGrid(element: HTMLElement): boolean {
  const classList = element.className
  return (
    classList.includes('grid') &&
    classList.includes('grid-cols-1') &&
    (classList.includes('sm:grid-cols-') || classList.includes('md:grid-cols-') || classList.includes('lg:grid-cols-'))
  )
}

/**
 * Check if element has responsive gap classes
 * @param element - HTML element
 */
export function hasResponsiveGap(element: HTMLElement): boolean {
  const classList = element.className
  return (
    classList.includes('gap-') &&
    (classList.includes('sm:gap-') || classList.includes('md:gap-') || classList.includes('lg:gap-'))
  )
}

/**
 * Check if element has responsive padding classes
 * @param element - HTML element
 */
export function hasResponsivePadding(element: HTMLElement): boolean {
  const classList = element.className
  return (
    (classList.includes('px-') || classList.includes('py-')) &&
    (classList.includes('sm:px-') || classList.includes('sm:py-') || classList.includes('md:px-') || classList.includes('md:py-'))
  )
}

/**
 * Check if element has responsive typography classes
 * @param element - HTML element
 */
export function hasResponsiveTypography(element: HTMLElement): boolean {
  const classList = element.className
  return (
    classList.includes('text-') &&
    (classList.includes('sm:text-') || classList.includes('md:text-') || classList.includes('lg:text-'))
  )
}

/**
 * Check if element has responsive display classes
 * @param element - HTML element
 */
export function hasResponsiveDisplay(element: HTMLElement): boolean {
  const classList = element.className
  return (
    (classList.includes('hidden') || classList.includes('block')) &&
    (classList.includes('sm:') || classList.includes('md:') || classList.includes('lg:'))
  )
}

/**
 * Check if element has responsive flex direction classes
 * @param element - HTML element
 */
export function hasResponsiveFlexDirection(element: HTMLElement): boolean {
  const classList = element.className
  return (
    classList.includes('flex') &&
    (classList.includes('flex-col') || classList.includes('flex-row')) &&
    (classList.includes('sm:flex-') || classList.includes('md:flex-') || classList.includes('lg:flex-'))
  )
}

/**
 * Check if element has responsive width classes
 * @param element - HTML element
 */
export function hasResponsiveWidth(element: HTMLElement): boolean {
  const classList = element.className
  return (
    classList.includes('w-') &&
    (classList.includes('sm:w-') || classList.includes('md:w-') || classList.includes('lg:w-'))
  )
}

/**
 * Get all elements with a specific responsive class pattern
 * @param container - Container element
 * @param pattern - Class pattern to search for (e.g., 'grid-cols-')
 */
export function getElementsWithResponsiveClass(container: HTMLElement, pattern: string): HTMLElement[] {
  return Array.from(container.querySelectorAll(`[class*="${pattern}"]`)) as HTMLElement[]
}

/**
 * Check if no horizontal scrolling occurs at breakpoint
 * @param container - Container element
 * @param breakpoint - Breakpoint name
 */
export function hasNoHorizontalScroll(container: HTMLElement, breakpoint: Breakpoint): boolean {
  setViewportToBreakpoint(breakpoint)
  return container.scrollWidth <= container.clientWidth
}

/**
 * Test responsive layout at all breakpoints
 * @param component - React component to render
 * @param testFn - Test function to run at each breakpoint
 */
export async function testResponsiveLayout(
  component: React.ReactElement,
  testFn: (breakpoint: Breakpoint, width: number) => void | Promise<void>
): Promise<void> {
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
  for (const breakpoint of breakpoints) {
    const width = BREAKPOINTS[breakpoint]
    setViewportSize(width)
    render(component)
    await testFn(breakpoint, width)
  }
}

/**
 * Mock useMediaQuery hook for testing
 * @param breakpoint - Breakpoint to mock
 */
export function mockUseMediaQuery(breakpoint: Breakpoint) {
  const width = BREAKPOINTS[breakpoint]
  return (query: string) => {
    if (query.includes('max-width')) {
      const maxWidth = parseInt(query.match(/\d+/)?.[0] || '0')
      return width <= maxWidth
    }
    if (query.includes('min-width')) {
      const minWidth = parseInt(query.match(/\d+/)?.[0] || '0')
      return width >= minWidth
    }
    return false
  }
}

/**
 * Assert responsive grid layout
 * @param element - Grid element
 * @param expectedColumns - Expected columns at each breakpoint
 */
export function assertResponsiveGrid(
  element: HTMLElement,
  expectedColumns: {
    mobile: number
    tablet?: number
    desktop?: number
  }
): void {
  const classList = element.className

  // Check mobile columns
  expect(classList).toContain(`grid-cols-${expectedColumns.mobile}`)

  // Check tablet columns if specified
  if (expectedColumns.tablet) {
    expect(classList).toMatch(new RegExp(`(sm|md):grid-cols-${expectedColumns.tablet}`))
  }

  // Check desktop columns if specified
  if (expectedColumns.desktop) {
    expect(classList).toMatch(new RegExp(`(lg|xl):grid-cols-${expectedColumns.desktop}`))
  }
}

/**
 * Assert responsive typography
 * @param element - Typography element
 * @param expectedSizes - Expected text sizes at each breakpoint
 */
export function assertResponsiveTypography(
  element: HTMLElement,
  expectedSizes: {
    mobile: string
    tablet?: string
    desktop?: string
  }
): void {
  const classList = element.className

  // Check mobile size
  expect(classList).toContain(`text-${expectedSizes.mobile}`)

  // Check tablet size if specified
  if (expectedSizes.tablet) {
    expect(classList).toMatch(new RegExp(`(sm|md):text-${expectedSizes.tablet}`))
  }

  // Check desktop size if specified
  if (expectedSizes.desktop) {
    expect(classList).toMatch(new RegExp(`(md|lg|xl):text-${expectedSizes.desktop}`))
  }
}

/**
 * Assert responsive spacing
 * @param element - Element with spacing
 * @param expectedSpacing - Expected spacing at each breakpoint
 */
export function assertResponsiveSpacing(
  element: HTMLElement,
  expectedSpacing: {
    mobile: string
    tablet?: string
    desktop?: string
  }
): void {
  const classList = element.className

  // Check mobile spacing
  expect(classList).toMatch(new RegExp(`(p|m|gap)-${expectedSpacing.mobile}`))

  // Check tablet spacing if specified
  if (expectedSpacing.tablet) {
    expect(classList).toMatch(new RegExp(`(sm|md):(p|m|gap)-${expectedSpacing.tablet}`))
  }

  // Check desktop spacing if specified
  if (expectedSpacing.desktop) {
    expect(classList).toMatch(new RegExp(`(md|lg|xl):(p|m|gap)-${expectedSpacing.desktop}`))
  }
}
