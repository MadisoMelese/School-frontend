import React, { useState } from 'react'
import { Modal } from '@components/molecules/Modal'
import { Button } from '@components/atoms/Button'
import { FormField } from '@components/molecules/FormField'
import { Input } from '@components/atoms/Input'
import type { UserRole } from '@types/api.types'

interface UserCreateFormProps {
  onSubmit: (data: any) => Promise<void>
  onClose: () => void
}

/**
 * User Create Form
 * Form for creating a new user with email, name, and role
 * Sends welcome email with temporary password
 */
const UserCreateForm: React.FC<UserCreateFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'student' as UserRole,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      if (!validateForm()) return

      setLoading(true)
      await onSubmit(formData)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Modal isOpen={true} onClose={onClose} title="User Created" size="sm">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">User created successfully!</p>
            <p className="text-sm text-neutral-600 mt-1">
              A welcome email with temporary password has been sent to {formData.email}
            </p>
          </div>
        </div>
      </Modal>
    )
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Create User
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

        {/* Email Field */}
        <FormField label="Email Address" required>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            disabled={loading}
            required
            aria-label="Email address"
          />
        </FormField>

        {/* Name Field */}
        <FormField label="Full Name" required>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            disabled={loading}
            required
            aria-label="Full name"
          />
        </FormField>

        {/* Role Field */}
        <FormField label="Role" required>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
            required
            aria-label="User role"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>

        {/* Info Message */}
        <div className="p-3 bg-info-50 border border-info-200 rounded-lg text-info-700 text-sm">
          <p className="font-medium mb-1">Welcome Email</p>
          <p>
            A welcome email with a temporary password will be sent to the user's email address.
          </p>
        </div>
      </form>
    </Modal>
  )
}

export default UserCreateForm
