/**
 * Date Helper Utilities
 * Date calculations, formatting, parsing
 */

/**
 * Get current date
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Get current date as string (YYYY-MM-DD)
 */
export const getCurrentDateString = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from date
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Add months to date
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Add years to date
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of week (Sunday)
 */
export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of week (Saturday)
 */
export const getEndOfWeek = (date: Date): Date => {
  const result = getStartOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Get start of year
 */
export const getStartOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(0);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get end of year
 */
export const getEndOfYear = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(11);
  result.setDate(31);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Check if date is within range
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Get difference in days between two dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get difference in months between two dates
 */
export const getMonthsDifference = (date1: Date, date2: Date): number => {
  return (
    date2.getMonth() -
    date1.getMonth() +
    12 * (date2.getFullYear() - date1.getFullYear())
  );
};

/**
 * Get difference in years between two dates
 */
export const getYearsDifference = (date1: Date, date2: Date): number => {
  return date2.getFullYear() - date1.getFullYear();
};

/**
 * Parse date string (YYYY-MM-DD)
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
};

/**
 * Get day of week (0-6, Sunday-Saturday)
 */
export const getDayOfWeek = (date: Date): number => {
  return date.getDay();
};

/**
 * Get day name
 */
export const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Get month name
 */
export const getMonthName = (date: Date): string => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[date.getMonth()];
};

/**
 * Get week number of year
 */
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Check if year is leap year
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Get days in month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get week dates (start and end dates of the week)
 */
export const getWeekDates = (date: Date): { start: Date; end: Date } => {
  const start = getStartOfWeek(date);
  const end = getEndOfWeek(date);
  return { start, end };
};

/**
 * Format time from HH:mm format
 */
export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return time;
  }
};

/**
 * Get day name from day of week number (0-6)
 */
export const getDayNameFromNumber = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

/**
 * Check if a class time is current or upcoming (within the same day)
 */
export const isCurrentOrUpcoming = (classDate: Date, startTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = startTime.split(':').map(Number);

  const classDateTime = new Date(classDate);
  classDateTime.setHours(hours, minutes, 0, 0);

  // Check if class is today and time is >= now
  return (
    classDate.toDateString() === now.toDateString() &&
    classDateTime.getTime() >= now.getTime()
  );
};
