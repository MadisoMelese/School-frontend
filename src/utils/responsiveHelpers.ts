/**
 * Responsive Layout Helpers
 * Utilities for implementing mobile-first responsive design
 *
 * Breakpoints (Tailwind CSS v4):
 * - xs: 320px (extra small devices)
 * - sm: 640px (small devices, landscape phones)
 * - md: 768px (medium devices, tablets)
 * - lg: 1024px (large devices, small laptops)
 * - xl: 1280px (extra large devices, desktops)
 * - 2xl: 1536px (2X large devices, large desktops)
 * - 3xl: 1920px (3X large devices, ultra-wide)
 */

/**
 * Responsive grid column classes
 * Mobile-first: 1 column → 2 columns (tablet) → 3+ columns (desktop)
 */
export const responsiveGridClasses = {
  // 1 column mobile → 2 columns tablet → 3 columns desktop
  cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',

  // 1 column mobile → 2 columns tablet → 4 columns desktop
  cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',

  // 1 column mobile → 2 columns tablet → 2 columns desktop
  cols2: 'grid-cols-1 sm:grid-cols-2',

  // 1 column mobile → 3 columns tablet → 6 columns desktop
  cols6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
} as const;

/**
 * Responsive gap classes
 * Mobile-first: smaller gaps on mobile, larger on desktop
 */
export const responsiveGapClasses = {
  // 3 (mobile) → 4 (tablet) → 6 (desktop)
  default: 'gap-3 sm:gap-4 md:gap-6',

  // 2 (mobile) → 3 (tablet) → 4 (desktop)
  compact: 'gap-2 sm:gap-3 md:gap-4',

  // 4 (mobile) → 6 (tablet) → 8 (desktop)
  spacious: 'gap-4 sm:gap-6 md:gap-8',
} as const;

/**
 * Responsive padding classes
 * Mobile-first: smaller padding on mobile, larger on desktop
 */
export const responsivePaddingClasses = {
  // 4 (mobile) → 6 (tablet) → 8 (desktop)
  default: 'px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8',

  // 3 (mobile) → 4 (tablet) → 6 (desktop)
  compact: 'px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6',

  // 6 (mobile) → 8 (tablet) → 12 (desktop)
  spacious: 'px-6 sm:px-8 md:px-12 py-6 sm:py-8 md:py-12',
} as const;

/**
 * Responsive typography classes
 * Mobile-first: smaller text on mobile, larger on desktop
 */
export const responsiveTypographyClasses = {
  // Heading 1: 24px (mobile) → 30px (tablet) → 36px (desktop)
  h1: 'text-2xl sm:text-3xl md:text-4xl',

  // Heading 2: 20px (mobile) → 24px (tablet) → 28px (desktop)
  h2: 'text-xl sm:text-2xl md:text-3xl',

  // Heading 3: 18px (mobile) → 20px (tablet) → 24px (desktop)
  h3: 'text-lg sm:text-xl md:text-2xl',

  // Body: 14px (mobile) → 16px (tablet) → 16px (desktop)
  body: 'text-sm sm:text-base',

  // Small: 12px (mobile) → 13px (tablet) → 14px (desktop)
  small: 'text-xs sm:text-sm',
} as const;

/**
 * Responsive display classes
 * Show/hide elements based on screen size
 */
export const responsiveDisplayClasses = {
  // Hide on mobile, show on tablet+
  hideOnMobile: 'hidden sm:block',

  // Show on mobile, hide on tablet+
  showOnMobile: 'block sm:hidden',

  // Hide on mobile, show on desktop
  hideOnMobileTablet: 'hidden lg:block',

  // Show on mobile/tablet, hide on desktop
  showOnMobileTablet: 'block lg:hidden',
} as const;

/**
 * Responsive flex direction classes
 * Mobile-first: column on mobile, row on desktop
 */
export const responsiveFlexClasses = {
  // Column on mobile, row on tablet+
  colToRow: 'flex-col sm:flex-row',

  // Column on mobile, row on desktop
  colToRowLg: 'flex-col lg:flex-row',
} as const;

/**
 * Responsive width classes
 * Full width on mobile, constrained on desktop
 */
export const responsiveWidthClasses = {
  // Full width on mobile, auto on desktop
  fullToAuto: 'w-full sm:w-auto',

  // Full width on mobile, 50% on tablet, auto on desktop
  fullToHalfToAuto: 'w-full sm:w-1/2 lg:w-auto',
} as const;

/**
 * Touch target minimum size (44px)
 * Used for buttons, inputs, and interactive elements
 * Ensures WCAG 2.1 AA compliance for touch-friendly interfaces
 *
 * Reference: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
export const touchTargetClasses = {
  // Minimum 44px height and width for square targets
  button: 'min-h-[44px] min-w-[44px]',

  // Minimum 44px height for rectangular targets (inputs, dropdowns)
  input: 'min-h-[44px]',

  // Minimum 44px height with proper padding for labels/checkboxes
  label: 'min-h-[44px] px-2 py-2 -mx-2 -my-2 rounded-lg',

  // Minimum 44px height for navigation items
  navItem: 'min-h-[44px]',

  // Minimum 44px height for tab items
  tab: 'min-h-[44px]',

  // Minimum 44px height for pagination buttons
  pagination: 'min-h-[44px] min-w-[44px]',

  // Larger tap target for bottom navigation (64px for better mobile UX)
  bottomNav: 'min-h-[64px]',
} as const;

/**
 * Responsive container classes
 * Constrain content width on large screens
 */
export const responsiveContainerClasses = {
  // Max width: 100% (mobile) → 100% (tablet) → 1024px (desktop)
  default: 'w-full max-w-none lg:max-w-4xl',

  // Max width: 100% (mobile) → 100% (tablet) → 1280px (desktop)
  wide: 'w-full max-w-none lg:max-w-5xl',

  // Max width: 100% (mobile) → 100% (tablet) → 1536px (desktop)
  ultraWide: 'w-full max-w-none lg:max-w-6xl',
} as const;

/**
 * Responsive image classes
 * Responsive images with proper aspect ratios
 */
export const responsiveImageClasses = {
  // Full width, maintain aspect ratio
  responsive: 'w-full h-auto',

  // Cover container, maintain aspect ratio
  cover: 'w-full h-full object-cover',

  // Contain in container, maintain aspect ratio
  contain: 'w-full h-full object-contain',
} as const;

/**
 * Responsive table classes
 * Stack on mobile, table layout on desktop
 */
export const responsiveTableClasses = {
  // Hide on mobile, show on tablet+
  desktopOnly: 'hidden md:table',

  // Show on mobile, hide on tablet+
  mobileOnly: 'block md:hidden',
} as const;

/**
 * Responsive margin classes
 * Mobile-first: smaller margins on mobile, larger on desktop
 */
export const responsiveMarginClasses = {
  // 4 (mobile) → 6 (tablet) → 8 (desktop)
  default: 'mx-4 sm:mx-6 md:mx-8 my-4 sm:my-6 md:my-8',

  // 3 (mobile) → 4 (tablet) → 6 (desktop)
  compact: 'mx-3 sm:mx-4 md:mx-6 my-3 sm:my-4 md:my-6',
} as const;

/**
 * Get responsive grid classes based on column count
 * @param columns - Number of columns on desktop (2, 3, 4, 6)
 * @returns Tailwind CSS classes for responsive grid
 */
export function getResponsiveGridClasses(columns: 2 | 3 | 4 | 6): string {
  return responsiveGridClasses[`cols${columns}` as keyof typeof responsiveGridClasses];
}

/**
 * Get responsive gap classes based on density
 * @param density - Gap density (compact, default, spacious)
 * @returns Tailwind CSS classes for responsive gap
 */
export function getResponsiveGapClasses(
  density: 'compact' | 'default' | 'spacious' = 'default'
): string {
  return responsiveGapClasses[density];
}

/**
 * Get responsive padding classes based on density
 * @param density - Padding density (compact, default, spacious)
 * @returns Tailwind CSS classes for responsive padding
 */
export function getResponsivePaddingClasses(
  density: 'compact' | 'default' | 'spacious' = 'default'
): string {
  return responsivePaddingClasses[density];
}

/**
 * Get responsive typography classes based on level
 * @param level - Typography level (h1, h2, h3, body, small)
 * @returns Tailwind CSS classes for responsive typography
 */
export function getResponsiveTypographyClasses(
  level: keyof typeof responsiveTypographyClasses
): string {
  return responsiveTypographyClasses[level];
}

/**
 * Combine multiple responsive class groups
 * @param classes - Array of class strings or objects
 * @returns Combined class string
 */
export function combineResponsiveClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create responsive grid layout
 * @param columns - Number of columns on desktop
 * @param gap - Gap density
 * @returns Combined responsive grid classes
 */
export function createResponsiveGrid(
  columns: 2 | 3 | 4 | 6 = 3,
  gap: 'compact' | 'default' | 'spacious' = 'default'
): string {
  return combineResponsiveClasses(
    'grid',
    getResponsiveGridClasses(columns),
    getResponsiveGapClasses(gap)
  );
}

/**
 * Create responsive container
 * @param padding - Padding density
 * @param maxWidth - Max width constraint
 * @returns Combined responsive container classes
 */
export function createResponsiveContainer(
  padding: 'compact' | 'default' | 'spacious' = 'default',
  maxWidth: 'default' | 'wide' | 'ultraWide' = 'default'
): string {
  return combineResponsiveClasses(
    'w-full',
    getResponsivePaddingClasses(padding),
    responsiveContainerClasses[maxWidth]
  );
}

/**
 * Get touch target classes based on element type
 * @param type - Element type (button, input, label, navItem, tab, pagination, bottomNav)
 * @returns Tailwind CSS classes for touch target sizing
 */
export function getTouchTargetClasses(type: keyof typeof touchTargetClasses = 'button'): string {
  return touchTargetClasses[type];
}

/**
 * Create touch-friendly button with proper spacing
 * @param _variant - Button variant
 * @returns Combined button classes with touch target sizing
 */
export function createTouchFriendlyButton(
  _variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary'
): string {
  return combineResponsiveClasses(
    'inline-flex items-center justify-center',
    getTouchTargetClasses('button'),
    'rounded-lg transition-colors duration-200'
  );
}

/**
 * Create touch-friendly input with proper sizing
 * @returns Combined input classes with touch target sizing
 */
export function createTouchFriendlyInput(): string {
  return combineResponsiveClasses(
    'w-full px-3 py-2.5 text-base rounded-lg border-2',
    getTouchTargetClasses('input'),
    'transition-colors duration-200'
  );
}

/**
 * Create touch-friendly interactive element with proper spacing
 * Adds padding around element to ensure 44px minimum tap target
 * @returns Combined classes for touch-friendly spacing
 */
export function createTouchFriendlySpacing(): string {
  return 'px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-neutral-50 transition-colors';
}
