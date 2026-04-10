import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TimetablePage } from './TimetablePage';
import * as studentService from '@services/api/studentService';
import type { Timetable } from '@types';

/**
 * Integration tests for TimetablePage
 * Tests the component with mocked API responses
 */

// Mock the student service
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getTimetable: vi.fn(),
  },
}));

// Mock the hooks
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn((query) => {
    if (query === '(max-width: 768px)') {
      return false; // Default to desktop view
    }
    return false;
  }),
}));

// Mock the components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children, variant }: any) => <span data-testid={`badge-${variant}`}>{children}</span>,
}));

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock URL.createObjectURL for download tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock data
const mockTimetableData: Timetable[] = [
  {
    id: '1',
    className: 'Mathematics 101',
    subject: 'Mathematics',
    teacherName: 'Mr. Smith',
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '10:00',
    roomNumber: 'Room 101',
  },
  {
    id: '2',
    className: 'English Literature',
    subject: 'English',
    teacherName: 'Ms. Johnson',
    dayOfWeek: 1, // Monday
    startTime: '10:30',
    endTime: '11:30',
    roomNumber: 'Room 102',
  },
  {
    id: '3',
    className: 'Physics Lab',
    subject: 'Physics',
    teacherName: 'Dr. Brown',
    dayOfWeek: 3, // Wednesday
    startTime: '14:00',
    endTime: '15:30',
    roomNumber: 'Lab 1',
  },
  {
    id: '4',
    className: 'Chemistry Lecture',
    subject: 'Chemistry',
    teacherName: 'Prof. Davis',
    dayOfWeek: 5, // Friday
    startTime: '11:00',
    endTime: '12:00',
    roomNumber: 'Room 201',
  },
];

describe('TimetablePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.studentService.getTimetable as any).mockResolvedValue(mockTimetableData);
  });

  it('loads and displays timetable data from API', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      expect(screen.getByText('English Literature')).toBeInTheDocument();
      expect(screen.getByText('Physics Lab')).toBeInTheDocument();
      expect(screen.getByText('Chemistry Lecture')).toBeInTheDocument();
    });
  });

  it('displays all class details from API response', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      // Check teachers
      expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Ms. Johnson')).toBeInTheDocument();
      expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
      expect(screen.getByText('Prof. Davis')).toBeInTheDocument();

      // Check rooms
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
      expect(screen.getByText('Lab 1')).toBeInTheDocument();
      expect(screen.getByText('Room 201')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (studentService.studentService.getTimetable as any).mockRejectedValueOnce(
      new Error('Server error')
    );

    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('handles empty timetable response', async () => {
    (studentService.studentService.getTimetable as any).mockResolvedValueOnce([]);

    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('No classes scheduled for this week')).toBeInTheDocument();
    });
  });

  it('fetches timetable with correct week parameter', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    });

    expect(studentService.studentService.getTimetable).toHaveBeenCalled();
    const callArgs = (studentService.studentService.getTimetable as any).mock.calls[0][0];
    expect(callArgs).toHaveProperty('week');
  });

  it('refetches timetable when navigating weeks', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    });

    const initialCallCount = (studentService.studentService.getTimetable as any).mock.calls.length;

    // Navigate to next week
    const nextButton = screen.getAllByText('Next')[0];
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect((studentService.studentService.getTimetable as any).mock.calls.length).toBeGreaterThan(
        initialCallCount
      );
    });
  });

  it('exports calendar with all classes', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('displays week navigation controls', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    });

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('displays week range in header', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      const weekLabel = screen.getByText(/Week of/);
      expect(weekLabel).toBeInTheDocument();
    });
  });

  it('organizes classes by day of week', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
      expect(screen.getByText('Physics Lab')).toBeInTheDocument();
    });

    // Verify classes are displayed (organization is tested in unit tests)
    expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
  });

  it('displays class times in readable format', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    });

    // Times should be displayed (exact format depends on locale)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays subject information for each class', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
      expect(screen.getByText('Chemistry')).toBeInTheDocument();
    });
  });

  it('displays room/location information for each class', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
      expect(screen.getByText('Lab 1')).toBeInTheDocument();
      expect(screen.getByText('Room 201')).toBeInTheDocument();
    });
  });

  it('displays teacher names for each class', async () => {
    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Mr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Ms. Johnson')).toBeInTheDocument();
      expect(screen.getByText('Dr. Brown')).toBeInTheDocument();
      expect(screen.getByText('Prof. Davis')).toBeInTheDocument();
    });
  });

  it('handles retry on error', async () => {
    (studentService.studentService.getTimetable as any).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<TimetablePage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);
    (studentService.studentService.getTimetable as any).mockResolvedValueOnce(mockTimetableData);

    await waitFor(() => {
      expect(studentService.studentService.getTimetable).toHaveBeenCalledTimes(2);
    });
  });
});
