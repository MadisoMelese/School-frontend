import React, { useState } from 'react';
import { Modal } from '@components/molecules/Modal';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import type { User, UserRole } from '@/types/api.types';

interface UserEditFormProps {
  user: User;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  onRoleChange?: (userId: string, role: UserRole) => Promise<void>;
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'admin', label: 'Admin' },
];

export const UserEditForm: React.FC<UserEditFormProps> = ({
  user,
  onSubmit,
  onClose,
  onRoleChange,
}) => {
  const [formData, setFormData] = useState({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = async (newRole: UserRole) => {
    setFormData((prev) => ({ ...prev, role: newRole }));
    if (onRoleChange && newRole !== user.role) {
      try {
        await onRoleChange(user.id, newRole);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to change role');
        setFormData((prev) => ({ ...prev, role: user.role }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

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
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
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
            First Name
          </label>
          <Input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter first name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Last Name
          </label>
          <Input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter last name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
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
  );
};

export default UserEditForm;
