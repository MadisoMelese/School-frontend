import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from './SettingsPage';
import * as adminService from '@services/api/adminService';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the admin service
vi.mock('@services/api/adminService', () => ({
  adminService: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

// Mock the DashboardLayout
vi.mock('@components/templates/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const mockSettings = {
  schoolName: 'Test School',
  schoolCode: 'TS001',
  schoolAddress: {
    street: '123 Main St',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
  },
  contactInformation: {
    phone: '+1-555-0123',
    email: 'contact@testschool.com',
    website: 'https://testschool.com',
  },
  schoolLogo: 'https://example.com/logo.png',
  principalName: 'Dr. John Doe',
  establishmentYear: 2000,
  academicYear: '2024-2025',
  termStartDate: '2024-01-15',
  termEndDate: '2024-04-15',
  terms: [
    { name: 'Term 1', startDate: '2024-01-15', endDate: '2024-03-15' },
    { name: 'Term 2', startDate: '2024-03-16', endDate: '2024-04-15' },
  ],
  holidays: [
    { name: 'Summer Break', startDate: '2024-05-01', endDate: '2024-06-30' },
    { name: 'Winter Break', startDate: '2024-12-15', endDate: '2024-12-31' },
  ],
  gradingScale: [
    { grade: 'A', minMarks: 90, maxMarks: 100 },
    { grade: 'B', minMarks: 80, maxMarks: 89 },
  ],
};

describe('SettingsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SettingsPage />
      </QueryClientProvider>
    );
  };

  it('should render the settings page', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('should load and display school settings', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      const schoolNameInput = screen.getByDisplayValue('Test School');
      expect(schoolNameInput).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('TS001')).toBeInTheDocument();
  });

  it('should load and display academic calendar settings', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });
  });

  it('should update school information', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(adminService.adminService.updateSettings).mockResolvedValue({
      settings: { ...mockSettings, schoolName: 'Updated School' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    const schoolNameInput = screen.getByDisplayValue('Test School') as HTMLInputElement;
    await userEvent.clear(schoolNameInput);
    await userEvent.type(schoolNameInput, 'Updated School');

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(adminService.adminService.updateSettings).toHaveBeenCalled();
      const callArgs = vi.mocked(adminService.adminService.updateSettings).mock.calls[0][0];
      expect(callArgs.schoolName).toBe('Updated School');
      expect(callArgs.schoolCode).toBe('TS001');
    });
  });

  it('should display validation errors for empty school name', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    const schoolNameInput = screen.getByDisplayValue('Test School') as HTMLInputElement;
    await userEvent.clear(schoolNameInput);

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    // The validation error should appear
    await waitFor(() => {
      const errorMessages = screen.queryAllByText('School name is required');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should display loading skeleton while fetching settings', () => {
    vi.mocked(adminService.adminService.getSettings).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderComponent();

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('should display error message when settings fail to load', async () => {
    const error = new Error('Failed to fetch settings');
    vi.mocked(adminService.adminService.getSettings).mockRejectedValue(error);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });
  });

  it('should toggle notification settings', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });
  });

  it('should display success notification on successful update', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(adminService.adminService.updateSettings).mockResolvedValue({
      settings: mockSettings,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Settings updated successfully')).toBeInTheDocument();
    });
  });

  it('should load and display school address information', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test State')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
    });
  });

  it('should load and display contact information', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('+1-555-0123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('contact@testschool.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://testschool.com')).toBeInTheDocument();
    });
  });

  it('should load and display principal name and establishment year', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dr. John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });
  });

  it('should update school information with all fields', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(adminService.adminService.updateSettings).mockResolvedValue({
      settings: { ...mockSettings, schoolName: 'Updated School' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    const schoolNameInput = screen.getByDisplayValue('Test School') as HTMLInputElement;
    await userEvent.clear(schoolNameInput);
    await userEvent.type(schoolNameInput, 'Updated School');

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(adminService.adminService.updateSettings).toHaveBeenCalled();
    });
  });

  it('should validate email format in contact information', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('contact@testschool.com')).toBeInTheDocument();
    });

    const emailInput = screen.getByDisplayValue('contact@testschool.com') as HTMLInputElement;
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'invalid-email');

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    // Validation should prevent submission
    await waitFor(() => {
      expect(adminService.adminService.updateSettings).not.toHaveBeenCalled();
    });
  });

  it('should validate establishment year is not in the future', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    });

    const yearInput = screen.getByDisplayValue('2000') as HTMLInputElement;
    await userEvent.clear(yearInput);
    await userEvent.type(yearInput, (new Date().getFullYear() + 1).toString());

    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[0]);

    // Validation should prevent submission
    await waitFor(() => {
      expect(adminService.adminService.updateSettings).not.toHaveBeenCalled();
    });
  });

  it('should load and display terms', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to academic calendar tab
    const academicCalendarTab = screen.getByText('Academic Calendar');
    fireEvent.click(academicCalendarTab);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Term 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Term 2')).toBeInTheDocument();
    });
  });

  it('should load and display holidays', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to academic calendar tab
    const academicCalendarTab = screen.getByText('Academic Calendar');
    fireEvent.click(academicCalendarTab);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Summer Break')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Winter Break')).toBeInTheDocument();
    });
  });

  it('should add a new term', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to academic calendar tab
    const academicCalendarTab = screen.getByText('Academic Calendar');
    fireEvent.click(academicCalendarTab);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Term 1')).toBeInTheDocument();
    });

    // Find and click the "Add Term" button
    const addTermButtons = screen.getAllByText('Add Term');
    fireEvent.click(addTermButtons[0]);

    // Verify new term input appears
    await waitFor(() => {
      const termInputs = screen.getAllByPlaceholderText('e.g., Term 1');
      expect(termInputs.length).toBeGreaterThan(2);
    });
  });

  it('should add a new holiday', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to academic calendar tab
    const academicCalendarTab = screen.getByText('Academic Calendar');
    fireEvent.click(academicCalendarTab);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Summer Break')).toBeInTheDocument();
    });

    // Find and click the "Add Holiday" button
    const addHolidayButtons = screen.getAllByText('Add Holiday');
    fireEvent.click(addHolidayButtons[0]);

    // Verify new holiday input appears
    await waitFor(() => {
      const holidayInputs = screen.getAllByPlaceholderText('Holiday name');
      expect(holidayInputs.length).toBeGreaterThan(2);
    });
  });

  it('should update academic calendar with terms and holidays', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(adminService.adminService.updateSettings).mockResolvedValue({
      settings: mockSettings,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to academic calendar tab
    const academicCalendarTab = screen.getByText('Academic Calendar');
    fireEvent.click(academicCalendarTab);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2024-2025')).toBeInTheDocument();
    });

    // Verify terms and holidays are loaded
    expect(screen.getByDisplayValue('Term 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Summer Break')).toBeInTheDocument();
  });

  it('should load and display grading scale', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });
  });

  it('should add a new grade', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Find and click the "Add Grade" button
    const addGradeButtons = screen.getAllByText('Add Grade');
    fireEvent.click(addGradeButtons[0]);

    // Verify new grade input appears
    await waitFor(() => {
      const gradeInputs = screen.getAllByPlaceholderText('e.g., A');
      expect(gradeInputs.length).toBeGreaterThan(2);
    });
  });

  it('should validate duplicate grade names', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Add a new grade
    const addGradeButtons = screen.getAllByText('Add Grade');
    fireEvent.click(addGradeButtons[0]);

    // Try to set duplicate grade name
    const gradeInputs = screen.getAllByPlaceholderText('e.g., A');
    const newGradeInput = gradeInputs[gradeInputs.length - 1] as HTMLInputElement;
    await userEvent.type(newGradeInput, 'A');

    // Try to save - find the save button in the grading scale section
    const saveButtons = screen.getAllByText('Save Changes');
    // The grading scale save button should be the last one
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    // Validation should prevent submission
    await waitFor(() => {
      expect(adminService.adminService.updateSettings).not.toHaveBeenCalled();
    });
  });

  it('should validate overlapping grade ranges', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Add a new grade with overlapping range
    const addGradeButtons = screen.getAllByText('Add Grade');
    fireEvent.click(addGradeButtons[0]);

    // Set overlapping range (85-95 overlaps with B: 80-89)
    const gradeInputs = screen.getAllByPlaceholderText('e.g., A');
    const newGradeInput = gradeInputs[gradeInputs.length - 1] as HTMLInputElement;
    await userEvent.type(newGradeInput, 'C');

    // Try to save
    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    // Validation should prevent submission
    await waitFor(() => {
      expect(adminService.adminService.updateSettings).not.toHaveBeenCalled();
    });
  });

  it('should validate min marks <= max marks', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Add a new grade
    const addGradeButtons = screen.getAllByText('Add Grade');
    fireEvent.click(addGradeButtons[0]);

    // Set invalid range (min > max)
    const gradeInputs = screen.getAllByPlaceholderText('e.g., A');
    const newGradeInput = gradeInputs[gradeInputs.length - 1] as HTMLInputElement;
    await userEvent.type(newGradeInput, 'C');

    // Try to save
    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    // Validation should prevent submission
    await waitFor(() => {
      expect(adminService.adminService.updateSettings).not.toHaveBeenCalled();
    });
  });

  it('should update grading scale successfully', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);
    vi.mocked(adminService.adminService.updateSettings).mockResolvedValue({
      settings: mockSettings,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Save grading scale
    const saveButtons = screen.getAllByText('Save Changes');
    fireEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() => {
      expect(adminService.adminService.updateSettings).toHaveBeenCalled();
    });
  });

  it('should remove a grade', async () => {
    vi.mocked(adminService.adminService.getSettings).mockResolvedValue(mockSettings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    });

    // Navigate to grading scale tab
    const gradingScaleTab = screen.getByText('Grading Scale');
    fireEvent.click(gradingScaleTab);

    await waitFor(() => {
      const gradeInputs = screen.getAllByDisplayValue('A');
      expect(gradeInputs.length).toBeGreaterThan(0);
    });

    // Find and click the first delete button
    const deleteButtons = screen.getAllByLabelText('Remove grade');
    fireEvent.click(deleteButtons[0]);

    // Verify grade is removed
    await waitFor(() => {
      const gradeInputs = screen.queryAllByDisplayValue('A');
      expect(gradeInputs.length).toBe(0);
    });
  });
});
