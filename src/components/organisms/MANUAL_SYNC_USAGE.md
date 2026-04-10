# Manual Sync Trigger - Usage Guide

## Overview

The manual sync trigger allows users to manually initiate synchronization of pending offline actions. This feature is integrated into the `SyncStatusIndicator` component and provides a seamless way for users to sync their data when they have pending actions queued.

## Features

- **Automatic Display**: The sync button appears automatically when:
  - User is online
  - There are pending actions to sync
  - Sync is not already in progress

- **Visual Feedback**: 
  - Spinning icon during sync
  - Button disabled state while syncing
  - Accessible ARIA labels

- **Error Handling**: Gracefully handles sync failures and logs errors

## Component Integration

The manual sync trigger is built into the `SyncStatusIndicator` component:

```tsx
import { SyncStatusIndicator } from '@components/organisms/SyncStatusIndicator';

// In your component
<SyncStatusIndicator />
```

## How It Works

1. **Detection**: The component monitors the offline store for pending actions
2. **Display**: When conditions are met (online + pending actions), the sync button appears
3. **Trigger**: User clicks the "Sync" button
4. **Execution**: Calls `manualSync()` from the sync engine
5. **Feedback**: Button shows loading state during sync
6. **Completion**: Button returns to normal state after sync completes

## User Experience

### When Sync Button Appears
- User is online
- At least one pending action exists
- Sync is not currently running

### When Sync Button is Hidden
- User is offline
- No pending actions
- Sync is already in progress

### Button States
- **Enabled**: Ready to sync
- **Disabled**: Syncing in progress or conditions not met
- **Loading**: Shows spinning icon during sync

## Technical Details

### Dependencies
- `useOffline` hook: Provides online status and pending action count
- `manualSync` function: Triggers the sync process from sync engine
- `Button` component: Provides consistent button styling
- `Icon` component: Displays sync icon with animation

### State Management
- Local state tracks manual sync progress
- Offline store provides pending action count
- Sync engine handles actual synchronization

### Accessibility
- ARIA label: "Manually sync pending actions"
- Button disabled state properly communicated
- Loading state indicated with aria-busy

## Example Usage in Header

The `SyncStatusIndicator` is typically placed in the application header:

```tsx
<Header>
  {/* Other header content */}
  <div className="hidden md:block">
    <SyncStatusIndicator />
  </div>
</Header>
```

## Testing

The manual sync trigger includes comprehensive tests:

### Unit Tests
- Button visibility conditions
- Click handler invocation
- Disabled state management
- Accessibility attributes

### Integration Tests
- End-to-end sync trigger flow
- Error handling
- State synchronization with offline store

## Related Components

- **OfflineIndicator**: Shows offline status banner
- **ManualSyncButton**: Standalone sync button (alternative implementation)
- **SyncEngine**: Handles actual synchronization logic

## Requirements Satisfied

This implementation satisfies:
- **Requirement 18**: Progressive Web App Features
  - "WHEN a user returns online, THE System SHALL automatically sync queued actions and refresh data"
  - Manual trigger provides user control over sync timing

- **Requirement 30**: Offline Data Synchronization
  - "THE System SHALL allow users to manually trigger sync if automatic sync is delayed"

## Future Enhancements

Potential improvements:
- Toast notification on sync completion
- Sync progress indicator for large queues
- Conflict resolution UI
- Sync history view
