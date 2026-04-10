import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { Modal } from '@components/molecules/Modal';
import { NotificationToast } from '@components/molecules/NotificationToast';
import { useDebounce } from '@hooks/useDebounce';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { parentService } from '@services/api/parentService';
import type { Message, SendMessageRequest } from '@types';
import { z } from 'zod';

/**
 * Parent Messages Page
 * Displays parent messages with inbox, compose form, search, filtering, and thread view
 * - Inbox with all received messages sorted by date (newest first)
 * - Mark messages as read when viewed
 * - Compose form to send new messages to teachers/administrators
 * - Search and filter messages by sender or subject in real-time
 * - Display unread message count
 * - Success notification on message send
 * - Notification badge for new messages
 * - Message thread view for conversations
 */

// Validation schema for message composition
const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(5000, 'Message must be less than 5000 characters'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormErrors {
  recipientId?: string;
  subject?: string;
  content?: string;
}

export const ParentMessagesPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Compose form state
  const [formData, setFormData] = useState<MessageFormData>({
    recipientId: '',
    subject: '',
    content: '',
  });
  const [formErrors, setFormErrors] = useState<MessageFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load messages data
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch messages
        const response = await parentService.getMessages();
        const sortedMessages = (response.data || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setMessages(sortedMessages);

        // Fetch unread count
        const countResponse = await parentService.getUnreadMessageCount();
        setUnreadCount(countResponse.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // Filter and search messages by sender or subject
  const filteredMessages = useMemo(() => {
    if (!debouncedSearchQuery) return messages;

    const query = debouncedSearchQuery.toLowerCase();
    return messages.filter(
      (msg) =>
        `${msg.sender.firstname} ${msg.sender.lastname}`.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query)
    );
  }, [messages, debouncedSearchQuery]);

  // Get unique recipients for compose form
  const recipients = useMemo(() => {
    const uniqueSenders = new Map<string, Message['sender']>();
    messages.forEach((msg) => {
      if (!uniqueSenders.has(msg.sender.id)) {
        uniqueSenders.set(msg.sender.id, msg.sender);
      }
    });
    return Array.from(uniqueSenders.values());
  }, [messages]);

  // Get message thread (all messages from same sender)
  const messageThread = useMemo(() => {
    if (!selectedMessage) return [];
    return messages
      .filter((msg) => msg.sender.id === selectedMessage.sender.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [selectedMessage, messages]);

  // Handle message selection and mark as read
  const handleSelectMessage = useCallback(async (message: Message) => {
    setSelectedMessage(message);

    // Mark as read if not already read
    if (!message.isRead) {
      try {
        await parentService.markMessageAsRead(message.id);

        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? { ...msg, isRead: true } : msg))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  }, []);

  // Handle form input change
  const handleFormChange = useCallback(
    (field: keyof MessageFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (formErrors[field]) {
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [formErrors]
  );

  // Handle message submission
  const handleSubmitMessage = useCallback(async () => {
    try {
      // Validate form
      const validationResult = messageSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors: MessageFormErrors = {};
        validationResult.error.errors.forEach((err) => {
          const field = err.path[0] as keyof MessageFormData;
          errors[field] = err.message;
        });
        setFormErrors(errors);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // Send message
      const response = await parentService.sendMessage(formData as SendMessageRequest);

      // Add new message to list
      setMessages((prev) => [response.message, ...prev]);

      // Reset form
      setFormData({ recipientId: '', subject: '', content: '' });
      setFormErrors({});
      setShowComposeModal(false);

      // Show success notification
      setNotification({ type: 'success', message: 'Message sent successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setNotification({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  // Handle close compose modal
  const handleCloseComposeModal = useCallback(() => {
    setShowComposeModal(false);
    setFormData({ recipientId: '', subject: '', content: '' });
    setFormErrors({});
  }, []);

  // Handle reset search
  const handleResetSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Messages" description="View and send messages to teachers">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Messages" description="View and send messages to teachers">
      <div className="space-y-6">
        {/* Notification Toast */}
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Header with Compose Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Inbox</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-neutral-600 mt-1">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-2"
            aria-label="Compose new message"
          >
            <Icon name="Plus" size={20} />
            {!isMobile && 'Compose'}
          </Button>
        </div>

        {/* Search Bar */}
        <Card>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700">Search Messages</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by sender or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                aria-label="Search messages"
              />
              <Icon name="Search" size={18} className="absolute left-3 top-3 text-neutral-400" />
              {searchQuery && (
                <button
                  onClick={handleResetSearch}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  aria-label="Clear search"
                >
                  <Icon name="X" size={18} />
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Messages Display */}
        {error ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
              <p className="text-danger-600 font-medium">{error}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleResetSearch}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="Mail" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">
                {searchQuery ? 'No messages found matching your search' : 'No messages yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !message.isRead ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                } ${selectedMessage?.id === message.id ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => handleSelectMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {message.sender.firstname} {message.sender.lastname}
                      </h3>
                      {!message.isRead && (
                        <Badge variant="info" size="sm">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-neutral-700 truncate mb-1">
                      {message.subject}
                    </p>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{message.content}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(message.timestamp).toLocaleDateString()} at{' '}
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!message.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Message Thread View Modal */}
        {selectedMessage && (
          <Modal
            isOpen={!!selectedMessage}
            onClose={() => setSelectedMessage(null)}
            title={`Conversation with ${selectedMessage.sender.firstname} ${selectedMessage.sender.lastname}`}
            size="lg"
          >
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messageThread.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg border ${
                    msg.id === selectedMessage.id
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {msg.sender.firstname} {msg.sender.lastname}
                      </p>
                      <p className="text-xs text-neutral-600">{msg.sender.email}</p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {new Date(msg.timestamp).toLocaleDateString()} at{' '}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {msg.id === selectedMessage.id && (
                    <p className="text-sm font-medium text-neutral-700 mb-2">
                      Subject: {msg.subject}
                    </p>
                  )}
                  <p className="text-sm text-neutral-900 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {/* Compose Message Modal */}
        <Modal
          isOpen={showComposeModal}
          onClose={handleCloseComposeModal}
          title="Compose Message"
          size="lg"
        >
          <div className="space-y-4">
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Recipient <span className="text-danger-600">*</span>
              </label>
              <select
                value={formData.recipientId}
                onChange={(e) => handleFormChange('recipientId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  formErrors.recipientId ? 'border-danger-500' : 'border-neutral-300'
                }`}
                aria-label="Select recipient"
              >
                <option value="">Select a teacher or administrator...</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.firstname} {recipient.lastname}
                  </option>
                ))}
              </select>
              {formErrors.recipientId && (
                <p className="text-sm text-danger-600 mt-1">{formErrors.recipientId}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Subject <span className="text-danger-600">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter message subject..."
                value={formData.subject}
                onChange={(e) => handleFormChange('subject', e.target.value)}
                className={formErrors.subject ? 'border-danger-500' : ''}
                aria-label="Message subject"
              />
              {formErrors.subject && (
                <p className="text-sm text-danger-600 mt-1">{formErrors.subject}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Message <span className="text-danger-600">*</span>
              </label>
              <textarea
                placeholder="Enter your message..."
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                  formErrors.content ? 'border-danger-500' : 'border-neutral-300'
                }`}
                aria-label="Message content"
              />
              <div className="flex items-center justify-between mt-1">
                {formErrors.content && (
                  <p className="text-sm text-danger-600">{formErrors.content}</p>
                )}
                <p className="text-xs text-neutral-500 ml-auto">{formData.content.length}/5000</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-neutral-200">
              <Button variant="secondary" onClick={handleCloseComposeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMessage} loading={isSubmitting} disabled={isSubmitting}>
                Send Message
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ParentMessagesPage;
