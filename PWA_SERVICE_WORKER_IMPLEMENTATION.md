# PWA Service Worker Implementation

## Overview

This document describes the implementation of the Progressive Web App (PWA) service worker using Workbox for the SchoolOS Mobile Frontend application.

## Implementation Summary

### 1. Dependencies Installed

```json
{
  "dependencies": {
    "workbox-window": "^7.0.0"
  },
  "devDependencies": {
    "vite-plugin-pwa": "latest",
    "workbox-build": "latest",
    "workbox-precaching": "latest",
    "workbox-routing": "latest",
    "workbox-strategies": "latest",
    "workbox-expiration": "latest"
  }
}
```

### 2. Vite Configuration

Updated `vite.config.ts` to include the PWA plugin with the following configuration:

**Key Features:**
- **Auto Update**: Service worker automatically updates when a new version is available
- **Precaching**: Static assets (JS, CSS, HTML, images, fonts) are precached for offline use
- **Runtime Caching**: Three caching strategies implemented:
  1. **API Cache** (NetworkFirst): API calls with 24-hour expiration
  2. **Image Cache** (CacheFirst): Images with 30-day expiration
  3. **Google Fonts Cache** (CacheFirst): Fonts with 1-year expiration

**Configuration:**
```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icons/*.png', 'screenshots/*.png'],
  manifest: false, // Use existing manifest.json
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    runtimeCaching: [...],
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
  },
})
```

### 3. Service Worker Registration

Created `src/services/pwa/serviceWorkerRegistration.ts` with the following functions:

- **registerServiceWorker()**: Registers the service worker with lifecycle event handlers
- **unregisterServiceWorker()**: Unregisters the service worker
- **updateServiceWorker()**: Triggers an immediate service worker update
- **checkForUpdates()**: Manually checks for service worker updates
- **getServiceWorkerRegistration()**: Returns the current service worker registration

**Features:**
- Only registers in production mode (skipped in development)
- Handles service worker lifecycle events (installed, activated, waiting, controlling)
- Provides callbacks for custom handling (onSuccess, onUpdate, onOfflineReady, onNeedRefresh)
- Automatic page reload when new service worker takes control

### 4. PWA Hook

Created `src/hooks/usePWA.ts` to manage PWA functionality:

**Returns:**
- `isOffline`: Boolean indicating offline status
- `needRefresh`: Boolean indicating if an update is available
- `offlineReady`: Boolean indicating if the app is ready for offline use
- `canInstall`: Boolean indicating if the install prompt is available
- `updateServiceWorker()`: Function to trigger service worker update
- `promptInstall()`: Function to show the install prompt

**Features:**
- Monitors online/offline status
- Handles service worker update notifications
- Manages PWA install prompt (beforeinstallprompt event)
- Tracks app installation (appinstalled event)

### 5. UI Components

#### PWAUpdatePrompt Component
Location: `src/components/organisms/PWAUpdatePrompt.tsx`

Displays a notification when:
- A new version of the app is available (needRefresh)
- The app is ready for offline use (offlineReady)

**Features:**
- Slide-up animation
- Update now button (triggers service worker update)
- Dismiss button
- Dark mode support

#### PWAInstallPrompt Component
Location: `src/components/organisms/PWAInstallPrompt.tsx`

Displays a prompt to install the app as a PWA.

**Features:**
- Shows when install prompt is available
- Install button (triggers native install prompt)
- Dismiss button
- Dark mode support

### 6. Integration

Updated `src/App.tsx` to include PWA components:

```tsx
import { PWAUpdatePrompt } from '@components/organisms/PWAUpdatePrompt';
import { PWAInstallPrompt } from '@components/organisms/PWAInstallPrompt';

function App() {
  return (
    <Router>
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
      {/* ... rest of the app */}
    </Router>
  );
}
```

## Caching Strategies

### 1. Precaching (Cache-First)
All static assets are precached during service worker installation:
- JavaScript bundles
- CSS files
- HTML files
- Icons and images
- Fonts

### 2. API Caching (Network-First)
API calls use Network-First strategy:
- Tries network first
- Falls back to cache if network fails
- 10-second network timeout
- 24-hour cache expiration
- Maximum 100 entries

### 3. Image Caching (Cache-First)
External images use Cache-First strategy:
- Serves from cache if available
- Fetches from network if not cached
- 30-day cache expiration
- Maximum 60 entries

### 4. Font Caching (Cache-First)
Google Fonts use Cache-First strategy:
- Serves from cache if available
- 1-year cache expiration
- Maximum 10 entries

## Offline Functionality

### What Works Offline:
1. **Static Pages**: All precached pages (dashboard, grades, attendance, etc.)
2. **Cached Data**: Previously loaded data from API calls
3. **Images**: Previously loaded images
4. **Fonts**: Google Fonts (if previously loaded)

### What Requires Network:
1. **New Data**: Fresh data from API calls
2. **Form Submissions**: Creating/updating records
3. **Real-time Features**: Notifications, messages

## Testing

### Unit Tests
- `src/services/pwa/serviceWorkerRegistration.test.ts`: Tests for service worker registration functions
- `src/hooks/usePWA.test.ts`: Tests for the usePWA hook

### Manual Testing
1. **Build the app**: `npm run build`
2. **Serve the build**: `npm run preview`
3. **Open in browser**: Navigate to the preview URL
4. **Test offline**: 
   - Open DevTools → Application → Service Workers
   - Check "Offline" checkbox
   - Reload the page
   - Verify the app still works

5. **Test update notification**:
   - Make a change to the code
   - Build again
   - Reload the page
   - Verify the update prompt appears

6. **Test install prompt**:
   - Open in Chrome/Edge
   - Verify the install prompt appears
   - Click "Install"
   - Verify the app installs

## Build Output

When building the app, you should see:

```
PWA v1.2.0
mode      generateSW
precache  X entries (XXX.XX KiB)
files generated
  dist/sw.js
  dist/workbox-XXXXXXXX.js
```

## Browser Support

### Service Worker Support:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

### Install Prompt Support:
- Chrome 68+
- Edge 79+
- Samsung Internet 8.2+

**Note**: Safari does not support the install prompt (beforeinstallprompt event), but users can still add to home screen manually.

## Configuration Options

### Customizing Cache Strategies

Edit `vite.config.ts` to customize caching:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/your-api\.com\/.*$/i,
      handler: 'NetworkFirst', // or 'CacheFirst', 'StaleWhileRevalidate'
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
  ],
}
```

### Customizing Precache

Add more file patterns to precache:

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
}
```

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify you're running in production mode (`npm run build && npm run preview`)
- Ensure HTTPS is enabled (service workers require HTTPS except on localhost)

### Update Not Showing
- Clear browser cache
- Unregister old service worker (DevTools → Application → Service Workers → Unregister)
- Rebuild and reload

### Offline Not Working
- Check if service worker is active (DevTools → Application → Service Workers)
- Verify precache includes necessary files
- Check cache storage (DevTools → Application → Cache Storage)

## Future Enhancements

1. **Background Sync**: Queue actions when offline and sync when online
2. **Push Notifications**: Send notifications to users
3. **Periodic Background Sync**: Update data in the background
4. **Advanced Offline**: Full offline mode with IndexedDB storage

## References

- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/pwa/)
