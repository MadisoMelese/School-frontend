import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Heart: ({ className, ...props }: any) => (
    <svg data-testid="heart-icon" className={className} {...props} />
  ),
  Star: ({ className, ...props }: any) => (
    <svg data-testid="star-icon" className={className} {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <svg data-testid="x-icon" className={className} {...props} />
  ),
}));

describe('Icon Component', () => {
  it('renders icon component', () => {
    render(<Icon name="Heart" />);
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
  });

  it('applies size styles', () => {
    const { rerender } = render(<Icon name="Heart" size="sm" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('size', '20');

    rerender(<Icon name="Heart" size="md" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('size', '24');

    rerender(<Icon name="Heart" size="lg" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('size', '32');
  });

  it('applies color styles', () => {
    const { rerender } = render(<Icon name="Heart" color="primary" />);
    expect(screen.getByTestId('heart-icon')).toHaveClass('text-primary-500');

    rerender(<Icon name="Heart" color="danger" />);
    expect(screen.getByTestId('heart-icon')).toHaveClass('text-danger-500');

    rerender(<Icon name="Heart" color="success" />);
    expect(screen.getByTestId('heart-icon')).toHaveClass('text-success-500');
  });

  it('applies inherit color by default', () => {
    render(<Icon name="Heart" />);
    expect(screen.getByTestId('heart-icon')).toHaveClass('text-current');
  });

  it('sets aria-hidden by default', () => {
    render(<Icon name="Heart" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets aria-label when provided', () => {
    render(<Icon name="Heart" aria-label="Like" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('aria-label', 'Like');
  });

  it('sets aria-hidden to false when aria-label is provided', () => {
    render(<Icon name="Heart" aria-hidden={false} aria-label="Like" />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('aria-hidden', 'false');
  });

  it('applies custom strokeWidth', () => {
    render(<Icon name="Heart" strokeWidth={3} />);
    expect(screen.getByTestId('heart-icon')).toHaveAttribute('strokeWidth', '3');
  });

  it('applies custom className', () => {
    render(<Icon name="Heart" className="custom-class" />);
    expect(screen.getByTestId('heart-icon')).toHaveClass('custom-class');
  });

  it('renders different icons', () => {
    const { rerender } = render(<Icon name="Heart" />);
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();

    rerender(<Icon name="Star" />);
    expect(screen.getByTestId('star-icon')).toBeInTheDocument();
  });
});
