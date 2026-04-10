# Offline Functionality Manual Testing Checklist

## Overview
This checklist covers manual testing for PWA and offline features that cannot be fully automated. Test on multiple devices and browsers for comprehensive coverage.

---

## Test Environment Setup

### Browsers to Test
- [ ] Chrome/Edge (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop - macOS)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

### Devices to Test
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad/Android tablet)
- [ ] Mobile (iPhone/Android phone)

---

## 1. Service Worker Installation

### 1.1 Initial Installation
- [ ] Open the app in a fresh browser (clear cache first)
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker is registered and activated
- [ ] Check status shows "activated and is running"
- [ ] Verify no console errors during registration

### 1.2 Service Worker Update
- [ ] Deploy a new version of the app
- [ ] Reload the page
- [ ] Verify update notification appears
- [ ] Click "Update" button
- [ ] Verify app reloads with new version
- [ ] Check service worker shows new version in DevTools

### 1.3 Service Worker Lifecycle
- [ ] Open app in multiple tabs
- [ ] Update service worker
- [ ] Verify all tabs receive update notification
- [ ] Close all tabs except one
- [ ] Verify service worker activates properly

---

## 2. PWA Installation

### 2.1 Install Prompt (Desktop)
- [ ] Visit app in Chrome/Edge
- [ ] Wait for install prompt to appear (may take a few seconds)
- [ ] Verify prompt shows app name and icon
- [ ] Click "Install"
- [ ] Verify app installs and opens in standalone window
- [ ] Check app appears in Start Menu/Applications

### 2.2 Install Prompt (Mobile)
- [ ] Visit app in Chrome (Android) or Safari (iOS)
- [ ] Look for "Add to Home Screen" prompt or banner
- [ ] Tap "Add to Home Screen"
- [ ] Verify app icon appears on home screen
- [ ] Launch app from home screen
- [ ] Verify app opens in fullscreen (no browser UI)

### 2.3 Installed App Behavior
- [ ] Launch installed app
- [ ] Verify splash screen appears (if configured)
- [ ] Verify app opens in standalone mode (no browser chrome)
- [ ] Check theme color matches manifest
- [ ] Verify app orientation is correct
- [ ] Test app switching (minimize/restore)

### 2.4 Uninstall
- [ ] Right-click app icon (Desktop) or long-press (Mobile)
- [ ] Select "Uninstall" or "Remove"
- [ ] Verify app is removed from system
- [ ] Verify service worker is unregistered

---

## 3. Offline Indicator

### 3.1 Offline Detection
- [ ] Open app while online
- [ ] Turn off WiFi/mobile data
- [ ] Verify offline indicator appears within 2 seconds
- [ ] Check indicator shows "You're offline" message
- [ ] Verify indicator styling (warning color, icon)
- [ ] Check indicator is visible on all pages

### 3.2 Online Detection
- [ ] Start with app offline (indicator visible)
- [ ] Turn on WiFi/mobile data
- [ ] Verify indicator changes to "Back online" within 2 seconds
- [ ] Check indicator disappears after 3-5 seconds
- [ ] Verify smooth transition animation

### 3.3 Pending Actions Display
- [ ] Go offline
- [ ] Perform an action (mark attendance, send message)
- [ ] Verify offline indicator shows pending action count
- [ ] Perform multiple actions
- [ ] Verify count increments correctly
- [ ] Check format: "X actions pending sync"

### 3.4 Accessibility
- [ ] Use screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify offline indicator is announced
- [ ] Check ARIA live region is working
- [ ] Verify keyboard navigation works
- [ ] Test with high contrast mode

---

## 4. Offline Data Caching

### 4.1 Dashboard Caching
- [ ] Login and view dashboard while online
- [ ] Note the data displayed (grades, attendance, etc.)
- [ ] Go offline
- [ ] Reload the page
- [ ] Verify dashboard data is still visible
- [ ] Check data matches what was shown online
- [ ] Verify no "failed to load" errors

### 4.2 Grades Caching
- [ ] View grades page while online
- [ ] Note specific grades displayed
- [ ] Go offline
- [ ] Navigate to grades page
- [ ] Verify grades are displayed from cache
- [ ] Check filters still work on cached data
- [ ] Verify search works on cached data

### 4.3 Attendance Caching
- [ ] View attendance page while online
- [ ] Note attendance records
- [ ] Go offline
- [ ] Navigate to attendance page
- [ ] Verify attendance data is displayed
- [ ] Check calendar view shows cached data
- [ ] Verify attendance percentage is calculated

### 4.4 Cache Expiration
- [ ] View a page while online
- [ ] Wait 24 hours (or configured TTL)
- [ ] Go offline
- [ ] Navigate to the page
- [ ] Verify stale data warning (if implemented)
- [ ] Check data is still accessible

---

## 5. Offline Action Queuing

### 5.1 Mark Attendance Offline (Teacher)
- [ ] Login as teacher
- [ ] Go to attendance marking page
- [ ] Go offline
- [ ] Mark attendance for students
- [ ] Click submit
- [ ] Verify success message or queued notification
- [ ] Check offline indicator shows pending action
- [ ] Go back online
- [ ] Verify attendance syncs automatically
- [ ] Check attendance is saved on server

### 5.2 Send Message Offline
- [ ] Go to messages page
- [ ] Go offline
- [ ] Compose a new message
- [ ] Click send
- [ ] Verify message is queued
- [ ] Check offline indicator shows pending action
- [ ] Go back online
- [ ] Verify message syncs and appears in sent items
- [ ] Confirm recipient receives message

### 5.3 Update Profile Offline
- [ ] Go to profile page
- [ ] Go offline
- [ ] Edit profile information
- [ ] Click save
- [ ] Verify changes are queued
- [ ] Go back online
- [ ] Verify profile updates sync
- [ ] Reload page and confirm changes persisted

### 5.4 Multiple Actions Queuing
- [ ] Go offline
- [ ] Perform 3-5 different actions
- [ ] Verify all actions are queued
- [ ] Check offline indicator shows correct count
- [ ] Go back online
- [ ] Verify all actions sync in order
- [ ] Confirm all changes are saved

---

## 6. Sync Engine

### 6.1 Automatic Sync on Reconnect
- [ ] Queue multiple actions while offline
- [ ] Note the pending action count
- [ ] Go back online
- [ ] Verify sync starts automatically
- [ ] Check sync status indicator shows "Syncing..."
- [ ] Wait for sync to complete
- [ ] Verify pending count decreases to 0
- [ ] Confirm all actions were successful

### 6.2 Manual Sync Trigger
- [ ] Queue actions while offline
- [ ] Go back online
- [ ] Find manual sync button (if available)
- [ ] Click manual sync
- [ ] Verify sync starts immediately
- [ ] Check sync status updates
- [ ] Confirm actions are synced

### 6.3 Sync Error Handling
- [ ] Queue an action while offline
- [ ] Go back online but block API endpoint (DevTools)
- [ ] Verify sync fails gracefully
- [ ] Check error message is user-friendly
- [ ] Verify retry option is available
- [ ] Click retry
- [ ] Unblock API and verify sync succeeds

### 6.4 Sync Status Indicator
- [ ] Queue actions while offline
- [ ] Go back online
- [ ] Watch sync status indicator
- [ ] Verify it shows: idle → syncing → idle
- [ ] Check status updates in real-time
- [ ] Verify no flickering or UI jumps

---

## 7. Conflict Resolution

### 7.1 Update Conflict
- [ ] Open app on two devices (Device A and B)
- [ ] Go offline on Device A
- [ ] Edit a grade on Device A
- [ ] Edit the same grade on Device B (online)
- [ ] Go back online on Device A
- [ ] Verify conflict is detected
- [ ] Check conflict resolution strategy (server wins)
- [ ] Confirm final value matches server

### 7.2 Delete Conflict
- [ ] Open app on two devices
- [ ] Go offline on Device A
- [ ] Edit a record on Device A
- [ ] Delete the same record on Device B (online)
- [ ] Go back online on Device A
- [ ] Verify conflict is detected
- [ ] Check appropriate error message
- [ ] Confirm record remains deleted

### 7.3 Conflict Notification
- [ ] Create a conflict scenario
- [ ] Verify user is notified of conflict
- [ ] Check notification is clear and actionable
- [ ] Verify user can view conflict details
- [ ] Test conflict resolution options

---

## 8. Offline/Online Transitions

### 8.1 Smooth Transition
- [ ] Start online
- [ ] Go offline
- [ ] Verify transition is smooth (no errors)
- [ ] Go back online
- [ ] Verify transition is smooth
- [ ] Check no data loss during transitions
- [ ] Verify UI updates correctly

### 8.2 Rapid Transitions
- [ ] Toggle WiFi on/off rapidly (5-10 times)
- [ ] Verify app handles transitions gracefully
- [ ] Check no duplicate sync attempts
- [ ] Verify offline indicator updates correctly
- [ ] Confirm no console errors

### 8.3 Slow Network Transition
- [ ] Use DevTools to throttle network (Slow 3G)
- [ ] Perform actions
- [ ] Verify app remains responsive
- [ ] Check loading indicators appear
- [ ] Verify timeouts are handled properly

---

## 9. Performance

### 9.1 Initial Load Performance
- [ ] Clear cache and reload app
- [ ] Measure time to interactive (< 3s on 4G)
- [ ] Check Lighthouse PWA score (> 90)
- [ ] Verify no blocking resources
- [ ] Check service worker installs quickly

### 9.2 Offline Performance
- [ ] Go offline
- [ ] Navigate between pages
- [ ] Verify pages load instantly from cache
- [ ] Check no network delays
- [ ] Measure page transition time (< 500ms)

### 9.3 Sync Performance
- [ ] Queue 10+ actions while offline
- [ ] Go back online
- [ ] Measure sync completion time
- [ ] Verify sync doesn't block UI
- [ ] Check app remains responsive during sync

---

## 10. Edge Cases

### 10.1 Session Expiry Offline
- [ ] Login and go offline
- [ ] Wait for session to expire (15+ minutes)
- [ ] Try to perform an action
- [ ] Go back online
- [ ] Verify user is prompted to login
- [ ] Check queued actions are preserved

### 10.2 Storage Quota
- [ ] Fill IndexedDB with large amount of data
- [ ] Verify app handles quota exceeded error
- [ ] Check old data is cleaned up
- [ ] Verify app continues to function

### 10.3 Service Worker Error
- [ ] Unregister service worker manually
- [ ] Reload app
- [ ] Verify app still works (degraded mode)
- [ ] Check appropriate warning is shown
- [ ] Verify service worker re-registers

### 10.4 Browser Compatibility
- [ ] Test in unsupported browser (IE11)
- [ ] Verify graceful degradation
- [ ] Check app still functions without PWA features
- [ ] Verify appropriate messaging

---

## 11. Security

### 11.1 HTTPS Requirement
- [ ] Verify app only works over HTTPS
- [ ] Check service worker requires HTTPS
- [ ] Test on localhost (should work)
- [ ] Verify HTTP shows appropriate error

### 11.2 Secure Storage
- [ ] Inspect IndexedDB in DevTools
- [ ] Verify sensitive data is not stored
- [ ] Check tokens are stored securely
- [ ] Verify data is encrypted (if applicable)

---

## 12. Accessibility

### 12.1 Screen Reader
- [ ] Use screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate offline indicator
- [ ] Verify announcements are clear
- [ ] Check sync status is announced
- [ ] Test with all interactive elements

### 12.2 Keyboard Navigation
- [ ] Navigate app using only keyboard
- [ ] Tab through offline indicator
- [ ] Verify focus indicators are visible
- [ ] Check all actions are keyboard accessible
- [ ] Test Escape key dismisses notifications

### 12.3 High Contrast Mode
- [ ] Enable high contrast mode (Windows)
- [ ] Verify offline indicator is visible
- [ ] Check all text is readable
- [ ] Verify icons are distinguishable

---

## Test Results Template

### Test Session Information
- **Date**: _______________
- **Tester**: _______________
- **Browser**: _______________
- **Device**: _______________
- **OS**: _______________

### Summary
- **Total Tests**: _______________
- **Passed**: _______________
- **Failed**: _______________
- **Blocked**: _______________

### Issues Found
1. **Issue**: _______________
   - **Severity**: Critical / High / Medium / Low
   - **Steps to Reproduce**: _______________
   - **Expected**: _______________
   - **Actual**: _______________
   - **Screenshot**: _______________

### Notes
_______________________________________________
_______________________________________________
_______________________________________________

---

## Sign-off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Ready for production

**Tester Signature**: _______________
**Date**: _______________
