import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';

/**
 * Teacher Messages Page
 * Professional chat application with full backend integration
 * Mobile-first responsive design with dark theme support
 * 
 * Backend Routes Used:
 * - GET /messages/inbox - Fetch received messages
 * - GET /messages/sent - Fetch sent messages
 * - GET /messages/unread-count - Get unread message count
 * - GET /messages/:id - Get specific message
 * - POST /messages - Send new message
 * - PATCH /messages/:id/read - Mark message as read
 * - DELETE /messages/:id - Delete message
 */

interface User {
  _id?: string;
  id?: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  senderId: User | string;
  receiverId: User | string;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Helper to get user ID from either populated user object or string
const getUserId = (userRef: User | string): string => {
  if (typeof userRef === 'string') return userRef;
  // Backend's toJSON transform converts _id to id, so check id first, then _id
  return userRef.id || userRef._id || '';
};

// Helper to get user object from reference
const getUserFromRef = (userRef: User | string): User => {
  if (typeof userRef === 'string') {
    return { _id: userRef, id: userRef, firstname: '', lastname: '', email: '' };
  }
  return userRef;
};

interface Conversation {
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

type TabType = 'inbox' | 'sent';

interface ComposeData {
  receiverId: string;
  subject: string;
  content: string;
}

export const TeacherMessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unreadCount, setUnreadCount] = useState(0);
  const [composeData, setComposeData] = useState<ComposeData>({
    receiverId: '',
    subject: '',
    content: '',
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: { unreadCount: number } }>('/messages/unread-count');
      setUnreadCount(response.data.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Load all users for compose
  const loadAllUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get<{ data: { users: User[] } }>('/users?limit=1000');
      const users = response.data.data?.users || [];
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load messages and build conversations
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      if (activeTab === 'inbox') {
        endpoint = '/messages/inbox?limit=100';
      } else if (activeTab === 'sent') {
        endpoint = '/messages/sent?limit=100';
      }

      const response = await apiClient.get<{ data: { messages: Message[] } }>(endpoint);
      const messages = response.data.data?.messages || [];

      if (Array.isArray(messages)) {
        setAllMessages(messages);
        buildConversations(messages);
      } else {
        setAllMessages([]);
        setConversations([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Build conversations from messages
  const buildConversations = (messages: Message[]) => {
    const conversationMap = new Map<string, Conversation>();

    messages.forEach((msg) => {
      const otherUser = activeTab === 'sent' ? msg.receiverId : msg.senderId;
      const userId = getUserId(otherUser);
      const user = getUserFromRef(otherUser);

      if (!conversationMap.has(userId)) {
        conversationMap.set(userId, {
          userId,
          user,
          lastMessage: msg,
          unreadCount: activeTab === 'inbox' && !msg.isRead ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(userId)!;
        if (activeTab === 'inbox' && !msg.isRead) {
          conv.unreadCount += 1;
        }
      }
    });

    setConversations(Array.from(conversationMap.values()));
  };

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, [loadMessages, loadUnreadCount]);

  useEffect(() => {
    if (showCompose) {
      loadAllUsers();
    }
  }, [showCompose, loadAllUsers]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, allMessages]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${conv.user.firstname} ${conv.user.lastname}`.toLowerCase().includes(searchLower) ||
      conv.user.email.toLowerCase().includes(searchLower)
    );
  });

  // Get messages with selected user
  const selectedUserMessages = selectedConversation
    ? allMessages.filter((msg) => {
        const otherUser = activeTab === 'sent' ? msg.receiverId : msg.senderId;
        const otherUserId = getUserId(otherUser);
        return otherUserId === selectedConversation.userId;
      })
    : [];

  // Handle send message
  const handleSendMessage = async () => {
    if (!composeData.receiverId || !composeData.subject || !composeData.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      console.log('Sending message with receiverId:', composeData.receiverId, 'Type:', typeof composeData.receiverId);
      
      await apiClient.post('/messages', {
        receiverId: composeData.receiverId,
        subject: composeData.subject,
        content: composeData.content,
      });

      setSuccess('Message sent successfully!');
      setComposeData({ receiverId: '', subject: '', content: '' });
      setShowCompose(false);
      await loadMessages();
      await loadUnreadCount();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  // Handle send reply
  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedConversation) {
      setError('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      setError(null);
      
      // Get the last message to use its subject
      const lastMsg = selectedUserMessages[selectedUserMessages.length - 1];
      const subject = lastMsg?.subject || 'Re: Message';
      
      // The conversation userId is already the correct user ID to reply to
      // (the other person in the conversation)
      const receiverId = selectedConversation.userId;
      
      console.log('Sending reply to receiverId:', receiverId);
      
      const response = await apiClient.post('/messages', {
        receiverId: receiverId,
        subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
        content: replyContent,
      });

      console.log('Reply response:', response.data);
      setSuccess('Reply sent successfully!');
      setReplyContent('');
      await loadMessages();
      await loadUnreadCount();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Reply error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await apiClient.patch(`/messages/${messageId}/read`);
      await loadMessages();
      await loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await apiClient.delete(`/messages/${messageId}`);
      setSuccess('Message deleted!');
      setSelectedConversation(null);
      await loadMessages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  // Handle select conversation
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    // Mark all messages as read
    selectedUserMessages.forEach((msg) => {
      if (!msg.isRead && activeTab === 'inbox') {
        handleMarkAsRead(msg._id);
      }
    });
  };

  return (
    <DashboardLayout title="Messages" description="Professional messaging system">
      <div className="h-screen -mx-4 sm:-mx-6 md:-mx-8 -my-4 sm:-my-6 md:-my-8 flex flex-col bg-white dark:bg-neutral-900">
        {/* Notifications */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border-b border-danger-200 dark:border-danger-900 p-3 sm:p-4">
            <p className="text-danger-700 dark:text-danger-200 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-success-50 dark:bg-success-950 border-b border-success-200 dark:border-success-900 p-3 sm:p-4">
            <p className="text-success-700 dark:text-success-200 text-sm">{success}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Messages</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-2"
            >
              <Icon name="Plus" size={18} />
              <span className="hidden sm:inline">New Message</span>
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
            {(['inbox', 'sent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedConversation(null);
                }}
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'inbox' && unreadCount > 0 && (
                  <Badge variant="danger" className="absolute -top-2 -right-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div
            className={`${
              isMobile && selectedConversation ? 'hidden' : 'w-full md:w-80'
            } bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden`}
          >
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
                <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                  <p className="mt-2">Loading...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                  No conversations yet
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.userId === conv.userId;
                  return (
                    <button
                      key={conv.userId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                          {conv.user.firstname.charAt(0)}
                          {conv.user.lastname.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {conv.user.firstname} {conv.user.lastname}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="primary" className="text-xs flex-shrink-0 ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                            {conv.lastMessage?.subject || conv.user.email}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate mt-1">
                              {conv.lastMessage.content.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              isMobile && !selectedConversation ? 'hidden' : 'flex-1'
            } flex flex-col bg-white dark:bg-neutral-900 overflow-hidden`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                      {selectedConversation.user.firstname.charAt(0)}
                      {selectedConversation.user.lastname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {selectedConversation.user.firstname} {selectedConversation.user.lastname}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {selectedConversation.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedUserMessages.length > 0) {
                          handleDeleteMessage(selectedUserMessages[0]._id);
                        }
                      }}
                      className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 p-2 hover:bg-danger-50 dark:hover:bg-danger-950 rounded-lg transition-colors"
                      title="Delete conversation"
                    >
                      <Icon name="Trash2" size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-4 bg-neutral-50 dark:bg-neutral-900">
                  {selectedUserMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Icon name="Mail" size={48} className="text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">No messages in this conversation</p>
                      </div>
                    </div>
                  ) : (
                    selectedUserMessages.map((msg) => {
                      const isOwn = activeTab === 'sent';
                      return (
                        <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${
                              isOwn
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <p className={`font-semibold text-sm ${isOwn ? 'text-primary-100' : ''}`}>
                              {msg.subject}
                            </p>
                            <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div className="flex items-center justify-between mt-2 gap-2">
                              <p
                                className={`text-xs ${
                                  isOwn ? 'text-primary-100' : 'text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                              {isOwn && msg.isRead && (
                                <Icon name="Check" size={14} className="text-primary-100" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Area */}
                <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      className="text-sm"
                      disabled={activeTab === 'sent' || sendingReply}
                    />
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleSendReply}
                      disabled={activeTab === 'sent' || sendingReply || !replyContent.trim()}
                    >
                      {sendingReply ? (
                        <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Icon name="Send" size={18} />
                      )}
                    </Button>
                  </div>
                  {activeTab === 'sent' && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                      You can only reply to received messages
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Mail" size={48} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {isMobile ? 'Select a conversation to start' : 'Select a conversation to view messages'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  New Message
                </h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    To *
                  </label>
                  <div className="relative">
                    <select
                      value={composeData.receiverId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        console.log('Selected user ID:', selectedId);
                        setComposeData({ ...composeData, receiverId: selectedId });
                      }}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a user...</option>
                      {loadingUsers ? (
                        <option disabled>Loading users...</option>
                      ) : allUsers.length === 0 ? (
                        <option disabled>No users available</option>
                      ) : (
                        allUsers.map((user) => {
                          const userId = getUserId(user);
                          return (
                            <option key={userId} value={userId}>
                              {user.firstname} {user.lastname} ({user.email})
                            </option>
                          );
                        })
                      )}
                    </select>
                    {composeData.receiverId && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Selected ID: {composeData.receiverId}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({ ...composeData, subject: e.target.value })
                    }
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) =>
                      setComposeData({ ...composeData, content: e.target.value })
                    }
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="primary" onClick={handleSendMessage}>
                  Send Message
                </Button>
                <Button variant="secondary" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeacherMessagesPage;
