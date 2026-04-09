import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Card } from '@components/molecules/Card'
import { Modal } from '@components/molecules/Modal'
import { Button } from '@components/atoms/Button'
import { Input } from '@components/atoms/Input'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { Spinner } from '@components/atoms/Spinner'
import { useDebounce } from '@hooks/useDebounce'
import { useMediaQuery } from '@hooks/useMediaQuery'
import { useExamNotifications } from '@hooks/useExamNotifications'
import { studentService } from '@services/api/studentService'
import type { Exam } from '@types'

/**
 * Student Exams Page
 * Displays upcoming and past exams with filtering, search, and details modal
 * - Upcoming/past exam tabs or sections
 * - Real-time search and filtering
 * - Visual indicator for exams within 7 days
 * - Exam details modal with all information
 * - Past exam results display (marks, grade, rank)
 * - Exam notifications when results published
 */

interface ExamWithStatus extends Exam {
  isUpcoming: boolean
  daysUntilExam?: number
  isWithin7Days?: boolean
}

export const ExamsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { checkExamsForNewResults } = useExamNotifications()

  // State
  const [exams, setExams] = useState<ExamWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [selectedExam, setSelectedExam] = useState<ExamWithStatus | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Load exams data
  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch upcoming exams
        const upcomingResponse = await studentService.getExams({
          status: 'upcoming',
        })

        // Fetch past exams
        const pastResponse = await studentService.getExams({
          status: 'past',
        })

        // Combine and enrich with status information
        const allExams: ExamWithStatus[] = [
          ...(upcomingResponse.data || []).map((exam) => {
            const examDate = new Date(exam.date)
            const today = new Date()
            const daysUntil = Math.ceil(
              (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )

            return {
              ...exam,
              isUpcoming: true,
              daysUntilExam: daysUntil,
              isWithin7Days: daysUntil <= 7 && daysUntil > 0,
            }
          }),
          ...(pastResponse.data || []).map((exam) => ({
            ...exam,
            isUpcoming: false,
          })),
        ]

        setExams(allExams)

        // Check for new exam results and send notifications
        checkExamsForNewResults(allExams)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exams')
      } finally {
        setLoading(false)
      }
    }

    loadExams()
  }, [checkExamsForNewResults])

  // Filter exams by tab and search
  const filteredExams = useMemo(() => {
    let result = exams.filter((exam) => exam.isUpcoming === (activeTab === 'upcoming'))

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      result = result.filter(
        (exam) =>
          exam.name.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query)
      )
    }

    // Sort: upcoming by date ascending, past by date descending
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA
    })

    return result
  }, [exams, activeTab, debouncedSearchQuery])

  // Handle exam selection
  const handleSelectExam = useCallback((exam: ExamWithStatus) => {
    setSelectedExam(exam)
    setIsModalOpen(true)
  }, [])

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedExam(null)
  }, [])

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    const examDate = new Date(date)
    const dateStr = examDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${dateStr} at ${time}`
  }

  // Calculate days until exam
  const getDaysUntilText = (daysUntil?: number) => {
    if (!daysUntil) return ''
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    return `In ${daysUntil} days`
  }

  if (loading) {
    return (
      <DashboardLayout title="Exams" description="View your exam schedule and results">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Exams" description="View your exam schedule and results">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'upcoming'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            aria-selected={activeTab === 'upcoming'}
            role="tab"
          >
            Upcoming Exams
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'past'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
            aria-selected={activeTab === 'past'}
            role="tab"
          >
            Past Exams
          </button>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Search</h3>
              {searchQuery && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <Icon name="X" size={16} />
                  Clear
                </Button>
              )}
            </div>

            <Input
              type="text"
              placeholder="Search by exam name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              aria-label="Search exams"
            />
          </div>
        </Card>

        {/* Exams Display */}
        {error ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="AlertCircle" size={32} className="text-danger-600 mx-auto mb-3" />
              <p className="text-danger-600 font-medium">{error}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleResetFilters}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : filteredExams.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Icon name="Calendar" size={32} className="text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">
                {activeTab === 'upcoming'
                  ? 'No upcoming exams scheduled'
                  : 'No past exams to display'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExams.map((exam) => (
              <Card
                key={exam.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectExam(exam)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-neutral-900 truncate">{exam.name}</h3>
                      {exam.isWithin7Days && (
                        <Badge variant="warning" size="sm">
                          <Icon name="AlertCircle" size={14} />
                          Soon
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-neutral-600">
                      <p className="flex items-center gap-2">
                        <Icon name="BookOpen" size={16} />
                        {exam.subject}
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} />
                        {formatDateTime(exam.date, exam.time)}
                      </p>
                      {exam.hallLocation && (
                        <p className="flex items-center gap-2">
                          <Icon name="MapPin" size={16} />
                          {exam.hallLocation}
                        </p>
                      )}
                      {exam.isUpcoming && exam.daysUntilExam !== undefined && (
                        <p className="flex items-center gap-2 font-medium text-primary-600">
                          <Icon name="Clock" size={16} />
                          {getDaysUntilText(exam.daysUntilExam)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Results Badge for Past Exams */}
                  {!exam.isUpcoming && exam.result && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-medium text-neutral-900">
                        {exam.result.marksObtained}/{exam.totalMarks}
                      </div>
                      <Badge
                        variant={
                          exam.result.grade === 'A' || exam.result.grade === 'A+'
                            ? 'success'
                            : exam.result.grade === 'B' || exam.result.grade === 'B+'
                              ? 'info'
                              : exam.result.grade === 'C' || exam.result.grade === 'C+'
                                ? 'warning'
                                : 'danger'
                        }
                        size="sm"
                      >
                        {exam.result.grade}
                      </Badge>
                    </div>
                  )}

                  {/* Arrow Icon */}
                  <Icon
                    name="ChevronRight"
                    size={20}
                    className="text-neutral-400 flex-shrink-0"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Exam Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedExam?.name}
        size="md"
      >
        {selectedExam && (
          <div className="space-y-6">
            {/* Exam Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Subject</label>
                <p className="text-neutral-900 font-medium mt-1">{selectedExam.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-600">Date & Time</label>
                <p className="text-neutral-900 font-medium mt-1">
                  {formatDateTime(selectedExam.date, selectedExam.time)}
                </p>
              </div>

              {selectedExam.hallLocation && (
                <div>
                  <label className="text-sm font-medium text-neutral-600">Exam Hall</label>
                  <p className="text-neutral-900 font-medium mt-1">{selectedExam.hallLocation}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-neutral-600">Total Marks</label>
                <p className="text-neutral-900 font-medium mt-1">{selectedExam.totalMarks}</p>
              </div>

              {selectedExam.isUpcoming && selectedExam.daysUntilExam !== undefined && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-primary-900 font-medium">
                    {getDaysUntilText(selectedExam.daysUntilExam)}
                  </p>
                </div>
              )}
            </div>

            {/* Past Exam Results */}
            {!selectedExam.isUpcoming && selectedExam.result && (
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="font-semibold text-neutral-900 mb-4">Results</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Marks Obtained</label>
                      <p className="text-2xl font-bold text-primary-600 mt-1">
                        {selectedExam.result.marksObtained}/{selectedExam.totalMarks}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Grade</label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedExam.result.grade === 'A' ||
                            selectedExam.result.grade === 'A+'
                              ? 'success'
                              : selectedExam.result.grade === 'B' ||
                                  selectedExam.result.grade === 'B+'
                                ? 'info'
                                : selectedExam.result.grade === 'C' ||
                                    selectedExam.result.grade === 'C+'
                                  ? 'warning'
                                  : 'danger'
                          }
                          size="md"
                        >
                          {selectedExam.result.grade}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600">Class Rank</label>
                    <p className="text-neutral-900 font-medium mt-1">
                      Rank {selectedExam.result.rank}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600">Percentage</label>
                    <p className="text-neutral-900 font-medium mt-1">
                      {Math.round(
                        (selectedExam.result.marksObtained / selectedExam.totalMarks) * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-neutral-200">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default ExamsPage
