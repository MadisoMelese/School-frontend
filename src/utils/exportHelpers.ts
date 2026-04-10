/**
 * Export Helpers
 * Utilities for exporting data in various formats (CSV, PDF)
 */

/**
 * Convert data array to CSV format
 */
export const convertToCSV = (data: Record<string, any>[], columns?: string[]): string => {
  if (data.length === 0) return '';

  // Determine columns to include
  const keys = columns || Object.keys(data[0]);

  // Create header row
  const header = keys.map((key) => `"${key}"`).join(',');

  // Create data rows
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (
  csvContent: string,
  filename: string = `export-${new Date().toISOString().split('T')[0]}.csv`
): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate simple PDF content (text-based)
 * For more complex PDFs, consider using a library like jsPDF
 */
export const generateSimplePDF = (
  title: string,
  data: Record<string, any>[],
  columns?: string[]
): Blob => {
  const keys = columns || (data.length > 0 ? Object.keys(data[0]) : []);

  // Create simple text content
  let content = `${title}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += '='.repeat(80) + '\n\n';

  // Add headers
  content += keys.map((k) => k.padEnd(20)).join('') + '\n';
  content += '-'.repeat(80) + '\n';

  // Add data rows
  data.forEach((row) => {
    content += keys
      .map((key) => {
        const value = row[key];
        const stringValue =
          value === null || value === undefined
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value);
        return stringValue.substring(0, 20).padEnd(20);
      })
      .join('');
    content += '\n';
  });

  return new Blob([content], { type: 'text/plain;charset=utf-8;' });
};

/**
 * Download PDF file
 */
export const downloadPDF = (
  blob: Blob,
  filename: string = `export-${new Date().toISOString().split('T')[0]}.pdf`
): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format filename with timestamp
 */
export const formatExportFilename = (baseName: string, format: 'csv' | 'pdf' = 'csv'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}-${timestamp}.${format}`;
};

/**
 * Validate export data
 */
export const validateExportData = (data: any[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};
