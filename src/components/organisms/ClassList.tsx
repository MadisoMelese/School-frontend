import React from 'react';
import { Class } from '../../types';
import { Card } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';

export interface ClassListProps {
  classes: Class[];
  onClassClick?: (classId: string) => void;
  onAction?: (classId: string, action: string) => void;
  loading?: boolean;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  onClassClick,
  onAction,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="BookOpen" size={48} className="mx-auto text-neutral-300 mb-4" />
        <p className="text-neutral-500">No classes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm" role="table" aria-label="Classes list">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-4 py-3 text-left font-semibold text-neutral-700" scope="col">
                Class
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700" scope="col">
                Grade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700" scope="col">
                Section
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700" scope="col">
                Students
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr
                key={classItem.id}
                className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => onClassClick?.(classItem.id)}
                    className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {classItem.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-neutral-700">{classItem.gradeLevel}</td>
                <td className="px-4 py-3 text-neutral-700">{classItem.section}</td>
                <td className="px-4 py-3">
                  <Badge variant="info">{classItem.studentCount}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAction?.(classItem.id, 'attendance')}
                      aria-label={`Mark attendance for ${classItem.name}`}
                    >
                      <Icon name="CheckSquare" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAction?.(classItem.id, 'grades')}
                      aria-label={`Enter grades for ${classItem.name}`}
                    >
                      <Icon name="BookOpen" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClassClick?.(classItem.id)}
                      aria-label={`View details for ${classItem.name}`}
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} onClick={() => onClassClick?.(classItem.id)} hoverable>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-neutral-900">{classItem.name}</h3>
                  <p className="text-sm text-neutral-600">
                    {classItem.gradeLevel} - {classItem.section}
                  </p>
                </div>
                <Badge variant="info">{classItem.studentCount} students</Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-neutral-200">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.(classItem.id, 'attendance');
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Icon name="CheckSquare" size={16} />
                  Attendance
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.(classItem.id, 'grades');
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  <Icon name="BookOpen" size={16} />
                  Grades
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
