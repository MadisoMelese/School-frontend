import React from 'react';
import { Modal } from '@components/molecules/Modal';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import type { Student } from '@services/admin/studentService';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  onClose,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'danger';
      case 'graduated':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Student Details"
      size="lg"
      actions={
        <>
          {onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          {onEdit && (
            <Button variant="primary" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Student ID</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.studentId}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Status</p>
              <Badge variant={getStatusColor(student.status)}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">First Name</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.firstName}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Name</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Date of Birth</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {formatDate(student.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Gender</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Email</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.userId?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.phone || 'N/A'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Address</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.address || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Class</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.classId
                  ? `${student.classId.name} - ${student.classId.section}`
                  : 'Not Assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Enrollment Date</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {formatDate(student.enrollmentDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Parent Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Parent Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Parent Name</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.parentName}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Parent Phone</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.parentPhone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Parent Email</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {student.parentEmail || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Created At</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {formatDate(student.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Updated</p>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                {formatDate(student.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;
