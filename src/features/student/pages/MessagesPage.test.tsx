import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagesPage } from './MessagesPage';
import * as studentService from '@services/api/studentService';

// Mock the student service
vi.mock('@services/api/studentService', () => ({
  studentService: {
    getMessages: vi.fn(),
    getUnreadMessageCount: vi.fn(),
    markMessageAsRead: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

// Mock the hooks
vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
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

vi.mock('@components/molecules/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@components/molecules/NotificationToast', () => ({
  NotificationToast: ({ type, message, onClose }: any) => (
    <div data-testid="notification" data-type={type}>
      {message}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

vi.mock('@components/atoms/Input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}));

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

const mockMessages = [
  {
    id: '1',
    sender: {
      id: 'sender1',
      firstname: 'John',
      lastname: 'Teacher',
      username: 'john.teacher',
      email: 'john@school.com',
      role: 'teacher' as const,
      isBlocked: false,
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    subject: 'Grade Update',
    content: 'Your grades have been updated',
    timestamp: '2024-01-15T10:00:00Z',
    isRead: false,
  },
  {
    id: '2',
    sender: {
      id: 'sender2',
      firstname: 'Admin',
      lastname: 'User',
      username: 'admin.user',
      email: 'admin@school.com',
      role: 'admin' as const,
      isBlocked: false,
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    subject: 'Announcement',
    content: 'School will be closed tomorrow',
    timestamp: '2024-01-14T09:00:00Z',
    isRead: true,
  },
];

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(studentService.studentService.getMessages).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<MessagesPage />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('loads and displays messages', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
  });

  it('displays unread message count', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText(/1 unread message/)).toBeInTheDocument();
    });
  });

  it('displays message details when message is selected', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });
    vi.mocked(studentService.studentService.markMessageAsRead).mockResolvedValue({
      message: 'Message marked as read',
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    // Verify message content is displayed
    expect(screen.getByText('Grade Update')).toBeInTheDocument();
    expect(screen.getByText('Your grades have been updated')).toBeInTheDocument();
  });

  it('filters messages by search query', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by sender, subject, or content...');
    await userEvent.type(searchInput, 'Grade');

    await waitFor(() => {
      expect(screen.getByText('Grade Update')).toBeInTheDocument();
      expect(screen.queryByText('Announcement')).not.toBeInTheDocument();
    });
  });

  it('opens compose modal when compose button is clicked', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    const composeButton = screen.getByLabelText('Compose new message');
    fireEvent.click(composeButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Compose Message')).toBeInTheDocument();
    });
  });

  it('validates message form before submission', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    const composeButton = screen.getByLabelText('Compose new message');
    fireEvent.click(composeButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Recipient is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message content is required')).toBeInTheDocument();
    });
  });

  it('sends message successfully', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    const newMessage = {
      id: '3',
      sender: {
        id: 'me',
        firstname: 'Me',
        lastname: 'User',
        username: 'me.user',
        email: 'me@school.com',
        role: 'student' as const,
        isBlocked: false,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      subject: 'Test Message',
      content: 'This is a test',
      timestamp: '2024-01-16T10:00:00Z',
      isRead: true,
    };

    vi.mocked(studentService.studentService.sendMessage).mockResolvedValue({
      message: newMessage,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    const composeButton = screen.getByLabelText('Compose new message');
    fireEvent.click(composeButton);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    // Fill form
    const recipientSelect = screen.getByLabelText('Select recipient');
    const subjectInput = screen.getByLabelText('Message subject');
    const contentInput = screen.getByLabelText('Message content');

    await userEvent.selectOptions(recipientSelect, 'sender1');
    await userEvent.type(subjectInput, 'Test Message');
    await userEvent.type(contentInput, 'This is a test');

    const sendButton = screen.getByText('Send Message');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(studentService.studentService.sendMessage).toHaveBeenCalledWith({
        recipientId: 'sender1',
        subject: 'Test Message',
        content: 'This is a test',
      });
    });

    // Check for success notification
    await waitFor(() => {
      expect(screen.getByTestId('notification')).toHaveAttribute('data-type', 'success');
    });
  });

  it('displays error message on API failure', async () => {
    vi.mocked(studentService.studentService.getMessages).mockRejectedValue(
      new Error('Network error')
    );
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 0,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays empty state when no messages', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 0,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });
  });

  it('clears search when clear button is clicked', async () => {
    vi.mocked(studentService.studentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    });
    vi.mocked(studentService.studentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    });

    render(<MessagesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by sender, subject, or content...');
    await userEvent.type(searchInput, 'Grade');

    await waitFor(() => {
      expect(screen.queryByText('Announcement')).not.toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Announcement')).toBeInTheDocument();
    });
  });
});
