import React, { useState } from 'react'
import { Modal } from '@components/molecules/Modal'
import { Button } from '@components/atoms/Button'
import { FormField } from '@components/molecules/FormField'
import { Input } from '@components/atoms/Input'
import { Label } from '@components/atoms/Label'
import type { User, UserRole } from '@types/api.types'

interface UserEditFormProps {
  user: User
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
  onRoleChange: (userId: string, role: UserRole) => Promise<void>
}

/**
 * User Edit Form
 * Allows editing user information and role
 */
const UserEditForm: React.FC<UserEditFormProps> = ({
  user,
  onSubmit,
  onClose,
  onRoleChange,
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole
    try {
      setRoleLoading(true)
      setError(null)
      await onRoleChange(user.id, newRole)
      setFormData((prev) => ({ ...prev, role: newRole }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role')
      // Reset role to previous value
      setFormData((prev) => ({ ...prev, role: user.role }))
    } finally {
      setRoleLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit User"
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error Message */}
        {error && (
          <div
            className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Name Field */}
        <FormField label="Name" required>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter user name"
            disabled={loading}
            required
          />
        </FormField>

        {/* Email Field */}
        <FormField label="Email" required>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            disabled={loading}
            required
          />
        </FormField>

        {/* Role Field */}
        <FormField label="Role" required>
          <select
            name="role"
            value={formData.role}
            onChange={handleRoleChange}
            disabled={loading || roleLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>

        {/* User ID (Read-only) */}
        <FormField label="User ID">
          <Input
            type="text"
            value={user.id}
            disabled
            className="bg-neutral-100"
          />
        </FormField>

        {/* Created Date (Read-only) */}
        <FormField label="Created">
          <Input
            type="text"
            value={new Date(user.createdAt).toLocaleString()}
            disabled
            className="bg-neutral-100"
          />
        </FormField>
      </form>
    </Modal>
  )
}

export default UserEditForm
