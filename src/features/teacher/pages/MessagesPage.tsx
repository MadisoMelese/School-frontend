import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PortalLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms';
import { Card, Dropdown, NotificationToast, Modal } from '@/components/molecules';
import { Button, Badge, Spinner } from '@/components/atoms';
import { teacherService } from '@/services/api';
import { Message, SendMessageRequest } from '@/types/api.types';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import { Send, Search } from 'lucide-react';

const messageSchema = z.object({
  recipientType: z.enum(['individual', 'class']),
  recipientId: z.string().min(1, 'Please select a recipient'),
  subject: z.string().min(1, 'Subject is required').min(3, 'Subject must be at least 3 characters'),
  content: z
    .string()
    .min(1, 'Message content is required')
    .min(10, 'Message must be at least 10 characters'),
});

type MessageFormData = z.infer<typeof messageSchema>;

export const TeacherMessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['teacher-messages'],
    queryFn: () => teacherService.getMessages({ limit: 100 }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['teacher-classes-messaging'],
    queryFn: () => teacherService.getClasses({ limit: 100 }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageRequest & { classId?: string }) =>
      teacherService.sendMessage(data),
    onSuccess: () => {
      setNotification({
        type: 'success',
        message: 'Message sent successfully!',
      });
      form.reset();
      setShowComposeModal(false);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: () => {
      setNotification({
        type: 'error',
        message: 'Failed to send message. Please try again.',
      });
    },
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipientType: 'individual',
      recipientId: '',
      subject: '',
      content: '',
    },
  });

  const filteredMessages = useMemo(() => {
    if (!messagesData?.messages) return [];
    return messagesData.messages.filter(
      (msg) =>
        `${msg.senderId.firstname} ${msg.senderId.lastname}`
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        msg.subject.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [messagesData?.messages, debouncedSearch]);

  const onSubmit = (data: MessageFormData) => {
    const payload: SendMessageRequest & { classId?: string } = {
      recipientId: data.recipientId,
      subject: data.subject,
      content: data.content,
    };

    if (data.recipientType === 'class') {
      payload.classId = data.recipientId;
    }

    sendMessageMutation.mutate(payload);
  };

  const messageColumns = [
    {
      key: 'senderId' as const,
      label: 'From',
      render: (_: unknown, row: any) => (
        <span className="font-medium">
          {row.senderId.firstname} {row.senderId.lastname}
        </span>
      ),
    },
    {
      key: 'subject' as const,
      label: 'Subject',
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: 'createdAt' as const,
      label: 'Date',
      render: (value: string) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(new Date(value), 'short')}
        </span>
      ),
    },
    {
      key: 'isRead' as const,
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'info' : 'warning'}>{value ? 'Read' : 'Unread'}</Badge>
      ),
    },
  ];

  if (messagesLoading) {
    return (
      <PortalLayout title="Messages">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Messages">
      <div className="space-y-6">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </div>
          <Button
            onClick={() => setShowComposeModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Send size={18} />
            Compose Message
          </Button>
        </div>

        {filteredMessages.length === 0 ? (
          <Card className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">No messages found</p>
          </Card>
        ) : (
          <DataTable columns={messageColumns} data={filteredMessages} pageSize={10} />
        )}

        {/* Compose Modal */}
        <Modal
          isOpen={showComposeModal}
          onClose={() => setShowComposeModal(false)}
          title="Compose Message"
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Recipient Type
              </label>
              <div className="mt-2 flex gap-4">
                {(['individual', 'class'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      {...form.register('recipientType')}
                      className="h-4 w-4"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Recipient
              </label>
              <Dropdown
                options={
                  form.watch('recipientType') === 'class'
                    ? classesData?.classes.map((cls) => ({
                        value: cls._id,
                        label: `${cls.name} (${cls.students?.length || 0} students)`,
                      })) || []
                    : [
                        { value: 'student1', label: 'Student 1' },
                        { value: 'student2', label: 'Student 2' },
                      ]
                }
                value={form.watch('recipientId')}
                onChange={(value: string | number) => form.setValue('recipientId', String(value))}
                placeholder="Select recipient"
              />
              {form.formState.errors.recipientId && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {form.formState.errors.recipientId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Subject
              </label>
              <input
                type="text"
                {...form.register('subject')}
                placeholder="Message subject"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800"
              />
              {form.formState.errors.subject && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {form.formState.errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Message
              </label>
              <textarea
                {...form.register('content')}
                placeholder="Type your message..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-800"
              />
              {form.formState.errors.content && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary" loading={sendMessageMutation.isPending}>
                Send Message
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowComposeModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  );
};

export default TeacherMessagesPage;
