import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { teacherService } from '@services/api/teacherService';

/**
 * Teacher Classes Page
 * Displays all classes assigned to the teacher with filtering and sorting
 * Mobile-first responsive design with dark theme support
 */

interface ClassData {
  _id: string;
  id?: string;
  name: string;
  section: string;
  grade: string;
  capacity: number;
  academicYear?: string;
  status?: string;
  students?: any[];
  teacherId?: string;
}

export const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'grade' | 'students'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load classes
  React.useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await teacherService.getClasses({ limit: 100 });
        const classesData = response.data?.classes || response.classes || [];
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'grade') {
        aVal = a.grade;
        bVal = b.grade;
      } else if (sortBy === 'students') {
        aVal = a.students?.length || 0;
        bVal = b.students?.length || 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return filtered;
  }, [classes, searchTerm, sortBy, sortOrder]);

  return (
    <DashboardLayout title="My Classes" description="View and manage your assigned classes">
      <div className="space-y-4 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-4">
            <p className="text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}

        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'grade' | 'students')}
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Sort by Name</option>
              <option value="grade">Sort by Grade</option>
              <option value="students">Sort by Students</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 animate-pulse"
              >
                <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedClasses.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-12 text-center border border-neutral-200 dark:border-neutral-700">
            <Icon name="BookOpen" size={48} className="text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              {searchTerm ? 'No classes match your search' : 'No classes assigned yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedClasses.map((cls) => (
              <div
                key={cls._id || cls.id}
                className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow duration-200 flex flex-col"
              >
                {/* Class Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {cls.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info" className="text-xs">
                      Grade {cls.grade}
                    </Badge>
                    <Badge variant="neutral" className="text-xs">
                      Section {cls.section}
                    </Badge>
                    {cls.status && (
                      <Badge
                        variant={cls.status === 'active' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {cls.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Class Details */}
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Students:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {cls.students?.length || 0} / {cls.capacity}
                    </span>
                  </div>
                  {cls.academicYear && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Academic Year:</span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {cls.academicYear}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    fullWidth
                    onClick={() => navigate(`/teacher/classes/${cls._id || cls.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && filteredAndSortedClasses.length > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredAndSortedClasses.length} of {classes.length} classes
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;
