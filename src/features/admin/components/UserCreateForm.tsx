import React, { useState } from 'react'
import { Modal } from '@components/molecules/Modal'
import { Button } from '@components/atoms/Button'
import { Input } from '@components/atoms/Input'
import type { UserRole } from '@/types/api.types'

interface UserCreateFormProps {
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'admin', label: 'Admin' },
]

export const UserCreateForm: React.FC<UserCreateFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!formData.role) {
      setError('Role is required')
      setLoading(false)
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New User"
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-900 rounded-lg p-3">
            <p className="text-sm text-danger-700 dark:text-danger-200">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter user name"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
            required
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}

export default UserCreateForm
