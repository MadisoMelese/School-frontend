import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '@/components/templates';
import { Card, SearchBar } from '@/components/molecules';
import { Button, Badge } from '@/components/atoms';
import { teacherService } from '@/services/api';
import { Class } from '@/types/api.types';
import { useDebounce } from '@/hooks';

/**
 * ClassesPage Component
 * Displays all classes assigned to the teacher with filtering and sorting
 * Requirement 9.1: Display all classes assigned to the teacher
 * Requirement 9.2: Display class name, grade level, number of students, and class schedule
 */
export const ClassesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'gradeLevel' | 'studentCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => teacherService.getClasses({ limit: 100 }),
  });

  const filteredAndSortedClasses = useMemo(() => {
    if (!data?.data) return [];

    const filtered = data.data.filter((cls) =>
      cls.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      cls.gradeLevel.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'gradeLevel') {
        aVal = a.gradeLevel;
        bVal = b.gradeLevel;
      } else if (sortBy === 'studentCount') {
        aVal = a.studentCount;
        bVal = b.studentCount;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [data?.data, debouncedSearch, sortBy, sortOrder]);

  const renderSkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          </div>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <PortalLayout title="Classes">
        <Card className="border-danger-200 bg-danger-50 dark:border-danger-900 dark:bg-danger-950">
          <div className="text-center">
            <p className="text-danger-700 dark:text-danger-200">Failed to load classes</p>
          </div>
        </Card>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Classes" description="Manage your assigned classes and view class details">
      <div className="space-y-6">
        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <SearchBar
              placeholder="Search classes by name or grade..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'gradeLevel' | 'studentCount')}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              aria-label="Sort classes by"
            >
              <option value="name">Sort by Name</option>
              <option value="gradeLevel">Sort by Grade</option>
              <option value="studentCount">Sort by Students</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          renderSkeletonLoader()
        ) : filteredAndSortedClasses.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchTerm ? 'No classes match your search' : 'No classes assigned yet'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                classData={cls}
                onViewDetails={() => navigate(`/teacher/classes/${cls.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

/**
 * ClassCard Component
 * Displays individual class information in a card format
 */
interface ClassCardProps {
  classData: Class;
  onViewDetails: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ classData, onViewDetails }) => {
  const formatSchedule = (schedule?: any[]) => {
    if (!schedule || schedule.length === 0) return 'No schedule';
    return schedule.slice(0, 2).map((s) => s.day).join(', ');
  };

  return (
    <Card
      className="flex flex-col h-full hover:shadow-md transition-shadow duration-200"
      hoverable
    >
      <div className="space-y-4 flex-1">
        {/* Class Header */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            {classData.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="info" size="sm">
              Grade {classData.gradeLevel}
            </Badge>
            <Badge variant="neutral" size="sm">
              Section {classData.section}
            </Badge>
          </div>
        </div>

        {/* Class Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">Students:</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {classData.studentCount}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">Schedule:</span>
            <span className="text-right text-neutral-700 dark:text-neutral-300">
              {formatSchedule(classData.schedule)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        size="sm"
        variant="primary"
        fullWidth
        onClick={onViewDetails}
        className="mt-4"
      >
        View Details
      </Button>
    </Card>
  );
};

export default ClassesPage;
