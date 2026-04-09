import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@components/templates/DashboardLayout'
import { Button } from '@components/atoms/Button'
import { Input } from '@components/atoms/Input'
import { apiClient } from '@services/api/client'

/**
 * Teachers Management Page
 * Allows admins to view, create, update, and delete teachers
 */

interface Teacher {
  id: string
  name: string
  email: string
  department: string
  qualification: string
  status: string
  phone?: string
  address?: string
}

interface FormData {
  name: string
  email: string
  department: string
  qualification: string
  status: string
  phone: string
  address: string
}

export const TeachersManagementPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    department: '',
    qualification: '',
    status: 'active',
    phone: '',
    address: '',
  })

  // Load teachers
  const loadTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/teachers')
      const data = response.data.data
      setTeachers(Array.isArray(data) ? data : data?.teachers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle create teacher
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError(null)
      await apiClient.post('/teachers', formData)
      setSuccess('Teacher created successfully')
      setFormData({
        name: '',
        email: '',
        department: '',
        qualification: '',
        status: 'active',
        phone: '',
        address: '',
      })
      setShowForm(false)
      await loadTeachers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create teacher')
    }
  }

  // Handle edit teacher
  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      qualification: teacher.qualification,
      status: teacher.status,
      phone: teacher.phone || '',
      address: teacher.address || '',
    })
    setShowForm(true)
  }

  // Handle update teacher
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return

    try {
      setError(null)
      await apiClient.put(`/teachers/${editingId}`, formData)
      setSuccess('Teacher updated successfully')
      setFormData({
        name: '',
        email: '',
        department: '',
        qualification: '',
        status: 'active',
        phone: '',
        address: '',
      })
      setEditingId(null)
      setShowForm(false)
      await loadTeachers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update teacher')
    }
  }

  // Handle delete teacher
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return

    try {
      setError(null)
      await apiClient.delete(`/teachers/${id}`)
      setSuccess('Teacher deleted successfully')
      await loadTeachers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete teacher')
    }
  }

  // Handle cancel form
  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      department: '',
      qualification: '',
      status: 'active',
      phone: '',
      address: '',
    })
  }

  return (
    <DashboardLayout
      title="Teachers Management"
      description="Manage all teachers in the system"
    >
      <div className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-success-700">{success}</p>
          </div>
        )}

        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-neutral-600">Total Teachers: {teachers.length}</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="primary">
              + Add Teacher
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Teacher' : 'Create New Teacher'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter teacher name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Department *
                  </label>
                  <Input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Qualification *
                  </label>
                  <Input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="Enter qualification"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary">
                  {editingId ? 'Update Teacher' : 'Create Teacher'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Teachers List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading && <p className="p-6 text-neutral-600">Loading teachers...</p>}
          {!loading && teachers.length === 0 && (
            <p className="p-6 text-neutral-600">No teachers found. Create one to get started.</p>
          )}
          {!loading && teachers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Department</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Qualification</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-t hover:bg-neutral-50">
                      <td className="px-4 py-3">{teacher.name}</td>
                      <td className="px-4 py-3">{teacher.email}</td>
                      <td className="px-4 py-3">{teacher.department}</td>
                      <td className="px-4 py-3">{teacher.qualification}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            teacher.status === 'active'
                              ? 'bg-success-100 text-success-700'
                              : teacher.status === 'on_leave'
                                ? 'bg-warning-100 text-warning-700'
                                : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEdit(teacher)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TeachersManagementPage
