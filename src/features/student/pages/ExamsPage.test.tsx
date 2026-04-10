import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamsPage } from './ExamsPage';
import * as studentService from '@services/api/studentService';

// Mock the service
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getExams: vi.fn(),
  },
}));

// Mock components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

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

vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

describe('ExamsPage', () => {
  const mockUpcomingExams = [
    {
      id: '1',
      name: 'Mathematics Final',
      subject: 'Mathematics',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      time: '10:00 AM',
      totalMarks: 100,
      hallLocation: 'Hall A',
      isUpcoming: true,
      daysUntilExam: 3,
      isWithin7Days: true,
    },
    {
      id: '2',
      name: 'English Midterm',
      subject: 'English',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      time: '02:00 PM',
      totalMarks: 80,
      hallLocation: 'Hall B',
      isUpcoming: true,
      daysUntilExam: 15,
      isWithin7Days: false,
    },
  ];

  const mockPastExams = [
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
      isUpcoming: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(studentService.studentService.getExams).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ExamsPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders exams page with title', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Exams')).toBeInTheDocument();
    });
  });

  it('displays upcoming exams by default', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
      expect(screen.getByText('English Midterm')).toBeInTheDocument();
    });
  });

  it('switches to past exams tab', async () => {
    vi.mocked(studentService.studentService.getExams)
      .mockResolvedValueOnce({
        data: mockUpcomingExams,
        pagination: { page: 1, limit: 10, total: 2, pages: 1 },
      })
      .mockResolvedValueOnce({
        data: mockPastExams,
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });

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

  it('filters exams by search query', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by exam name or subject/i);
    await userEvent.type(searchInput, 'Mathematics');

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
      expect(screen.queryByText('English Midterm')).not.toBeInTheDocument();
    });
  });

  it('displays visual indicator for exams within 7 days', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      const badges = screen.getAllByTestId('badge');
      const soonBadge = badges.find((badge) => badge.textContent?.includes('Soon'));
      expect(soonBadge).toBeInTheDocument();
    });
  });

  it('opens exam details modal when exam is clicked', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const examCards = screen.getAllByTestId('card');
    // Click the first exam card (not the search card)
    fireEvent.click(examCards[1]);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  it('displays exam details in modal', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const examCard = screen.getByText('Mathematics Final').closest('[data-testid="card"]');
    fireEvent.click(examCard!);

    await waitFor(() => {
      const modal = screen.getByTestId('modal');
      expect(within(modal).getByText('Mathematics')).toBeInTheDocument();
      expect(within(modal).getByText('Hall A')).toBeInTheDocument();
    });
  });

  it('displays past exam results in modal', async () => {
    vi.mocked(studentService.studentService.getExams)
      .mockResolvedValueOnce({
        data: mockUpcomingExams,
        pagination: { page: 1, limit: 10, total: 2, pages: 1 },
      })
      .mockResolvedValueOnce({
        data: mockPastExams,
        pagination: { page: 1, limit: 10, total: 1, pages: 1 },
      });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const pastTab = screen.getByRole('tab', { name: /past exams/i });
    fireEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.getByText('Science Midterm')).toBeInTheDocument();
    });

    const examCard = screen.getByText('Science Midterm').closest('[data-testid="card"]');
    fireEvent.click(examCard!);

    await waitFor(() => {
      const modal = screen.getByTestId('modal');
      expect(within(modal).getByText('Results')).toBeInTheDocument();
      expect(within(modal).getByText('Rank 5')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const examCard = screen.getByText('Mathematics Final').closest('[data-testid="card"]');
    fireEvent.click(examCard!);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    vi.mocked(studentService.studentService.getExams).mockRejectedValue(
      new Error('Failed to load exams')
    );

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load exams')).toBeInTheDocument();
    });
  });

  it('displays no exams message when list is empty', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('No upcoming exams scheduled')).toBeInTheDocument();
    });
  });

  it('clears search filter when clear button is clicked', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics Final')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by exam name or subject/i);
    await userEvent.type(searchInput, 'Mathematics');

    await waitFor(() => {
      expect(screen.queryByText('English Midterm')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('English Midterm')).toBeInTheDocument();
    });
  });

  it('displays exam hall location when available', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      expect(screen.getByText('Hall A')).toBeInTheDocument();
      expect(screen.getByText('Hall B')).toBeInTheDocument();
    });
  });

  it('sorts upcoming exams by date ascending', async () => {
    vi.mocked(studentService.studentService.getExams).mockResolvedValue({
      data: mockUpcomingExams,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });

    render(<ExamsPage />);

    await waitFor(() => {
      const exams = screen.getAllByTestId('card');
      expect(exams[1].textContent).toContain('Mathematics Final');
      expect(exams[2].textContent).toContain('English Midterm');
    });
  });
});
