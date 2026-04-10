# Student Management - User Guide

## Accessing Student Management

1. Log in as an **Admin** user
2. Navigate to **Admin Panel** → **Students Management**
3. You'll see the Students Management page with a list of all students

## Features Overview

### Main Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Students Management                                     │
│  Manage all students in the system                      │
├─────────────────────────────────────────────────────────┤
│  Students                          [+ Add Student]      │
│  Total: X students                                       │
│                                                          │
│  [Search by name or ID...] [Status Filter] [Search]    │
├─────────────────────────────────────────────────────────┤
│  Student ID │ Name │ Email │ Class │ Status │ Actions  │
│  ──────────────────────────────────────────────────────│
│  S001       │ John │ john@ │ 10-A  │ Active │ 👁 ✏ 🗑  │
│  S002       │ Jane │ jane@ │ 10-B  │ Active │ 👁 ✏ 🗑  │
│                                                          │
│              [Previous] Page 1 of 5 [Next]              │
└─────────────────────────────────────────────────────────┘
```

## How to Add a New Student

1. Click the **"+ Add Student"** button in the top-right corner
2. A modal form will appear with the following fields:

### Required Fields (marked with *)
- **User Account*** - Select from existing user accounts
- **Student ID*** - Unique identifier (e.g., S001, STU2024001)
- **First Name*** - Student's first name
- **Last Name*** - Student's last name
- **Date of Birth*** - Select from calendar
- **Gender*** - Male or Female
- **Parent Name*** - Full name of parent/guardian
- **Parent Phone*** - Contact number for parent

### Optional Fields
- **Phone** - Student's phone number
- **Address** - Residential address
- **Class** - Select from available classes
- **Parent Email** - Parent's email address
- **Enrollment Date** - Defaults to today
- **Status** - Active (default), Inactive, Suspended, or Graduated

3. Fill in all required fields
4. Click **"Create Student"**
5. Success message will appear
6. New student will be added to the list

### Example: Creating a Student
```
User Account: John Doe (john.doe@school.com)
Student ID: S2024001
First Name: John
Last Name: Doe
Date of Birth: 2010-05-15
Gender: Male
Phone: +1234567890
Address: 123 Main St, City
Class: Grade 10 - Section A
Parent Name: Robert Doe
Parent Phone: +1234567891
Parent Email: robert.doe@email.com
Enrollment Date: 2024-01-15
Status: Active
```

## How to View Student Details

1. Find the student in the list
2. Click the **Eye icon (👁)** in the Actions column
3. A modal will display complete student information:
   - Basic Information
   - Contact Information
   - Academic Information
   - Parent Information
   - System Information (created/updated dates)
4. Click **"Close"** to exit

## How to Edit a Student

### Method 1: From List
1. Find the student in the list
2. Click the **Edit icon (✏)** in the Actions column
3. Edit form modal will appear with current data

### Method 2: From Details Modal
1. Open student details (Eye icon)
2. Click **"Edit"** button at the bottom
3. Edit form modal will appear

### Editing Process
1. Modify the fields you want to change
2. Note: Student ID cannot be changed
3. Click **"Save Changes"**
4. Success message will appear
5. Changes will be reflected in the list

## How to Delete a Student

### Method 1: From List
1. Find the student in the list
2. Click the **Delete icon (🗑)** in the Actions column
3. Button will change to show "Confirm?"
4. Click again to confirm deletion
5. Student will be removed from the list

### Method 2: From Details Modal
1. Open student details (Eye icon)
2. Click **"Delete"** button at the bottom
3. Click again to confirm
4. Student will be deleted

⚠️ **Warning:** Deletion is permanent and cannot be undone!

## How to Search for Students

### Search by Name or Student ID
1. Type in the search box at the top
2. Enter student name (first or last) or student ID
3. Click **"Search"** button or press Enter
4. Results will be filtered

### Filter by Status
1. Use the status dropdown next to search box
2. Select status:
   - All Status (default)
   - Active
   - Inactive
   - Suspended
   - Graduated
3. Click **"Search"** to apply filter

### Combined Search
You can combine text search and status filter:
1. Enter search term
2. Select status
3. Click **"Search"**

### Clear Filters
1. Clear the search box
2. Select "All Status"
3. Click **"Search"**

## Understanding Status Badges

Students have different status indicators:

- 🟢 **Active** (Green) - Currently enrolled and attending
- 🟡 **Inactive** (Yellow) - Temporarily not attending
- 🔴 **Suspended** (Red) - Disciplinary suspension
- 🔵 **Graduated** (Blue) - Completed studies

## Pagination

When there are many students:
1. Use **"Previous"** and **"Next"** buttons at the bottom
2. Current page number is displayed: "Page X of Y"
3. Each page shows 20 students

## Mobile View

On mobile devices:
- Table converts to card layout
- Each card shows:
  - Student name and ID
  - Email and class
  - Status badge
  - Action buttons (View, Edit, Delete)
- Swipe to scroll through cards

## Tips and Best Practices

### Before Creating a Student
1. ✅ Ensure user account exists first
2. ✅ Have all required information ready
3. ✅ Use consistent Student ID format
4. ✅ Verify parent contact information

### Student ID Format
- Use consistent format (e.g., S2024001, STU001)
- Include year if helpful (e.g., 2024001)
- Keep it unique and sequential
- Avoid special characters

### Managing Classes
- Assign students to classes for better organization
- Update class when student is promoted
- Leave blank if class not yet assigned

### Status Management
- Set to **Active** for current students
- Use **Inactive** for temporary leave
- Use **Suspended** for disciplinary cases
- Change to **Graduated** when student completes

### Parent Information
- Always provide accurate parent contact
- Parent email enables communication
- Keep parent phone updated

## Troubleshooting

### "Failed to load users and classes"
**Problem:** Cannot load dropdown options
**Solution:** 
- Check internet connection
- Refresh the page
- Contact system administrator

### "Failed to create student"
**Problem:** Student creation fails
**Solution:**
- Verify all required fields are filled
- Check Student ID is unique
- Ensure user account is valid
- Check for valid email format

### "Student not found"
**Problem:** Cannot find student in list
**Solution:**
- Clear search filters
- Check spelling in search
- Verify student exists in system
- Try searching by Student ID

### Delete button not working
**Problem:** Delete doesn't work on first click
**Solution:**
- This is intentional for safety
- Click once: Button shows "Confirm?"
- Click again: Student is deleted

## Keyboard Shortcuts

- **Enter** in search box - Execute search
- **Tab** - Navigate between form fields
- **Esc** - Close modal dialogs

## Data Export

Currently, student data can be viewed on screen. For data export:
1. Contact system administrator
2. Request CSV or PDF export
3. Specify filters needed

## Security Notes

- Only **Admin** users can access this page
- All actions are logged
- Deleted students cannot be recovered
- Always verify before deleting

## Getting Help

If you encounter issues:
1. Check this user guide
2. Contact your system administrator
3. Report bugs to technical support

## Frequently Asked Questions

**Q: Can I change a student's Student ID?**
A: No, Student ID is permanent once created.

**Q: What happens to student data when deleted?**
A: All student data is permanently removed from the system.

**Q: Can I bulk import students?**
A: Not currently available. Contact admin for bulk operations.

**Q: How do I link a student to a parent account?**
A: Parent information is stored with student. For parent portal access, create a parent user account separately.

**Q: Can students have multiple classes?**
A: Currently, one class per student. For multiple subjects, use the timetable feature.

**Q: What if I don't have a user account for the student?**
A: Create a user account first in User Management, then create the student record.

## Version Information

- **Version:** 1.0
- **Last Updated:** 2024
- **Compatible with:** SchoolOS Backend API v1.0+
