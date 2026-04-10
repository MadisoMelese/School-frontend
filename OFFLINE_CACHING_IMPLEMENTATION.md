# Offline Data Caching Implementation

## Overview

This document describes the implementation of offline data caching for the SchoolOS Mobile Frontend, specifically for dashboard, grades, and attendance pages.

## Implementation Summary

### Task 24.4: Implement offline data caching (dashboard, grades, attendance)

**Status**: ✅ Completed

**Changes Made**:

1. **Updated Student Dashboard Page** (`src/features/student/pages/DashboardPage.tsx`)
   - Replaced direct API calls with `useCachedDashboard` hook
   - Added offline indicator banner when user is offline
   - Dashboard now displays cached data when offline
   - Shows "Showing cached data (offline mode)" in description when offline

2. **Updated Grades Page** (`src/features/student/pages/GradesPage.tsx`)
   - Replaced direct API calls with `useCachedGrades` hook
   - Added offline indicator banner
   - Grades are cached and available offline
   - Performance summary loads only when online (optional data)

3. **Updated Attendance Page** (`src/features/student/pages/AttendancePage.tsx`)
   - Replaced direct API calls with `useCachedAttendance` hook
   - Added offline indicator banner
   - Attendance records are cached and available offline
   - Attendance percentage loads only when online (optional data)

## Architecture

### Existing Infrastructure (Already Implemented)

The following components were already in place:

1. **IndexedDB Setup** (`src/services/offline/indexedDB.ts`)
   - Database schema with stores for: user, grades, attendance, exams, fees, messages, timetable, syncQueue, conflictLog
   - CRUD operations for all stores
   - Automatic initialization

2. **Cache Service** (`src/services/offline/cacheService.ts`)
   - Generic caching functions with TTL support (default 7 days)
   - Cache metadata (cachedAt, expiresAt, version)
   - Specific cache functions for dashboard, grades, attendance

3. **useCachedQuery Hook** (`src/hooks/useCachedQuery.ts`)
   - Generic hook for fetching and caching data
   - Automatically uses cached data when offline
   - Caches fresh data when online
   - Returns `isFromCache` flag to indicate data source

4. **Cached Hooks**
   - `useCachedDashboard` - Fetches and caches dashboard data
   - `useCachedGrades` - Fetches and caches grades with filtering
   - `useCachedAttendance` - Fetches and caches attendance with filtering

5. **Offline Store** (`src/store/offlineStore.ts`)
   - Tracks online/offline status
   - Manages sync status and pending actions

## How It Works

### Online Mode

1. User navigates to dashboard/grades/attendance page
2. Hook fetches data from API
3. Data is automatically cached to IndexedDB
4. Fresh data is displayed to user
5. `isFromCache` flag is `false`

### Offline Mode

1. User navigates to dashboard/grades/attendance page
2. Hook detects offline status
3. Hook retrieves cached data from IndexedDB
4. Cached data is displayed to user
5. `isFromCache` flag is `true`
6. Offline indicator banner is shown

### Cache Expiration

- Default TTL: 7 days
- Expired cache is not returned
- Cache version checking prevents incompatible data

## User Experience

### Visual Indicators

When offline, users see:
- ⚠️ Yellow banner: "You're offline. Showing cached data."
- Page description changes to indicate cached data
- All functionality works with cached data

### Data Freshness

- Data is automatically refreshed when online
- Cache is updated in the background
- No manual refresh needed

## Testing

The implementation can be tested by:

1. **Manual Testing**:
   - Load dashboard/grades/attendance while online
   - Go offline (disable network in DevTools)
   - Navigate to pages - cached data should display
   - Offline indicator should appear

2. **Automated Testing**:
   - Existing `useCachedQuery.test.ts` covers the caching logic
   - Tests verify online/offline behavior
   - Tests verify cache retrieval and storage

## Future Enhancements

The following features are planned for future phases:

1. **Offline Action Queuing** (Task 24.5)
   - Queue actions performed offline
   - Sync when connection restored

2. **Sync Engine** (Task 24.6)
   - Automatic background sync
   - Conflict resolution
   - Retry logic

3. **Sync Status Indicator** (Task 24.7)
   - Show sync progress
   - Display sync errors

4. **Manual Sync Trigger** (Task 24.8)
   - Allow users to manually trigger sync
   - Force refresh cached data

## Technical Details

### Cache Keys

- Dashboard: `dashboard-{userId}`
- Grades: `grades-{userId}-{filters}`
- Attendance: `attendance-{userId}-{month}-{year}`

### Storage

- All data stored in IndexedDB
- Separate object stores for each data type
- Metadata tracks cache age and version

### Performance

- Minimal overhead when online
- Instant load when offline (no network wait)
- Background caching doesn't block UI

## Dependencies

- `idb` - IndexedDB wrapper library
- React hooks for state management
- Zustand for offline store

## Files Modified

1. `src/features/student/pages/DashboardPage.tsx`
2. `src/features/student/pages/GradesPage.tsx`
3. `src/features/student/pages/AttendancePage.tsx`

## Files Used (Already Existing)

1. `src/services/offline/indexedDB.ts`
2. `src/services/offline/cacheService.ts`
3. `src/hooks/useCachedQuery.ts`
4. `src/hooks/useCachedDashboard.ts`
5. `src/hooks/useCachedGrades.ts`
6. `src/hooks/useCachedAttendance.ts`
7. `src/hooks/useOffline.ts`
8. `src/store/offlineStore.ts`

## Conclusion

Task 24.4 is now complete. The dashboard, grades, and attendance pages now support offline data caching. Users can view their data even when offline, with clear indicators showing when cached data is being displayed.
