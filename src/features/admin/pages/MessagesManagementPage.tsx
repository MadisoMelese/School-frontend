import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';

/**
 * Admin Messages Chat Page
 * Real chat app interface for admin messaging with full backend integration
 */

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  senderId: User;
  receiverId: User;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

type TabType = 'inbox' | 'sent' | 'drafts';

interface ComposeData {
  receiverId: string;
  subject: string;
  content: string;
}

export const MessagesManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drafts, setDrafts] = useState<ComposeData[]>([]);
  const [composeData, setComposeData] = useState<ComposeData>({
    receiverId: '',
    subject: '',
    content: '',
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
      const response = await apiClient.get<{ data: { data: User[] } }>('/users?limit=1000');
      const users = response.data.data?.data || [];
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      if (activeTab === 'inbox') {
        endpoint = '/messages/inbox?limit=100';
      } else if (activeTab === 'sent') {
        endpoint = '/messages/sent?limit=100';
      } else {
        // Load drafts from localStorage
        const savedDrafts = localStorage.getItem('messageDrafts');
        setDrafts(savedDrafts ? JSON.parse(savedDrafts) : []);
        setMessages([]);
        setLoading(false);
        return;
      }

      const response = await apiClient.get<{ data: { messages: Message[] } }>(endpoint);
      const data = response.data.data;

      if (data?.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
    if (showCompose) {
      loadAllUsers();
    }
  }, [loadMessages, loadUnreadCount, showCompose]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessage]);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const otherUser = activeTab === 'sent' ? msg.receiverId : msg.senderId;
    const searchLower = searchTerm.toLowerCase();
    return (
      `${otherUser.firstname} ${otherUser.lastname}`.toLowerCase().includes(searchLower) ||
      otherUser.email.toLowerCase().includes(searchLower) ||
      msg.subject.toLowerCase().includes(searchLower)
    );
  });

  // Get unique users
  const uniqueUsers = Array.from(
    new Map(
      filteredMessages.map((msg) => {
        const user = activeTab === 'sent' ? msg.receiverId : msg.senderId;
        return [user._id, user];
      })
    ).values()
  );

  // Get messages with selected user
  const selectedUserMessages = selectedMessage
    ? filteredMessages.filter((msg) => {
        const otherUser = activeTab === 'sent' ? msg.receiverId : msg.senderId;
        const selectedUser = activeTab === 'sent' ? selectedMessage.receiverId : selectedMessage.senderId;
        return otherUser._id === selectedUser._id;
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

  // Handle save draft
  const handleSaveDraft = () => {
    if (!composeData.receiverId || !composeData.subject || !composeData.content) {
      setError('Please fill in all fields');
      return;
    }

    const savedDrafts = localStorage.getItem('messageDrafts');
    const draftsList = savedDrafts ? JSON.parse(savedDrafts) : [];
    draftsList.push(composeData);
    localStorage.setItem('messageDrafts', JSON.stringify(draftsList));

    setSuccess('Draft saved!');
    setComposeData({ receiverId: '', subject: '', content: '' });
    setShowCompose(false);
    setTimeout(() => setSuccess(null), 3000);
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
      setSelectedMessage(null);
      await loadMessages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  // Handle use draft
  const handleUseDraft = (draft: ComposeData) => {
    setComposeData(draft);
    setShowCompose(true);
  };

  return (
    <DashboardLayout title="Messages" description="Chat with users">
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
            {(['inbox', 'sent', 'drafts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedMessage(null);
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
          {/* Users/Drafts List */}
          <div
            className={`${
              isMobile && selectedMessage ? 'hidden' : 'w-full md:w-80'
            } bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden`}
          >
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Input
                type="text"
                placeholder={activeTab === 'drafts' ? 'Search drafts...' : 'Search users...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {activeTab === 'drafts' ? (
                // Drafts List
                drafts.length === 0 ? (
                  <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                    No drafts yet
                  </div>
                ) : (
                  drafts.map((draft, idx) => {
                    const receiver = allUsers.find((u) => u._id === draft.receiverId);
                    return (
                      <div
                        key={idx}
                        className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => handleUseDraft(draft)}
                      >
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {receiver?.firstname} {receiver?.lastname}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {draft.subject}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate mt-1">
                          {draft.content}
                        </p>
                      </div>
                    );
                  })
                )
              ) : (
                // Messages List
                loading ? (
                  <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                    Loading...
                  </div>
                ) : uniqueUsers.length === 0 ? (
                  <div className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                    No messages yet
                  </div>
                ) : (
                  uniqueUsers.map((user) => {
                    const lastMsg = filteredMessages.find((msg) => {
                      const otherUser = activeTab === 'sent' ? msg.receiverId : msg.senderId;
                      return otherUser._id === user._id;
                    });
                    const isSelected =
                      selectedMessage &&
                      ((activeTab === 'sent' && selectedMessage.receiverId._id === user._id) ||
                        (activeTab === 'inbox' && selectedMessage.senderId._id === user._id));

                    return (
                      <button
                        key={user._id}
                        onClick={() => {
                          const msg = filteredMessages.find((m) => {
                            const otherUser = activeTab === 'sent' ? m.receiverId : m.senderId;
                            return otherUser._id === user._id;
                          });
                          if (msg) {
                            setSelectedMessage(msg);
                            if (!msg.isRead && activeTab === 'inbox') {
                              handleMarkAsRead(msg._id);
                            }
                          }
                        }}
                        className={`w-full p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 text-left transition-colors ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-900'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.firstname.charAt(0)}
                            {user.lastname.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {user.firstname} {user.lastname}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                              {lastMsg?.subject || user.email}
                            </p>
                            {lastMsg && !lastMsg.isRead && activeTab === 'inbox' && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full mt-1" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              isMobile && !selectedMessage ? 'hidden' : 'flex-1'
            } flex flex-col bg-white dark:bg-neutral-900 overflow-hidden`}
          >
            {selectedMessage ? (
              <>
                {/* Chat Header */}
                <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </button>
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {activeTab === 'sent'
                          ? selectedMessage.receiverId.firstname
                          : selectedMessage.senderId.firstname}{' '}
                        {activeTab === 'sent'
                          ? selectedMessage.receiverId.lastname
                          : selectedMessage.senderId.lastname}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {activeTab === 'sent'
                          ? selectedMessage.receiverId.email
                          : selectedMessage.senderId.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.isRead && activeTab === 'inbox' && (
                      <Badge variant="warning" className="text-xs">
                        Unread
                      </Badge>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage._id)}
                      className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                    >
                      <Icon name="Trash2" size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-4">
                  {selectedUserMessages.map((msg) => {
                    const isOwn = activeTab === 'sent';
                    return (
                      <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                          }`}
                        >
                          <p className="font-semibold text-sm">{msg.subject}</p>
                          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{msg.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isOwn ? 'text-primary-100' : 'text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Area */}
                <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a reply..."
                      className="text-sm"
                      disabled
                    />
                    <Button variant="primary" size="sm" disabled>
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    Reply feature coming soon
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Mail" size={48} className="text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {isMobile ? 'Select a message to start' : 'Select a user to view messages'}
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
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
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
                    To
                  </label>
                  <select
                    value={composeData.receiverId}
                    onChange={(e) =>
                      setComposeData({ ...composeData, receiverId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a user...</option>
                    {loadingUsers ? (
                      <option>Loading users...</option>
                    ) : (
                      allUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstname} {user.lastname} ({user.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject
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
                    Message
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
                <Button variant="secondary" onClick={handleSaveDraft}>
                  Save Draft
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

export default MessagesManagementPage;
