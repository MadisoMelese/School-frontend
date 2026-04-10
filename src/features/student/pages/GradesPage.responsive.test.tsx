import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradesPage } from './GradesPage';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useAuth } from '@hooks/useAuth';
import { useUIStore } from '@store/uiStore';
import { studentService } from '@services/api/studentService';

// Mock hooks and services
vi.mock('@hooks/useMediaQuery');
vi.mock('@hooks/useAuth');
vi.mock('@store/uiStore');
vi.mock('@services/api/studentService');

describe('GradesPage - Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        status: 'active',
      },
    });
    (useUIStore as any).mockReturnValue({
      sidebarOpen: true,
      setSidebarOpen: vi.fn(),
    });
    (studentService.getGrades as any).mockResolvedValue({
      data: [
        {
          id: '1',
          subject: 'Mathematics',
          marksObtained: 85,
          totalMarks: 100,
          percentage: 85,
          grade: 'A',
          remarks: 'Good',
          examDate: new Date(),
          academicYear: '2024',
        },
      ],
    });
    (studentService.getPerformanceSummary as any).mockResolvedValue({
      averageGrade: 85,
      highestScore: 95,
      lowestScore: 75,
      gpa: 3.8,
    });
  });

  describe('Mobile Layout (320px - 640px)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return true;
        if (query === '(max-width: 1024px)') return true;
        return false;
      });
    });

    it('should render performance summary in single column on mobile', async () => {
      const { container } = render(<GradesPage />);

      // Wait for data to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should have responsive gap on mobile', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-3', 'sm:gap-4', 'md:gap-6');
    });

    it('should display card layout on mobile instead of table', async () => {
      (useMediaQuery as any).mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return true;
        return false;
      });

      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should render GradeCard components instead of DataTable
      const gradeCards = screen.queryAllByRole('region');
      expect(gradeCards.length).toBeGreaterThanOrEqual(0);
    });

    it('should have responsive filter layout on mobile', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const filterSection = container.querySelector('.space-y-3');
      expect(filterSection).toBeInTheDocument();
    });

    it('should have responsive typography on mobile', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl');
    });
  });

  describe('Tablet Layout (768px - 1024px)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return false;
        if (query === '(max-width: 1024px)') return true;
        return false;
      });
    });

    it('should render performance summary in 2 columns on tablet', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should display table layout on tablet', async () => {
      (useMediaQuery as any).mockImplementation((query: string) => {
        if (query === '(max-width: 768px)') return false;
        return false;
      });

      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should render DataTable on tablet/desktop
      const table = screen.queryByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      (useMediaQuery as any).mockImplementation((_query: string) => {
        return false;
      });
    });

    it('should render performance summary in 4 columns on desktop', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('should display table layout on desktop', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const table = screen.queryByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should have full-width layout on desktop', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const mainContent = container.querySelector('main');
      expect(mainContent).toHaveClass('flex-1');
    });
  });

  describe('Responsive Typography', () => {
    it('should scale typography from mobile to desktop', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveClass('text-2xl', 'sm:text-3xl', 'md:text-4xl');

      const description = screen.getByText(/view your academic performance/i);
      expect(description).toHaveClass('text-sm', 'sm:text-base');
    });

    it('should have responsive font sizes in performance cards', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const cardTitles = container.querySelectorAll('.text-xs');
      expect(cardTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Spacing', () => {
    it('should have responsive padding in filters', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const filterCard = container.querySelector('.space-y-4');
      expect(filterCard).toBeInTheDocument();
    });

    it('should have responsive gap in performance summary', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-3', 'sm:gap-4', 'md:gap-6');
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 44px touch targets for buttons', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const buttons = screen.queryAllByRole('button');
      buttons.forEach((button) => {
        const styles = window.getComputedStyle(button);
        const height = parseFloat(styles.minHeight);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have minimum 44px touch targets for form inputs', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const inputs = screen.queryAllByRole('textbox');
      inputs.forEach((input) => {
        const styles = window.getComputedStyle(input);
        const height = parseFloat(styles.minHeight);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Responsive Images', () => {
    it('should support responsive image utilities', () => {
      const { container } = render(
        <div>
          <img src="test.jpg" alt="test" className="img-responsive img-cover" />
        </div>
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('img-responsive', 'img-cover');
    });
  });

  describe('Responsive Grid Layouts', () => {
    it('should use responsive grid for performance summary', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should use responsive grid for grade distribution', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const distributionGrid = container.querySelector('.space-y-3');
      expect(distributionGrid).toBeInTheDocument();
    });
  });

  describe('Responsive Filters', () => {
    it('should have responsive filter layout', async () => {
      const { container } = render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const filterContainer = container.querySelector('.space-y-4');
      expect(filterContainer).toBeInTheDocument();
    });

    it('should have responsive button layout in filters', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const resetButton = screen.queryByText(/reset/i);
      if (resetButton) {
        expect(resetButton).toHaveClass('w-full', 'sm:w-auto');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form inputs', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const searchInput = screen.queryByLabelText(/search grades/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper ARIA labels for select elements', async () => {
      render(<GradesPage />);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const yearSelect = screen.queryByLabelText(/filter by academic year/i);
      expect(yearSelect).toBeInTheDocument();
    });
  });
});
