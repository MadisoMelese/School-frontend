# OfflineIndicator Component

## Overview

The `OfflineIndicator` component displays a banner notification at the top of the screen when the user loses network connectivity. It automatically hides when the connection is restored, providing clear feedback about the application's online/offline status.

## Features

- **Automatic Detection**: Monitors browser online/offline events
- **Visual Feedback**: Displays a prominent yellow banner when offline
- **Pending Actions**: Shows count of queued actions waiting to sync
- **Smooth Animations**: Slides in/out with CSS animations
- **Auto-Hide**: Automatically disappears when connection is restored
- **Mobile-First**: Responsive design optimized for all screen sizes
- **Accessible**: ARIA labels and semantic HTML for screen readers

## Usage

### Basic Integration

The component is already integrated into the main App component and requires no props:

```tsx
import { OfflineIndicator } from '@components/organisms/OfflineIndicator';

function App() {
  return (
    <>
      <OfflineIndicator />
      {/* Rest of your app */}
    </>
  );
}
```

### With Offline Store

The component automatically integrates with the offline store:

```tsx
import { useOffline } from '@hooks/useOffline';

function MyComponent() {
  const { isOnline, addPendingAction } = useOffline();

  const handleSubmit = async (data) => {
    if (!isOnline) {
      // Queue action for later sync
      addPendingAction({
        type: 'create',
        resource: 'attendance',
        data,
      });
      // OfflineIndicator will show pending count
    }
  };
}
```

## Behavior

### Offline State
- Banner slides down from top of screen
- Yellow background with "You're offline" message
- Shows WifiOff icon
- Displays pending action count if any actions are queued
- Example: "(3 actions pending sync)"

### Online State
- When reconnecting, briefly shows "Back online" with checkmark
- Slides up and disappears after 300ms
- Pending actions are automatically synced by the sync engine

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Background**: `bg-yellow-500` (light) / `bg-yellow-600` (dark)
- **Text**: White for high contrast
- **Position**: Fixed at top with `z-50` to appear above content
- **Animation**: Custom slide-in/out animations from `animations.css`

## Accessibility

- **Role**: `alert` for screen reader announcements
- **ARIA Live**: `assertive` for immediate notification
- **ARIA Atomic**: `true` for complete message reading
- **Icons**: Marked with `aria-hidden="true"` to avoid duplication

## Testing

### Unit Tests

```bash
npm test -- OfflineIndicator.test.tsx --run
```

Tests cover:
- Rendering when offline/online
- Pending action count display
- Auto-hide behavior
- ARIA attributes
- Animation classes

### Integration Tests

```bash
npm test -- OfflineIndicator.integration.test.tsx --run
```

Tests cover:
- Integration with offline store
- Browser online/offline events
- Pending action updates
- State synchronization

## Technical Details

### Dependencies

- `@hooks/useOffline`: Access to offline state and pending actions
- `@components/atoms/Icon`: Lucide React icons
- `@store/offlineStore`: Zustand store for offline state

### State Management

The component uses local state for animation control:
- `show`: Controls component visibility
- `isAnimatingOut`: Triggers exit animation

### Performance

- Minimal re-renders (only when online status changes)
- CSS animations (GPU-accelerated)
- No polling or intervals
- Event-driven updates

## Browser Support

Works in all modern browsers that support:
- `navigator.onLine` API
- `online`/`offline` events
- CSS animations
- Flexbox

## Related Components

- `PWAUpdatePrompt`: Notifies about app updates
- `PWAInstallPrompt`: Prompts to install PWA
- `NotificationToast`: General toast notifications

## Future Enhancements

Potential improvements:
- Manual retry button for failed syncs
- Detailed sync status (syncing, failed, success)
- Expandable view showing pending actions list
- Customizable position (top/bottom)
- Sound/vibration feedback (with user preference)
