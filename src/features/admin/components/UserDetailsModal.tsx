import React from 'react'
import { Modal } from '@components/molecules/Modal'
import { Badge } from '@components/atoms/Badge'
import type { User } from '@/types/api.types'

interface UserDetailsModalProps {
  user: User
  onClose: () => void
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="User Details"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstname} ${user.lastname}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl font-semibold text-primary-600 dark:text-primary-300">
              {`${user.firstname} ${user.lastname}`.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{user.firstname} {user.lastname}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Role</p>
            <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</p>
            <Badge
              variant={
                user.status === 'active'
                  ? 'success'
                  : user.status === 'blocked'
                    ? 'danger'
                    : 'warning'
              }
            >
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Created</p>
            <p className="text-sm text-neutral-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Updated</p>
            <p className="text-sm text-neutral-900 dark:text-white">
              {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UserDetailsModal
