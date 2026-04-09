import React from 'react'
import { Card } from '../molecules/Card'
import { Badge } from '../atoms/Badge'
import { Icon } from '../atoms/Icon'

export interface GradeCardProps {
  subject: string
  marksObtained: number
  totalMarks: number
  grade: string
  remarks?: string
  examDate?: Date
  onClick?: () => void
}

const getGradeColor = (grade: string): 'success' | 'warning' | 'danger' | 'info' => {
  const gradeUpper = grade.toUpperCase()
  if (gradeUpper === 'A' || gradeUpper === 'A+') return 'success'
  if (gradeUpper === 'B' || gradeUpper === 'B+') return 'info'
  if (gradeUpper === 'C' || gradeUpper === 'C+') return 'warning'
  return 'danger'
}

const getPercentageColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-success-600'
  if (percentage >= 80) return 'text-primary-600'
  if (percentage >= 70) return 'text-warning-600'
  return 'text-danger-600'
}

export const GradeCard: React.FC<GradeCardProps> = ({
  subject,
  marksObtained,
  totalMarks,
  grade,
  remarks,
  examDate,
  onClick,
}) => {
  const percentage = Math.round((marksObtained / totalMarks) * 100)

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className="cursor-pointer transition-all hover:shadow-md"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">{subject}</h3>
            {examDate && (
              <p className="text-xs text-neutral-500 mt-1">
                {new Date(examDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge variant={getGradeColor(grade)} className="text-lg font-bold">
            {grade}
          </Badge>
        </div>

        {/* Marks and Percentage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-xs text-neutral-600 mb-1">Marks</p>
            <p className="text-lg font-bold text-neutral-900">
              {marksObtained}/{totalMarks}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-xs text-neutral-600 mb-1">Percentage</p>
            <p className={`text-lg font-bold ${getPercentageColor(percentage)}`}>
              {percentage}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentage >= 90
                  ? 'bg-success-500'
                  : percentage >= 80
                    ? 'bg-primary-500'
                    : percentage >= 70
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
              }`}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${subject} progress`}
            />
          </div>
        </div>

        {/* Remarks */}
        {remarks && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Icon name="MessageSquare" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">{remarks}</p>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
          <div
            className={`w-2 h-2 rounded-full ${
              percentage >= 75 ? 'bg-success-500' : 'bg-warning-500'
            }`}
          />
          <p className="text-xs text-neutral-600">
            {percentage >= 75 ? 'Good performance' : 'Needs improvement'}
          </p>
        </div>
      </div>
    </Card>
  )
}
