# Backend Endpoints Guide

## Overview
This document explains all backend endpoints and how they should be used by different user roles (Admin, Teacher, Student).

## Authentication & Authorization

All endpoints require:
1. **Authentication**: `protect` middleware - User must be logged in
2. **School Read Scope**: `loadSchoolReadScope` middleware - Determines what data user can access based on their role

### School Read Scope Types
- **Admin**: Can access all data
- **Teacher**: Can only access data related to their assigned classes and students
- **Student**: Can only access their own data and data from their classes

## Endpoint Categories

### 1. Classes Endpoints

#### GET /api/classes
**Description**: Get all classes (filtered by user role)
**Authentication**: Required
**Authorization**: 
- Admin: All classes
- Teacher: Only their assigned classes
- Student: Only their enrolled classes

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by class name
- `status` (string): Filter by status (active/inactive)

**Response**:
```json
{
  "success": true,
  "data": {
    "classes": [...],
    "total": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

#### GET /api/classes/:id
**Description**: Get specific class details
**Authorization**: Same as GET /api/classes

### 2. Grades Endpoints

#### GET /api/grades
**Description**: Get grades (filtered by user role)
**Authorization**:
- Admin: All grades
- Teacher: Grades for their students
- Student: Only their own grades

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `studentId` (string): Filter by student
- `classId` (string): Filter by class

**Response**:
```json
{
  "success": true,
  "data": {
    "grades": [...],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

#### POST /api/grades
**Description**: Create a new grade
**Authorization**: Admin only

### 3. Attendance Endpoints

#### GET /api/attendance
**Description**: Get attendance records (filtered by user role)
**Authorization**:
- Admin: All attendance
- Teacher: Attendance for their students
- Student: Only their own attendance

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `studentId` (string): Filter by student
- `date` (string): Filter by date

**Response**:
```json
{
  "success": true,
  "data": {
    "attendance": [...],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

#### POST /api/attendance
**Description**: Mark attendance
**Authorization**: Admin or Teacher

### 4. Messages Endpoints

#### GET /api/messages/inbox
**Description**: Get received messages
**Authorization**: Required (all authenticated users)

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `isRead` (boolean): Filter by read status

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "total": 20,
    "page": 1,
    "totalPages": 2
  }
}
```

#### GET /api/messages/sent
**Description**: Get sent messages
**Authorization**: Required (all authenticated users)

#### GET /api/messages/unread-count
**Description**: Get count of unread messages
**Authorization**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

#### POST /api/messages
**Description**: Send a new message
**Authorization**: Required

**Request Body**:
```json
{
  "receiverId": "user_id",
  "subject": "Message subject",
  "content": "Message content"
}
```

#### PATCH /api/messages/:id/read
**Description**: Mark message as read
**Authorization**: Required (only receiver can mark as read)

#### DELETE /api/messages/:id
**Description**: Delete a message
**Authorization**: Required (sender or receiver can delete)

### 5. Students Endpoints

#### GET /api/students
**Description**: Get students (filtered by user role)
**Authorization**:
- Admin: All students
- Teacher: Only their class students
- Student: Only themselves

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name or ID
- `status` (string): Filter by status
- `classId` (string): Filter by class

#### GET /api/students/dashboard
**Description**: Get student dashboard data
**Authorization**: Student only (role check in service)

**Response**:
```json
{
  "success": true,
  "data": {
    "grades": [...],
    "attendance": [...],
    "exams": [...],
    "fees": [...],
    "messages": [...],
    "attendancePercentage": 85,
    "feeSummary": {...},
    "unreadMessageCount": 2
  }
}
```

### 6. Teachers Endpoints

#### GET /api/teachers
**Description**: Get teachers (filtered by user role)
**Authorization**:
- Admin: All teachers
- Teacher: Only themselves
- Student: Only their class teachers

#### GET /api/teachers/:id/class-students
**Description**: Get class and students for a teacher
**Authorization**: 
- Teacher: Only their own class
- Admin: Any teacher's class

**Response**:
```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "class_id",
      "name": "Class Name",
      "section": "A",
      "grade": "10",
      "capacity": 40,
      "academicYear": "2024-2025",
      "status": "active"
    },
    "students": [...]
  }
}
```

### 7. Exams Endpoints

#### GET /api/exams
**Description**: Get exams (filtered by user role)
**Authorization**:
- Admin: All exams
- Teacher: Exams for their classes
- Student: Exams for their classes

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `classId` (string): Filter by class
- `status` (string): Filter by status

### 8. Fees Endpoints

#### GET /api/fees
**Description**: Get fees (filtered by user role)
**Authorization**:
- Admin: All fees
- Teacher: Fees for their students
- Student: Only their own fees

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `studentId` (string): Filter by student
- `status` (string): Filter by status (paid/pending)

### 9. Timetable Endpoints

#### GET /api/timetables
**Description**: Get timetables (filtered by user role)
**Authorization**:
- Admin: All timetables
- Teacher: Their class timetables
- Student: Their class timetables

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `classId` (string): Filter by class
- `week` (string): Filter by week

## Response Structure

All successful responses follow this structure:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Success message"
}
```

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400
}
```

## Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (no permission)
- **404**: Not Found
- **500**: Server Error

## Important Notes

### Role-Based Access
- All endpoints use `schoolReadScope` middleware to filter data
- Teachers can only see data for their assigned classes
- Students can only see their own data
- Admins can see all data

### Response Structure Differences
- Some endpoints return data directly in `data` field
- Some endpoints return paginated data with `classes`, `grades`, etc. inside `data`
- Always check the response structure before accessing data

### Common Mistakes
1. **Calling student-only endpoints as teacher**: `/api/students/dashboard` is student-only
2. **Wrong response structure access**: Check if data is in `data.classes` or `data.data.classes`
3. **Missing pagination parameters**: Always include `page` and `limit` for list endpoints
4. **Not checking user role**: Some endpoints have role-specific logic

## Frontend Implementation Examples

### Teacher Dashboard
```typescript
// Correct: Use generic endpoints that support teacher scope
const classes = await apiClient.get('/classes?limit=100');
const grades = await apiClient.get('/grades?limit=100');
const attendance = await apiClient.get('/attendance?limit=100');
const messages = await apiClient.get('/messages/inbox?limit=10');

// Wrong: Don't call student-only endpoints
// const dashboard = await apiClient.get('/students/dashboard');
```

### Student Dashboard
```typescript
// Correct: Use student-specific dashboard endpoint
const dashboard = await apiClient.get('/students/dashboard');
```

### Admin Dashboard
```typescript
// Correct: Use generic endpoints (admin sees all data)
const allClasses = await apiClient.get('/classes?limit=100');
const allGrades = await apiClient.get('/grades?limit=100');
const allStudents = await apiClient.get('/students?limit=100');
```
