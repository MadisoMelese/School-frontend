/**
 * API Request/Response Types
 */

// ============ Authentication ============

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  refreshExpiresIn: number; // in seconds
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetConfirmResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ============ User ============

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin' | 'user';
export type UserStatus = 'active' | 'blocked' | 'inactive';

export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  username: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  isBlocked: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: User;
}

// ============ Student ============

export interface Grade {
  id: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  examDate: string;
  academicYear: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  time: string;
  totalMarks: number;
  hallLocation?: string;
  result?: {
    marksObtained: number;
    grade: string;
    rank: number;
  };
}

export interface Fee {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  academicYear: string;
  term?: string;
}

export interface Message {
  id: string;
  sender: User;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface SendMessageRequest {
  recipientId: string;
  subject: string;
  content: string;
}

export interface SendMessageResponse {
  message: Message;
}

export interface Timetable {
  id: string;
  className: string;
  subject: string;
  teacherName: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  roomNumber: string;
}

// ============ Teacher ============

export interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  studentCount: number;
  schedule?: Timetable[];
}

export interface ClassStudent {
  id: string;
  name: string;
  enrollmentNumber: string;
  status: 'active' | 'inactive';
}

export interface MarkAttendanceRequest {
  classId: string;
  date: string;
  attendance: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }>;
}

export interface MarkAttendanceResponse {
  message: string;
}

export interface GradeEntry {
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export interface SubmitGradesRequest {
  examId: string;
  grades: GradeEntry[];
}

export interface SubmitGradesResponse {
  message: string;
}

// ============ Parent ============

export interface ChildData {
  id: string;
  name: string;
  enrollmentNumber: string;
  class: string;
  section: string;
  currentGPA: number;
  attendancePercentage: number;
  recentGrades: Grade[];
  upcomingExams: Exam[];
  fees: Fee[];
}

// ============ Admin ============

export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface CreateUserResponse {
  user: User;
  temporaryPassword?: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserResponse {
  user: User;
}

export interface BlockUserRequest {
  reason?: string;
}

export interface BlockUserResponse {
  message: string;
}

export interface UnblockUserResponse {
  message: string;
}

export interface DeleteUserResponse {
  message: string;
}

export interface Holiday {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Term {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  holidays?: Holiday[];
}

export interface SchoolSettings {
  schoolName: string;
  schoolCode: string;
  schoolAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  contactInformation?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  schoolLogo?: string;
  principalName?: string;
  establishmentYear?: number;
  academicYear: string;
  termStartDate: string;
  termEndDate: string;
  terms?: Term[];
  holidays?: Holiday[];
  gradingScale: Array<{
    grade: string;
    minMarks: number;
    maxMarks: number;
  }>;
}

export interface UpdateSettingsRequest {
  schoolName?: string;
  schoolCode?: string;
  schoolAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  contactInformation?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  schoolLogo?: string;
  principalName?: string;
  establishmentYear?: number;
  academicYear?: string;
  termStartDate?: string;
  termEndDate?: string;
  terms?: Term[];
  holidays?: Holiday[];
  gradingScale?: SchoolSettings['gradingScale'];
}

export interface UpdateSettingsResponse {
  settings: SchoolSettings;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// ============ Pagination ============

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============ API Response Wrapper ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
