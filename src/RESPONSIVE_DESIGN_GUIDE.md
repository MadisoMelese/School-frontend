# SchoolOS Mobile-First Responsive Design Guide

## Overview

This guide documents the mobile-first responsive design implementation for SchoolOS using Tailwind CSS v4. All layouts follow a mobile-first approach, starting with mobile (320px) and progressively enhancing for larger screens.

## Breakpoints

Tailwind CSS v4 breakpoints used in SchoolOS:

| Breakpoint | Width | Device Type | Use Case |
|-----------|-------|-------------|----------|
| `xs` | 320px | Extra small | Older phones, small devices |
| `sm` | 640px | Small | Landscape phones, small tablets |
| `md` | 768px | Medium | Tablets, iPad |
| `lg` | 1024px | Large | Small laptops, iPad Pro |
| `xl` | 1280px | Extra large | Desktops, laptops |
| `2xl` | 1536px | 2X large | Large desktops |
| `3xl` | 1920px | 3X large | Ultra-wide displays |

## Mobile-First Approach

All styles start with mobile defaults and use breakpoint prefixes to enhance for larger screens:

```tsx
// ✅ CORRECT: Mobile-first
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>

// ❌ WRONG: Desktop-first
<div className="text-xl lg:text-sm">
  This is backwards!
</div>
```

## Responsive Grid Layouts

### 1 Column → 2 Columns → 3 Columns (Most Common)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
  {/* Cards automatically stack on mobile, 2 columns on tablet, 3 on desktop */}
</div>
```

### 1 Column → 2 Columns → 4 Columns (Dashboard Widgets)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {/* Performance summary cards */}
</div>
```

### Full Width (Single Column)

```tsx
<div className="w-full">
  {/* Always full width */}
</div>
```

## Responsive Typography

Scale typography from mobile to desktop:

```tsx
// Heading 1: 24px → 30px → 36px
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Page Title
</h1>

// Heading 2: 20px → 24px → 28px
<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
  Section Title
</h2>

// Body text: 14px → 16px
<p className="text-sm sm:text-base">
  Body text
</p>

// Small text: 12px → 13px → 14px
<span className="text-xs sm:text-sm">
  Small text
</span>
```

## Responsive Spacing

Use responsive padding and margins:

```tsx
// Responsive padding: 4px (mobile) → 6px (tablet) → 8px (desktop)
<div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
  Content
</div>

// Responsive gap: 3px (mobile) → 4px (tablet) → 6px (desktop)
<div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
  Items
</div>
```

## Responsive Flex Direction

Stack on mobile, row on desktop:

```tsx
// Column on mobile, row on tablet+
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Responsive Display

Show/hide elements based on screen size:

```tsx
// Hide on mobile, show on tablet+
<div className="hidden sm:block">
  Desktop navigation
</div>

// Show on mobile, hide on tablet+
<div className="block sm:hidden">
  Mobile navigation
</div>

// Hide on mobile/tablet, show on desktop
<div className="hidden lg:block">
  Desktop sidebar
</div>
```

## Touch Targets

Ensure minimum 44px touch targets on mobile:

```tsx
// Button with 44px minimum height
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Touch-friendly button
</button>

// Input with 44px minimum height
<input className="min-h-[44px] px-3 py-2" />
```

## Responsive Images

Use responsive image utilities:

```tsx
// Full width, maintain aspect ratio
<img src="image.jpg" alt="Description" className="w-full h-auto" />

// Cover container
<img src="image.jpg" alt="Description" className="w-full h-full object-cover" />

// Contain in container
<img src="image.jpg" alt="Description" className="w-full h-full object-contain" />
```

## Responsive Tables

Stack on mobile, table layout on desktop:

```tsx
// Hide on mobile, show on tablet+
<table className="hidden md:table w-full">
  {/* Table content */}
</table>

// Show on mobile, hide on tablet+
<div className="block md:hidden">
  {/* Card layout for mobile */}
</div>
```

## Responsive Forms

Stack form fields on mobile, side-by-side on desktop:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  <div>
    <label>First Name</label>
    <input type="text" />
  </div>
  <div>
    <label>Last Name</label>
    <input type="text" />
  </div>
</div>
```

## Responsive Buttons

Full width on mobile, auto width on desktop:

```tsx
<button className="w-full sm:w-auto px-4 py-2">
  Action Button
</button>
```

## Responsive Cards

Responsive card layouts:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-white rounded-lg p-4 sm:p-6">
    <h3 className="text-lg sm:text-xl font-semibold mb-2">Card Title</h3>
    <p className="text-sm sm:text-base text-neutral-600">Card content</p>
  </div>
</div>
```

## Responsive Navigation

Mobile bottom nav, desktop sidebar:

```tsx
// Desktop sidebar (hidden on mobile)
<aside className="hidden md:block w-64 bg-white">
  {/* Sidebar navigation */}
</aside>

// Mobile bottom nav (hidden on desktop)
<nav className="fixed bottom-0 md:hidden w-full bg-white">
  {/* Bottom navigation */}
</nav>
```

## Responsive Modals

Full screen on mobile, centered on desktop:

```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg w-full sm:w-96 max-h-screen overflow-y-auto">
    {/* Modal content */}
  </div>
</div>
```

## Responsive Sidebars

Collapsible sidebar on mobile, always visible on desktop:

```tsx
// Desktop sidebar
<aside className="hidden lg:block w-64 bg-white">
  {/* Sidebar */}
</aside>

// Mobile sidebar (drawer)
<aside className="fixed left-0 top-0 bottom-0 w-64 bg-white transform -translate-x-full lg:translate-x-0 transition-transform">
  {/* Sidebar */}
</aside>
```

## Responsive Containers

Constrain content width on large screens:

```tsx
// Max width 1024px on desktop
<div className="w-full max-w-none lg:max-w-4xl mx-auto">
  Content
</div>

// Max width 1280px on desktop
<div className="w-full max-w-none lg:max-w-5xl mx-auto">
  Content
</div>
```

## Responsive Utilities

Use the responsive helpers from `@utils/responsiveHelpers`:

```tsx
import {
  createResponsiveGrid,
  createResponsiveContainer,
  getResponsiveTypographyClasses,
  responsiveGridClasses,
  responsiveGapClasses,
  responsivePaddingClasses,
  responsiveTypographyClasses,
  touchTargetClasses,
} from '@utils/responsiveHelpers'

// Create responsive grid
<div className={createResponsiveGrid(3, 'default')}>
  {/* 3-column grid with default gap */}
</div>

// Create responsive container
<div className={createResponsiveContainer('default', 'wide')}>
  {/* Responsive container with wide max-width */}
</div>

// Get typography classes
<h1 className={getResponsiveTypographyClasses('h1')}>
  Heading
</h1>
```

## Testing Responsive Layouts

Test at these breakpoints:

- **320px** (xs): iPhone SE, small phones
- **480px** (sm): Landscape phones
- **768px** (md): Tablets, iPad
- **1024px** (lg): iPad Pro, small laptops
- **1280px** (xl): Desktops, laptops
- **1920px** (2xl): Large desktops, ultra-wide

### Using useMediaQuery Hook

```tsx
import { useMediaQuery } from '@hooks/useMediaQuery'

export const MyComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div>
      {isMobile && <MobileLayout />}
      {!isMobile && <DesktopLayout />}
    </div>
  )
}
```

## Common Patterns

### Dashboard Grid (1 → 2 → 3 → 4 columns)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  {/* Dashboard widgets */}
</div>
```

### Content with Sidebar (Full width → Sidebar layout)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <main className="lg:col-span-3">
    {/* Main content */}
  </main>
  <aside className="lg:col-span-1">
    {/* Sidebar */}
  </aside>
</div>
```

### Two Column Layout (Stack → Side-by-side)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

### Three Column Layout (Stack → 2 → 3 columns)

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  <div>{/* Column 1 */}</div>
  <div>{/* Column 2 */}</div>
  <div>{/* Column 3 */}</div>
</div>
```

## Best Practices

1. **Mobile-First**: Always start with mobile styles, then add breakpoint prefixes
2. **Progressive Enhancement**: Add features for larger screens, don't remove for smaller
3. **Touch Targets**: Ensure 44px minimum for all interactive elements on mobile
4. **Typography**: Scale text appropriately for readability on all devices
5. **Spacing**: Use responsive spacing to maintain visual hierarchy
6. **Images**: Use responsive images with appropriate sizes
7. **Performance**: Lazy load images and defer non-critical resources
8. **Testing**: Test at all breakpoints to ensure proper layout
9. **Accessibility**: Maintain semantic HTML and ARIA labels across all breakpoints
10. **Consistency**: Use responsive helper utilities for consistency

## Anti-Patterns to Avoid

❌ **Desktop-first approach**
```tsx
// Wrong: starts with desktop, reduces for mobile
<div className="text-xl lg:text-sm">
```

❌ **Hardcoded pixel values**
```tsx
// Wrong: not responsive
<div style={{ width: '1024px' }}>
```

❌ **Horizontal scrolling on mobile**
```tsx
// Wrong: causes horizontal scroll
<div className="overflow-x-auto">
```

❌ **Small touch targets**
```tsx
// Wrong: less than 44px
<button className="px-2 py-1">
```

❌ **Inconsistent spacing**
```tsx
// Wrong: inconsistent responsive spacing
<div className="p-4 md:p-12">
```

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Responsive Design](https://www.nngroup.com/articles/mobile-first-responsive-web-design/)
- [Touch Target Size Guidelines](https://www.nngroup.com/articles/touch-target-size/)
- [Responsive Typography](https://www.smashingmagazine.com/2016/05/fluid-typography/)
