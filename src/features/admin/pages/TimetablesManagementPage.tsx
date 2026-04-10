import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { apiClient } from '@services/api/client';

interface Timetable {
  id: string;
  class: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
}

export const TimetablesManagementPage: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTimetables = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/timetables');
        const data = response.data.data;
        setTimetables(Array.isArray(data) ? data : data?.timetables || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timetables');
      } finally {
        setLoading(false);
      }
    };

    loadTimetables();
  }, []);

  return (
    <DashboardLayout title="Timetables Management" description="Manage all timetables">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && <p className="text-neutral-600 dark:text-neutral-400">Loading timetables...</p>}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Total Timetables: {timetables.length}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Class
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Day
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Time
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Subject
                    </th>
                    <th className="px-4 py-2 text-left text-neutral-900 dark:text-neutral-300">
                      Teacher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timetables.map((tt) => (
                    <tr
                      key={tt.id}
                      className="border-t border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700 dark:text-white"
                    >
                      <td className="px-4 py-2">{tt.class}</td>
                      <td className="px-4 py-2">{tt.day}</td>
                      <td className="px-4 py-2">
                        {tt.startTime} - {tt.endTime}
                      </td>
                      <td className="px-4 py-2">{tt.subject}</td>
                      <td className="px-4 py-2">{tt.teacher}</td>
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

export default TimetablesManagementPage;
