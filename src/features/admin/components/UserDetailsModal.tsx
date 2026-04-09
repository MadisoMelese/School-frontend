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
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-semibold text-primary-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{user.name}</h3>
            <p className="text-sm text-neutral-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Role</p>
            <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Status</p>
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
            <p className="text-xs font-medium text-neutral-500 uppercase">Created</p>
            <p className="text-sm text-neutral-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase">Updated</p>
            <p className="text-sm text-neutral-900">
              {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default UserDetailsModal
