import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageThread } from './MessageThread'
import { User, Message } from '../../types'

describe('MessageThread Component', () => {
  const currentUser: User = {
    id: '1',
    email: 'user@example.com',
    firstname: 'John',
    lastname: 'Doe',
    username: 'john.doe',
    role: 'student',
    isBlocked: false,
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const otherUser: User = {
    id: '2',
    email: 'teacher@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    username: 'jane.smith',
    role: 'teacher',
    isBlocked: false,
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockMessages: Message[] = [
    {
      id: '1',
      sender: otherUser,
      subject: 'Grades',
      content: 'Your grades have been updated',
      timestamp: new Date().toISOString(),
      isRead: true,
    },
    {
      id: '2',
      sender: currentUser,
      subject: 'Grades',
      content: 'Thank you for the update',
      timestamp: new Date().toISOString(),
      isRead: true,
    },
  ]

  it('renders message thread', () => {
    const onSendMessage = vi.fn()
    const { container } = render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
        recipientName="Jane Smith"
      />
    )

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(container).toBeInTheDocument()
  })

  it('displays loading state', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={[]}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
        loading={true}
      />
    )

    const log = screen.getByRole('log')
    expect(log).toBeInTheDocument()
  })

  it('displays empty state when no messages', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={[]}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument()
  })

  it('sends message when send button is clicked', async () => {
    const onSendMessage = vi.fn().mockResolvedValue(undefined)
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const input = screen.getByPlaceholderText('Type a message...')
    const sendButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'Hello!' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Hello!')
    })
  })

  it('sends message on Enter key press', async () => {
    const onSendMessage = vi.fn().mockResolvedValue(undefined)
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const input = screen.getByPlaceholderText('Type a message...')

    fireEvent.change(input, { target: { value: 'Hello!' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Hello!')
    })
  })

  it('disables send button when message is empty', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const sendButton = screen.getByLabelText('Send message')
    expect(sendButton).toBeDisabled()
  })

  it('displays error message when send fails', async () => {
    const onSendMessage = vi.fn().mockRejectedValue(new Error('Send failed'))
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const input = screen.getByPlaceholderText('Type a message...')
    const sendButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'Hello!' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Send failed')).toBeInTheDocument()
    })
  })

  it('displays sent messages on the right', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const sentMessage = screen.getByText('Thank you for the update')
    const bubble = sentMessage.closest('div')
    expect(bubble).toHaveClass('bg-primary-600')
  })

  it('displays received messages on the left', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const receivedMessage = screen.getByText('Your grades have been updated')
    const bubble = receivedMessage.closest('div')
    expect(bubble).toHaveClass('bg-neutral-100')
  })

  it('has proper accessibility attributes', () => {
    const onSendMessage = vi.fn()
    render(
      <MessageThread
        messages={mockMessages}
        currentUser={currentUser}
        onSendMessage={onSendMessage}
      />
    )

    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
  })
})
