# Offline Action Queue - Usage Guide

## Overview

The Offline Action Queue provides a robust system for queuing actions performed while offline, tracking their status, and automatically syncing them when the connection is restored.

## Features

- ✅ Queue actions (create, update, delete) for offline sync
- ✅ Track action status (pending, syncing, completed, failed)
- ✅ Store queued actions in IndexedDB
- ✅ Automatic sync when connection is restored
- ✅ Retry failed actions
- ✅ Filter actions by status or resource
- ✅ Get queue statistics
- ✅ React hook for easy integration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  (Uses useActionQueue hook)                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Action Queue Service                        │
│  (actionQueue.ts - High-level API)                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sync Queue Service                        │
│  (syncQueue.ts - IndexedDB operations)                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      IndexedDB                               │
│  (Persistent storage)                                        │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### 1. Using the React Hook (Recommended)

```typescript
import { useActionQueue } from '@/hooks/useActionQueue';

function AttendanceForm() {
  const { queue, actions, stats, hasPending, retry } = useActionQueue({
    filterResource: 'attendance',
    autoRefresh: true,
  });

  const handleSubmit = async (data: AttendanceData) => {
    try {
      // Queue the action for offline sync
      const actionId = await queue('create', 'attendance', data);
      console.log('Action queued:', actionId);
    } catch (error) {
      console.error('Failed to queue action:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>

      {hasPending && (
        <div className="alert">
          You have {stats?.pending} pending actions that will sync when online.
        </div>
      )}

      {/* Display queued actions */}
      <div>
        <h3>Queued Actions</h3>
        {actions.map((action) => (
          <div key={action.id}>
            <span>{action.type} - {action.status}</span>
            {action.status === 'failed' && (
              <button onClick={() => retry(action.id)}>Retry</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Using the Service Directly

```typescript
import {
  queueAction,
  getActionsByStatus,
  retryAction,
  getActionQueueStats,
} from '@/services/offline/actionQueue';

// Queue an action
async function markAttendance(data: AttendanceData) {
  const actionId = await queueAction('create', 'attendance', data);
  return actionId;
}

// Get pending actions
async function getPendingActions() {
  const pending = await getActionsByStatus('pending');
  return pending;
}

// Retry a failed action
async function retryFailedAction(actionId: string) {
  await retryAction(actionId);
}

// Get queue statistics
async function getStats() {
  const stats = await getActionQueueStats();
  console.log('Total:', stats.total);
  console.log('Pending:', stats.pending);
  console.log('Failed:', stats.failed);
}
```

### 3. Integration with Existing Features

#### Teacher Attendance Marking

```typescript
import { useActionQueue } from '@/hooks/useActionQueue';
import { useOfflineStore } from '@/store/offlineStore';

function AttendanceMarkingPage() {
  const { isOnline } = useOfflineStore();
  const { queue, hasPending } = useActionQueue({
    filterResource: 'attendance',
  });

  const handleMarkAttendance = async (classId: string, attendance: AttendanceRecord[]) => {
    if (isOnline) {
      // Online: Submit directly to API
      await apiClient.post('/teacher/attendance', { classId, attendance });
    } else {
      // Offline: Queue for later sync
      await queue('create', 'attendance', { classId, attendance });
    }
  };

  return (
    <div>
      {!isOnline && (
        <div className="offline-banner">
          You're offline. Actions will sync when connection is restored.
        </div>
      )}

      {hasPending && (
        <div className="pending-badge">
          {stats?.pending} pending actions
        </div>
      )}

      {/* Attendance form */}
    </div>
  );
}
```

#### Grade Entry

```typescript
import { useActionQueue } from '@/hooks/useActionQueue';

function GradeEntryPage() {
  const { queue, actions, retry } = useActionQueue({
    filterResource: 'grades',
  });

  const handleSubmitGrades = async (examId: string, grades: GradeData[]) => {
    await queue('create', 'grades', { examId, grades });
  };

  const handleUpdateGrade = async (gradeId: string, updates: Partial<GradeData>) => {
    await queue('update', 'grades', updates, gradeId);
  };

  return (
    <div>
      {/* Grade entry form */}

      {/* Show failed actions */}
      {actions.filter(a => a.status === 'failed').map(action => (
        <div key={action.id} className="error-card">
          <p>Failed to sync grade: {action.error}</p>
          <button onClick={() => retry(action.id)}>Retry</button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### Action Queue Service

#### `queueAction(type, resource, data, resourceId?, metadata?)`
Queue an action for offline sync.

**Parameters:**
- `type`: 'create' | 'update' | 'delete'
- `resource`: Resource name (e.g., 'attendance', 'grades')
- `data`: Action data payload
- `resourceId`: Optional resource ID for update/delete
- `metadata`: Optional metadata for tracking

**Returns:** `Promise<string>` - Action ID

#### `getAction(actionId)`
Get action by ID.

**Returns:** `Promise<QueuedAction | undefined>`

#### `getAllActions()`
Get all queued actions.

**Returns:** `Promise<QueuedAction[]>`

#### `getActionsByStatus(status)`
Get actions by status.

**Parameters:**
- `status`: 'pending' | 'syncing' | 'completed' | 'failed'

**Returns:** `Promise<QueuedAction[]>`

#### `getActionsByResource(resource)`
Get actions by resource.

**Returns:** `Promise<QueuedAction[]>`

#### `updateActionStatus(actionId, status, error?)`
Update action status.

#### `removeAction(actionId)`
Remove action from queue.

#### `retryAction(actionId)`
Retry failed action.

#### `retryAllFailedActions()`
Retry all failed actions.

#### `getActionQueueStats()`
Get queue statistics.

**Returns:** `Promise<ActionQueueStats>`

### useActionQueue Hook

#### Options

```typescript
interface UseActionQueueOptions {
  autoRefresh?: boolean;        // Auto-refresh actions (default: false)
  refreshInterval?: number;     // Refresh interval in ms (default: 5000)
  filterStatus?: ActionStatus;  // Filter by status
  filterResource?: string;      // Filter by resource
}
```

#### Return Value

```typescript
interface UseActionQueueReturn {
  // State
  actions: QueuedAction[];
  stats: ActionQueueStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  queue: (type, resource, data, resourceId?, metadata?) => Promise<string>;
  getById: (actionId: string) => Promise<QueuedAction | undefined>;
  getByStatus: (status: ActionStatus) => Promise<QueuedAction[]>;
  getByResource: (resource: string) => Promise<QueuedAction[]>;
  updateStatus: (actionId, status, error?) => Promise<void>;
  remove: (actionId: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearFailed: () => Promise<void>;
  retry: (actionId: string) => Promise<void>;
  retryAllFailed: () => Promise<void>;
  refresh: () => Promise<void>;

  // Utilities
  isEmpty: boolean;
  hasPending: boolean;
  hasFailed: boolean;
}
```

## Data Types

### QueuedAction

```typescript
interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  data: unknown;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  timestamp: number;
  retries: number;
  maxRetries: number;
  error?: string;
  metadata?: Record<string, unknown>;
}
```

### ActionQueueStats

```typescript
interface ActionQueueStats {
  total: number;
  pending: number;
  syncing: number;
  completed: number;
  failed: number;
}
```

## Best Practices

1. **Always queue actions when offline**: Check `isOnline` status before deciding whether to call API directly or queue.

2. **Provide user feedback**: Show pending action count and sync status to users.

3. **Handle failures gracefully**: Display failed actions and provide retry options.

4. **Use metadata for tracking**: Add metadata to actions for better tracking and debugging.

5. **Filter by resource**: Use `filterResource` option to show only relevant actions in each feature.

6. **Auto-refresh in dashboards**: Enable `autoRefresh` in dashboard components to keep queue status up-to-date.

7. **Clean up completed actions**: Periodically call `clearCompleted()` to remove old completed actions.

## Integration with Sync Engine

The Action Queue integrates seamlessly with the existing Sync Engine:

1. Actions are queued in IndexedDB via `syncQueue.ts`
2. Sync Engine detects online status and triggers sync
3. Actions are processed in order (FIFO)
4. Failed actions are retried up to `maxRetries` times
5. Completed actions can be removed from queue

## Testing

Run tests:

```bash
npm test actionQueue.test.ts
npm test useActionQueue.test.ts
```

## Troubleshooting

### Actions not syncing

1. Check online status: `useOfflineStore().isOnline`
2. Check sync status: `useOfflineStore().syncStatus`
3. Manually trigger sync: `manualSync()` from sync engine

### Actions stuck in syncing state

1. Check for API errors in browser console
2. Verify API endpoints are correct
3. Check network connectivity

### Failed actions not retrying

1. Check if `maxRetries` limit reached
2. Manually retry: `retryAction(actionId)`
3. Check error message: `action.error`

## Future Enhancements

- [ ] Conflict resolution UI
- [ ] Batch sync optimization
- [ ] Priority queue for critical actions
- [ ] Action dependencies and ordering
- [ ] Sync progress indicators
- [ ] Action history and audit log
