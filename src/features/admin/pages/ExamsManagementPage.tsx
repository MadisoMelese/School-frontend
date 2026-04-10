import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { apiClient } from '@services/api/client';

interface Exam {
  id: string;
  name: string;
  class: string;
  date: string;
  totalMarks: number;
}

export const ExamsManagementPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/exams');
        const data = response.data.data;
        setExams(Array.isArray(data) ? data : data?.exams || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  return (
    <DashboardLayout title="Exams Management" description="Manage all exams">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading exams...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Total Exams: {exams.length}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Class
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Total Marks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white"
                    >
                      <td className="px-4 py-2">{exam.name}</td>
                      <td className="px-4 py-2">{exam.class}</td>
                      <td className="px-4 py-2">{exam.date}</td>
                      <td className="px-4 py-2">{exam.totalMarks}</td>
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

export default ExamsManagementPage;
