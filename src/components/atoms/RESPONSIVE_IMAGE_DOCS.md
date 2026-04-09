# ResponsiveImage Component

A comprehensive responsive image component that supports lazy loading, multiple image formats, responsive sizing, and accessibility features.

## Features

- **Responsive Image Loading**: Load different image sizes based on screen size (mobile, tablet, desktop)
- **Lazy Loading**: Uses Intersection Observer API to load images only when visible
- **Format Negotiation**: Supports WebP and JPEG formats with automatic fallback
- **Pixel Density Support**: Generates srcset for 1x and 2x pixel densities
- **Aspect Ratio Preservation**: Maintains aspect ratio with CSS aspect-ratio property
- **Placeholder/Skeleton Loading**: Shows animated placeholder while loading
- **Error Handling**: Graceful error state with user-friendly message
- **Accessibility**: Full WCAG compliance with alt text, ARIA labels, and semantic HTML
- **Performance**: Optimized image delivery based on viewport width

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mobileSrc` | string | - | Image URL for mobile devices (320px-768px) |
| `tabletSrc` | string | - | Image URL for tablets (768px-1024px) |
| `desktopSrc` | string | - | Image URL for desktop (1024px+) |
| `src` | string | - | Fallback image URL |
| `alt` | string | ✓ Required | Alt text for accessibility |
| `webpSrc` | string | - | WebP format image URL |
| `jpegSrc` | string | - | JPEG format image URL |
| `className` | string | '' | Additional CSS classes |
| `lazy` | boolean | true | Enable lazy loading with Intersection Observer |
| `aspectRatio` | string | - | CSS aspect ratio (e.g., "16/9", "4/3", "1/1") |
| `onLoad` | function | - | Callback when image loads successfully |
| `onError` | function | - | Callback when image fails to load |
| `showPlaceholder` | boolean | true | Show placeholder while loading |
| `placeholderColor` | string | 'bg-neutral-200' | Tailwind color class for placeholder |
| `sizes` | string | - | Responsive sizes attribute for srcset |
| `enableSrcSet` | boolean | true | Generate srcset for different pixel densities |

## Usage Examples

### Basic Usage
```tsx
import { ResponsiveImage } from '@components/atoms'

export function MyComponent() {
  return (
    <ResponsiveImage
      src="https://example.com/image.jpg"
      alt="My Image"
    />
  )
}
```

### Responsive Images for Different Screen Sizes
```tsx
<ResponsiveImage
  mobileSrc="https://example.com/mobile.jpg"
  tabletSrc="https://example.com/tablet.jpg"
  desktopSrc="https://example.com/desktop.jpg"
  alt="Responsive Image"
  aspectRatio="16/9"
/>
```

### With Format Negotiation (WebP + JPEG)
```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  webpSrc="https://example.com/image.webp"
  jpegSrc="https://example.com/image.jpg"
  alt="Modern Format Support"
/>
```

### With Callbacks
```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Image with Callbacks"
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>
```

### Disable Lazy Loading
```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Eager Loading"
  lazy={false}
/>
```

### Custom Placeholder
```tsx
<ResponsiveImage
  src="https://example.com/image.jpg"
  alt="Custom Placeholder"
  showPlaceholder={true}
  placeholderColor="bg-blue-200"
/>
```

## Accessibility

The component is fully accessible with:
- Semantic HTML using `<picture>` element
- Alt text for all images
- ARIA labels for screen readers
- Proper role attributes
- Error state with descriptive messages
- Keyboard navigation support

## Performance Considerations

1. **Lazy Loading**: Images are loaded only when visible (50px margin)
2. **Format Optimization**: WebP format reduces file size by ~25-35%
3. **Responsive Sizing**: Different image sizes for different devices
4. **Pixel Density**: Serves 2x images for high-DPI displays
5. **Placeholder**: Smooth loading experience with skeleton placeholder

## Browser Support

- Modern browsers with Intersection Observer API support
- Fallback to eager loading for older browsers
- WebP support detection with JPEG fallback
- Picture element support for format negotiation

## Testing

The component includes 25 comprehensive tests covering:
- Basic rendering
- Lazy loading behavior
- Placeholder display
- Error handling
- Responsive sources
- Format negotiation
- Accessibility features
- Callbacks
- Aspect ratio preservation

Run tests with:
```bash
npm test -- ResponsiveImage.test.tsx --run
```
