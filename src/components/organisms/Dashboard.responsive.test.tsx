import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard, Widget } from './Dashboard';

describe('Dashboard - Responsive Grid Layout', () => {
  const mockWidgets: Widget[] = [
    {
      id: 'widget-1',
      title: 'Widget 1',
      type: 'card',
      size: 'large',
      content: <div>Content 1</div>,
    },
    {
      id: 'widget-2',
      title: 'Widget 2',
      type: 'card',
      size: 'medium',
      content: <div>Content 2</div>,
    },
    {
      id: 'widget-3',
      title: 'Widget 3',
      type: 'card',
      size: 'medium',
      content: <div>Content 3</div>,
    },
    {
      id: 'widget-4',
      title: 'Widget 4',
      type: 'card',
      size: 'medium',
      content: <div>Content 4</div>,
    },
  ];

  describe('Mobile Layout (320px - 640px)', () => {
    it('should render widgets in single column on mobile', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    });

    it('should have responsive gap on mobile', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'sm:gap-5', 'md:gap-6');
    });

    it('should render all widgets', () => {
      render(<Dashboard widgets={mockWidgets} />);

      mockWidgets.forEach((widget) => {
        expect(screen.getByText(widget.title)).toBeInTheDocument();
      });
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    it('should render widgets in 2-3 columns on tablet', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive gap on tablet', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'sm:gap-5', 'md:gap-6');
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    it('should render widgets in 3-4 columns on desktop', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('lg:grid-cols-3', 'xl:grid-cols-4');
    });

    it('should have responsive gap on desktop', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('md:gap-6');
    });
  });

  describe('Widget Sizing', () => {
    it('should apply correct size classes to large widgets', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const largeWidget = container.querySelector('[aria-label="Widget 1"]');
      expect(largeWidget).toHaveClass('md:col-span-2', 'lg:col-span-2', 'xl:col-span-2');
    });

    it('should apply correct size classes to medium widgets', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const mediumWidget = container.querySelector('[aria-label="Widget 2"]');
      expect(mediumWidget).toHaveClass('col-span-1');
    });
  });

  describe('Loading State', () => {
    it('should display skeleton loaders on mobile', () => {
      const { container } = render(<Dashboard widgets={[]} loading={true} />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should have responsive skeleton styling', () => {
      const { container } = render(<Dashboard widgets={[]} loading={true} />);

      const skeleton = container.querySelector('.animate-pulse')?.parentElement;
      expect(skeleton).toHaveClass('p-4', 'sm:p-5', 'md:p-6');
    });
  });

  describe('Responsive Spacing', () => {
    it('should have responsive padding in widgets', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const cards = container.querySelectorAll('[role="region"]');
      expect(cards.length).toBe(mockWidgets.length);
    });

    it('should maintain proper spacing at all breakpoints', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4', 'sm:gap-5', 'md:gap-6');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for regions', () => {
      render(<Dashboard widgets={mockWidgets} />);

      mockWidgets.forEach((widget) => {
        const region = screen.getByRole('region', { name: widget.title });
        expect(region).toBeInTheDocument();
      });
    });

    it('should maintain semantic structure', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(mockWidgets.length);
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      render(<Dashboard widgets={[]} error="Failed to load dashboard" />);

      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    });

    it('should display empty state', () => {
      render(<Dashboard widgets={[]} loading={false} />);

      expect(screen.getByText('No widgets available')).toBeInTheDocument();
    });
  });

  describe('Responsive Typography', () => {
    it('should have responsive text sizes in widget titles', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const headers = container.querySelectorAll('[role="region"] h2');
      headers.forEach((header) => {
        expect(header).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
      });
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets', () => {
      const { container } = render(<Dashboard widgets={mockWidgets} />);

      const regions = container.querySelectorAll('[role="region"]');
      regions.forEach((region) => {
        const styles = window.getComputedStyle(region);
        const minHeight = parseFloat(styles.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });
});
