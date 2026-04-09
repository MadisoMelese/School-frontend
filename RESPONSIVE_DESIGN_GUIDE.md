# SchoolOS Mobile Frontend - Responsive Design Guide

## Overview

This guide documents the comprehensive mobile-first responsive design implementation for SchoolOS Mobile Frontend. The application is designed to work seamlessly from 320px (mobile) to 1920px (desktop) using Tailwind CSS v4 breakpoints.

## Breakpoints

The application uses the following responsive breakpoints:

| Breakpoint | Size Range | Device Type | Use Case |
|-----------|-----------|------------|----------|
| `xs` | 320px | Extra small phones | Minimum supported width |
| `sm` | 640px | Small phones (landscape) | Landscape phones, small tablets |
| `md` | 768px | Medium tablets | Portrait tablets |
| `lg` | 1024px | Large tablets/small laptops | Tablet landscape, small desktops |
| `xl` | 1280px | Desktops | Standard desktop monitors |
| `2xl` | 1536px | Large desktops | Large desktop monitors |
| `3xl` | 1920px | Ultra-wide displays | Ultra-wide monitors |

## Mobile-First Approach

All styles start with mobile defaults and progressively enhance for larger screens:

```tsx
// Mobile first - base styles apply to all screens
<div className="text-sm p-4">
  {/* sm: applies at 640px and above */}
  {/* md: applies at 768px and above */}
  {/* lg: applies at 1024px and above */}
</div>
```

## Responsive Grid Layouts

### 1-Column Layout (Mobile)
```tsx
<div className="grid grid-cols-1">
  {/* Single column on mobile */}
</div>
```

### 2-Column Layout (Tablet)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2">
  {/* Single column on mobile, 2 columns on tablet */}
</div>
```

### 3-Column Layout (Desktop)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### 4-Column Layout (Large Desktop)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Single column on mobile, 2 on tablet, 3 on desktop, 4 on large desktop */}
</div>
```

## Responsive Typography

Typography scales appropriately across breakpoints:

```tsx
// Responsive heading
<h1 className="text-2xl sm:text-3xl md:text-4xl">
  Page Title
</h1>

// Responsive body text
<p className="text-sm sm:text-base md:text-lg">
  Body text
</p>

// Using responsive text utilities
<p className="text-responsive-base">
  Scales from 1rem (mobile) → 1.125rem (tablet) → 1.25rem (desktop)
</p>
```

### Typography Scale

| Class | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `text-responsive-sm` | 0.875rem | 1rem | 1.125rem |
| `text-responsive-base` | 1rem | 1.125rem | 1.25rem |
| `text-responsive-lg` | 1.125rem | 1.25rem | 1.5rem |
| `text-responsive-xl` | 1.25rem | 1.5rem | 1.875rem |
| `text-responsive-2xl` | 1.5rem | 1.875rem | 2.25rem |

## Responsive Spacing

Spacing scales from mobile to desktop:

```tsx
// Responsive padding
<div className="p-responsive">
  {/* 1rem on mobile, 1.5rem on tablet, 2rem on desktop */}
</div>

// Responsive horizontal padding
<div className="px-responsive">
  {/* 1rem on mobile, 1.5rem on tablet, 2rem on desktop */}
</div>

// Responsive vertical padding
<div className="py-responsive">
  {/* 1rem on mobile, 1.5rem on tablet, 2rem on desktop */}
</div>

// Responsive gap
<div className="flex gap-responsive">
  {/* 1rem on mobile, 1.5rem on tablet, 2rem on desktop */}
</div>
```

## Responsive Images

Images are responsive by default:

```tsx
// Responsive image
<img src="image.jpg" alt="description" className="img-responsive" />

// Cover image (fills container)
<img src="image.jpg" alt="description" className="img-responsive img-cover" />

// Contain image (fits inside container)
<img src="image.jpg" alt="description" className="img-responsive img-contain" />
```

## Touch Targets

All interactive elements have minimum 44px touch targets on mobile:

```tsx
// Button with touch target
<button className="min-h-touch-target min-w-touch-target">
  Click me
</button>

// Using touch-target utility
<button className="touch-target">
  Click me
</button>
```

## Navigation

### Mobile Navigation (Bottom Tab Bar)
- Fixed at bottom of screen
- Hides on scroll to maximize content space
- 5-6 navigation items maximum
- Icons + labels

### Desktop Navigation (Sidebar)
- Fixed sidebar on left
- Collapsible for more content space
- Full labels visible
- Scrollable for many items

## Responsive Containers

Use responsive container utilities for consistent max-widths:

```tsx
// Container with responsive max-width
<div className="container-responsive-lg mx-auto">
  {/* Max-width: 1024px, centered */}
</div>

// Available sizes
<div className="container-responsive-xs">  {/* 320px */}</div>
<div className="container-responsive-sm">  {/* 640px */}</div>
<div className="container-responsive-md">  {/* 768px */}</div>
<div className="container-responsive-lg">  {/* 1024px */}</div>
<div className="container-responsive-xl">  {/* 1280px */}</div>
<div className="container-responsive-2xl"> {/* 1536px */}</div>
```

## Responsive Display Utilities

Show/hide content based on screen size:

```tsx
// Hide on mobile, show on tablet+
<div className="hidden-mobile">
  Desktop only content
</div>

// Show on mobile, hide on tablet+
<div className="visible-mobile">
  Mobile only content
</div>

// Show only on tablet
<div className="visible-tablet">
  Tablet only content
</div>

// Show only on desktop
<div className="visible-desktop">
  Desktop only content
</div>
```

## Responsive Flex Layouts

Flex direction changes based on screen size:

```tsx
// Column on mobile, row on tablet+
<div className="flex-responsive gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Column-reverse on mobile, row-reverse on tablet+
<div className="flex-responsive-reverse gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Responsive Column Utilities

Grid column utilities for common layouts:

```tsx
// 1 column on mobile, 2 on tablet
<div className="grid col-responsive-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid col-responsive-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large desktop
<div className="grid col-responsive-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

## Safe Area Support

Safe area insets are supported for notched devices:

```tsx
// Safe area padding
<div className="p-safe-top p-safe-bottom">
  Content with safe area padding
</div>

// Safe area spacing
<div className="mt-safe-top mb-safe-bottom">
  Content with safe area margins
</div>
```

## Testing Responsive Layouts

Test layouts at key breakpoints:

1. **320px** - iPhone SE, small phones
2. **480px** - Landscape phones
3. **768px** - iPad, tablets
4. **1024px** - iPad Pro, small laptops
5. **1280px** - Desktop monitors
6. **1920px** - Large desktop monitors

### Using Chrome DevTools

1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device or custom dimensions
4. Test at each breakpoint

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
      {isTablet && !isMobile && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  )
}
```

## Responsive Component Examples

### Dashboard Grid

```tsx
// Responsive dashboard with 1-4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
  {widgets.map(widget => (
    <Card key={widget.id}>{widget.content}</Card>
  ))}
</div>
```

### Performance Summary Cards

```tsx
// Responsive performance cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
  <Card>
    <p className="text-xs sm:text-sm text-neutral-600">Average Grade</p>
    <p className="text-2xl sm:text-3xl md:text-4xl font-bold">85</p>
  </Card>
  {/* More cards */}
</div>
```

### Responsive Table/Card Layout

```tsx
// Table on desktop, cards on mobile
{isMobile ? (
  <div className="space-y-3">
    {items.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
) : (
  <DataTable columns={columns} data={items} />
)}
```

### Responsive Filter Layout

```tsx
// Responsive filter section
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
  <h3 className="font-semibold text-base sm:text-lg">Filters</h3>
  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
    Reset
  </Button>
</div>
```

## Performance Considerations

1. **Mobile-First CSS**: Smaller CSS payload on mobile
2. **Lazy Loading**: Images load on demand
3. **Code Splitting**: Routes split by breakpoint
4. **Responsive Images**: Serve appropriate sizes
5. **Touch Optimization**: Larger targets on mobile

## Accessibility

1. **Semantic HTML**: Proper heading hierarchy
2. **ARIA Labels**: Descriptive labels for screen readers
3. **Keyboard Navigation**: Tab, Enter, Escape support
4. **Focus Indicators**: Visible focus states
5. **Color Contrast**: 4.5:1 minimum ratio
6. **Touch Targets**: 44px minimum on mobile

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## Common Patterns

### Responsive Padding
```tsx
<div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
  Content
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Heading
</h1>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Responsive Flex
```tsx
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Item 1</div>
  <div className="flex-1">Item 2</div>
</div>
```

## Troubleshooting

### Content Overflowing on Mobile
- Check for fixed widths
- Use `max-w-full` or `w-full`
- Ensure padding/margin are responsive

### Text Too Small on Mobile
- Use responsive text utilities
- Minimum 16px on mobile
- Scale up for larger screens

### Touch Targets Too Small
- Use `min-h-touch-target` and `min-w-touch-target`
- Ensure 44px minimum
- Add padding around interactive elements

### Layout Breaking at Breakpoints
- Test at exact breakpoint widths
- Check for conflicting classes
- Use DevTools to inspect computed styles

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design](https://www.nngroup.com/articles/mobile-first-web-design/)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
