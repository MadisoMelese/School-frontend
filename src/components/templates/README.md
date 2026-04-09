# Templates

Template components provide page-level layouts for different sections of the application. They combine organisms and molecules to create complete page structures.

## Components

### AuthLayout

Layout for authentication pages (login, password reset, etc.).

**Features:**
- Centered card layout with gradient background
- Optional branding section
- Responsive design (mobile-first)
- Theme support (light/dark mode)
- Accessibility compliant (WCAG 2.1 AA)

**Usage:**

```tsx
import { AuthLayout } from '@/components/templates';

export function LoginPage() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Enter your credentials to continue"
      showBranding={true}
    >
      <form>
        {/* Login form content */}
      </form>
    </AuthLayout>
  );
}
```

**Props:**

- `children` (React.ReactNode) - Page content
- `title` (string, optional) - Page title
- `subtitle` (string, optional) - Page subtitle
- `showBranding` (boolean, default: true) - Show SchoolOS branding

---

### DashboardLayout

Main app layout with navigation and content area.

**Features:**
- Responsive sidebar (desktop) / bottom nav (mobile)
- Header with user menu and notifications
- Scrollable content area
- Auto-hide bottom nav on scroll (mobile)
- Theme support
- Accessibility compliant

**Usage:**

```tsx
import { DashboardLayout } from '@/components/templates';

export function DashboardPage() {
  return (
    <DashboardLayout
      title="Dashboard"
      description="Welcome back to SchoolOS"
    >
      {/* Dashboard content */}
    </DashboardLayout>
  );
}
```

**Props:**

- `children` (React.ReactNode) - Page content
- `title` (string, optional) - Page title
- `description` (string, optional) - Page description

**Responsive Behavior:**

- **Mobile (< 768px):** Bottom tab navigation, full-width content
- **Tablet (768px - 1024px):** Sidebar navigation, responsive content
- **Desktop (> 1024px):** Fixed sidebar, full-width content

---

### PortalLayout

Layout for feature-specific portals (Student Portal, Teacher Portal, etc.).

**Features:**
- Breadcrumb navigation
- Optional sidebar for portal-specific navigation
- Responsive design
- Theme support
- Accessibility compliant

**Usage:**

```tsx
import { PortalLayout } from '@/components/templates';

export function GradesPage() {
  return (
    <PortalLayout
      title="Grades"
      description="View your academic performance"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Grades' },
      ]}
      sidebarContent={<GradesSidebar />}
    >
      {/* Grades content */}
    </PortalLayout>
  );
}
```

**Props:**

- `children` (React.ReactNode) - Page content
- `title` (string, optional) - Page title
- `description` (string, optional) - Page description
- `breadcrumbs` (BreadcrumbItem[], optional) - Breadcrumb navigation
- `sidebarContent` (React.ReactNode, optional) - Sidebar content
- `showSidebar` (boolean, default: true) - Show sidebar

**BreadcrumbItem:**

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}
```

---

### AdminLayout

Layout for admin-specific pages with sidebar navigation.

**Features:**
- Collapsible sidebar with admin menu
- Header with admin controls
- Expandable submenu items
- Badge support for menu items
- Responsive design
- Theme support
- Accessibility compliant

**Usage:**

```tsx
import { AdminLayout } from '@/components/templates';

export function UserManagementPage() {
  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Users', href: '/admin/users', badge: 5 },
    {
      label: 'Settings',
      href: '/admin/settings',
      submenu: [
        { label: 'General', href: '/admin/settings/general' },
        { label: 'Security', href: '/admin/settings/security' },
      ],
    },
  ];

  return (
    <AdminLayout
      title="User Management"
      description="Manage system users"
      menuItems={menuItems}
      currentPath="/admin/users"
    >
      {/* Admin content */}
    </AdminLayout>
  );
}
```

**Props:**

- `children` (React.ReactNode) - Page content
- `title` (string, optional) - Page title
- `description` (string, optional) - Page description
- `menuItems` (AdminMenuItem[], optional) - Admin menu items
- `currentPath` (string, optional) - Current page path for highlighting

**AdminMenuItem:**

```typescript
interface AdminMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  submenu?: AdminMenuItem[];
}
```

---

## Responsive Design

All templates follow a mobile-first approach with responsive breakpoints:

- **Mobile:** 320px - 640px (sm)
- **Tablet:** 641px - 1024px (md, lg)
- **Desktop:** 1025px+ (xl, 2xl)

### Touch Targets

All interactive elements have a minimum 44px height and width on mobile devices for accessibility.

---

## Theme Support

All templates support light and dark modes through CSS variables and Tailwind CSS classes:

```tsx
import { useTheme } from '@/hooks/useTheme';

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

---

## Accessibility

All templates are WCAG 2.1 AA compliant:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance (4.5:1 for text)
- Screen reader support

---

## Testing

Each template includes comprehensive tests covering:

- Rendering with default and custom props
- Accessibility attributes
- Responsive behavior
- Theme support
- Children rendering

Run tests with:

```bash
npm run test
```

---

## Best Practices

1. **Use appropriate template for page type:**
   - AuthLayout for login/password reset
   - DashboardLayout for main app pages
   - PortalLayout for feature-specific pages
   - AdminLayout for admin pages

2. **Provide meaningful titles and descriptions:**
   - Helps with SEO and accessibility
   - Improves user experience

3. **Use breadcrumbs in PortalLayout:**
   - Helps users understand page hierarchy
   - Improves navigation

4. **Keep sidebar content lightweight:**
   - Avoid heavy computations in sidebar
   - Use lazy loading for sidebar data

5. **Test responsive behavior:**
   - Test on multiple screen sizes
   - Verify touch targets are 44px minimum

---

## Related Components

- [Header](/src/components/organisms/Header.tsx) - App header
- [Navigation](/src/components/organisms/Navigation.tsx) - Navigation menu
- [Breadcrumb](/src/components/molecules/Breadcrumb.tsx) - Breadcrumb navigation
- [useTheme](/src/hooks/useTheme.ts) - Theme hook
- [useMediaQuery](/src/hooks/useMediaQuery.ts) - Media query hook
