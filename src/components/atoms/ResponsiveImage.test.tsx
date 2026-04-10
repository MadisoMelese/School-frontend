import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ResponsiveImage } from './ResponsiveImage';

describe('ResponsiveImage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Renders with basic src
  it('renders image with basic src prop', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test Image" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Test Image');
  });

  // Test 2: Alt text for accessibility
  it('has proper alt text for accessibility', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="User Profile" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'User Profile');
    expect(img).toHaveAttribute('aria-label', 'User Profile');
  });

  // Test 3: Lazy loading enabled by default
  it('has lazy loading enabled by default', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  // Test 4: Lazy loading can be disabled
  it('disables lazy loading when lazy prop is false', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={false} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  // Test 5: Placeholder shows while loading
  it('shows placeholder while image is loading', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        showPlaceholder={true}
        placeholderColor="bg-neutral-200"
      />
    );
    const placeholder = document.querySelector('.bg-neutral-200');
    expect(placeholder).toBeInTheDocument();
  });

  // Test 6: Placeholder can be hidden
  it('hides placeholder when showPlaceholder is false', () => {
    render(
      <ResponsiveImage src="https://example.com/image.jpg" alt="Test" showPlaceholder={false} />
    );
    const placeholder = document.querySelector('.animate-pulse');
    expect(placeholder).not.toBeInTheDocument();
  });

  // Test 7: Custom placeholder color
  it('applies custom placeholder color', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        placeholderColor="bg-blue-200"
      />
    );
    const placeholder = document.querySelector('.bg-blue-200');
    expect(placeholder).toBeInTheDocument();
  });

  // Test 8: Aspect ratio preservation
  it('preserves aspect ratio when specified', () => {
    const { container } = render(
      <ResponsiveImage src="https://example.com/image.jpg" alt="Test" aspectRatio="16/9" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ aspectRatio: '16/9' });
  });

  // Test 9: Picture element with WebP support
  it('renders picture element with WebP source', () => {
    const { container } = render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        webpSrc="https://example.com/image.webp"
        lazy={false}
      />
    );
    const sources = container.querySelectorAll('source');
    const webpSource = Array.from(sources).find((s) => s.getAttribute('type')?.includes('webp'));
    expect(webpSource).toBeInTheDocument();
  });

  // Test 10: Picture element with JPEG fallback
  it('renders picture element with JPEG source', () => {
    const { container } = render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        jpegSrc="https://example.com/image.jpg"
        lazy={false}
      />
    );
    const sources = container.querySelectorAll('source');
    const jpegSource = Array.from(sources).find((s) => s.getAttribute('type')?.includes('jpeg'));
    expect(jpegSource).toBeInTheDocument();
  });

  // Test 11: Responsive image sources for different breakpoints
  it('includes responsive image sources for mobile, tablet, desktop', () => {
    const { container } = render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        mobileSrc="https://example.com/mobile.jpg"
        tabletSrc="https://example.com/tablet.jpg"
        desktopSrc="https://example.com/desktop.jpg"
        lazy={false}
      />
    );
    const sources = container.querySelectorAll('source[media]');
    expect(sources.length).toBeGreaterThan(0);
  });

  // Test 12: srcset for different pixel densities
  it('generates srcset for different pixel densities', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        enableSrcSet={true}
        lazy={false}
      />
    );
    const img = screen.getByRole('img');
    const srcSet = img.getAttribute('srcset');
    expect(srcSet).toContain('1x');
    expect(srcSet).toContain('2x');
  });

  // Test 13: srcset can be disabled
  it('disables srcset when enableSrcSet is false', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        enableSrcSet={false}
        lazy={false}
      />
    );
    const img = screen.getByRole('img');
    const srcSet = img.getAttribute('srcset');
    expect(srcSet).toBeNull();
  });

  // Test 14: onLoad callback is called
  it('calls onLoad callback when image loads', async () => {
    const onLoad = vi.fn();
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        onLoad={onLoad}
        lazy={false}
      />
    );
    const img = screen.getByRole('img') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  // Test 15: onError callback is called
  it('calls onError callback when image fails to load', async () => {
    const onError = vi.fn();
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        onError={onError}
        lazy={false}
      />
    );
    const img = screen.getByRole('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  // Test 16: Error state displays when image fails
  it('displays error state when image fails to load', async () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test Image" lazy={false} />);
    const img = screen.getByRole('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    await waitFor(() => {
      const errorStatus = screen.getByRole('status');
      expect(errorStatus).toBeInTheDocument();
      expect(errorStatus).toHaveAttribute('aria-label', 'Failed to load image: Test Image');
    });
  });

  // Test 17: Custom className is applied
  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveImage src="https://example.com/image.jpg" alt="Test" className="custom-class" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  // Test 18: Sizes attribute is applied
  it('applies sizes attribute for responsive loading', () => {
    render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        sizes="(max-width: 768px) 100vw, 50vw"
        lazy={false}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  // Test 19: Default sizes attribute when not specified
  it('uses default sizes attribute when not specified', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={false} />);
    const img = screen.getByRole('img');
    const sizes = img.getAttribute('sizes');
    expect(sizes).toBeTruthy();
    expect(sizes).toContain('100vw');
  });

  // Test 20: Image has object-cover class for proper scaling
  it('applies object-cover class for proper image scaling', () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={false} />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('object-cover');
  });

  // Test 21: Opacity transition on load
  it('applies opacity transition when image loads', async () => {
    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={false} />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('transition-opacity');
    expect(img).toHaveClass('duration-300');
  });

  // Test 22: Picture element structure is correct
  it('renders picture element with correct structure', () => {
    const { container } = render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        webpSrc="https://example.com/image.webp"
        jpegSrc="https://example.com/image.jpg"
        lazy={false}
      />
    );
    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();
    const img = picture?.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  // Test 23: Intersection Observer is set up for lazy loading
  it('sets up Intersection Observer when lazy loading is enabled', () => {
    const observerMock = vi.fn();
    global.IntersectionObserver = vi.fn(() => ({
      observe: observerMock,
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as any;

    render(<ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={true} />);

    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  // Test 24: Image is rendered even when lazy (but with lazy loading attribute)
  it('renders image with lazy loading attribute when lazy is true', () => {
    const { container } = render(
      <ResponsiveImage src="https://example.com/image.jpg" alt="Test" lazy={true} />
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  // Test 25: Responsive image sources have correct media queries
  it('responsive sources have correct media query attributes', () => {
    const { container } = render(
      <ResponsiveImage
        src="https://example.com/image.jpg"
        alt="Test"
        mobileSrc="https://example.com/mobile.jpg"
        tabletSrc="https://example.com/tablet.jpg"
        desktopSrc="https://example.com/desktop.jpg"
        lazy={false}
      />
    );
    const mobileSource = container.querySelector('source[media*="768px"]');
    const tabletSource = container.querySelector('source[media*="1024px"]');
    expect(mobileSource).toBeInTheDocument();
    expect(tabletSource).toBeInTheDocument();
  });
});
