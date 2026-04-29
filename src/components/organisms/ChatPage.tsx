import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '@components/atoms/Icon';
import { Badge } from '@components/atoms/Badge';
import { Spinner } from '@components/atoms/Spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  _id?: string;
  id?: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Message {
  _id: string;
  senderId: User | string;
  receiverId: User | string;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface ComposeData {
  receiverId: string;
  subject: string;
  content: string;
}

export interface ChatPageProps {
  // Data
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  allUsers: User[];

  // State
  loading: boolean;
  loadingMessages: boolean;
  loadingUsers: boolean;
  unreadCount: number;
  searchTerm: string;
  replyContent: string;
  replySubject: string;
  showCompose: boolean;
  composeData: ComposeData;
  isTyping: boolean;
  sendingReply: boolean;
  error: string | null;
  success: string | null;

  // Callbacks
  onSearchChange: (term: string) => void;
  onSelectConversation: (conv: Conversation) => void;
  onBackToList: () => void;
  onReplyChange: (content: string) => void;
  onSubjectChange: (subject: string) => void;
  onSendReply: () => void;
  onShowCompose: () => void;
  onHideCompose: () => void;
  onComposeChange: (field: keyof ComposeData, value: string) => void;
  onSendCompose: () => void;
  onDeleteMessage: (messageId: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

const getUserId = (userRef: User | string): string => {
  if (typeof userRef === 'string') return userRef;
  return userRef.id || userRef._id || '';
};

const getInitials = (user: User): string => {
  return `${user.firstname?.charAt(0) ?? ''}${user.lastname?.charAt(0) ?? ''}`.toUpperCase();
};

const formatMessageTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatConversationTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getDateSeparator = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

const shouldShowDateSeparator = (current: Message, previous: Message | undefined): boolean => {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', showOnline = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold select-none`}
      >
        {getInitials(user)}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-500 border-2 border-white dark:border-neutral-900 rounded-full" />
      )}
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start px-4 py-1">
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ─── Date Separator ───────────────────────────────────────────────────────────

const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 my-4 px-4">
    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
  </div>
);

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conv, isActive, onClick }) => {
  const hasUnread = conv.unreadCount > 0;
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-start gap-3 transition-colors text-left border-b border-neutral-100 dark:border-neutral-800 ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-950 border-l-2 border-l-primary-600'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-l-2 border-l-transparent'
      }`}
      aria-current={isActive ? 'true' : undefined}
    >
      <Avatar user={conv.user} size="md" showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={`text-sm truncate ${
              hasUnread
                ? 'font-semibold text-neutral-900 dark:text-white'
                : 'font-medium text-neutral-700 dark:text-neutral-300'
            }`}
          >
            {conv.user.firstname} {conv.user.lastname}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap flex-shrink-0">
            {conv.lastMessage ? formatConversationTime(conv.lastMessage.createdAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {conv.lastMessage?.content ?? conv.user.email}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 mb-1`}>
    <div
      className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
        isOwn
          ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
          : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl rounded-tl-sm'
      } px-4 py-2.5 shadow-sm`}
    >
      {message.subject && (
        <p
          className={`text-xs font-semibold mb-1 ${
            isOwn ? 'text-primary-100' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {message.subject}
        </p>
      )}
      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-200' : 'text-neutral-400 dark:text-neutral-500'}`}>
        <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
        {isOwn && (
          <span className="flex items-center">
            {message.isRead ? (
              // Double check — read
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-primary-200">
                <path d="M1 5L5 9L15 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 5L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              // Single check — sent
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="text-primary-200">
                <path d="M1 5L5 9L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  </div>
);

// ─── Compose Modal ────────────────────────────────────────────────────────────

interface ComposeModalProps {
  composeData: ComposeData;
  allUsers: User[];
  loadingUsers: boolean;
  onComposeChange: (field: keyof ComposeData, value: string) => void;
  onSendCompose: () => void;
  onHideCompose: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({
  composeData,
  allUsers,
  loadingUsers,
  onComposeChange,
  onSendCompose,
  onHideCompose,
}) => {
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(
      (u) =>
        `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  const selectedUser = allUsers.find((u) => getUserId(u) === composeData.receiverId);

  const canSend = composeData.receiverId && composeData.subject.trim() && composeData.content.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="New Message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onHideCompose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-neutral-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">New Message</h2>
          <button
            onClick={onHideCompose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Close"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* To field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
              To
            </label>
            {selectedUser ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 rounded-lg">
                <Avatar user={selectedUser} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {selectedUser.firstname} {selectedUser.lastname}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => { onComposeChange('receiverId', ''); setUserSearch(''); }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                  aria-label="Remove recipient"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <Icon name="Search" size={16} className="text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
                    autoFocus
                  />
                  {loadingUsers && <Spinner size="sm" />}
                </div>
                {userSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">No users found</p>
                    ) : (
                      filteredUsers.slice(0, 20).map((u) => {
                        const uid = getUserId(u);
                        return (
                          <button
                            key={uid}
                            onClick={() => { onComposeChange('receiverId', uid); setUserSearch(''); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left"
                          >
                            <Avatar user={u} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {u.firstname} {u.lastname}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{u.email}</p>
                            </div>
                            {u.role && (
                              <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 capitalize flex-shrink-0">
                                {u.role}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
              Subject
            </label>
            <input
              type="text"
              placeholder="Message subject"
              value={composeData.subject}
              onChange={(e) => onComposeChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              placeholder="Type your message..."
              value={composeData.content}
              onChange={(e) => onComposeChange('content', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
            />
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-right mt-1">
              {composeData.content.length} chars
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <button
            onClick={onHideCompose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSendCompose}
            disabled={!canSend}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Icon name="Send" size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Left Panel ───────────────────────────────────────────────────────────────

interface LeftPanelProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  unreadCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectConversation: (conv: Conversation) => void;
  onShowCompose: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  conversations,
  activeConversation,
  loading,
  unreadCount,
  searchTerm,
  onSearchChange,
  onSelectConversation,
  onShowCompose,
}) => {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const q = searchTerm.toLowerCase();
    return conversations.filter(
      (c) =>
        `${c.user.firstname} ${c.user.lastname}`.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q) ||
        c.lastMessage?.subject?.toLowerCase().includes(q) ||
        c.lastMessage?.content?.toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      {/* Panel Header */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Messages</h2>
            {unreadCount > 0 && (
              <Badge variant="info" size="sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <button
            onClick={onShowCompose}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
            aria-label="New message"
            title="New message"
          >
            <Icon name="PenSquare" size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <Icon name="Search" size={16} className="text-neutral-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
            aria-label="Search conversations"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Clear search"
            >
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3">
            <Spinner size="md" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading conversations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Icon name="MessageSquare" size={24} className="text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {searchTerm ? 'No results found' : 'No conversations yet'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Start a new conversation'}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.userId}
              conv={conv}
              isActive={activeConversation?.userId === conv.userId}
              onClick={() => onSelectConversation(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── Right Panel ──────────────────────────────────────────────────────────────

interface RightPanelProps {
  activeConversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  loadingMessages: boolean;
  replyContent: string;
  replySubject: string;
  isTyping: boolean;
  sendingReply: boolean;
  isMobile: boolean;
  onBackToList: () => void;
  onReplyChange: (content: string) => void;
  onSubjectChange: (subject: string) => void;
  onSendReply: () => void;
  onDeleteMessage: (messageId: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  activeConversation,
  messages,
  currentUserId,
  loadingMessages,
  replyContent,
  replySubject,
  isTyping,
  sendingReply,
  isMobile,
  onBackToList,
  onReplyChange,
  onSubjectChange,
  onSendReply,
  onDeleteMessage,
  onTyping,
  onStopTyping,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSubject, setShowSubject] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = 4 * 24 + 16; // ~4 rows
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [replyContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (replyContent.trim() && !sendingReply) {
        onSendReply();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onReplyChange(e.target.value);
    onTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 2000);
  };

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const canSend = replyContent.trim().length > 0 && !sendingReply;

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 gap-4">
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <Icon name="MessageCircle" size={40} className="text-neutral-300 dark:text-neutral-600" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
            Select a conversation
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm flex-shrink-0">
        {isMobile && (
          <button
            onClick={onBackToList}
            className="p-1.5 -ml-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Back to conversations"
          >
            <Icon name="ChevronLeft" size={22} />
          </button>
        )}
        <Avatar user={activeConversation.user} size="md" showOnline />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {activeConversation.user.firstname} {activeConversation.user.lastname}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {activeConversation.user.role
              ? `${activeConversation.user.role} · ${activeConversation.user.email}`
              : activeConversation.user.email}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSearchOpen((v) => !v); setSearchQuery(''); }}
            className={`p-2 rounded-lg transition-colors ${
              searchOpen
                ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-label="Search in chat"
            title="Search in chat"
          >
            <Icon name="Search" size={18} />
          </button>
          <button
            onClick={() => {
              if (messages.length > 0) {
                onDeleteMessage(messages[0]._id);
              }
            }}
            className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors"
            aria-label="Delete conversation"
            title="Delete conversation"
          >
            <Icon name="Trash2" size={18} />
          </button>
        </div>
      </div>

      {/* In-chat search bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <Icon name="Search" size={16} className="text-neutral-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search in conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
          />
          {searchQuery && (
            <span className="text-xs text-neutral-400">
              {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close search"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Spinner size="md" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Icon name="Mail" size={28} className="text-neutral-300 dark:text-neutral-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {searchQuery ? 'No messages match your search' : 'No messages yet'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {searchQuery ? 'Try different keywords' : 'Send the first message below'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {filteredMessages.map((msg, idx) => {
              const senderId = getUserId(msg.senderId);
              const isOwn = senderId === currentUserId;
              const prev = filteredMessages[idx - 1];
              const showSep = shouldShowDateSeparator(msg, prev);
              return (
                <React.Fragment key={msg._id}>
                  {showSep && <DateSeparator label={getDateSeparator(msg.createdAt)} />}
                  <MessageBubble message={msg} isOwn={isOwn} />
                </React.Fragment>
              );
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3">
        {/* Subject row (collapsible) */}
        {showSubject && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Subject (optional)"
              value={replySubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
            <button
              onClick={() => setShowSubject(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Hide subject"
            >
              <Icon name="ChevronUp" size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Emoji placeholder */}
          <button
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors flex-shrink-0 mb-0.5"
            aria-label="Emoji"
            title="Emoji (coming soon)"
          >
            <Icon name="Smile" size={20} />
          </button>

          {/* Subject toggle */}
          {!showSubject && (
            <button
              onClick={() => setShowSubject(true)}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors flex-shrink-0 mb-0.5"
              aria-label="Add subject"
              title="Add subject"
            >
              <Icon name="Tag" size={18} />
            </button>
          )}

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={replyContent}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onBlur={onStopTyping}
              placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={sendingReply}
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-60"
              style={{ minHeight: '42px', maxHeight: '112px' }}
              aria-label="Message input"
            />
          </div>

          {/* Send button */}
          <button
            onClick={onSendReply}
            disabled={!canSend}
            className="flex-shrink-0 w-10 h-10 mb-0.5 flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-sm"
            aria-label="Send message"
          >
            {sendingReply ? (
              <Spinner size="sm" color="inherit" />
            ) : (
              <Icon name="Send" size={16} />
            )}
          </button>
        </div>

        {/* Character count */}
        {replyContent.length > 0 && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-right mt-1">
            {replyContent.length} chars
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main ChatPage Component ──────────────────────────────────────────────────

export const ChatPage: React.FC<ChatPageProps> = ({
  conversations,
  activeConversation,
  messages,
  currentUserId,
  allUsers,
  loading,
  loadingMessages,
  loadingUsers,
  unreadCount,
  searchTerm,
  replyContent,
  replySubject,
  showCompose,
  composeData,
  isTyping,
  sendingReply,
  error,
  success,
  onSearchChange,
  onSelectConversation,
  onBackToList,
  onReplyChange,
  onSubjectChange,
  onSendReply,
  onShowCompose,
  onHideCompose,
  onComposeChange,
  onSendCompose,
  onDeleteMessage,
  onTyping,
  onStopTyping,
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mobile: show list when no active conversation, show chat when one is selected
  const showList = !isMobile || !activeConversation;
  const showChat = !isMobile || !!activeConversation;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-neutral-900">
      {/* Toast notifications */}
      {(error || success) && (
        <div
          className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 text-sm border-b ${
            error
              ? 'bg-danger-50 dark:bg-danger-950 border-danger-200 dark:border-danger-900 text-danger-700 dark:text-danger-300'
              : 'bg-success-50 dark:bg-success-950 border-success-200 dark:border-success-900 text-success-700 dark:text-success-300'
          }`}
          role="alert"
        >
          <Icon name={error ? 'AlertCircle' : 'CheckCircle'} size={16} />
          <span>{error ?? success}</span>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel — 320px on desktop, full-width on mobile */}
        {showList && (
          <div
            className={`${
              isMobile ? 'w-full' : 'w-80 flex-shrink-0'
            } flex flex-col min-h-0 overflow-hidden`}
          >
            <LeftPanel
              conversations={conversations}
              activeConversation={activeConversation}
              loading={loading}
              unreadCount={unreadCount}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              onSelectConversation={onSelectConversation}
              onShowCompose={onShowCompose}
            />
          </div>
        )}

        {/* Right panel — flex-1 */}
        {showChat && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <RightPanel
              activeConversation={activeConversation}
              messages={messages}
              currentUserId={currentUserId}
              loadingMessages={loadingMessages}
              replyContent={replyContent}
              replySubject={replySubject}
              isTyping={isTyping}
              sendingReply={sendingReply}
              isMobile={isMobile}
              onBackToList={onBackToList}
              onReplyChange={onReplyChange}
              onSubjectChange={onSubjectChange}
              onSendReply={onSendReply}
              onDeleteMessage={onDeleteMessage}
              onTyping={onTyping}
              onStopTyping={onStopTyping}
            />
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          composeData={composeData}
          allUsers={allUsers}
          loadingUsers={loadingUsers}
          onComposeChange={onComposeChange}
          onSendCompose={onSendCompose}
          onHideCompose={onHideCompose}
        />
      )}
    </div>
  );
};

// Types are already exported inline above (export interface / export type)
