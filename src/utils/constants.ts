/**
 * Application Constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PASSWORD_RESET: '/auth/password-reset',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  STUDENT: {
    GRADES: '/student/grades',
    ATTENDANCE: '/student/attendance',
    EXAMS: '/student/exams',
    FEES: '/student/fees',
    MESSAGES: '/student/messages',
    TIMETABLE: '/student/timetable',
  },
  TEACHER: {
    CLASSES: '/teacher/classes',
    ATTENDANCE: '/teacher/attendance',
    GRADES: '/teacher/grades',
    MESSAGES: '/teacher/messages',
  },
  PARENT: {
    CHILDREN: '/parent/children',
    MESSAGES: '/parent/messages',
  },
  ADMIN: {
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    LOGS: '/admin/logs',
  },
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
} as const;

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

// Fee Status
export const FEE_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;

// Grade Letters
export const GRADE_LETTERS = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  F: 'F',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Token Expiry Times (in seconds)
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
} as const;

// Attendance Threshold
export const ATTENDANCE_THRESHOLD = 75; // percentage

// Debounce Delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 300,
  RESIZE: 300,
  SCROLL: 300,
} as const;

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Months
export const MONTHS = [
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
] as const;

// Responsive Breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE: 320,
  TABLET: 641,
  DESKTOP: 1025,
} as const;

// Color Codes
export const COLORS = {
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#0ea5e9',
  NEUTRAL: '#6b7280',
} as const;

// Status Colors
export const STATUS_COLORS = {
  PRESENT: '#10b981', // green
  ABSENT: '#ef4444', // red
  LATE: '#f59e0b', // yellow
  EXCUSED: '#9ca3af', // gray
  PENDING: '#f59e0b', // yellow
  PAID: '#10b981', // green
  OVERDUE: '#ef4444', // red
} as const;
