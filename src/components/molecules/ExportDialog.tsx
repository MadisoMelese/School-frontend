import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '@components/atoms/Button';
import { Icon } from '@components/atoms/Icon';
import { Checkbox } from '@components/atoms/Checkbox';
import { Input } from '@components/atoms/Input';
import { Dropdown } from './Dropdown';

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  title?: string;
  description?: string;
  availableColumns: ColumnOption[];
  defaultFormat?: 'csv' | 'pdf';
  isLoading?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  columns: string[];
  filename: string;
}

export interface ColumnOption {
  key: string;
  label: string;
  selected?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  title = 'Export Data',
  description = 'Choose export format and columns to include',
  availableColumns,
  defaultFormat = 'csv',
  isLoading = false,
}) => {
  const [format, setFormat] = useState<'csv' | 'pdf'>(defaultFormat);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(availableColumns.filter((col) => col.selected !== false).map((col) => col.key))
  );
  const [filename, setFilename] = useState(`export-${new Date().toISOString().split('T')[0]}`);

  const formatOptions = [
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'pdf', label: 'PDF (.pdf)' },
  ];

  const selectedCount = selectedColumns.size;
  const totalCount = availableColumns.length;

  const handleToggleColumn = (key: string) => {
    const updated = new Set(selectedColumns);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedColumns(updated);
  };

  const handleSelectAll = () => {
    if (selectedCount === totalCount) {
      setSelectedColumns(new Set());
    } else {
      setSelectedColumns(new Set(availableColumns.map((col) => col.key)));
    }
  };

  const handleExport = async () => {
    if (selectedColumns.size === 0) {
      alert('Please select at least one column to export');
      return;
    }

    try {
      await onExport({
        format,
        columns: Array.from(selectedColumns),
        filename: `${filename}.${format}`,
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
        {/* Description */}
        <p className="text-sm text-neutral-600">{description}</p>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Export Format</label>
          <Dropdown
            options={formatOptions}
            value={format}
            onChange={(value) => setFormat(value as 'csv' | 'pdf')}
            placeholder="Select format"
            aria-label="Export format"
          />
        </div>

        {/* Filename */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">Filename</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
              aria-label="Export filename"
            />
            <span className="text-sm text-neutral-600 py-2">.{format}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            File will be saved as: {filename}.{format}
          </p>
        </div>

        {/* Column Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-900">Columns to Export</label>
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {availableColumns.length === 0 ? (
              <p className="text-sm text-neutral-500">No columns available</p>
            ) : (
              availableColumns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-100 rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedColumns.has(column.key)}
                    onChange={() => handleToggleColumn(column.key)}
                    aria-label={`Include ${column.label}`}
                  />
                  <span className="text-sm text-neutral-700">{column.label}</span>
                </label>
              ))
            )}
          </div>

          <p className="text-xs text-neutral-500 mt-2">
            {selectedCount} of {totalCount} columns selected
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t border-neutral-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isLoading || selectedColumns.size === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Icon name="Loader" size={18} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportDialog;
