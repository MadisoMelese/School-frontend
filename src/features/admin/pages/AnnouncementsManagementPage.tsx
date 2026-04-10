import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { apiClient } from '@services/api/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export const AnnouncementsManagementPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/announcements');
        const data = response.data.data;
        setAnnouncements(Array.isArray(data) ? data : data?.announcements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  return (
    <DashboardLayout title="Announcements Management" description="Manage all announcements">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {loading && (
          <p className="text-neutral-600 dark:text-neutral-400">Loading announcements...</p>
        )}
        {error && <p className="text-danger-600 dark:text-danger-200">{error}</p>}
        {!loading && !error && (
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Total Announcements: {announcements.length}
            </p>
            <div className="mt-4 space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 dark:bg-neutral-700"
                >
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    By {announcement.createdBy} on {announcement.createdAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsManagementPage;
