import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { apiClient } from '@services/api/client';
import { useAuthStore } from '@store/authStore';
import { useNotificationStore } from '@store/notificationStore';
import socketService from '@services/socket/socketService';
import {
  ChatPage,
  type Conversation,
  type Message,
  type User,
  type ComposeData,
} from '@components/organisms/ChatPage';

const getUserId = (userRef: User | string): string => {
  if (typeof userRef === 'string') return userRef;
  return userRef.id || userRef._id || '';
};

const getUserFromRef = (userRef: User | string): User => {
  if (typeof userRef === 'string') {
    return { _id: userRef, id: userRef, firstname: '?', lastname: '', email: '' };
  }
  return userRef;
};

export const ParentMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setUnreadMessageCount } = useNotificationStore();

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData>({ receiverId: '', subject: '', content: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buildConversations = useCallback((messages: Message[], tab: 'inbox' | 'sent') => {
    const map = new Map<string, Conversation>();
    messages.forEach((msg) => {
      const otherRef = tab === 'sent' ? msg.receiverId : msg.senderId;
      const userId = getUserId(otherRef);
      const userObj = getUserFromRef(otherRef);
      if (!map.has(userId)) {
        map.set(userId, { userId, user: userObj, lastMessage: msg, unreadCount: tab === 'inbox' && !msg.isRead ? 1 : 0 });
      } else {
        const conv = map.get(userId)!;
        if (tab === 'inbox' && !msg.isRead) conv.unreadCount += 1;
        if (new Date(msg.createdAt) > new Date(conv.lastMessage?.createdAt ?? 0)) conv.lastMessage = msg;
      }
    });
    setConversations(Array.from(map.values()));
  }, []);

  const loadMessages = useCallback(async (tab: 'inbox' | 'sent') => {
    try {
      setLoading(true);
      const endpoint = tab === 'inbox' ? '/messages/inbox?limit=200' : '/messages/sent?limit=200';
      const res = await apiClient.get<{ data: { messages: Message[] } }>(endpoint);
      const msgs = res.data.data?.messages ?? [];
      setAllMessages(Array.isArray(msgs) ? msgs : []);
      buildConversations(Array.isArray(msgs) ? msgs : [], tab);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [buildConversations]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: { unreadCount: number } }>('/messages/unread-count');
      const count = res.data.data?.unreadCount ?? 0;
      setUnreadCount(count); setUnreadMessageCount(count);
    } catch { /* silent */ }
  }, [setUnreadMessageCount]);

  const loadAllUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await apiClient.get<{ data: { users: User[] } }>('/users?limit=1000');
      const users = res.data.data?.users ?? [];
      setAllUsers(Array.isArray(users) ? users : []);
    } catch { /* silent */ }
    finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => { loadMessages(activeTab); loadUnreadCount(); }, [activeTab, loadMessages, loadUnreadCount]);
  useEffect(() => { if (showCompose) loadAllUsers(); }, [showCompose, loadAllUsers]);

  useEffect(() => {
    const offMsg = socketService.onNewMessage((socketMsg) => {
      const newMsg: Message = { _id: socketMsg._id, senderId: socketMsg.senderId, receiverId: socketMsg.receiverId, subject: socketMsg.subject, content: socketMsg.content, isRead: false, createdAt: socketMsg.createdAt };
      setAllMessages((prev) => { const updated = [newMsg, ...prev]; buildConversations(updated, activeTab); return updated; });
      setUnreadCount((c) => c + 1);
    });
    const offCount = socketService.onUnreadCountUpdate(({ count }) => { setUnreadCount(count); setUnreadMessageCount(count); });
    const offTypingStart = socketService.onTypingStart(() => setIsTyping(true));
    const offTypingStop = socketService.onTypingStop(() => setIsTyping(false));
    return () => { offMsg(); offCount(); offTypingStart(); offTypingStop(); };
  }, [activeTab, buildConversations, setUnreadMessageCount]);

  useEffect(() => {
    if (error || success) { const t = setTimeout(() => { setError(null); setSuccess(null); }, 4000); return () => clearTimeout(t); }
  }, [error, success]);

  const activeMessages = activeConversation
    ? allMessages.filter((msg) => getUserId(activeTab === 'sent' ? msg.receiverId : msg.senderId) === activeConversation.userId)
    : [];

  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    setActiveConversation(conv);
    const unread = allMessages.filter((m) => !m.isRead && getUserId(m.senderId) === conv.userId);
    for (const msg of unread) {
      try { await apiClient.patch(`/messages/${msg._id}/read`); socketService.emitMessageRead(msg._id); } catch { /* silent */ }
    }
    if (unread.length > 0) {
      setAllMessages((prev) => prev.map((m) => (getUserId(m.senderId) === conv.userId ? { ...m, isRead: true } : m)));
      await loadUnreadCount();
    }
  }, [allMessages, loadUnreadCount]);

  const handleSendReply = useCallback(async () => {
    if (!replyContent.trim() || !activeConversation) return;
    try {
      setSendingReply(true);
      const lastMsg = activeMessages[activeMessages.length - 1];
      const subject = replySubject.trim() || (lastMsg?.subject ? `Re: ${lastMsg.subject}` : 'Reply');
      await apiClient.post('/messages', { receiverId: activeConversation.userId, subject, content: replyContent });
      setReplyContent(''); setReplySubject(''); setSuccess('Sent!');
      await loadMessages(activeTab); await loadUnreadCount();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send'); }
    finally { setSendingReply(false); }
  }, [replyContent, replySubject, activeConversation, activeMessages, activeTab, loadMessages, loadUnreadCount]);

  const handleSendCompose = useCallback(async () => {
    if (!composeData.receiverId || !composeData.subject.trim() || !composeData.content.trim()) { setError('Please fill in all fields'); return; }
    try {
      await apiClient.post('/messages', composeData);
      setSuccess('Sent!'); setComposeData({ receiverId: '', subject: '', content: '' }); setShowCompose(false);
      await loadMessages(activeTab); await loadUnreadCount();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send'); }
  }, [composeData, activeTab, loadMessages, loadUnreadCount]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!window.confirm('Delete this conversation?')) return;
    try { await apiClient.delete(`/messages/${messageId}`); setSuccess('Deleted!'); setActiveConversation(null); await loadMessages(activeTab); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete'); }
  }, [activeTab, loadMessages]);

  return (
    <DashboardLayout title="Messages" description="Real-time messaging">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8" style={{ height: 'calc(100vh - 64px)' }}>
        <ChatPage
          conversations={conversations} activeConversation={activeConversation} messages={activeMessages}
          currentUserId={user?.id ?? ''} allUsers={allUsers} loading={loading} loadingMessages={loading}
          loadingUsers={loadingUsers} unreadCount={unreadCount} activeTab={activeTab} searchTerm={searchTerm}
          replyContent={replyContent} replySubject={replySubject} showCompose={showCompose} composeData={composeData}
          isTyping={isTyping} sendingReply={sendingReply} error={error} success={success}
          onTabChange={(tab) => { setActiveTab(tab); setActiveConversation(null); }}
          onSearchChange={setSearchTerm} onSelectConversation={handleSelectConversation}
          onBackToList={() => setActiveConversation(null)} onReplyChange={setReplyContent}
          onSubjectChange={setReplySubject} onSendReply={handleSendReply}
          onShowCompose={() => setShowCompose(true)}
          onHideCompose={() => { setShowCompose(false); setComposeData({ receiverId: '', subject: '', content: '' }); }}
          onComposeChange={(field, value) => setComposeData((prev) => ({ ...prev, [field]: value }))}
          onSendCompose={handleSendCompose} onDeleteMessage={handleDeleteMessage}
          onTyping={() => activeConversation && socketService.emitTypingStart(activeConversation.userId)}
          onStopTyping={() => activeConversation && socketService.emitTypingStop(activeConversation.userId)}
        />
      </div>
    </DashboardLayout>
  );
};

export default ParentMessagesPage;
