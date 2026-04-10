/**
 * Formatter Utilities
 * Format dates, numbers, currency, grades, etc.
 */

/**
 * Format date to readable string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  };

  return dateObj.toLocaleDateString('en-US', optionsMap[format]);
};

/**
 * Format time to readable string
 */
export const formatTimeWithPeriod = (
  time: string | Date,
  format: '12h' | '24h' = '12h'
): string => {
  const dateObj = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h',
  };

  return dateObj.toLocaleTimeString('en-US', options);
};

/**
 * Format datetime to readable string
 */
export const formatDateTime = (
  dateTime: string | Date,
  format: 'short' | 'long' = 'short'
): string => {
  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const dateStr = formatDate(dateObj, format);
  const timeStr = formatTimeWithPeriod(dateObj, '12h');

  return `${dateStr} ${timeStr}`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format grade with letter and percentage
 */
export const formatGrade = (marksObtained: number, totalMarks: number): string => {
  const percentage = (marksObtained / totalMarks) * 100;
  const grade = getGradeFromPercentage(percentage);
  return `${grade} (${percentage.toFixed(1)}%)`;
};

/**
 * Get grade letter from percentage
 */
export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Format name (capitalize first letter of each word)
 */
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format email (lowercase)
 */
export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(dateObj, 'short');
};
