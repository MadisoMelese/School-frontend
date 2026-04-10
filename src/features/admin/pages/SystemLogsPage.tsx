import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { DataTable, type Column } from '@components/organisms/DataTable';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { Icon } from '@components/atoms/Icon';
import { Card } from '@components/molecules/Card';
import { Input } from '@components/atoms/Input';
import { Dropdown } from '@components/molecules/Dropdown';
import { Modal } from '@components/molecules/Modal';
import { ExportDialog, type ColumnOption } from '@components/molecules/ExportDialog';
import { useSystemLogs } from '../hooks/useSystemLogs';
import type { SystemLog } from '../../../types/api.types';

/**
 * Admin System Logs Page
 * Displays system activity logs with advanced filtering, searching, and export functionality
 * Supports: view logs, filter by date/user/action/resource/level/status, search, pagination, export to CSV/PDF
 * Features: detailed log view modal, filter presets, bulk actions, timeline view, real-time updates
 */

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'export', label: 'Export' },
  { value: 'import', label: 'Import' },
];

const resourceOptions = [
  { value: '', label: 'All Resources' },
  { value: 'user', label: 'User' },
  { value: 'grade', label: 'Grade' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'exam', label: 'Exam' },
  { value: 'fee', label: 'Fee' },
  { value: 'message', label: 'Message' },
  { value: 'class', label: 'Class' },
  { value: 'timetable', label: 'Timetable' },
];

const logLevelOptions = [
  { value: '', label: 'All Levels' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
];

interface FilterPreset {
  name: string;
  filters: typeof initialFilters;
}

const initialFilters = {
  action: '',
  resource: '',
  userId: '',
  startDate: '',
  endDate: '',
  search: '',
  logLevel: '',
  status: '',
};

export const SystemLogsPage: React.FC = () => {
  const { logs, total, limit, loading, error, exporting, fetchLogs, exportAsCSV, exportAsPDF } =
    useSystemLogs();

  const [filters, setFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Available columns for export
  const exportColumns: ColumnOption[] = [
    { key: 'timestamp', label: 'Timestamp', selected: true },
    { key: 'userName', label: 'User Name', selected: true },
    { key: 'userId', label: 'User ID', selected: true },
    { key: 'action', label: 'Action', selected: true },
    { key: 'resource', label: 'Resource', selected: true },
    { key: 'details', label: 'Details', selected: false },
  ];

  // Load filter presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('logFilterPresets');
    if (saved) {
      try {
        setFilterPresets(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load filter presets:', err);
      }
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Load logs on mount and when filters change
  useEffect(() => {
    fetchLogs({
      action: filters.action || undefined,
      resource: filters.resource || undefined,
      userId: filters.userId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      search: debouncedSearch || undefined,
      page: currentPage,
      limit,
    });
  }, [
    filters.action,
    filters.resource,
    filters.userId,
    filters.startDate,
    filters.endDate,
    debouncedSearch,
    currentPage,
    limit,
    fetchLogs,
  ]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (query: string) => {
    handleFilterChange('search', query);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle export
  const handleExport = async (options: any) => {
    try {
      const exportFilters = {
        action: filters.action || undefined,
        resource: filters.resource || undefined,
        userId: filters.userId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: debouncedSearch || undefined,
      };

      if (options.format === 'csv') {
        await exportAsCSV(exportFilters, options.filename);
      } else {
        await exportAsPDF(exportFilters, options.filename);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
    setSelectedLogs(new Set());
  };

  // Save filter preset
  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: FilterPreset = { name: presetName, filters };
    const updated = [...filterPresets, newPreset];
    setFilterPresets(updated);
    localStorage.setItem('logFilterPresets', JSON.stringify(updated));
    setPresetName('');
  };

  // Load filter preset
  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    setCurrentPage(1);
  };

  // Delete filter preset
  const handleDeletePreset = (name: string) => {
    const updated = filterPresets.filter((p) => p.name !== name);
    setFilterPresets(updated);
    localStorage.setItem('logFilterPresets', JSON.stringify(updated));
  };

  // Get action badge variant
  const getActionVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'delete':
        return 'danger';
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'login':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  // Define table columns
  const columns: Column<SystemLog>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => {
            setSelectedLog(row);
            setShowDetailModal(true);
          }}
          className="text-sm hover:text-primary-600 cursor-pointer"
        >
          <p className="font-medium text-neutral-900">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-neutral-500">{new Date(value).toLocaleTimeString()}</p>
        </button>
      ),
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => {
            setSelectedLog(row);
            setShowDetailModal(true);
          }}
          className="flex items-center gap-2 hover:text-primary-600 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-600">
            {value.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-neutral-900">{value}</span>
        </button>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getActionVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-neutral-700">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (value?: Record<string, unknown>) => {
        if (!value) return <span className="text-xs text-neutral-500">-</span>;
        const details = Object.entries(value)
          .slice(0, 2)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        return <span className="text-xs text-neutral-600 truncate">{details}</span>;
      },
    },
  ];

  return (
    <DashboardLayout title="System Logs" description="View and manage system activity logs">
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">System Logs</h1>
            {activeFilterCount > 0 && (
              <p className="text-sm text-neutral-600 mt-1">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2"
            >
              <Icon name="Filter" size={18} />
              {showFilterPanel ? 'Hide' : 'Show'} Filters
            </Button>
            <Button
              variant="secondary"
              onClick={() => setViewMode(viewMode === 'table' ? 'timeline' : 'table')}
              className="flex items-center gap-2"
            >
              <Icon name={viewMode === 'table' ? 'Clock' : 'Table'} size={18} />
              {viewMode === 'table' ? 'Timeline' : 'Table'} View
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowExportDialog(true)}
              disabled={exporting || logs.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Icon name="Loader" size={18} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Icon name="Download" size={18} />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Card */}
        {showFilterPanel && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">Advanced Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1"
                  >
                    <Icon name="X" size={16} />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Main Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search logs"
                />
                <Dropdown
                  options={actionOptions}
                  value={filters.action}
                  onChange={(value) => handleFilterChange('action', value)}
                  placeholder="Filter by action"
                  aria-label="Filter by action"
                />
                <Dropdown
                  options={resourceOptions}
                  value={filters.resource}
                  onChange={(value) => handleFilterChange('resource', value)}
                  placeholder="Filter by resource"
                  aria-label="Filter by resource"
                />
                <Dropdown
                  options={logLevelOptions}
                  value={filters.logLevel}
                  onChange={(value) => handleFilterChange('logLevel', value)}
                  placeholder="Filter by log level"
                  aria-label="Filter by log level"
                />
              </div>

              {/* Date and Status Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  aria-label="Start date"
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  aria-label="End date"
                />
                <Dropdown
                  options={statusOptions}
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  placeholder="Filter by status"
                  aria-label="Filter by status"
                />
                <Input
                  type="text"
                  placeholder="User ID"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  aria-label="Filter by user ID"
                />
              </div>

              {/* Filter Presets */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Save Current Filters as Preset
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Preset name (e.g., 'Failed Logins')"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        aria-label="Preset name"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Saved Presets */}
                {filterPresets.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Saved Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {filterPresets.map((preset) => (
                        <div
                          key={preset.name}
                          className="flex items-center gap-2 bg-neutral-100 px-3 py-2 rounded-lg"
                        >
                          <button
                            onClick={() => handleLoadPreset(preset)}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                          >
                            {preset.name}
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.name)}
                            className="text-neutral-500 hover:text-danger-600"
                            aria-label={`Delete preset ${preset.name}`}
                          >
                            <Icon name="X" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Logs Display */}
        <Card>
          {viewMode === 'table' ? (
            <>
              {/* Bulk Actions */}
              {selectedLogs.size > 0 && (
                <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-900">
                    {selectedLogs.size} log{selectedLogs.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedLogs(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              )}

              <DataTable
                columns={columns}
                data={logs}
                loading={loading}
                error={error || undefined}
                pageSize={limit}
                totalItems={total}
                onPageChange={handlePageChange}
                keyExtractor={(log: SystemLog) => log.id}
              />
            </>
          ) : (
            /* Timeline View */
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Icon name="Loader" size={24} className="animate-spin text-primary-600" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <Icon name="AlertCircle" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No logs found</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex gap-4 pb-4 border-b border-neutral-200 last:border-b-0 cursor-pointer hover:bg-neutral-50 p-3 rounded-lg transition-colors"
                    onClick={() => {
                      setSelectedLog(log);
                      setShowDetailModal(true);
                    }}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary-600 mt-1.5" />
                      {index < logs.length - 1 && (
                        <div className="w-0.5 h-12 bg-neutral-200 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-600">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-900">{log.userName}</span>
                        <Badge variant={getActionVariant(log.action)} size="sm">
                          {log.action}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {log.resource}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.details && (
                        <p className="text-xs text-neutral-600 mt-1 truncate">
                          {Object.entries(log.details)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Log View Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">User</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                    {selectedLog.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-neutral-900">{selectedLog.userName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase">Timestamp</p>
                <p className="font-medium text-neutral-900 mt-1">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase">Action</p>
                  <Badge variant={getActionVariant(selectedLog.action)} className="mt-1">
                    {selectedLog.action.charAt(0).toUpperCase() + selectedLog.action.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase">Resource</p>
                  <Badge variant="neutral" className="mt-1">
                    {selectedLog.resource.charAt(0).toUpperCase() + selectedLog.resource.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details Section */}
            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div className="border-t border-neutral-200 pt-4">
                <p className="text-sm font-semibold text-neutral-900 mb-3">
                  Request/Response Details
                </p>
                <div className="bg-neutral-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-neutral-700 whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm font-semibold text-neutral-900 mb-2">User Information</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">User ID:</span>
                  <span className="font-medium text-neutral-900">{selectedLog.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">User Name:</span>
                  <span className="font-medium text-neutral-900">{selectedLog.userName}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        title="Export System Logs"
        description="Choose export format and select which columns to include in the export"
        availableColumns={exportColumns}
        isLoading={exporting}
      />
    </DashboardLayout>
  );
};

export default SystemLogsPage;
