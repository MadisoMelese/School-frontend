import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { useAuth } from '@hooks/useAuth';
import { apiClient } from '@services/api/client';

/**
 * Students Management Page
 * Allows admins to view, create, update, and delete students
 */

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  status: string;
}

export const StudentsManagementPage: React.FC = () => {
  useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/students');
        const data = response.data.data;
        setStudents(Array.isArray(data) ? data : data?.students || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <DashboardLayout title="Students Management" description="Manage all students in the system">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading students...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">Error: {error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Total Students: {students.length}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Roll Number
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Class
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white"
                    >
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{student.email}</td>
                      <td className="px-4 py-2">{student.rollNumber}</td>
                      <td className="px-4 py-2">{student.class}</td>
                      <td className="px-4 py-2">{student.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentsManagementPage;
