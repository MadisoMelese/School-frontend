# Styles & Theme System

This directory contains global styles, theme configuration, and animations for the SchoolOS Mobile Frontend.

## Files

### globals.css

Global base styles and utility classes.

**Includes:**
- Base HTML and body styles
- Safe area support for notched devices
- Focus visible styles for keyboard navigation
- Selection styles
- Component layer styles (buttons, cards, forms, badges)
- Utility classes (scrollbar, truncate, flex-center, responsive)
- Accessibility utilities (sr-only, focus-ring, skip-to-main)
- Print styles

### theme.css

CSS variables for light and dark mode theming.

**Color Variables:**
- Primary colors (primary, primary-dark)
- Secondary colors
- Status colors (success, warning, danger)
- Background colors (primary, secondary, tertiary)
- Text colors (primary, secondary, tertiary)
- Border colors
- Shadow values

**Usage:**

```css
.my-element {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
```

### animations.css

Custom animations and transitions.

**Animations:**
- fadeIn / fadeOut
- slideUp / slideDown / slideLeft / slideRight
- slideInFromLeft / slideInFromRight
- scaleIn
- spin
- pulse
- shimmer
- bounce

**Usage:**

```tsx
<div className="animate-fade-in">Content</div>
<div className="animate-slide-up">Slide up animation</div>
```

---

## Theme System

### Light & Dark Mode

The application supports three theme modes:

1. **Light** - Always use light theme
2. **Dark** - Always use dark theme
3. **System** - Follow system preference (default)

### Switching Themes

```tsx
import { useTheme } from '@/hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### Theme Persistence

Theme preference is automatically saved to localStorage and restored on page load.

### CSS Variables

Theme colors are defined as CSS variables in `theme.css`:

```css
:root {
  --color-primary: rgb(14, 165, 233);
  --bg-primary: rgb(255, 255, 255);
  --text-primary: rgb(17, 24, 39);
}

.dark {
  --bg-primary: rgb(17, 24, 39);
  --text-primary: rgb(249, 250, 251);
}
```

---

## Responsive Design

### Breakpoints

The application uses Tailwind CSS breakpoints:

- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

### Mobile-First Approach

All styles start with mobile design and progressively enhance for larger screens:

```tsx
<div className="text-base sm:text-lg md:text-xl lg:text-2xl">
  Responsive text
</div>
```

### Responsive Utilities

**Responsive Padding:**
```tsx
<div className="p-responsive">Content</div>
// Applies: p-4 sm:p-6 md:p-8
```

**Responsive Grid:**
```tsx
<div className="grid-responsive">
  {/* 1 col mobile, 2 col tablet, 3 col desktop, 4 col large desktop */}
</div>
```

**Responsive Gap:**
```tsx
<div className="flex gap-responsive">
  {/* gap-4 sm:gap-6 md:gap-8 */}
</div>
```

### Touch Targets

All interactive elements have a minimum 44px height and width on mobile:

```tsx
<button className="touch-target">
  Click me
</button>
```

---

## Accessibility

### Color Contrast

All text meets WCAG 2.1 AA standards:
- Text: 4.5:1 contrast ratio
- Graphics: 3:1 contrast ratio

### Focus Indicators

All interactive elements have visible focus indicators:

```tsx
<button className="focus-ring">
  Keyboard accessible
</button>
```

### Screen Reader Support

Use semantic HTML and ARIA labels:

```tsx
<nav aria-label="Main navigation">
  {/* Navigation items */}
</nav>
```

### Reduced Motion

Animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Skip to Main Content

Include skip link for keyboard users:

```tsx
<a href="#main-content" className="skip-to-main">
  Skip to main content
</a>
```

### Screen Reader Only Text

Hide text visually but keep it for screen readers:

```tsx
<span className="sr-only">Loading...</span>
```

---

## Animations

### Fade Animations

```tsx
<div className="animate-fade-in">Fade in</div>
<div className="animate-fade-out">Fade out</div>
```

### Slide Animations

```tsx
<div className="animate-slide-up">Slide up</div>
<div className="animate-slide-down">Slide down</div>
<div className="animate-slide-left">Slide left</div>
<div className="animate-slide-right">Slide right</div>
```

### Scale Animation

```tsx
<div className="animate-scale-in">Scale in</div>
```

### Loading Animations

```tsx
<div className="animate-spin-slow">Spinning loader</div>
<div className="animate-pulse-soft">Pulsing element</div>
<div className="animate-shimmer">Shimmer skeleton</div>
```

### Bounce Animation

```tsx
<div className="animate-bounce">Bouncing element</div>
```

### Respecting User Preferences

All animations automatically disable when `prefers-reduced-motion` is set.

---

## Best Practices

### 1. Use Responsive Utilities

Instead of writing custom media queries, use responsive utilities:

```tsx
// ✅ Good
<div className="text-base sm:text-lg md:text-xl">Text</div>

// ❌ Avoid
<div style={{ fontSize: isMobile ? '16px' : '20px' }}>Text</div>
```

### 2. Maintain Color Contrast

Always ensure sufficient color contrast:

```tsx
// ✅ Good - 4.5:1 contrast
<p className="text-neutral-900 dark:text-neutral-50">Text</p>

// ❌ Avoid - insufficient contrast
<p className="text-neutral-400 dark:text-neutral-600">Text</p>
```

### 3. Use Semantic HTML

```tsx
// ✅ Good
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Avoid
<div className="nav">
  <div className="nav-item"><span>Home</span></div>
</div>
```

### 4. Provide Focus Indicators

```tsx
// ✅ Good
<button className="focus-ring">Click me</button>

// ❌ Avoid
<button style={{ outline: 'none' }}>Click me</button>
```

### 5. Use Touch-Friendly Targets

```tsx
// ✅ Good - 44px minimum
<button className="touch-target">Click me</button>

// ❌ Avoid - too small
<button className="w-6 h-6">Click me</button>
```

### 6. Respect User Motion Preferences

```tsx
// ✅ Good - animations respect prefers-reduced-motion
<div className="animate-fade-in">Content</div>

// ❌ Avoid - ignores user preference
<div style={{ animation: 'fadeIn 0.3s' }}>Content</div>
```

---

## Customization

### Adding Custom Colors

Edit `theme.css` to add custom color variables:

```css
:root {
  --color-custom: rgb(100, 150, 200);
}

.dark {
  --color-custom: rgb(50, 100, 150);
}
```

### Adding Custom Animations

Edit `animations.css` to add custom animations:

```css
@keyframes myAnimation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-my-animation {
  animation: myAnimation 0.3s ease-out;
}
```

### Adding Custom Utilities

Edit `globals.css` to add custom utility classes:

```css
@layer utilities {
  .my-utility {
    @apply flex items-center justify-center;
  }
}
```

---

## Performance

### CSS Optimization

- Tailwind CSS automatically purges unused styles
- CSS variables are more performant than inline styles
- Animations use GPU acceleration (transform, opacity)

### Bundle Size

- Global CSS: ~50KB (gzipped)
- Animations: ~2KB (gzipped)
- Theme variables: ~1KB (gzipped)

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Latest versions

---

## Related Documentation

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Prefers Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
