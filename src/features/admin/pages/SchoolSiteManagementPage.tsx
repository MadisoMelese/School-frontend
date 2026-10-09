import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { apiClient } from '@services/api/client';

const sections = [
  ['news', 'News'],
  ['events', 'Events'],
  ['academic-calendar', 'Academic calendar'],
  ['announcements', 'Announcements'],
  ['photo-gallery', 'Photo gallery'],
  ['video-gallery', 'Video gallery'],
  ['about-us', 'About us'],
  ['director', 'Director'],
  ['staff-members', 'Staff members'],
  ['administration', 'Administration'],
  ['vision-and-mission', 'Vision and mission'],
  ['contact', 'Contact'],
] as const;

type Section = (typeof sections)[number][0];
type ContentStatus = 'draft' | 'published';

interface SchoolContentRecord {
  _id: string;
  section: Section;
  title: { en: string; am: string };
  summary?: { en: string; am: string };
  body?: { en: string; am: string };
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  externalUrl?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  status: ContentStatus;
  featured: boolean;
  sortOrder: number;
}

interface ContentForm {
  section: Section;
  titleEn: string;
  titleAm: string;
  summaryEn: string;
  summaryAm: string;
  bodyEn: string;
  bodyAm: string;
  mediaUrl: string;
  mediaType: '' | 'image' | 'video';
  externalUrl: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: ContentStatus;
  featured: boolean;
  sortOrder: number;
}

const blankForm: ContentForm = {
  section: 'news',
  titleEn: '',
  titleAm: '',
  summaryEn: '',
  summaryAm: '',
  bodyEn: '',
  bodyAm: '',
  mediaUrl: '',
  mediaType: '',
  externalUrl: '',
  location: '',
  startsAt: '',
  endsAt: '',
  status: 'draft',
  featured: false,
  sortOrder: 0,
};

const localDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const getSectionLabel = (section: Section) =>
  sections.find(([key]) => key === section)?.[1] ?? section;

export const SchoolSiteManagementPage = () => {
  const [records, setRecords] = useState<SchoolContentRecord[]>([]);
  const [form, setForm] = useState<ContentForm>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<Section | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (sectionFilter !== 'all') params.section = sectionFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await apiClient.get<{
        data: { items: SchoolContentRecord[] };
      }>('/school-site/admin', { params });
      setRecords(response.data.data.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load school site content.');
    } finally {
      setLoading(false);
    }
  }, [sectionFilter, statusFilter]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const editRecord = (record: SchoolContentRecord) => {
    setEditingId(record._id);
    setForm({
      section: record.section,
      titleEn: record.title.en,
      titleAm: record.title.am,
      summaryEn: record.summary?.en ?? '',
      summaryAm: record.summary?.am ?? '',
      bodyEn: record.body?.en ?? '',
      bodyAm: record.body?.am ?? '',
      mediaUrl: record.mediaUrl ?? '',
      mediaType: record.mediaType ?? '',
      externalUrl: record.externalUrl ?? '',
      location: record.location ?? '',
      startsAt: localDateTime(record.startsAt),
      endsAt: localDateTime(record.endsAt),
      status: record.status,
      featured: record.featured,
      sortOrder: record.sortOrder,
    });
    setNotice(null);
    document.getElementById('school-site-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload = {
      section: form.section,
      title: { en: form.titleEn, am: form.titleAm },
      summary: { en: form.summaryEn, am: form.summaryAm },
      body: { en: form.bodyEn, am: form.bodyAm },
      mediaUrl: form.mediaUrl,
      externalUrl: form.externalUrl,
      location: form.location,
      status: form.status,
      featured: form.featured,
      sortOrder: Number(form.sortOrder),
      ...(editingId
        ? {
            mediaType: form.mediaType || null,
            startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
            endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          }
        : {
            ...(form.mediaType ? { mediaType: form.mediaType } : {}),
            ...(form.startsAt ? { startsAt: new Date(form.startsAt).toISOString() } : {}),
            ...(form.endsAt ? { endsAt: new Date(form.endsAt).toISOString() } : {}),
          }),
    };

    try {
      if (editingId) {
        await apiClient.put(`/school-site/admin/${editingId}`, payload);
        setNotice('School site content updated.');
      } else {
        await apiClient.post('/school-site/admin', payload);
        setNotice('School site content created.');
      }
      resetForm();
      await loadRecords();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save school site content.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record: SchoolContentRecord) => {
    const label = record.title.en || record.title.am || getSectionLabel(record.section);
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError(null);
    setNotice(null);
    try {
      await apiClient.delete(`/school-site/admin/${record._id}`);
      if (editingId === record._id) resetForm();
      setNotice('School site content deleted.');
      await loadRecords();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete school site content.');
    }
  };

  const update = <K extends keyof ContentForm>(key: K, value: ContentForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <DashboardLayout
      title="School Website Content"
      description="Create, edit, and publish content on the public school website."
    >
      <div className="space-y-6">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {notice}
          </div>
        )}

        <section id="school-site-editor" className="rounded-xl bg-white p-5 shadow dark:bg-neutral-800 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingId ? 'Edit content' : 'Add website content'}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Enter English and Amharic text. Drafts stay private until published.
              </p>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700" aria-label="Cancel editing">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={saveRecord} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Page / section
                <select value={form.section} onChange={(event) => update('section', event.target.value as Section)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900">
                  {sections.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Publishing status
                <select value={form.status} onChange={(event) => update('status', event.target.value as ContentStatus)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900">
                  <option value="draft">Draft — private</option>
                  <option value="published">Published — public</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Title (English)
                <input value={form.titleEn} onChange={(event) => update('titleEn', event.target.value)} maxLength={200} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                ርዕስ (አማርኛ)
                <input value={form.titleAm} onChange={(event) => update('titleAm', event.target.value)} maxLength={200} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Short summary (English)
                <textarea value={form.summaryEn} onChange={(event) => update('summaryEn', event.target.value)} rows={3} maxLength={1000} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                አጭር ማጠቃለያ (አማርኛ)
                <textarea value={form.summaryAm} onChange={(event) => update('summaryAm', event.target.value)} rows={3} maxLength={1000} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Main text (English)
                <textarea value={form.bodyEn} onChange={(event) => update('bodyEn', event.target.value)} rows={6} maxLength={20000} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                ዋና ጽሑፍ (አማርኛ)
                <textarea value={form.bodyAm} onChange={(event) => update('bodyAm', event.target.value)} rows={6} maxLength={20000} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Image or video URL
                <input type="url" value={form.mediaUrl} onChange={(event) => update('mediaUrl', event.target.value)} placeholder="https://…" className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Media type
                <select value={form.mediaType} onChange={(event) => update('mediaType', event.target.value as ContentForm['mediaType'])} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900">
                  <option value="">No media</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Additional link URL
                <input type="url" value={form.externalUrl} onChange={(event) => update('externalUrl', event.target.value)} placeholder="https://…" className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Location (events / contact)
                <input value={form.location} onChange={(event) => update('location', event.target.value)} maxLength={300} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Start date and time
                <input type="datetime-local" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                End date and time
                <input type="datetime-local" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Display order
                <input type="number" value={form.sortOrder} onChange={(event) => update('sortOrder', Number(event.target.value))} min={-10000} max={10000} className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white p-2.5 dark:border-neutral-600 dark:bg-neutral-900" />
              </label>
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                <input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} />
                Feature this item
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 font-semibold text-white hover:bg-primary-700 disabled:opacity-60">
                {editingId ? <Save size={17} /> : <Plus size={17} />}
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create content'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-lg border border-neutral-300 px-5 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow dark:bg-neutral-800 sm:p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Published and draft content</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Items in draft status are not visible on the public site.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select aria-label="Filter by page" value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as Section | 'all')} className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-900">
                <option value="all">All pages</option>
                {sections.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContentStatus | 'all')} className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-600 dark:bg-neutral-900">
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold dark:border-neutral-600">
                <ImagePlus size={16} /> New
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-neutral-600 dark:text-neutral-300">Loading website content…</p>
          ) : records.length === 0 ? (
            <p className="rounded-lg bg-neutral-50 p-6 text-center text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
              No content matches these filters. Create a record above to populate a public page.
            </p>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {records.map((record) => (
                <article key={record._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {record.title.en || record.title.am || 'Untitled'}
                      </h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {getSectionLabel(record.section)}
                      {record.title.am ? ` · ${record.title.am}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => editRecord(record)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-700">
                      <Pencil size={15} /> Edit
                    </button>
                    <button type="button" onClick={() => void deleteRecord(record)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SchoolSiteManagementPage;
