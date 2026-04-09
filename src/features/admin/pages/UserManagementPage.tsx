import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { DataTable, type Column } from '@components/organisms/DataTable'
import { Modal } from '@components/molecules/Modal'
import { Button } from '@components/atoms/Button'
import { Badge } from '@components/atoms/Badge'
import { Icon } from '@components/atoms/Icon'
import { Card } from '@components/molecules/Card'
import { Input } from '@components/atoms/Input'
import { Dropdown } from '@components/molecules/Dropdown'
import { useUsers } from '../hooks/useUsers'
import type { User, UserRole, UserStatus } from '@/types/api.types'
import UserDetailsModal from '../components/UserDetailsModal'
import UserEditForm from '../components/UserEditForm'
import UserCreateForm from '../components/UserCreateForm'

/**
 * Admin User Management Page
 * Displays list of all users with filtering, searching, and management options
 * Supports: view details, edit, change role, block/unblock, delete, create
 */

type ModalType = 'details' | 'edit' | 'create' | 'delete' | null

interface ModalState {
  type: ModalType
  user?: User
}

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'inactive', label: 'Inactive' },
]

export const UserManagementPage: React.FC = () => {
  const {
    users,
    total,
    page,
    limit,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    changeRole,
    blockUser,
    unblockUser,
    deleteUser,
  } = useUsers()

  const [modal, setModal] = useState<ModalState>({ type: null })
  const [filters, setFilters] = useState({
    role: '' as UserRole | '',
    status: '' as UserStatus | '',
    search: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Load users on mount and when filters change
  useEffect(() => {
    fetchUsers({
      role: filters.role || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
      page,
      limit,
    })
  }, [filters, page, limit, fetchUsers])

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Handle search with debouncing
  const handleSearch = (query: string) => {
    handleFilterChange('search', query)
  }

  // Open modals
  const openDetailsModal = (user: User) => {
    setModal({ type: 'details', user })
  }

  const openEditModal = (user: User) => {
    setModal({ type: 'edit', user })
  }

  const openCreateModal = () => {
    setModal({ type: 'create' })
  }

  const openDeleteConfirm = (userId: string) => {
    setDeleteConfirm(userId)
  }

  // Close modals
  const closeModal = () => {
    setModal({ type: null })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null)
  }

  // Handle user creation
  const handleCreateUser = async (data: any) => {
    try {
      await createUser(data.email, data.name, data.role)
      closeModal()
    } catch (err) {
      throw err
    }
  }

  // Handle user update
  const handleUpdateUser = async (data: any) => {
    if (!modal.user) return
    try {
      await updateUser(modal.user.id, data)
      closeModal()
    } catch (err) {
      throw err
    }
  }

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await changeRole(userId, newRole)
    } catch (err) {
      console.error('Failed to change role:', err)
    }
  }

  // Handle block/unblock
  const handleToggleBlock = async (user: User) => {
    try {
      if (user.status === 'blocked') {
        await unblockUser(user.id)
      } else {
        await blockUser(user.id)
      }
    } catch (err) {
      console.error('Failed to toggle block status:', err)
    }
  }

  // Handle delete
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      closeDeleteConfirm()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-300">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">{value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: UserRole) => (
        <Badge
          variant={
            value === 'admin'
              ? 'danger'
              : value === 'teacher'
                ? 'info'
                : value === 'parent'
                  ? 'warning'
                  : 'success'
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: UserStatus) => (
        <Badge
          variant={
            value === 'active'
              ? 'success'
              : value === 'blocked'
                ? 'danger'
                : 'warning'
          }
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDetailsModal(row)}
            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded transition-colors"
            title="View details"
            aria-label={`View details for ${row.name}`}
          >
            <Icon name="Eye" size={16} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded transition-colors"
            title="Edit user"
            aria-label={`Edit ${row.name}`}
          >
            <Icon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => handleToggleBlock(row)}
            className={`p-1 rounded transition-colors ${
              row.status === 'blocked'
                ? 'text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900'
                : 'text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900'
            }`}
            title={row.status === 'blocked' ? 'Unblock user' : 'Block user'}
            aria-label={row.status === 'blocked' ? `Unblock ${row.name}` : `Block ${row.name}`}
          >
            <Icon name={row.status === 'blocked' ? 'Unlock' : 'Lock'} size={16} />
          </button>
          <button
            onClick={() => openDeleteConfirm(row.id)}
            className="p-1 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900 rounded transition-colors"
            title="Delete user"
            aria-label={`Delete ${row.name}`}
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="User Management"
      description="Manage all users in the system"
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Users</h1>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center gap-2"
          >
            <Icon name="Plus" size={18} />
            Create User
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search users"
              />
              <Dropdown
                options={roleOptions}
                value={filters.role}
                onChange={(value) => handleFilterChange('role', value)}
                placeholder="Filter by role"
                aria-label="Filter by role"
              />
              <Dropdown
                options={statusOptions}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                placeholder="Filter by status"
                aria-label="Filter by status"
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            error={error || undefined}
            pageSize={limit}
            totalItems={total}
            keyExtractor={(user) => user.id}
          />
        </Card>
      </div>

      {/* User Details Modal */}
      {modal.type === 'details' && modal.user && (
        <UserDetailsModal user={modal.user} onClose={closeModal} />
      )}

      {/* User Edit Modal */}
      {modal.type === 'edit' && modal.user && (
        <UserEditForm
          user={modal.user}
          onSubmit={handleUpdateUser}
          onClose={closeModal}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* User Create Modal */}
      {modal.type === 'create' && (
        <UserCreateForm onSubmit={handleCreateUser} onClose={closeModal} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={true}
          onClose={closeDeleteConfirm}
          title="Delete User"
          size="sm"
          actions={
            <>
              <Button variant="secondary" onClick={closeDeleteConfirm}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteUser(deleteConfirm)}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default UserManagementPage
