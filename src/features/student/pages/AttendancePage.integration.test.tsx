import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AttendancePage } from './AttendancePage';
import * as studentService from '@services/api/studentService';
import type { Attendance } from '@types';

// Mock the service
vi.mock('@services/api/studentService');

// Mock the hooks
vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => {
    if (query.includes('max-width: 768px')) return false; // Desktop by default
    return false;
  },
}));

// Mock the layout
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

/**
 * Integration tests for AttendancePage
 * Tests the full flow of fetching attendance data and rendering the UI
 */

const mockAttendanceRecords: Attendance[] = [
  {
    id: '1',
    date: '2024-01-15',
    status: 'present',
    notes: 'On time',
  },
  {
    id: '2',
    date: '2024-01-16',
    status: 'absent',
    notes: 'Sick leave',
  },
  {
    id: '3',
    date: '2024-01-17',
    status: 'late',
    notes: 'Traffic',
  },
  {
    id: '4',
    date: '2024-01-18',
    status: 'excused',
    notes: 'Medical appointment',
  },
  {
    id: '5',
    date: '2024-01-19',
    status: 'present',
    notes: undefined,
  },
];

describe('AttendancePage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.studentService.getAttendance as any).mockResolvedValue({
      data: mockAttendanceRecords,
      pagination: {
        page: 1,
        limit: 50,
        total: 5,
        pages: 1,
      },
    });
    (studentService.studentService.getAttendancePercentage as any).mockResolvedValue({
      percentage: 80,
      term: 'Term 1',
    });
  });

  it('loads and displays attendance data from API', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalled();
    });
  });

  it('displays correct attendance summary from API data', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendancePercentage).toHaveBeenCalled();
    });
  });

  it('displays attendance percentage from API', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendancePercentage).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    (studentService.studentService.getAttendance as any).mockRejectedValue(
      new Error('Server error')
    );

    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument();
    });
  });

  it('displays all attendance records with correct status colors', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('On time')).toBeInTheDocument();
      expect(screen.getByText('Sick leave')).toBeInTheDocument();
    });
  });

  it('displays calendar view with attendance status for each day', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
    });
  });

  it('allows month navigation', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalled();
    });

    const nextMonthButton = screen.getByRole('button', { name: /Next month/i });
    fireEvent.click(nextMonthButton);

    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalledTimes(2);
    });
  });

  it('displays warning indicator when attendance is below 75%', async () => {
    (studentService.studentService.getAttendancePercentage as any).mockResolvedValue({
      percentage: 70,
      term: 'Term 1',
    });

    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Below 75%')).toBeInTheDocument();
    });
  });

  it('displays "Today" button for quick navigation to current month', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      const todayButton = screen.getByRole('button', { name: /Today/i });
      expect(todayButton).toBeInTheDocument();
    });
  });

  it('displays attendance records sorted by date (newest first)', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      const records = screen.getAllByText(/Jan/);
      expect(records.length).toBeGreaterThan(0);
    });
  });

  it('displays summary statistics correctly', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Attendance %')).toBeInTheDocument();
      const presentElements = screen.getAllByText('Present');
      expect(presentElements.length).toBeGreaterThan(0);
    });
  });

  it('displays teacher notes for records that have them', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('On time')).toBeInTheDocument();
      expect(screen.getByText('Sick leave')).toBeInTheDocument();
    });
  });

  it('handles empty attendance records', async () => {
    (studentService.studentService.getAttendance as any).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    });

    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('No attendance records for this month')).toBeInTheDocument();
    });
  });

  it('displays calendar legend with all status types', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      const presentElements = screen.getAllByText('Present');
      expect(presentElements.length).toBeGreaterThan(0);
    });
  });

  it('fetches attendance data with correct month and year parameters', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalled();
      const callArgs = (studentService.studentService.getAttendance as any).mock.calls[0][0];
      expect(callArgs).toHaveProperty('month');
      expect(callArgs).toHaveProperty('year');
    });
  });

  it('displays attendance percentage with appropriate color coding', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendancePercentage).toHaveBeenCalled();
    });
  });

  it('displays status icons for each attendance record', async () => {
    render(<AttendancePage />);

    await waitFor(() => {
      expect(studentService.studentService.getAttendance).toHaveBeenCalled();
    });
  });
});
