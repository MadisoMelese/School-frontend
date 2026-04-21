import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { apiClient } from '@services/api/client';

/**
 * Admin Messages Chat Page
 * Real chat app interface for admin messaging
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

export const MessagesManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        // Drafts would be stored locally
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
  }, [loadMessages]);

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

  return (
    <DashboardLayout title="Messages" description="Chat with users">
      <div className="h-screen -mx-4 sm:-mx-6 md:-mx-8 -my-4 sm:-my-6 md:-my-8 flex flex-col bg-white dark:bg-neutral-900">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Messages</h1>
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
                className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Users List */}
          <div
            className={`${
              isMobile && selectedMessage ? 'hidden' : 'w-full md:w-80'
            } bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden`}
          >
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
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
                  const isSelected = selectedMessage && 
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
                        if (msg) setSelectedMessage(msg);
                      }}
                      className={`w-full p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.firstname.charAt(0)}{user.lastname.charAt(0)}
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
                        {activeTab === 'sent' ? selectedMessage.receiverId.firstname : selectedMessage.senderId.firstname}{' '}
                        {activeTab === 'sent' ? selectedMessage.receiverId.lastname : selectedMessage.senderId.lastname}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {activeTab === 'sent' ? selectedMessage.receiverId.email : selectedMessage.senderId.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.isRead && activeTab === 'inbox' && (
                      <Badge variant="warning" className="text-xs">Unread</Badge>
                    )}
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
                          <p className={`text-xs mt-2 ${isOwn ? 'text-primary-100' : 'text-neutral-600 dark:text-neutral-400'}`}>
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
    </DashboardLayout>
  );
};

export default MessagesManagementPage;
