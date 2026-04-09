# Mobile Keyboard Handling Implementation

## Overview

This document describes the mobile keyboard handling implementation for the SchoolOS Mobile Frontend. The implementation provides comprehensive keyboard detection, management, and form integration for mobile devices.

## Components Implemented

### 1. Custom Hooks

#### `useKeyboardHeight`
**Location:** `src/hooks/useKeyboardHeight.ts`

Detects mobile keyboard height and visibility with support for both iOS and Android.

**Features:**
- Detects keyboard height in pixels
- Tracks keyboard visibility state
- iOS support via `visualViewport` API
- Android fallback using window resize events
- 50px threshold to avoid false positives from address bar

**Returns:**
```typescript
{
  keyboardHeight: number,      // Height of visible keyboard in pixels
  isKeyboardVisible: boolean   // Whether keyboard is currently visible
}
```

**Usage:**
```typescript
const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight()
```

#### `useMobileKeyboard`
**Location:** `src/hooks/useMobileKeyboard.ts`

Manages keyboard state and provides viewport adjustment capabilities.

**Features:**
- Tracks focused input/textarea elements
- Scrolls focused element into view when keyboard appears
- Maintains scroll position when keyboard dismisses
- Provides keyboard show/hide callbacks
- Dismisses keyboard on demand
- Supports custom scroll options

**Returns:**
```typescript
{
  keyboardHeight: number,
  isKeyboardVisible: boolean,
  focusedElement: HTMLElement | null,
  dismissKeyboard: () => void,
  maintainScrollPosition: () => void,
  isKeyboardDismissing: boolean
}
```

**Usage:**
```typescript
const {
  keyboardHeight,
  isKeyboardVisible,
  focusedElement,
  dismissKeyboard,
  maintainScrollPosition
} = useMobileKeyboard({
  onKeyboardShow: () => console.log('Keyboard shown'),
  onKeyboardHide: () => console.log('Keyboard hidden'),
  scrollIntoViewOptions: { behavior: 'smooth', block: 'center' }
})
```

### 2. Form Components

#### `MobileForm`
**Location:** `src/components/molecules/MobileForm.tsx`

Mobile-optimized form component with keyboard event handling.

**Features:**
- Automatic keyboard dismissal on submit
- Scroll position maintenance
- Keyboard event callbacks (show/hide)
- Escape key to dismiss keyboard
- Ctrl+Enter to submit
- Touch-friendly design

**Props:**
```typescript
interface MobileFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  className?: string
  dismissKeyboardOnSubmit?: boolean
  maintainScrollPosition?: boolean
  onKeyboardShow?: () => void
  onKeyboardHide?: () => void
}
```

**Usage:**
```typescript
<MobileForm
  onSubmit={handleSubmit}
  dismissKeyboardOnSubmit={true}
  maintainScrollPosition={true}
>
  <MobileInput label="Email" type="email" />
  <MobileTextarea label="Message" />
  <Button type="submit">Submit</Button>
</MobileForm>
```

#### `MobileInput`
**Location:** `src/components/atoms/MobileInput.tsx`

Mobile-optimized input component with keyboard handling.

**Features:**
- Proper keyboard type selection (email, number, tel, date, time)
- Auto-focus support
- Scroll into view on focus
- Keyboard dismissal callback
- Touch-friendly tap targets (44px minimum)
- Proper ARIA labels
- Escape key to dismiss keyboard
- Enter key handling for specific input types

**Props:**
```typescript
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
  onKeyboardDismiss?: () => void
  autoFocusOnMount?: boolean
  scrollIntoViewOnFocus?: boolean
}
```

**Usage:**
```typescript
<MobileInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={emailError}
  helperText="We'll never share your email"
  onKeyboardDismiss={() => console.log('Keyboard dismissed')}
  scrollIntoViewOnFocus={true}
/>
```

#### `MobileTextarea`
**Location:** `src/components/atoms/MobileTextarea.tsx`

Mobile-optimized textarea component with keyboard handling.

**Features:**
- Auto-resize based on content
- Scroll into view on focus
- Keyboard dismissal callback
- Touch-friendly tap targets
- Proper ARIA labels
- Escape key to dismiss keyboard
- Ctrl+Enter to submit
- Maximum height constraint (300px)

**Props:**
```typescript
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  helperText?: string
  onKeyboardDismiss?: () => void
  autoFocusOnMount?: boolean
  scrollIntoViewOnFocus?: boolean
  autoResize?: boolean
}
```

**Usage:**
```typescript
<MobileTextarea
  label="Message"
  placeholder="Enter your message"
  error={messageError}
  helperText="Maximum 500 characters"
  onKeyboardDismiss={() => console.log('Keyboard dismissed')}
  autoResize={true}
/>
```

## Test Coverage

### Total Tests: 77

**Test Breakdown:**
- `useKeyboardHeight.test.ts`: 7 tests
- `useMobileKeyboard.test.ts`: 12 tests
- `MobileInput.test.tsx`: 23 tests
- `MobileTextarea.test.tsx`: 24 tests
- `MobileForm.test.tsx`: 11 tests

### Test Categories

#### Keyboard Detection Tests
- Keyboard visibility detection
- Keyboard height calculation
- iOS visualViewport support
- Android window resize fallback
- Threshold handling (50px minimum)

#### Keyboard Management Tests
- Focused element tracking
- Keyboard show/hide callbacks
- Keyboard dismissal
- Scroll position maintenance
- ContentEditable element support

#### Form Component Tests
- Input rendering with labels and errors
- Textarea auto-resize functionality
- Touch-friendly tap targets (44px minimum)
- Keyboard event handling (Escape, Enter)
- Auto-focus on mount
- Scroll into view on focus
- ARIA attributes and accessibility
- All input types support (text, email, password, number, tel, date, time)

## Keyboard Behavior

### iOS Keyboard Handling
- Uses `visualViewport` API for accurate detection
- Handles keyboard appearance/disappearance smoothly
- Maintains scroll position when keyboard dismisses
- Supports landscape orientation

### Android Keyboard Handling
- Uses window resize events for detection
- Handles various keyboard types (text, numeric, email, etc.)
- Prevents content from being hidden behind keyboard
- Supports landscape orientation

## Responsive Design Integration

All keyboard-handling components integrate with Tailwind CSS v4 for responsive adjustments:

- **Mobile (320px-640px):** Single column layout, full-width inputs
- **Tablet (641px-1024px):** Two-column layout, optimized spacing
- **Desktop (1025px+):** Multi-column layout, sidebar navigation

## Accessibility Features

- Semantic HTML elements
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Error message associations
- Minimum touch target size (44px)
- Color contrast compliance

## Usage Examples

### Basic Form with Keyboard Handling

```typescript
import { MobileForm, MobileInput, MobileTextarea } from '@components/molecules'
import { Button } from '@components/atoms'

export function ContactForm() {
  const [formData, setFormData] = useState({ email: '', message: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate and submit
  }

  return (
    <MobileForm
      onSubmit={handleSubmit}
      dismissKeyboardOnSubmit={true}
      maintainScrollPosition={true}
    >
      <MobileInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        scrollIntoViewOnFocus={true}
      />
      <MobileTextarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        error={errors.message}
        autoResize={true}
      />
      <Button type="submit" className="mt-4">
        Send Message
      </Button>
    </MobileForm>
  )
}
```

### Using Keyboard Hooks Directly

```typescript
import { useMobileKeyboard } from '@hooks'

export function CustomKeyboardComponent() {
  const {
    keyboardHeight,
    isKeyboardVisible,
    focusedElement,
    dismissKeyboard
  } = useMobileKeyboard({
    onKeyboardShow: () => console.log('Keyboard appeared'),
    onKeyboardHide: () => console.log('Keyboard dismissed')
  })

  return (
    <div style={{ paddingBottom: keyboardHeight }}>
      <input type="text" placeholder="Type something..." />
      {isKeyboardVisible && (
        <button onClick={dismissKeyboard}>
          Dismiss Keyboard
        </button>
      )}
    </div>
  )
}
```

## Browser Support

- iOS Safari 13+
- Android Chrome 80+
- Android Firefox 68+
- Android Samsung Internet 12+

## Performance Considerations

- Keyboard detection uses efficient event listeners
- Scroll operations are debounced via requestAnimationFrame
- No unnecessary re-renders
- Minimal memory footprint
- Cleanup of event listeners on unmount

## Future Enhancements

- Support for custom keyboard types
- Keyboard animation customization
- Multi-language keyboard support
- Keyboard shortcut customization
- Analytics tracking for keyboard interactions

## Related Documentation

- [Responsive Design Guide](./src/RESPONSIVE_DESIGN_GUIDE.md)
- [Tap Targets Guide](./src/components/TAP_TARGETS_GUIDE.md)
- [Device Rotation Guide](./src/hooks/DEVICE_ROTATION_GUIDE.md)
