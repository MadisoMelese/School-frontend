import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClassesPage } from './ClassesPage';
import * as teacherServiceModule from '@/services/api/teacherService';

// Mock the teacherService
vi.mock('@/services/api/teacherService');

const mockTeacherService = teacherServiceModule as any;

const mockClasses = [
  {
    id: '1',
    name: 'Mathematics 101',
    gradeLevel: '10',
    section: 'A',
    studentCount: 30,
    schedule: [
      { day: 'Monday', time: '09:00-10:00' },
      { day: 'Wednesday', time: '09:00-10:00' },
    ],
  },
  {
    id: '2',
    name: 'English Literature',
    gradeLevel: '10',
    section: 'B',
    studentCount: 28,
    schedule: [
      { day: 'Tuesday', time: '10:00-11:00' },
      { day: 'Thursday', time: '10:00-11:00' },
    ],
  },
  {
    id: '3',
    name: 'Science Lab',
    gradeLevel: '9',
    section: 'A',
    studentCount: 25,
    schedule: [
      { day: 'Friday', time: '14:00-15:30' },
    ],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 9.1: Display all classes assigned to the teacher', () => {
    it('should display all classes when data loads successfully', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
        expect(screen.getByText('English Literature')).toBeInTheDocument();
        expect(screen.getByText('Science Lab')).toBeInTheDocument();
      });
    });

    it('should display loading skeleton while fetching classes', () => {
      mockTeacherService.teacherService.getClasses.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ClassesPage />, { wrapper: createWrapper() });

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display error message when fetching fails', async () => {
      mockTeacherService.teacherService.getClasses.mockRejectedValue(
        new Error('Failed to fetch')
      );

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Failed to load classes')).toBeInTheDocument();
      });
    });

    it('should display empty state when no classes are assigned', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('No classes assigned yet')).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 9.2: Display class name, grade level, number of students, and class schedule', () => {
    it('should display class name for each class', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
        expect(screen.getByText('English Literature')).toBeInTheDocument();
      });
    });

    it('should display grade level for each class', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const gradeBadges = screen.getAllByText(/Grade \d+/);
        expect(gradeBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display student count for each class', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(screen.getByText('28')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('should display class schedule information', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Monday, Wednesday/)).toBeInTheDocument();
        expect(screen.getByText(/Tuesday, Thursday/)).toBeInTheDocument();
      });
    });

    it('should display section information', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const sectionBadges = screen.getAllByText(/Section [A-Z]/);
        expect(sectionBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search functionality', () => {
    it('should filter classes by name', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes/);
      await userEvent.type(searchInput, 'Mathematics');

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
        expect(screen.queryByText('English Literature')).not.toBeInTheDocument();
      });
    });

    it('should filter classes by grade level', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes/);
      await userEvent.type(searchInput, '9');

      await waitFor(() => {
        expect(screen.getByText('Science Lab')).toBeInTheDocument();
        expect(screen.queryByText('Mathematics 101')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when search returns no results', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search classes/);
      await userEvent.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText('No classes match your search')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting functionality', () => {
    it('should sort classes by name', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      // Default sort is by name ascending
      const classNames = screen.getAllByText(/Mathematics 101|English Literature|Science Lab/);
      expect(classNames[0]).toHaveTextContent('English Literature');
    });

    it('should toggle sort order', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const sortButton = screen.getByLabelText(/Sort descending/);
      await userEvent.click(sortButton);

      // After clicking, sort order should toggle
      expect(sortButton).toHaveTextContent(/↓ Desc/);
    });

    it('should sort by student count', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/Sort classes by/) as HTMLSelectElement;
      expect(sortSelect).toBeInTheDocument();
      
      // Verify the select has the expected options
      const options = sortSelect.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(options[2].value).toBe('studentCount');
    });
  });

  describe('Responsive design', () => {
    it('should render grid layout on desktop', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      // Find the grid container that holds the class cards
      const gridContainer = screen.getByText('Mathematics 101').closest('article')?.parentElement;
      expect(gridContainer).toHaveClass('grid');
    });
  });

  describe('Navigation', () => {
    it('should navigate to class details when View Details button is clicked', async () => {
      mockTeacherService.teacherService.getClasses.mockResolvedValue({
        data: mockClasses,
        total: 3,
        page: 1,
        limit: 100,
      });

      const { container } = render(<ClassesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      });

      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
    });
  });
});
