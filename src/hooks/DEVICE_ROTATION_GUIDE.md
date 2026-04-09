# Device Rotation Handling Guide

## Overview

This guide explains how to use the device rotation handling hooks in the SchoolOS Mobile Frontend application. These hooks enable responsive layout adjustments when users rotate their devices, with automatic preservation of scroll position and form state.

## Hooks

### 1. `useDeviceOrientation`

Detects device orientation changes (portrait/landscape) with throttling to prevent excessive re-renders.

#### Usage

```typescript
import { useDeviceOrientation } from '@/hooks';

function MyComponent() {
  const { orientation, isPortrait, isLandscape, angle } = useDeviceOrientation();

  return (
    <div>
      <p>Current orientation: {orientation}</p>
      <p>Is portrait: {isPortrait}</p>
      <p>Is landscape: {isLandscape}</p>
      <p>Angle: {angle}°</p>
    </div>
  );
}
```

#### API

```typescript
useDeviceOrientation(throttleMs?: number): DeviceOrientationState

interface DeviceOrientationState {
  orientation: 'portrait' | 'landscape' | 'unknown';
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
}
```

#### Parameters

- `throttleMs` (optional): Throttle delay in milliseconds (default: 300ms)

#### Returns

- `orientation`: Current device orientation
- `angle`: Current orientation angle (0, 90, 180, 270)
- `isPortrait`: Boolean flag for portrait orientation
- `isLandscape`: Boolean flag for landscape orientation

#### Features

- Detects orientation using `screen.orientation` API with fallback to window dimensions
- Throttles events to prevent excessive re-renders
- Listens to both `orientationchange` and `resize` events
- Automatically cleans up event listeners on unmount

### 2. `useOrientationChange`

Handles layout adjustments when device rotates, with automatic preservation of scroll position and form state.

#### Usage

```typescript
import { useOrientationChange } from '@/hooks';

function MyComponent() {
  const handleOrientationChange = (orientation, angle) => {
    console.log(`Device rotated to ${orientation} (${angle}°)`);
  };

  const {
    orientation,
    isPortrait,
    isLandscape,
    saveScrollPosition,
    restoreScrollPosition,
    saveFormState,
    restoreFormState,
  } = useOrientationChange(handleOrientationChange, {
    preserveScrollPosition: true,
    preserveFormState: true,
    throttleMs: 300,
  });

  return (
    <div>
      <p>Orientation: {orientation}</p>
      <button onClick={saveScrollPosition}>Save Scroll</button>
      <button onClick={restoreScrollPosition}>Restore Scroll</button>
    </div>
  );
}
```

#### API

```typescript
useOrientationChange(
  onOrientationChange?: OrientationChangeCallback,
  options?: {
    preserveScrollPosition?: boolean;
    preserveFormState?: boolean;
    throttleMs?: number;
  }
): OrientationChangeState

type OrientationChangeCallback = (orientation: Orientation, angle: number) => void;

interface OrientationChangeState extends DeviceOrientationState {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
  saveFormState: () => void;
  restoreFormState: () => void;
}
```

#### Parameters

- `onOrientationChange` (optional): Callback function triggered when orientation changes
- `options` (optional):
  - `preserveScrollPosition` (default: true): Automatically save/restore scroll position
  - `preserveFormState` (default: true): Automatically save/restore form state
  - `throttleMs` (default: 300): Throttle delay in milliseconds

#### Returns

- All properties from `DeviceOrientationState`
- `saveScrollPosition()`: Manually save current scroll position
- `restoreScrollPosition()`: Manually restore saved scroll position
- `saveFormState()`: Manually save form element values
- `restoreFormState()`: Manually restore saved form values

#### Features

- Automatically saves scroll position before orientation change
- Automatically restores scroll position after orientation change
- Saves form state (input values, checkbox/radio states, textarea content, select values)
- Restores form state after orientation change
- Supports both `name` and `id` attributes for form elements
- Uses `requestAnimationFrame` for smooth restoration
- Triggers callback on orientation change

## Usage Examples

### Example 1: Responsive Layout

```typescript
import { useOrientationChange } from '@/hooks';

function ResponsiveGrid() {
  const { isPortrait, isLandscape } = useOrientationChange();

  return (
    <div className={isPortrait ? 'grid-cols-1' : 'grid-cols-2'}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
    </div>
  );
}
```

### Example 2: Conditional Rendering

```typescript
import { useDeviceOrientation } from '@/hooks';

function AdaptiveComponent() {
  const { isPortrait } = useDeviceOrientation();

  return (
    <>
      {isPortrait && <MobileLayout />}
      {!isPortrait && <TabletLayout />}
    </>
  );
}
```

### Example 3: Orientation Change Callback

```typescript
import { useOrientationChange } from '@/hooks';

function FormWithOrientationHandling() {
  const handleOrientationChange = (orientation, angle) => {
    console.log(`Rotated to ${orientation} at ${angle}°`);
    // Trigger re-layout, adjust component sizes, etc.
  };

  const { orientation } = useOrientationChange(handleOrientationChange);

  return (
    <form>
      <input type="text" name="username" placeholder="Username" />
      <input type="email" name="email" placeholder="Email" />
      <textarea name="message" placeholder="Message"></textarea>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Example 4: Manual State Management

```typescript
import { useOrientationChange } from '@/hooks';

function AdvancedComponent() {
  const {
    orientation,
    saveScrollPosition,
    restoreScrollPosition,
    saveFormState,
    restoreFormState,
  } = useOrientationChange(undefined, {
    preserveScrollPosition: false,
    preserveFormState: false,
  });

  const handleCustomSave = () => {
    saveScrollPosition();
    saveFormState();
    // Custom logic here
  };

  const handleCustomRestore = () => {
    restoreScrollPosition();
    restoreFormState();
    // Custom logic here
  };

  return (
    <div>
      <p>Orientation: {orientation}</p>
      <button onClick={handleCustomSave}>Save State</button>
      <button onClick={handleCustomRestore}>Restore State</button>
    </div>
  );
}
```

## Best Practices

### 1. Use Responsive Tailwind Classes

Combine the hooks with Tailwind CSS responsive classes for optimal results:

```typescript
function ResponsiveComponent() {
  const { isPortrait } = useOrientationChange();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Content */}
    </div>
  );
}
```

### 2. Optimize Performance

Use throttling to prevent excessive re-renders:

```typescript
// Good: Throttle to 300ms (default)
const { orientation } = useOrientationChange();

// Better: Increase throttle for less frequent updates
const { orientation } = useOrientationChange(undefined, { throttleMs: 500 });
```

### 3. Handle Form State Carefully

Ensure form elements have proper `name` or `id` attributes:

```typescript
// Good: Form elements with name attributes
<input name="email" type="email" />
<textarea name="message"></textarea>

// Also works: Form elements with id attributes
<input id="email" type="email" />
<textarea id="message"></textarea>
```

### 4. Use Callbacks for Complex Logic

Implement custom logic in orientation change callbacks:

```typescript
const handleOrientationChange = (orientation, angle) => {
  if (orientation === 'landscape') {
    // Adjust layout for landscape
    adjustLayoutForLandscape();
  } else {
    // Adjust layout for portrait
    adjustLayoutForPortrait();
  }
};

const { orientation } = useOrientationChange(handleOrientationChange);
```

### 5. Disable Auto-Preservation When Not Needed

If you don't need automatic state preservation, disable it:

```typescript
const { orientation } = useOrientationChange(undefined, {
  preserveScrollPosition: false,
  preserveFormState: false,
});
```

## Testing

The hooks include comprehensive test coverage with 53 test cases covering:

- Initialization with correct orientation
- Orientation detection (portrait/landscape)
- Event listener setup and cleanup
- Throttling behavior
- Scroll position preservation
- Form state preservation (inputs, checkboxes, radios, textareas, selects)
- Multiple hook instances
- Error handling

Run tests with:

```bash
npm test -- useDeviceOrientation.test.ts useOrientationChange.test.ts
```

## Browser Support

- Modern browsers with `screen.orientation` API (Chrome, Firefox, Safari, Edge)
- Fallback to window dimensions for older browsers
- Works on mobile devices, tablets, and desktop browsers

## Performance Considerations

- Throttling prevents excessive re-renders (default: 300ms)
- Event listeners are properly cleaned up on unmount
- Scroll position and form state are stored in refs for efficient access
- Uses `requestAnimationFrame` for smooth state restoration

## Troubleshooting

### Orientation not detecting correctly

Ensure the device supports orientation detection:
- Check browser console for errors
- Verify device orientation is not locked
- Test on actual mobile device (not just browser dev tools)

### Scroll position not restoring

Verify that:
- `preserveScrollPosition` is enabled (default: true)
- The page has scrollable content
- No other code is interfering with scroll position

### Form state not restoring

Ensure that:
- `preserveFormState` is enabled (default: true)
- Form elements have `name` or `id` attributes
- Form elements are in the DOM when state is restored

## Related Hooks

- `useMediaQuery`: Detect responsive breakpoints
- `useResponsive`: Helper for common breakpoints
- `useScrollDirection`: Detect scroll direction
- `useHeaderVisibility`: Show/hide header on scroll

## References

- [MDN: Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation)
- [MDN: Window orientationchange event](https://developer.mozilla.org/en-US/docs/Web/API/Window/orientationchange_event)
- [MDN: Window resize event](https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event)
