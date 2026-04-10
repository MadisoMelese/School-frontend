import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamsPage } from './ExamsPage';
import * as studentService from '@services/api/studentService';
import type { Exam } from '@types';

// Mock the service
vi.mock('@services/api/studentService');

// Mock the hooks
vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

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

// Mock components
vi.mock('@components/molecules/Card', () => ({
  Card: ({ children, onClick }: any) => (
    <div data-testid="card" onClick={onClick}>
      {children}
    </div>
  ),
}));

vi.mock('@components/molecules/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) =>
    isOpen && (
      <div data-testid="modal" role="dialog">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ),
}));

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@components/atoms/Input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

const mockUpcomingExams: Exam[] = [
  {
    id: '1',
    name: 'Mathematics Final',
    subject: 'Mathematics',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM',
    totalMarks: 100,
    hallLocation: 'Hall A',
  },
  {
    id: '2',
    name: 'English Midterm',
    subject: 'English',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    time: '02:00 PM',
    totalMarks: 80,
    hallLocation: 'Hall B',
  },
];

const mockPastExams: Exam[] = [
  {
    id: '3',
    name: 'Science Midterm',
    subject: 'Science',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00 AM',
    totalMarks: 100,
    hallLocation: 'Hall C',
    result: {
      marksObtained: 85,
      grade: 'A',
      rank: 5,
    },
  },
];

describe('ExamsPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.studentService.getExams as any).mockImplementation(
      (params?: { status?: 'upcoming' | 'past' }) => {
        if (params?.status === 'upcoming') {
          return Promise.resolve({
            data: mockUpcomingExams,
            pagination: { page: 1, limit: 10, total: 2, pages: 1 },
          });
        }
        if (params?.status === 'past') {
          return Promise.resolve({
            data: mockPastExams,
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
          });
        }
        return Promise.resolve({
          data: [...mockUpcomingExams, ...mockPastExams],
          pagination: { page: 1, limit: 10, total: 3, pages: 1 },
        });
      }
    );
  });

  it('loads and displays upcoming exams on initial render', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
      expect(screen.getByText('English Midterm')).toBeInTheDocument();
    });
  });

  it('loads and displays past exams when tab is switched', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const pastTab = screen.getByRole('tab', { name: /past exams/i });
    fireEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Science Midterm')).toBeInTheDocument();
    });
  });

  it('filters exams by search query in real-time', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by exam name or subject/i);
    await userEvent.type(searchInput, 'English');

    await waitFor(() => {
      expect(screen.queryByText('Mathematics Final')).not.toBeInTheDocument();
      expect(screen.getByText('English Midterm')).toBeInTheDocument();
    });
  });

  it('displays exam details modal with all information', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const examCards = screen.getAllByTestId('card');
    fireEvent.click(examCards[1]);

    await waitFor(() => {
      const modal = screen.getByTestId('modal');
      expect(within(modal).getByText('Mathematics')).toBeInTheDocument();
      expect(within(modal).getByText('Hall A')).toBeInTheDocument();
    });
  });

  it('displays past exam results with marks, grade, and rank', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const pastTab = screen.getByRole('tab', { name: /past exams/i });
    fireEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Science Midterm')).toBeInTheDocument();
    });

    const examCards = screen.getAllByTestId('card');
    fireEvent.click(examCards[1]);

    await waitFor(() => {
      const modal = screen.getByTestId('modal');
      expect(within(modal).getByText('Results')).toBeInTheDocument();
      expect(within(modal).getByText('Rank 5')).toBeInTheDocument();
    });
  });

  it('displays visual indicator for exams within 7 days', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      const soonBadge = badges.find((badge) => badge.textContent?.includes('Soon'));
      expect(soonBadge).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (studentService.studentService.getExams as any).mockRejectedValue(
      new Error('Failed to load exams')
    );

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load exams/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no exams match search', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by exam name or subject/i);
    await userEvent.type(searchInput, 'NonexistentExam');

    await waitFor(() => {
      expect(screen.getByText('No upcoming exams scheduled')).toBeInTheDocument();
    });
  });

  it('maintains search filter when switching tabs', async () => {
    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by exam name or subject/i);
    await userEvent.type(searchInput, 'Science');

    await waitFor(() => {
      expect(screen.getByText('No upcoming exams scheduled')).toBeInTheDocument();
    });

    const pastTab = screen.getByRole('tab', { name: /past exams/i });
    fireEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Science Midterm')).toBeInTheDocument();
    });
  });
});
