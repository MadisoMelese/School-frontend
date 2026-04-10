import React, { useState, useRef, useEffect } from 'react'
import { User, Message } from '../../types'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { Avatar } from '../atoms/Avatar'
import { Icon } from '../atoms/Icon'
import { Spinner } from '../atoms/Spinner'

export interface MessageThreadProps {
  messages: Message[]
  currentUser: User
  onSendMessage: (content: string) => Promise<void>
  loading?: boolean
  recipientName?: string
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUser,
  onSendMessage,
  loading = false,
  recipientName,
}) => {
  const [messageContent, setMessageContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      return
    }

    try {
      setSending(true)
      setError(null)
      await onSendMessage(messageContent)
      setMessageContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-white">
          {recipientName || 'Message Thread'}
        </h3>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Message thread"
        aria-live="polite"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSent = message.sender.id === currentUser.id
            const showAvatar =
              index === 0 ||
              messages[index - 1].sender.id !== message.sender.id

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {showAvatar ? (
                  <Avatar
                    name={`${message.sender.firstname} ${message.sender.lastname}`}
                    src={message.sender.avatar}
                    size="sm"
                    className="flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 flex-shrink-0" />
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col gap-1 max-w-xs ${isSent ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {message.sender.firstname} {message.sender.lastname}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isSent
                        ? 'bg-primary-600 dark:bg-primary-700 text-white rounded-br-none'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-danger-50 dark:bg-danger-900/20 border-t border-danger-200 dark:border-danger-700 text-danger-700 dark:text-danger-400 text-sm">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending || loading}
            aria-label="Message input"
            className="flex-1"
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleSendMessage}
            disabled={!messageContent.trim() || sending || loading}
            loading={sending}
            aria-label="Send message"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
