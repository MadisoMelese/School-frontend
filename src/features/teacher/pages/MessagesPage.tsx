import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { teacherService } from '@services/api/teacherService';

/**
 * Teacher Messages Page
 * View and send messages to students and parents
 * Mobile-first responsive design with dark theme support
 */

interface Message {
  _id: string;
  senderId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  receiverId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ClassData {
  _id: string;
  name: string;
  section: string;
  grade: string;
  students?: any[];
}

export const TeacherMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
  });
  const [sending, setSending] = useState(false);

  // Load messages and classes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch messages
        const messagesResponse = await teacherService.getMessages({ limit: 100 });
        const messagesData = (messagesResponse as any).data?.messages || (messagesResponse as any).messages || [];
        setMessages(Array.isArray(messagesData) ? messagesData : []);

        // Fetch classes
        const classesResponse = await teacherService.getClasses({ limit: 100 });
        const classesData = (classesResponse as any).data?.classes || (classesResponse as any).classes || [];
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const searchLower = searchTerm.toLowerCase();
    const senderName = msg.senderId ? `${msg.senderId.firstname} ${msg.senderId.lastname}` : 'Unknown';
    return (
      senderName.toLowerCase().includes(searchLower) ||
      msg.subject.toLowerCase().includes(searchLower) ||
      msg.content.toLowerCase().includes(searchLower)
    );
  });

  // Handle send message
  const handleSendMessage = async () => {
    if (!composeData.recipientId || !composeData.subject || !composeData.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      setError(null);

      await teacherService.sendMessage({
        receiverId: composeData.recipientId,
        subject: composeData.subject,
        content: composeData.content,
      });

      setSuccess('Message sent successfully!');
      setComposeData({ recipientId: '', subject: '', content: '' });
      setShowCompose(false);

      // Reload messages
      const messagesResponse = await teacherService.getMessages({ limit: 100 });
      const messagesData = (messagesResponse as any).data?.messages || (messagesResponse as any).messages || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title="Messages" description="View and send messages">
      <div className="space-y-4 sm:space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
            <p className="text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-success-50 dark:bg-success-950 border border-success-200 dark:border-success-900 rounded-lg p-4">
            <p className="text-success-700 dark:text-success-200">{success}</p>
          </div>
        )}

        {/* Search and Compose */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2"
          >
            <Icon name="Send" size={18} />
            Compose Message
          </Button>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="Mail" size={48} className="text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {searchTerm ? 'No messages match your search' : 'No messages yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-4 sm:p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                    !msg.isRead ? 'bg-primary-50 dark:bg-primary-950' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {msg.senderId ? `${msg.senderId.firstname} ${msg.senderId.lastname}` : 'Unknown Sender'}
                        </p>
                        {!msg.isRead && (
                          <Badge variant="primary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                        {msg.subject}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredMessages.length > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredMessages.length} of {messages.length} messages
            </p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Compose Message
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
                    To (Select a class to message all students)
                  </label>
                  <select
                    value={composeData.recipientId}
                    onChange={(e) => setComposeData({ ...composeData, recipientId: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a class...</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - Grade {cls.grade} ({cls.students?.length || 0} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="primary" onClick={handleSendMessage} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
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
