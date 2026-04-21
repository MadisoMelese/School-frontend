import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { SkeletonTable } from '@components/atoms/SkeletonTable';
import { Badge } from '@components/atoms/Badge';
import { apiClient } from '@services/api/client';

/**
 * Admin Messages Management Page
 * Allows admins to view and manage all system messages
 */

interface Message {
  _id: string;
  id: string;
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
  updatedAt: string;
}

interface PaginatedResponse {
  messages: Message[];
  total: number;
  page: number;
  totalPages: number;
}

export const MessagesManagementPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load messages with filters
  const loadMessages = async (searchVal = '', isReadVal = '', pageVal = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchVal) params.append('search', searchVal);
      if (isReadVal) params.append('isRead', isReadVal);
      params.append('page', pageVal.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get<{ data: PaginatedResponse }>(
        `/messages/admin/all?${params.toString()}`
      );
      const data = response.data.data;

      if (data?.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setTotalPages(data.totalPages || 1);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(searchTerm, isReadFilter, page);
  }, [page, limit]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    loadMessages(value, isReadFilter, 1);
  };

  // Handle filter
  const handleFilterChange = (value: string) => {
    setIsReadFilter(value);
    setPage(1);
    loadMessages(searchTerm, value, 1);
  };

  // Handle view details
  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message);
    setShowDetails(true);
  };

  // Handle delete message
  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      setError(null);
      await apiClient.delete(`/messages/${id}`);
      await loadMessages(searchTerm, isReadFilter, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  return (
    <DashboardLayout
      title="Messages Management"
      description="View and manage all system messages"
    >
      <div className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
            <p className="text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}

        {/* Header with stats */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Total Messages: {messages.length}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Search by Subject or Sender
              </label>
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Filter by Status
              </label>
              <select
                value={isReadFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Messages</option>
                <option value="true">Read</option>
                <option value="false">Unread</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Items per Page
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
          {loading && (
            <div className="p-6">
              <SkeletonTable rows={5} columns={6} showHeader />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="p-6 text-neutral-600 dark:text-neutral-400">
              No messages found.
            </p>
          )}
          {!loading && messages.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      From
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      To
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr
                      key={message._id}
                      className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                        <div>
                          <p className="font-medium">
                            {message.senderId.firstname} {message.senderId.lastname}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {message.senderId.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                        <div>
                          <p className="font-medium">
                            {message.receiverId.firstname} {message.receiverId.lastname}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {message.receiverId.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-900 dark:text-white">
                        <p className="truncate max-w-xs">{message.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-xs">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={message.isRead ? 'info' : 'warning'}
                          className="text-xs"
                        >
                          {message.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDetails(message)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteMessage(message._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && messages.length > 0 && totalPages > 1 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Message Details Modal */}
        {showDetails && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Message Details
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      From
                    </label>
                    <p className="text-neutral-900 dark:text-white">
                      {selectedMessage.senderId.firstname} {selectedMessage.senderId.lastname}
                      <br />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedMessage.senderId.email}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      To
                    </label>
                    <p className="text-neutral-900 dark:text-white">
                      {selectedMessage.receiverId.firstname} {selectedMessage.receiverId.lastname}
                      <br />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {selectedMessage.receiverId.email}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Subject
                    </label>
                    <p className="text-neutral-900 dark:text-white">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Message
                    </label>
                    <p className="text-neutral-900 dark:text-white whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Badge variant={selectedMessage.isRead ? 'info' : 'warning'}>
                      {selectedMessage.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleDeleteMessage(selectedMessage._id);
                      setShowDetails(false);
                    }}
                  >
                    Delete Message
                  </Button>
                  <Button variant="secondary" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MessagesManagementPage;
