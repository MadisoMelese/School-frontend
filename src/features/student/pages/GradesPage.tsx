import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Card } from '@components/molecules/Card';
import { DataTable, Column } from '@components/organisms/DataTable';
import { GradeCard } from '@components/organisms/GradeCard';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Spinner } from '@components/atoms/Spinner';
import { SkeletonCard } from '@components/atoms/SkeletonCard';
import { SkeletonTable } from '@components/atoms/SkeletonTable';
import { useDebounce } from '@hooks/useDebounce';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { useCachedGrades } from '@hooks/useCachedGrades';
import { useOffline } from '@hooks/useOffline';
import { studentService } from '@services/api/studentService';
import type { Grade } from '@types';

/**
 * Student Grades Page
 * Displays student grades with filtering, search, and performance summary
 * - Table view on desktop, card layout on mobile
 * - Filter by academic year and subject
 * - Search with 300ms debouncing
 * - Performance summary with average grade, GPA, and charts
 * - Grade distribution chart
 */

interface PerformanceSummary {
  averageGrade: number;
  highestScore: number;
  lowestScore: number;
  gpa: number;
}

export const GradesPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isOnline } = useOffline();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Use cached grades with filters
  const {
    data: gradesResponse,
    loading,
    error,
    isFromCache,
  } = useCachedGrades({
    academicYear: selectedYear || undefined,
    subject: selectedSubject || undefined,
  });

  const grades = gradesResponse?.data || [];

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load performance summary
  useEffect(() => {
    const loadPerformanceSummary = async () => {
      if (!isOnline) return; // Skip if offline

      try {
        const summary = await studentService.getPerformanceSummary();
        setPerformanceSummary(summary);
      } catch (err) {
        console.error('Failed to load performance summary:', err);
      }
    };

    loadPerformanceSummary();
  }, [isOnline]);

  // Filter and search grades
  const filteredGrades = useMemo(() => {
    let result = [...grades];

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (grade) =>
          grade.subject.toLowerCase().includes(query) ||
          grade.remarks?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        let aVal: any = a[sortKey as keyof Grade];
        let bVal: any = b[sortKey as keyof Grade];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [grades, debouncedSearchQuery, sortKey, sortDirection]);

  // Get unique academic years and subjects
  const academicYears = useMemo(() => {
    const years = new Set(grades.map((g) => g.academicYear));
    return Array.from(years).sort().reverse();
  }, [grades]);

  const subjects = useMemo(() => {
    const subjs = new Set(grades.map((g) => g.subject));
    return Array.from(subjs).sort();
  }, [grades]);

  // Calculate grade distribution
  const gradeDistribution = useMemo(() => {
    const distribution: Record<string, { sum: number; count: number }> = {};

    filteredGrades.forEach((grade) => {
      if (!distribution[grade.subject]) {
        distribution[grade.subject] = { sum: 0, count: 0 };
      }
      distribution[grade.subject].sum += grade.percentage;
      distribution[grade.subject].count += 1;
    });

    return Object.entries(distribution).map(([subject, data]) => ({
      subject,
      average: Math.round(data.sum / data.count),
      count: data.count,
    }));
  }, [filteredGrades]);

  // Handle sort
  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedYear('');
    setSelectedSubject('');
    setSortKey(null);
    setSortDirection(null);
  }, []);

  // Table columns for desktop view
  const tableColumns: Column<Grade>[] = [
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      width: '25%',
    },
    {
      key: 'marksObtained',
      label: 'Marks',
      sortable: true,
      width: '15%',
      render: (value, row) => `${value}/${row.totalMarks}`,
    },
    {
      key: 'percentage',
      label: 'Percentage',
      sortable: true,
      width: '15%',
      render: (value) => (
        <span className={value >= 75 ? 'text-success-600' : 'text-warning-600'}>{value}%</span>
      ),
    },
    {
      key: 'grade',
      label: 'Grade',
      sortable: true,
      width: '12%',
      render: (value) => (
        <Badge
          variant={
            value === 'A' || value === 'A+'
              ? 'success'
              : value === 'B' || value === 'B+'
                ? 'info'
                : value === 'C' || value === 'C+'
                  ? 'warning'
                  : 'danger'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'examDate',
      label: 'Date',
      sortable: true,
      width: '15%',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'remarks',
      label: 'Remarks',
      width: '18%',
      render: (value) => <span className="text-sm text-neutral-600 truncate">{value || '-'}</span>,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Grades" description="View your academic performance">
        <div className="space-y-6">
          {/* Performance Summary Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} lines={1} showHeader={false} />
            ))}
          </div>

          {/* Grade Distribution Skeleton */}
          <SkeletonCard lines={5} showHeader />

          {/* Filters Skeleton */}
          <SkeletonCard lines={4} showHeader />

          {/* Grades Table/Cards Skeleton */}
          {isMobile ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonCard key={index} lines={3} showHeader />
              ))}
            </div>
          ) : (
            <Card>
              <SkeletonTable rows={5} columns={6} showHeader />
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Grades"
      description={
        isFromCache
          ? 'Showing cached grades (offline mode)'
          : 'View your academic performance'
      }
    >
      <div className="space-y-6">
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
            <Icon name="WifiOff" size={20} className="text-warning-600" />
            <span className="text-sm text-warning-800">
              You're offline. Showing cached data.
            </span>
          </div>
        )}

        {/* Performance Summary */}
        {performanceSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Average Grade
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600">
                  {performanceSummary.averageGrade.toFixed(1)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Highest Score
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-success-600">
                  {performanceSummary.highestScore}%
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Lowest Score
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-warning-600">
                  {performanceSummary.lowestScore}%
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  GPA
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600">
                  {performanceSummary.gpa.toFixed(2)}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Grade Distribution Chart */}
        {gradeDistribution.length > 0 && (
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900">Grade Distribution by Subject</h3>
              <div className="space-y-3">
                {gradeDistribution.map((dist) => (
                  <div key={dist.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">{dist.subject}</span>
                      <span className="font-medium text-neutral-900">{dist.average}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          dist.average >= 90
                            ? 'bg-success-500'
                            : dist.average >= 80
                              ? 'bg-primary-500'
                              : dist.average >= 70
                                ? 'bg-warning-500'
                                : 'bg-danger-500'
                        }`}
                        style={{ width: `${dist.average}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-base sm:text-lg">
                Filters
              </h3>
              {(searchQuery || selectedYear || selectedSubject) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Icon name="X" size={16} />
                  Reset
                </Button>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Search */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by subject or remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm sm:text-base"
                  aria-label="Search grades"
                />
              </div>

              {/* Academic Year Filter */}
              {academicYears.length > 0 && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Academic Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white"
                    aria-label="Filter by academic year"
                  >
                    <option value="">All Years</option>
                    {academicYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject Filter */}
              {subjects.length > 0 && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white"
                    aria-label="Filter by subject"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Grades Display */}
        {error ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
              <p className="text-danger-600 font-medium">{error.message || 'Failed to load grades'}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleResetFilters}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : filteredGrades.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="BookOpen" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No grades found</p>
            </div>
          </Card>
        ) : isMobile ? (
          // Mobile: Card Layout
          <div className="space-y-3">
            {filteredGrades.map((grade) => (
              <GradeCard
                key={grade.id}
                subject={grade.subject}
                marksObtained={grade.marksObtained}
                totalMarks={grade.totalMarks}
                grade={grade.grade}
                remarks={grade.remarks}
                examDate={new Date(grade.examDate)}
              />
            ))}
          </div>
        ) : (
          // Desktop: Table Layout
          <Card>
            <DataTable
              columns={tableColumns}
              data={filteredGrades}
              onSort={handleSort}
              loading={loading}
              keyExtractor={(grade) => grade.id}
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradesPage;
