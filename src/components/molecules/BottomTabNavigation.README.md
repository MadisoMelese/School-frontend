# BottomTabNavigation Component

## Overview

The `BottomTabNavigation` component is a mobile-optimized bottom tab navigation bar designed for the SchoolOS application. It provides role-based menu items with active state indicators, notification badges, and smooth animations.

## Features

- **Mobile-First Design**: Hidden on desktop (md and above), displayed at bottom on mobile
- **Touch-Friendly**: 44px minimum height (64px actual) with adequate padding for touch targets
- **Active State Indicator**: Visual highlight with smooth animations
- **Notification Badges**: Display unread message/notification counts with pulsing animation
- **Keyboard Navigation**: Arrow key support for navigating between items
- **Accessibility**: Full ARIA labels, focus management, and semantic HTML
- **Smooth Animations**: Scale and fade transitions for active states
- **Responsive Icons and Labels**: Configurable label display
- **Scroll Behavior**: Optional hide-on-scroll functionality to maximize content space

## Usage

### Basic Example

```tsx
import { BottomTabNavigation, BottomTabItem } from '@components/molecules'

const navItems: BottomTabItem[] = [
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
    badge: 3, // Shows unread count
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'User',
    roles: ['student', 'teacher', 'parent', 'admin'],
  },
]

export function App() {
  const [activeItem, setActiveItem] = useState('dashboard')

  return (
    <BottomTabNavigation
      items={navItems}
      activeItem={activeItem}
      onItemClick={setActiveItem}
    />
  )
}
```

### With Navigation Integration

```tsx
import { useNavigate } from 'react-router-dom'
import { BottomTabNavigation } from '@components/molecules'

export function Layout() {
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId)
    navigate(`/${itemId}`)
  }

  return (
    <BottomTabNavigation
      items={navItems}
      activeItem={activeItem}
      onItemClick={handleNavClick}
    />
  )
}
```

### With Hide-on-Scroll

```tsx
<BottomTabNavigation
  items={navItems}
  activeItem={activeItem}
  onItemClick={handleNavClick}
  hideOnScroll={true}
/>
```

### Without Labels

```tsx
<BottomTabNavigation
  items={navItems}
  activeItem={activeItem}
  onItemClick={handleNavClick}
  showLabels={false}
/>
```

## Props

### `BottomTabNavigationProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `BottomTabItem[]` | Yes | - | Array of navigation items to display |
| `activeItem` | `string` | No | - | ID of the currently active item |
| `onItemClick` | `(itemId: string) => void` | Yes | - | Callback when an item is clicked |
| `className` | `string` | No | `''` | Additional CSS classes to apply |
| `showLabels` | `boolean` | No | `true` | Whether to display item labels |
| `hideOnScroll` | `boolean` | No | `false` | Whether to hide nav on scroll down |

### `BottomTabItem`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the item |
| `label` | `string` | Yes | Display label for the item |
| `icon` | `string` | Yes | Lucide React icon name |
| `href` | `string` | No | Optional URL for the item |
| `roles` | `string[]` | No | Array of user roles that can see this item |
| `badge` | `number` | No | Optional notification badge count |
| `ariaLabel` | `string` | No | Custom ARIA label (defaults to label) |

## Styling

The component uses Tailwind CSS v4 with the following color scheme:

- **Active State**: `text-primary-600` with primary-600 indicator line
- **Inactive State**: `text-neutral-600` with hover effect
- **Badge**: `bg-danger-500` with pulsing animation
- **Indicator**: Primary-600 rounded line at bottom

### Customization

Apply custom styles via the `className` prop:

```tsx
<BottomTabNavigation
  items={navItems}
  activeItem={activeItem}
  onItemClick={handleNavClick}
  className="shadow-lg"
/>
```

## Accessibility

The component is fully accessible with:

- **ARIA Labels**: Each item has an `aria-label` for screen readers
- **Active State**: Uses `aria-current="page"` for active items
- **Keyboard Navigation**: 
  - Arrow Left/Right to navigate between items
  - Enter/Space to activate items
  - Tab to focus items
- **Focus Management**: Visible focus indicators with ring styling
- **Semantic HTML**: Uses `<nav>` and `<button>` elements
- **Badge Announcements**: Status role for notification badges

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Focus next item |
| `Shift + Tab` | Focus previous item |
| `ArrowRight` | Navigate to next item |
| `ArrowLeft` | Navigate to previous item |
| `Enter` / `Space` | Activate focused item |

## Animations

The component includes smooth animations:

- **Icon Scale**: Active icon scales to 110%, inactive to 100%
- **Indicator**: Fade-in and slide-up animation for active indicator
- **Badge**: Pulsing animation for notification badges
- **Transitions**: 200-300ms duration for smooth visual feedback

## Responsive Behavior

- **Mobile (< 768px)**: Displayed at bottom of screen
- **Desktop (≥ 768px)**: Hidden (use sidebar navigation instead)
- **Touch Targets**: Minimum 44px height (actual 64px)
- **Padding**: 8px horizontal, 8px vertical per item

## Integration with Navigation Component

The `BottomTabNavigation` is designed to work alongside the existing `Navigation` component:

- `Navigation`: Handles desktop sidebar and mobile header
- `BottomTabNavigation`: Handles mobile bottom tabs

Both can be used together in a layout:

```tsx
export function DashboardLayout() {
  return (
    <>
      <Navigation items={navItems} />
      <main className="pb-16 md:pb-0">
        {/* Content */}
      </main>
      <BottomTabNavigation items={navItems} />
    </>
  )
}
```

## State Persistence

To persist the active navigation state across page reloads:

```tsx
import { useEffect, useState } from 'react'

export function App() {
  const [activeItem, setActiveItem] = useState(() => {
    return localStorage.getItem('activeNav') || 'dashboard'
  })

  useEffect(() => {
    localStorage.setItem('activeNav', activeItem)
  }, [activeItem])

  return (
    <BottomTabNavigation
      items={navItems}
      activeItem={activeItem}
      onItemClick={setActiveItem}
    />
  )
}
```

## Testing

The component includes comprehensive tests covering:

- Rendering and ARIA attributes
- Active state management
- Badge display and formatting
- Click and keyboard interactions
- Accessibility features
- Touch-friendly design
- Responsive behavior
- Animation classes
- State persistence

Run tests with:

```bash
npm test -- BottomTabNavigation.test.tsx --run
```

## Performance Considerations

- **Minimal Re-renders**: Only re-renders when `activeItem` or `items` change
- **No External Dependencies**: Uses only React and Lucide icons
- **Optimized Animations**: Uses CSS transitions instead of JavaScript
- **Lazy Icon Loading**: Icons are loaded on-demand via Lucide React

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Accessibility Compliance

- **WCAG 2.1 AA**: Full compliance
- **Color Contrast**: 4.5:1 for text, 3:1 for graphics
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Fully compatible with NVDA, JAWS, VoiceOver

## Related Components

- `Navigation`: Main navigation component (sidebar/header)
- `Icon`: Icon component using Lucide React
- `Badge`: Badge component for notifications
- `Button`: Base button component

## Examples

### Role-Based Navigation

```tsx
const getNavItemsForRole = (role: string): BottomTabItem[] => {
  const allItems: BottomTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['student', 'teacher', 'parent', 'admin'] },
    { id: 'grades', label: 'Grades', icon: 'BookOpen', roles: ['student', 'teacher', 'parent'] },
    { id: 'attendance', label: 'Attendance', icon: 'Calendar', roles: ['student', 'teacher'] },
    { id: 'messages', label: 'Messages', icon: 'MessageSquare', roles: ['student', 'teacher', 'parent', 'admin'] },
    { id: 'profile', label: 'Profile', icon: 'User', roles: ['student', 'teacher', 'parent', 'admin'] },
  ]

  return allItems.filter(item => item.roles?.includes(role))
}
```

### With Unread Counts

```tsx
const [unreadCounts, setUnreadCounts] = useState({
  messages: 3,
  notifications: 1,
})

const navItems = [
  // ...
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageSquare',
    badge: unreadCounts.messages,
  },
  // ...
]
```

## Troubleshooting

### Navigation not showing on mobile

Ensure the component is rendered and not hidden by parent styles. Check that `md:hidden` class is not being overridden.

### Badges not displaying

Verify that `badge` prop is a number > 0. Badges with value 0 or undefined are not displayed.

### Keyboard navigation not working

Ensure the component has focus. Use Tab to focus the navigation, then use arrow keys to navigate.

### Animations not smooth

Check browser support for CSS transitions. Ensure `transition-transform` and `transition-all` classes are not being overridden.

## Future Enhancements

- [ ] Customizable animation speeds
- [ ] Swipe gesture support for navigation
- [ ] Haptic feedback on mobile
- [ ] Custom badge colors
- [ ] Animated icons
- [ ] Tooltip support
- [ ] Drag-to-reorder items
