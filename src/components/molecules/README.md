# Molecule Components

Molecule components are combinations of atoms that form more complex, reusable UI patterns. They represent functional units that are more specific than atoms but more generic than organisms.

## Components

### FormField
Combines Label + Input + Error message for form inputs.

**Props:**
- `label` (string): Field label
- `name` (string): Input name attribute
- `type` (string): Input type (default: 'text')
- `value` (string): Current value
- `onChange` (function): Change handler
- `error` (string): Error message
- `helperText` (string): Helper text
- `required` (boolean): Required indicator
- `disabled` (boolean): Disabled state
- `placeholder` (string): Placeholder text

### Card
Container component with optional header, body, and footer sections.

**Props:**
- `header` (ReactNode): Header content
- `footer` (ReactNode): Footer content
- `children` (ReactNode): Body content
- `onClick` (function): Click handler
- `hoverable` (boolean): Hover effect
- `className` (string): Custom CSS class

**Sub-components:**
- `CardHeader`: Header section
- `CardBody`: Body section
- `CardFooter`: Footer section

### Modal
Dialog component with focus management and keyboard support.

**Props:**
- `isOpen` (boolean): Open state
- `onClose` (function): Close handler
- `title` (string): Modal title
- `children` (ReactNode): Modal content
- `actions` (ReactNode): Action buttons
- `size` ('sm' | 'md' | 'lg'): Modal size
- `closeButton` (boolean): Show close button
- `onBackdropClick` (function): Backdrop click handler

### Dropdown
Select component with search and keyboard navigation.

**Props:**
- `options` (DropdownOption[]): Available options
- `value` (string | number): Selected value
- `onChange` (function): Change handler
- `placeholder` (string): Placeholder text
- `searchable` (boolean): Enable search
- `disabled` (boolean): Disabled state
- `multiple` (boolean): Multiple selection
- `className` (string): Custom CSS class

### DatePicker
Calendar component for date selection.

**Props:**
- `value` (Date): Selected date
- `onChange` (function): Change handler
- `minDate` (Date): Minimum selectable date
- `maxDate` (Date): Maximum selectable date
- `disabled` (boolean): Disabled state
- `format` (string): Date format (default: 'YYYY-MM-DD')
- `placeholder` (string): Placeholder text

### Tabs
Tab navigation with content panels.

**Props:**
- `tabs` (Tab[]): Tab definitions
- `activeTab` (string): Active tab ID
- `onChange` (function): Change handler
- `variant` ('line' | 'pill'): Tab style
- `className` (string): Custom CSS class

**Tab interface:**
```typescript
interface Tab {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
  icon?: ReactNode
}
```

### Pagination
Page navigation controls.

**Props:**
- `currentPage` (number): Current page
- `totalPages` (number): Total pages
- `onChange` (function): Change handler
- `showInfo` (boolean): Show page info
- `maxVisiblePages` (number): Max visible page numbers
- `className` (string): Custom CSS class

### SearchBar
Search input with debouncing and clear button.

**Props:**
- `value` (string): Search value
- `onChange` (function): Change handler
- `onSearch` (function): Debounced search handler
- `placeholder` (string): Placeholder text
- `debounceDelay` (number): Debounce delay in ms (default: 300)
- `clearable` (boolean): Show clear button
- `disabled` (boolean): Disabled state
- `className` (string): Custom CSS class

### FilterBar
Multiple filter controls with reset functionality.

**Props:**
- `filters` (Filter[]): Filter definitions
- `onChange` (function): Change handler
- `onReset` (function): Reset handler
- `showReset` (boolean): Show reset button
- `className` (string): Custom CSS class

**Filter interface:**
```typescript
interface Filter {
  id: string
  label: string
  type: 'select' | 'date' | 'text'
  value?: string | string[] | Date
  options?: DropdownOption[]
}
```

### NotificationToast
Toast notification component with auto-dismiss.

**Props:**
- `message` (string): Notification message
- `type` ('success' | 'error' | 'warning' | 'info'): Notification type
- `duration` (number): Auto-dismiss duration in ms (default: 3000)
- `onClose` (function): Close handler
- `action` (object): Optional action button
- `className` (string): Custom CSS class

## Accessibility Features

All molecule components include:
- Semantic HTML elements
- ARIA labels and attributes
- Keyboard navigation support
- Focus management
- Screen reader support
- Color contrast compliance

## Testing

Each component includes comprehensive unit tests covering:
- Rendering and display
- User interactions
- Keyboard navigation
- Accessibility attributes
- Edge cases and error states

Run tests with:
```bash
npm test
```

## Usage Example

```typescript
import { FormField, Card, Button } from '@components/molecules'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  return (
    <Card header="Login">
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        error={error}
        required
      />
      <Button fullWidth>Sign In</Button>
    </Card>
  )
}
```
