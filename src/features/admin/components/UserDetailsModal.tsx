import React from 'react'
import { Modal } from '@components/molecules/Modal'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import type { User } from '@types/api.types'

interface UserDetailsModalProps {
  user: User
  onClose: () => void
}

/**
 * User Details Modal
 * Displays detailed information about a user
 */
const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger'
      case 'teacher':
        return 'info'
      case 'parent':
        return 'warning'
      case 'student':
        return 'success'
      default:
        return 'info'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'blocked':
        return 'danger'
      case 'inactive':
        return 'warning'
      default:
        return 'info'
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="User Details" size="md">
      <div className="space-y-6">
        {/* User Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{user.name}</h2>
            <p className="text-sm text-neutral-600">{user.email}</p>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 font-medium mb-1">Role</p>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 font-medium mb-1">Status</p>
            <Badge variant={getStatusBadgeVariant(user.status)}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 font-medium mb-1">User ID</p>
            <p className="text-sm font-mono text-neutral-900">{user.id}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-600 font-medium mb-1">Created</p>
            <p className="text-sm text-neutral-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 col-span-2">
            <p className="text-xs text-neutral-600 font-medium mb-1">Last Updated</p>
            <p className="text-sm text-neutral-900">
              {new Date(user.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Information */}
        <div className="border-t border-neutral-200 pt-4">
          <div className="flex items-center gap-2 text-sm">
            {user.status === 'active' ? (
              <>
                <Icon name="CheckCircle" size={16} className="text-success-600" />
                <span className="text-neutral-700">User account is active</span>
              </>
            ) : user.status === 'blocked' ? (
              <>
                <Icon name="AlertCircle" size={16} className="text-danger-600" />
                <span className="text-neutral-700">User account is blocked</span>
              </>
            ) : (
              <>
                <Icon name="AlertCircle" size={16} className="text-warning-600" />
                <span className="text-neutral-700">User account is inactive</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UserDetailsModal
