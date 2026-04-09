# Organisms

Complex components composed of molecules and atoms. These are feature-rich components that handle specific business logic and user interactions.

## Components

### DataTable
Sortable, filterable table with pagination.

**Features:**
- Sortable columns with click to sort
- Filterable rows with search
- Pagination with configurable page size
- Responsive: Horizontal scroll on mobile, full table on desktop
- Accessibility: role="table", aria-sort, keyboard navigation
- Empty state and loading state support

**Usage:**
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
  ]}
  data={data}
  onSort={(key, direction) => console.log(key, direction)}
  onFilter={(query) => console.log(query)}
  onPageChange={(page) => console.log(page)}
  pageSize={10}
  totalItems={100}
/>
```

### Form
Multi-field form with validation using React Hook Form and Zod.

**Features:**
- Multiple field types: text, email, password, number, date, select, textarea, checkbox
- Client-side validation with Zod
- Field-level error display
- Submit button with loading state
- Cancel button support
- Accessibility: Proper labels, error associations

**Usage:**
```tsx
<Form
  fields={[
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ]}
  onSubmit={async (data) => console.log(data)}
  submitText="Login"
  onCancel={() => console.log('cancelled')}
/>
```

### Navigation
Sidebar/bottom nav with role-based items.

**Features:**
- Sidebar on desktop, bottom nav on mobile
- Role-based menu items
- Active item highlighting
- Badge support for notifications
- User section with logout
- Responsive layout

**Usage:**
```tsx
<Navigation
  items={[
    { id: 'dashboard', label: 'Dashboard', icon: 'Home', href: '/dashboard' },
    { id: 'grades', label: 'Grades', icon: 'BookOpen', href: '/grades', badge: 3 },
  ]}
  activeItem="dashboard"
  onItemClick={(itemId) => console.log(itemId)}
  user={user}
  onLogout={() => console.log('logged out')}
/>
```

### Header
App header with user menu and notifications.

**Features:**
- App title/logo
- Notification badge with count
- Notifications dropdown
- User menu with profile, settings, logout
- Theme toggle button
- Mobile hamburger menu
- Accessibility: aria-label, keyboard support

**Usage:**
```tsx
<Header
  title="Dashboard"
  user={user}
  notifications={notifications}
  onNotificationClick={(id) => console.log(id)}
  onLogout={() => console.log('logged out')}
  onThemeToggle={() => console.log('theme toggled')}
/>
```

### Dashboard
Grid layout with widgets.

**Features:**
- Responsive grid: 1 column on mobile, 2-3 columns on desktop
- Widget types: stats, chart, list, card
- Loading state with skeleton loaders
- Error state support
- Empty state messaging
- Proper heading hierarchy

**Usage:**
```tsx
<Dashboard
  widgets={[
    {
      id: 'grades',
      title: 'Recent Grades',
      type: 'card',
      content: <div>Grade content</div>,
      size: 'medium',
    },
  ]}
  loading={false}
/>
```

### GradeCard
Grade display with details.

**Features:**
- Shows marks, percentage, letter grade
- Color-coded: Green for A, yellow for B, red for F
- Progress bar visualization
- Remarks display
- Performance indicator
- Responsive layout

**Usage:**
```tsx
<GradeCard
  subject="Mathematics"
  marksObtained={85}
  totalMarks={100}
  grade="A"
  remarks="Excellent work"
  examDate={new Date()}
  onClick={() => console.log('clicked')}
/>
```

### AttendanceCalendar
Calendar view of attendance.

**Features:**
- Calendar view with month navigation
- Color-coded status: Green for present, red for absent, yellow for late, gray for excused
- Attendance statistics
- Attendance percentage calculation
- Legend with status colors
- Responsive layout

**Usage:**
```tsx
<AttendanceCalendar
  attendanceData={[
    { date: new Date('2024-01-01'), status: 'present' },
    { date: new Date('2024-01-02'), status: 'absent', notes: 'Sick' },
  ]}
  month={new Date()}
  onMonthChange={(month) => console.log(month)}
/>
```

### MessageThread
Conversation view with messages.

**Features:**
- Message display with sender info
- Sent/received message styling
- Message input with send button
- Auto-scroll to latest message
- Loading state
- Error handling
- Accessibility: aria-live for messages

**Usage:**
```tsx
<MessageThread
  messages={messages}
  currentUser={user}
  onSendMessage={async (content) => console.log(content)}
  loading={false}
  recipientName="Jane Smith"
/>
```

### ClassList
List of classes with actions.

**Features:**
- Desktop table view
- Mobile card view
- Class information display
- Quick action buttons (attendance, grades)
- Student count badge
- Loading state
- Empty state

**Usage:**
```tsx
<ClassList
  classes={classes}
  onClassClick={(classId) => console.log(classId)}
  onAction={(classId, action) => console.log(classId, action)}
  loading={false}
/>
```

## Accessibility

All organisms follow WCAG 2.1 AA standards:
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader support

## Responsive Design

All organisms use mobile-first approach:
- Mobile: Single column, stacked layout
- Tablet: Two-column layout
- Desktop: Multi-column layout with full features

## Testing

Each organism has comprehensive unit tests covering:
- Component rendering
- User interactions
- Props handling
- Accessibility features
- Error states
- Loading states
