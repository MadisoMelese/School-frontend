import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ParentMessagesPage } from './MessagesPage'
import * as parentService from '@services/api/parentService'

// Mock the parent service
vi.mock('@services/api/parentService', () => ({
  parentService: {
    getMessages: vi.fn(),
    getUnreadMessageCount: vi.fn(),
    markMessageAsRead: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

// Mock the hooks
vi.mock('@hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

vi.mock('@hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}))

// Mock the components
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('@components/molecules/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@components/molecules/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => (
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}))

vi.mock('@components/molecules/NotificationToast', () => ({
  NotificationToast: ({ type, message, onClose }: any) => (
    <div data-testid="notification" data-type={type}>
      {message}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

vi.mock('@components/atoms/Button', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  ),
}))

vi.mock('@components/atoms/Input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('@components/atoms/Badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}))

vi.mock('@components/atoms/Icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>,
}))

vi.mock('@components/atoms/Spinner', () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}))

const mockMessages = [
  {
    id: '1',
    sender: { id: 'teacher1', name: 'John Teacher', email: 'john@school.com', role: 'teacher' as const, status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    subject: 'Your child progress update',
    content: 'Your child is doing well in class',
    timestamp: '2024-01-15T10:00:00Z',
    isRead: false,
  },
  {
    id: '2',
    sender: { id: 'admin1', name: 'School Admin', email: 'admin@school.com', role: 'admin' as const, status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    subject: 'Fee payment reminder',
    content: 'Please pay the pending fees',
    timestamp: '2024-01-14T09:00:00Z',
    isRead: true,
  },
]

describe('ParentMessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(parentService.parentService.getMessages).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<ParentMessagesPage />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('loads and displays messages', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
      expect(screen.getByText('School Admin')).toBeInTheDocument()
    })
  })

  it('displays unread message count', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText(/1 unread message/)).toBeInTheDocument()
    })
  })

  it('filters messages by sender name', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by sender or subject...')
    await userEvent.type(searchInput, 'John')

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
      expect(screen.queryByText('School Admin')).not.toBeInTheDocument()
    })
  })

  it('filters messages by subject', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by sender or subject...')
    await userEvent.type(searchInput, 'progress')

    await waitFor(() => {
      expect(screen.getByText('Your child progress update')).toBeInTheDocument()
      expect(screen.queryByText('Fee payment reminder')).not.toBeInTheDocument()
    })
  })

  it('displays message thread when message is selected', async () => {
    const threadMessages = [
      mockMessages[0],
      {
        ...mockMessages[0],
        id: '3',
        content: 'Follow up message',
        timestamp: '2024-01-16T10:00:00Z',
        isRead: true,
      },
    ]

    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: threadMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })
    vi.mocked(parentService.parentService.markMessageAsRead).mockResolvedValue({
      message: 'Message marked as read',
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getAllByText('John Teacher').length).toBeGreaterThan(0)
    })

    // Verify thread messages are displayed
    expect(screen.getAllByText('Your child progress update').length).toBeGreaterThan(0)
    expect(screen.getByText('Your child is doing well in class')).toBeInTheDocument()
    expect(screen.getByText('Follow up message')).toBeInTheDocument()
  })

  it('opens compose modal when compose button is clicked', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const composeButton = screen.getByLabelText('Compose new message')
    fireEvent.click(composeButton)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByText('Compose Message')).toBeInTheDocument()
    })
  })

  it('validates message form before submission', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const composeButton = screen.getByLabelText('Compose new message')
    fireEvent.click(composeButton)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const sendButton = screen.getByText('Send Message')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Recipient is required')).toBeInTheDocument()
      expect(screen.getByText('Subject is required')).toBeInTheDocument()
      expect(screen.getByText('Message content is required')).toBeInTheDocument()
    })
  })

  it('sends message to teacher successfully', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    const newMessage = {
      id: '4',
      sender: { id: 'me', name: 'Me', email: 'me@school.com', role: 'parent' as const, status: 'active' as const, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
      subject: 'Question about homework',
      content: 'Can you help with the homework?',
      timestamp: '2024-01-16T10:00:00Z',
      isRead: true,
    }

    vi.mocked(parentService.parentService.sendMessage).mockResolvedValue({
      message: newMessage,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const composeButton = screen.getByLabelText('Compose new message')
    fireEvent.click(composeButton)

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    // Fill form
    const recipientSelect = screen.getByLabelText('Select recipient')
    const subjectInput = screen.getByLabelText('Message subject')
    const contentInput = screen.getByLabelText('Message content')

    await userEvent.selectOptions(recipientSelect, 'teacher1')
    await userEvent.type(subjectInput, 'Question about homework')
    await userEvent.type(contentInput, 'Can you help with the homework?')

    const sendButton = screen.getByText('Send Message')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(parentService.parentService.sendMessage).toHaveBeenCalledWith({
        recipientId: 'teacher1',
        subject: 'Question about homework',
        content: 'Can you help with the homework?',
      })
    })

    // Check for success notification
    await waitFor(() => {
      expect(screen.getByTestId('notification')).toHaveAttribute('data-type', 'success')
    })
  })

  it('displays error message on API failure', async () => {
    vi.mocked(parentService.parentService.getMessages).mockRejectedValue(
      new Error('Network error')
    )
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 0,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('displays empty state when no messages', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 0,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument()
    })
  })

  it('marks message as read when selected', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })
    vi.mocked(parentService.parentService.markMessageAsRead).mockResolvedValue({
      message: 'Message marked as read',
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getAllByText('John Teacher').length).toBeGreaterThan(0)
    })

    // Verify unread message is displayed with New badge
    const badges = screen.getAllByTestId('badge')
    expect(badges.some(badge => badge.textContent === 'New')).toBe(true)
  })

  it('clears search when clear button is clicked', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByText('John Teacher')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by sender or subject...')
    await userEvent.type(searchInput, 'John')

    await waitFor(() => {
      expect(screen.queryByText('School Admin')).not.toBeInTheDocument()
    })

    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('School Admin')).toBeInTheDocument()
    })
  })

  it('displays notification badge for new messages', async () => {
    vi.mocked(parentService.parentService.getMessages).mockResolvedValue({
      data: mockMessages,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 },
    })
    vi.mocked(parentService.parentService.getUnreadMessageCount).mockResolvedValue({
      count: 1,
    })

    render(<ParentMessagesPage />)

    await waitFor(() => {
      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByTestId('badge')).toHaveTextContent('New')
    })
  })
})
