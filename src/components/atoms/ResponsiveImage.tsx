import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveImageProps {
  /** Mobile image URL (320px-768px) */
  mobileSrc?: string;
  /** Tablet image URL (768px-1024px) */
  tabletSrc?: string;
  /** Desktop image URL (1024px+) */
  desktopSrc?: string;
  /** Fallback image URL */
  src?: string;
  /** Alt text for accessibility */
  alt: string;
  /** WebP format image URL for modern browsers */
  webpSrc?: string;
  /** JPEG format image URL as fallback */
  jpegSrc?: string;
  /** CSS class name */
  className?: string;
  /** Enable lazy loading with Intersection Observer */
  lazy?: boolean;
  /** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Show placeholder while loading */
  showPlaceholder?: boolean;
  /** Placeholder background color */
  placeholderColor?: string;
  /** Image sizes for responsive loading */
  sizes?: string;
  /** Enable srcset for different pixel densities */
  enableSrcSet?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  mobileSrc,
  tabletSrc,
  desktopSrc,
  src,
  alt,
  webpSrc,
  jpegSrc,
  className = '',
  lazy = true,
  aspectRatio,
  onLoad,
  onError,
  showPlaceholder = true,
  placeholderColor = 'bg-neutral-200',
  sizes,
  enableSrcSet = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Determine which image source to use based on viewport
  const getImageSource = (): string | undefined => {
    if (!isVisible) return undefined;

    // Use responsive sources if available
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768 && mobileSrc) return mobileSrc;
      if (width < 1024 && tabletSrc) return tabletSrc;
      if (desktopSrc) return desktopSrc;
    }

    return src;
  };

  // Generate srcset for different pixel densities
  const generateSrcSet = (imageSrc?: string): string | undefined => {
    if (!enableSrcSet || !imageSrc) return undefined;
    // Format: url 1x, url 2x
    return `${imageSrc} 1x, ${imageSrc}?dpr=2 2x`;
  };

  const imageSource = getImageSource();
  const srcSet = generateSrcSet(imageSource);

  // Determine sizes attribute for responsive images
  const responsiveSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

  const baseStyles = 'w-full h-full object-cover';
  const loadingStyles = !isLoaded && showPlaceholder ? `${placeholderColor} animate-pulse` : '';
  const containerClasses = `relative overflow-hidden ${className}`;

  // Aspect ratio styles
  const aspectRatioStyle = aspectRatio
    ? {
        aspectRatio: aspectRatio,
      }
    : {};

  return (
    <div ref={containerRef} className={containerClasses} style={aspectRatioStyle}>
      {/* Placeholder skeleton */}
      {!isLoaded && showPlaceholder && (
        <div className={`absolute inset-0 ${placeholderColor} animate-pulse`} />
      )}

      {/* Picture element for format negotiation */}
      {isVisible && (
        <picture>
          {/* WebP format for modern browsers */}
          {webpSrc && (
            <source srcSet={generateSrcSet(webpSrc)} type="image/webp" sizes={responsiveSizes} />
          )}

          {/* JPEG format as fallback */}
          {jpegSrc && (
            <source srcSet={generateSrcSet(jpegSrc)} type="image/jpeg" sizes={responsiveSizes} />
          )}

          {/* Responsive image sources */}
          {mobileSrc && (
            <source
              media="(max-width: 768px)"
              srcSet={generateSrcSet(mobileSrc)}
              sizes={responsiveSizes}
            />
          )}

          {tabletSrc && (
            <source
              media="(max-width: 1024px)"
              srcSet={generateSrcSet(tabletSrc)}
              sizes={responsiveSizes}
            />
          )}

          {/* Main image element */}
          <img
            ref={imgRef}
            src={imageSource}
            srcSet={srcSet}
            sizes={responsiveSizes}
            alt={alt}
            className={`${baseStyles} ${loadingStyles} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy ? 'lazy' : 'eager'}
            role="img"
            aria-label={alt}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${placeholderColor}`}
          role="status"
          aria-label={`Failed to load image: ${alt}`}
        >
          <div className="text-center">
            <div className="text-2xl text-neutral-400">⚠️</div>
            <p className="text-xs text-neutral-500 mt-1">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};
