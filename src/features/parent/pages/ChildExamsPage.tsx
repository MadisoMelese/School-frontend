import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PortalLayout } from '@/components/templates';
import { DataTable } from '@/components/organisms';
import { Card, Tabs } from '@/components/molecules';
import { Badge, Spinner } from '@/components/atoms';
import { parentService } from '@/services/api';
import { Exam } from '@/types/api.types';
import { useDebounce } from '@/hooks';
import { formatDate } from '@/utils/formatters';
import { Search } from 'lucide-react';

export const ChildExamsPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'upcoming' | 'past'>('upcoming');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const childId = searchParams.get('childId') || '';

  const { data: upcomingExamsData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['child-exams-upcoming', childId],
    queryFn: () =>
      parentService.getChildExams(childId, {
        status: 'upcoming',
        limit: 100,
      }),
    enabled: !!childId,
  });

  const { data: pastExamsData, isLoading: pastLoading } = useQuery({
    queryKey: ['child-exams-past', childId],
    queryFn: () =>
      parentService.getChildExams(childId, {
        status: 'past',
        limit: 100,
      }),
    enabled: !!childId,
  });

  const isLoading = upcomingLoading || pastLoading;

  const filteredUpcomingExams = useMemo(() => {
    if (!upcomingExamsData?.data) return [];
    return upcomingExamsData.data.filter(
      (exam) =>
        exam.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        exam.subject.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [upcomingExamsData?.data, debouncedSearch]);

  const filteredPastExams = useMemo(() => {
    if (!pastExamsData?.data) return [];
    return pastExamsData.data.filter(
      (exam) =>
        exam.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        exam.subject.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [pastExamsData?.data, debouncedSearch]);

  const upcomingColumns = [
    {
      key: 'name' as const,
      label: 'Exam Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'subject' as const,
      label: 'Subject',
      render: (value: string) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: 'date' as const,
      label: 'Date',
      render: (value: string) => (
        <span className="font-semibold">
          {formatDate(new Date(value), 'long')}
        </span>
      ),
    },
    {
      key: 'time' as const,
      label: 'Time',
      render: (value: string) => <span>{value}</span>,
    },
    {
      key: 'totalMarks' as const,
      label: 'Total Marks',
      render: (value: number) => <span>{value}</span>,
    },
    {
      key: 'hallLocation' as const,
      label: 'Hall Location',
      render: (value?: string) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {value || '-'}
        </span>
      ),
    },
  ];

  const pastColumns = [
    {
      key: 'name' as const,
      label: 'Exam Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'subject' as const,
      label: 'Subject',
      render: (value: string) => <Badge variant="info">{value}</Badge>,
    },
    {
      key: 'date' as const,
      label: 'Date',
      render: (value: string) => (
        <span>{formatDate(new Date(value), 'long')}</span>
      ),
    },
    {
      key: 'result' as const,
      label: 'Marks',
      render: (_: unknown, row: Exam) => (
        <span className="font-semibold">
          {row.result?.marksObtained || '-'} / {row.totalMarks}
        </span>
      ),
    },
    {
      key: 'grade' as const,
      label: 'Grade',
      render: (_: unknown, row: Exam) => (
        <Badge variant="info">{row.result?.grade || '-'}</Badge>
      ),
    },
    {
      key: 'rank' as const,
      label: 'Rank',
      render: (_: unknown, row: Exam) => (
        <span>{row.result?.rank ? `#${row.result.rank}` : '-'}</span>
      ),
    },
  ];

  if (!childId) {
    return (
      <PortalLayout title="Child Exams">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <p className="text-danger-700 dark:text-danger-200">Please select a child first</p>
        </Card>
      </PortalLayout>
    );
  }

  if (isLoading) {
    return (
      <PortalLayout title="Child Exams">
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Child Exams">
      <div className="space-y-6">
        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 pl-10 pr-4 py-2 dark:border-neutral-600 dark:bg-neutral-800"
            />
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs
            tabs={[
              { id: 'upcoming', label: 'Upcoming Exams', content: null },
              { id: 'past', label: 'Past Results', content: null },
            ]}
            activeTab={viewType}
            onChange={(tab: string) => setViewType(tab as 'upcoming' | 'past')}
          />
        </Card>

        {/* Upcoming Exams */}
        {viewType === 'upcoming' ? (
          filteredUpcomingExams.length > 0 ? (
            <Card>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Upcoming Exams ({filteredUpcomingExams.length})
                </h3>

                <DataTable
                  columns={upcomingColumns}
                  data={filteredUpcomingExams}
                  pageSize={10}
                />
              </div>
            </Card>
          ) : (
            <Card className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                No upcoming exams scheduled
              </p>
            </Card>
          )
        ) : filteredPastExams.length > 0 ? (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Past Exam Results ({filteredPastExams.length})
              </h3>

              <DataTable
                columns={pastColumns}
                data={filteredPastExams}
                pageSize={10}
              />
            </div>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              No past exam results available
            </p>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default ChildExamsPage;
