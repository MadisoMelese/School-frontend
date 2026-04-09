# Atom Components

Atom components are the basic building blocks of the SchoolOS UI. They are simple, reusable, and self-contained components that form the foundation for more complex molecules and organisms.

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `disabled`: boolean (default: false)
- All standard HTML button attributes

**Features:**
- Loading state with spinner
- Disabled state
- Full width option
- Minimum 44px touch target height
- Focus ring for accessibility
- Keyboard support

**Example:**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button loading>Saving...</Button>

<Button variant="danger" fullWidth>
  Delete
</Button>
```

### Input

A flexible input component with error handling and helper text.

**Props:**
- `type`: HTML input type (default: 'text')
- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- `disabled`: boolean (default: false)
- All standard HTML input attributes

**Features:**
- Built-in label
- Error state with red border
- Helper text support
- Accessibility labels (aria-describedby, aria-invalid)
- Focus ring styling
- Disabled state

**Example:**
```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  error={emailError}
/>

<Input
  type="password"
  label="Password"
  helperText="Minimum 8 characters"
/>
```

### Label

A semantic label component with optional required indicator.

**Props:**
- `required`: boolean (default: false)
- `htmlFor`: string (optional)
- All standard HTML label attributes

**Features:**
- Required indicator (*)
- Semantic HTML
- Proper font styling
- Accessibility support

**Example:**
```tsx
<Label htmlFor="email" required>
  Email Address
</Label>
<Input id="email" />
```

### Badge

A status badge component for displaying tags and status indicators.

**Props:**
- `variant`: 'success' | 'warning' | 'danger' | 'info' | 'neutral' (default: 'neutral')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `icon`: React.ReactNode (optional)
- `children`: React.ReactNode (required)

**Features:**
- Multiple color variants
- Icon support
- Semantic role="status"
- Rounded pill shape

**Example:**
```tsx
<Badge variant="success">Paid</Badge>
<Badge variant="warning" icon={<AlertIcon />}>Pending</Badge>
<Badge variant="danger">Absent</Badge>
```

### Icon

A Lucide React icon wrapper with size and color variants.

**Props:**
- `name`: keyof typeof Icons (required)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'inherit' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' (default: 'inherit')
- `strokeWidth`: number (default: 2)
- `aria-hidden`: boolean (default: true)
- `aria-label`: string (optional)

**Features:**
- Lucide React integration
- Multiple size options
- Color variants
- Accessibility support
- Customizable stroke width

**Example:**
```tsx
<Icon name="Heart" size="md" color="danger" />
<Icon name="Check" size="sm" color="success" aria-label="Completed" />
<Icon name="AlertCircle" color="warning" />
```

### Spinner

A loading spinner component for indicating loading states.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'primary' | 'secondary' | 'neutral' | 'inherit' (default: 'primary')
- `label`: string (default: 'Loading')

**Features:**
- Smooth rotation animation
- Multiple size options
- Color variants
- Accessibility with role="status"
- Screen reader support

**Example:**
```tsx
<Spinner />
<Spinner size="lg" color="secondary" label="Saving..." />
<Spinner size="sm" color="inherit" />
```

### Avatar

A user avatar component with image and fallback initials.

**Props:**
- `src`: string (optional)
- `alt`: string (optional)
- `name`: string (optional)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')

**Features:**
- Image support with lazy loading
- Fallback to initials
- Color-coded backgrounds
- Responsive sizing
- Accessibility support

**Example:**
```tsx
<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />
<Avatar name="John Doe" size="md" />
<Avatar name="Jane Smith" size="lg" />
```

### Divider

A horizontal or vertical divider component.

**Props:**
- `orientation`: 'horizontal' | 'vertical' (default: 'horizontal')
- `label`: string (optional)

**Features:**
- Horizontal and vertical variants
- Optional label in the middle
- Semantic role="separator"
- Subtle gray color

**Example:**
```tsx
<Divider />
<Divider label="OR" />
<Divider orientation="vertical" />
```

### Tooltip

A hover tooltip component with positioning options.

**Props:**
- `content`: React.ReactNode (required)
- `children`: React.ReactNode (required)
- `position`: 'top' | 'bottom' | 'left' | 'right' (default: 'top')
- `delay`: number (default: 200ms)

**Features:**
- Multiple position options
- Configurable delay
- Fade-in animation
- Semantic role="tooltip"
- Keyboard-friendly

**Example:**
```tsx
<Tooltip content="Save your changes">
  <Button>Save</Button>
</Tooltip>

<Tooltip content="Delete permanently" position="bottom">
  <Button variant="danger">Delete</Button>
</Tooltip>
```

### Tag

A categorization tag component with optional remove button.

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral' (default: 'neutral')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `icon`: React.ReactNode (optional)
- `onRemove`: () => void (optional)
- `children`: React.ReactNode (required)

**Features:**
- Multiple color variants
- Icon support
- Optional remove button
- Keyboard accessible
- Semantic role="status"

**Example:**
```tsx
<Tag variant="primary">React</Tag>
<Tag variant="success" icon={<CheckIcon />}>Verified</Tag>
<Tag onRemove={() => handleRemove()}>Removable Tag</Tag>
```

## Accessibility

All atom components follow WCAG 2.1 AA guidelines:

- **Semantic HTML**: Using proper HTML elements (button, input, label, etc.)
- **ARIA Attributes**: Proper aria-label, aria-describedby, role attributes
- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Escape
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Color Contrast**: 4.5:1 minimum contrast ratio for text
- **Touch Targets**: Minimum 44px height/width for mobile

## Mobile-First Design

All components are designed mobile-first:

- **Touch-Friendly**: 44px minimum tap targets
- **Responsive**: Adapt to all screen sizes (320px - 1920px)
- **Performance**: Optimized for 4G networks
- **Accessibility**: Work with assistive technologies

## Testing

Each component includes comprehensive unit tests:

- Component rendering
- Props validation
- Event handling
- Accessibility attributes
- Style application
- Edge cases

Run tests with:
```bash
npm run test
```

## Usage

Import components from the atoms index:

```tsx
import { Button, Input, Badge, Icon, Spinner, Avatar, Divider, Tooltip, Tag, Label } from '@/components/atoms'
```

Or import individual components:

```tsx
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
```

## Styling

All components use Tailwind CSS v4 with custom theme colors:

- **Primary**: Blue (#0ea5e9)
- **Secondary**: Purple (#8b5cf6)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray (#6b7280)

Custom theme colors are defined in `tailwind.config.ts`.

## Contributing

When adding new atom components:

1. Keep components simple and focused
2. Use TypeScript for type safety
3. Include comprehensive tests
4. Follow accessibility guidelines
5. Document props and usage
6. Use Tailwind CSS for styling
7. Support mobile-first design
