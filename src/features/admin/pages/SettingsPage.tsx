import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { Tabs, Tab } from '@components/molecules/Tabs';
import { Card } from '@components/molecules/Card';
import { Button } from '@components/atoms/Button';
import { FormField } from '@components/molecules/FormField';
import { ImageUpload } from '@components/molecules/ImageUpload';
import { NotificationToast } from '@components/molecules/NotificationToast';
import { Icon } from '@components/atoms/Icon';
import { adminService } from '@services/api/adminService';
import { UpdateSettingsRequest, Holiday, Term } from '../../../types/api.types';
import { z } from 'zod';

/**
 * Settings Page
 * Displays configuration options for:
 * - School Information (name, address, contact, logo)
 * - Academic Calendar (academic year, term dates, holidays)
 * - Grading Scale (grade ranges and criteria)
 * - Notification Settings (event-based notification configuration)
 */

// Validation schemas
const schoolInfoSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolCode: z.string().min(1, 'School code is required'),
  schoolAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  contactInformation: z
    .object({
      phone: z
        .string()
        .regex(/^[\d\s\-+()]*$/, 'Invalid phone number')
        .optional()
        .or(z.literal('')),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    })
    .optional(),
  principalName: z.string().optional(),
  establishmentYear: z
    .number()
    .int()
    .min(1900, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .or(z.literal(null)),
});

const academicCalendarSchema = z
  .object({
    academicYear: z.string().min(1, 'Academic year is required'),
    termStartDate: z.string().min(1, 'Term start date is required'),
    termEndDate: z.string().min(1, 'Term end date is required'),
    terms: z
      .array(
        z.object({
          name: z.string().min(1, 'Term name is required'),
          startDate: z.string().min(1, 'Term start date is required'),
          endDate: z.string().min(1, 'Term end date is required'),
        })
      )
      .optional(),
    holidays: z
      .array(
        z.object({
          name: z.string().min(1, 'Holiday name is required'),
          startDate: z.string().min(1, 'Holiday start date is required'),
          endDate: z.string().min(1, 'Holiday end date is required'),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.termStartDate && data.termEndDate) {
        return new Date(data.termStartDate) < new Date(data.termEndDate);
      }
      return true;
    },
    {
      message: 'Term end date must be after term start date',
      path: ['termEndDate'],
    }
  );

const gradingScaleSchema = z.object({
  gradingScale: z
    .array(
      z.object({
        grade: z
          .string()
          .min(1, 'Grade name is required')
          .max(10, 'Grade name must be 10 characters or less'),
        minMarks: z
          .number()
          .min(0, 'Minimum marks must be 0 or greater')
          .max(100, 'Minimum marks cannot exceed 100'),
        maxMarks: z
          .number()
          .min(0, 'Maximum marks must be 0 or greater')
          .max(100, 'Maximum marks cannot exceed 100'),
        description: z.string().optional(),
      })
    )
    .min(1, 'At least one grade must be defined')
    .refine(
      (grades) => {
        // Check for unique grade names
        const gradeNames = grades.map((g) => g.grade.toUpperCase());
        return new Set(gradeNames).size === gradeNames.length;
      },
      { message: 'Grade names must be unique' }
    )
    .refine(
      (grades) => {
        // Check for overlapping ranges
        const sortedGrades = [...grades].sort((a, b) => a.minMarks - b.minMarks);
        for (let i = 0; i < sortedGrades.length - 1; i++) {
          if (sortedGrades[i].maxMarks >= sortedGrades[i + 1].minMarks) {
            return false;
          }
        }
        return true;
      },
      { message: 'Grade ranges cannot overlap' }
    )
    .refine(
      (grades) => {
        // Check that min <= max for each grade
        return grades.every((g) => g.minMarks <= g.maxMarks);
      },
      { message: 'Minimum marks must be less than or equal to maximum marks' }
    ),
});

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  eventTypes: {
    userRegistration: boolean;
    gradeSubmission: boolean;
    attendanceAlert: boolean;
    feeReminder: boolean;
  };
}

interface SettingsPageState {
  schoolInfo: {
    schoolName: string;
    schoolCode: string;
    schoolAddress: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
    };
    contactInformation: {
      phone: string;
      email: string;
      website: string;
    };
    schoolLogo: File | string | null;
    principalName: string;
    establishmentYear: number | null;
  };
  academicCalendar: {
    academicYear: string;
    termStartDate: string;
    termEndDate: string;
    terms: Term[];
    holidays: Holiday[];
  };
  gradingScale: Array<{
    grade: string;
    minMarks: number;
    maxMarks: number;
    description?: string;
  }>;
  notificationSettings: NotificationSettings;
}

interface FormErrors {
  [key: string]: string;
}

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('school-info');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [formState, setFormState] = useState<SettingsPageState>({
    schoolInfo: {
      schoolName: '',
      schoolCode: '',
      schoolAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
      },
      contactInformation: {
        phone: '',
        email: '',
        website: '',
      },
      schoolLogo: null,
      principalName: '',
      establishmentYear: null,
    },
    academicCalendar: {
      academicYear: '',
      termStartDate: '',
      termEndDate: '',
      terms: [],
      holidays: [],
    },
    gradingScale: [],
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      eventTypes: {
        userRegistration: true,
        gradeSubmission: true,
        attendanceAlert: true,
        feeReminder: true,
      },
    },
  });

  // Fetch settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminService.getSettings(),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: UpdateSettingsRequest) => adminService.updateSettings(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['admin-settings'], response.settings);
      setNotification({
        message: 'Settings updated successfully',
        type: 'success',
      });
      setFormErrors({});
    },
    onError: (error: any) => {
      setNotification({
        message: error?.response?.data?.message || 'Failed to update settings',
        type: 'error',
      });
    },
  });

  // Initialize form state when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormState((prev) => ({
        ...prev,
        schoolInfo: {
          schoolName: settings.schoolName || '',
          schoolCode: settings.schoolCode || '',
          schoolAddress: {
            street: settings.schoolAddress?.street || '',
            city: settings.schoolAddress?.city || '',
            state: settings.schoolAddress?.state || '',
            postalCode: settings.schoolAddress?.postalCode || '',
          },
          contactInformation: {
            phone: settings.contactInformation?.phone || '',
            email: settings.contactInformation?.email || '',
            website: settings.contactInformation?.website || '',
          },
          schoolLogo: settings.schoolLogo || null,
          principalName: settings.principalName || '',
          establishmentYear: settings.establishmentYear || null,
        },
        academicCalendar: {
          academicYear: settings.academicYear || '',
          termStartDate: settings.termStartDate || '',
          termEndDate: settings.termEndDate || '',
          terms: settings.terms || [],
          holidays: settings.holidays || [],
        },
        gradingScale: settings.gradingScale || [],
      }));
    }
  }, [settings]);

  // Handle school info form submission
  const handleSchoolInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      schoolInfoSchema.parse(formState.schoolInfo);

      const updateData: UpdateSettingsRequest = {
        schoolName: formState.schoolInfo.schoolName,
        schoolCode: formState.schoolInfo.schoolCode,
        schoolAddress: {
          street: formState.schoolInfo.schoolAddress.street || undefined,
          city: formState.schoolInfo.schoolAddress.city || undefined,
          state: formState.schoolInfo.schoolAddress.state || undefined,
          postalCode: formState.schoolInfo.schoolAddress.postalCode || undefined,
        },
        contactInformation: {
          phone: formState.schoolInfo.contactInformation.phone || undefined,
          email: formState.schoolInfo.contactInformation.email || undefined,
          website: formState.schoolInfo.contactInformation.website || undefined,
        },
        principalName: formState.schoolInfo.principalName || undefined,
        establishmentYear: formState.schoolInfo.establishmentYear || undefined,
      };

      // Handle logo upload if it's a File
      if (formState.schoolInfo.schoolLogo instanceof File) {
        // In a real app, you'd upload this to a file service
        // For now, we'll convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          updateData.schoolLogo = reader.result as string;
          updateSettingsMutation.mutate(updateData);
        };
        reader.readAsDataURL(formState.schoolInfo.schoolLogo);
      } else {
        updateSettingsMutation.mutate(updateData);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: FormErrors = {};
        err.errors.forEach((error) => {
          errors[error.path[0] as string] = error.message;
        });
        setFormErrors(errors);
      }
    }
  };

  // Handle academic calendar form submission
  const handleAcademicCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      academicCalendarSchema.parse({
        academicYear: formState.academicCalendar.academicYear,
        termStartDate: formState.academicCalendar.termStartDate,
        termEndDate: formState.academicCalendar.termEndDate,
        terms: formState.academicCalendar.terms,
        holidays: formState.academicCalendar.holidays,
      });
      updateSettingsMutation.mutate({
        academicYear: formState.academicCalendar.academicYear,
        termStartDate: formState.academicCalendar.termStartDate,
        termEndDate: formState.academicCalendar.termEndDate,
        terms: formState.academicCalendar.terms,
        holidays: formState.academicCalendar.holidays,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: FormErrors = {};
        err.errors.forEach((error) => {
          errors[error.path[0] as string] = error.message;
        });
        setFormErrors(errors);
      }
    }
  };

  // Handle grading scale form submission
  const handleGradingScaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      gradingScaleSchema.parse({
        gradingScale: formState.gradingScale,
      });
      updateSettingsMutation.mutate({
        gradingScale: formState.gradingScale,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: FormErrors = {};
        err.errors.forEach((error) => {
          errors[error.path[0] as string] = error.message;
        });
        setFormErrors(errors);
      }
    }
  };

  // Handle grading scale row changes
  const handleGradeChange = (index: number, field: string, value: any) => {
    const newGradingScale = [...formState.gradingScale];
    newGradingScale[index] = {
      ...newGradingScale[index],
      [field]: field === 'grade' ? value : Number(value),
    };
    setFormState((prev) => ({
      ...prev,
      gradingScale: newGradingScale,
    }));
  };

  // Add new grading scale row
  const addGradeRow = () => {
    setFormState((prev) => ({
      ...prev,
      gradingScale: [
        ...prev.gradingScale,
        { grade: '', minMarks: 0, maxMarks: 0, description: '' },
      ],
    }));
  };

  // Remove grading scale row
  const removeGradeRow = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      gradingScale: prev.gradingScale.filter((_, i) => i !== index),
    }));
  };

  // Handle term changes
  const handleTermChange = (index: number, field: string, value: string) => {
    const newTerms = [...formState.academicCalendar.terms];
    newTerms[index] = {
      ...newTerms[index],
      [field]: value,
    };
    setFormState((prev) => ({
      ...prev,
      academicCalendar: { ...prev.academicCalendar, terms: newTerms },
    }));
  };

  // Add new term
  const addTerm = () => {
    setFormState((prev) => ({
      ...prev,
      academicCalendar: {
        ...prev.academicCalendar,
        terms: [
          ...prev.academicCalendar.terms,
          { name: `Term ${prev.academicCalendar.terms.length + 1}`, startDate: '', endDate: '' },
        ],
      },
    }));
  };

  // Remove term
  const removeTerm = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      academicCalendar: {
        ...prev.academicCalendar,
        terms: prev.academicCalendar.terms.filter((_, i) => i !== index),
      },
    }));
  };

  // Handle holiday changes
  const handleHolidayChange = (index: number, field: string, value: string) => {
    const newHolidays = [...formState.academicCalendar.holidays];
    newHolidays[index] = {
      ...newHolidays[index],
      [field]: value,
    };
    setFormState((prev) => ({
      ...prev,
      academicCalendar: { ...prev.academicCalendar, holidays: newHolidays },
    }));
  };

  // Add new holiday
  const addHoliday = () => {
    setFormState((prev) => ({
      ...prev,
      academicCalendar: {
        ...prev.academicCalendar,
        holidays: [...prev.academicCalendar.holidays, { name: '', startDate: '', endDate: '' }],
      },
    }));
  };

  // Remove holiday
  const removeHoliday = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      academicCalendar: {
        ...prev.academicCalendar,
        holidays: prev.academicCalendar.holidays.filter((_, i) => i !== index),
      },
    }));
  };

  // Handle notification settings change
  const handleNotificationChange = (field: string, value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [field]: value,
      },
    }));
  };

  // Handle notification event type change
  const handleEventTypeChange = (eventType: string, value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        eventTypes: {
          ...prev.notificationSettings.eventTypes,
          [eventType]: value,
        },
      },
    }));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <DashboardLayout
        title="Settings"
        description="Configure school information, academic calendar, and system settings."
      >
        <div className="space-y-4">
          <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-96 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        title="Settings"
        description="Configure school information, academic calendar, and system settings."
      >
        <Card>
          <div className="flex items-center gap-3 text-danger-600">
            <Icon name="AlertCircle" size={24} />
            <div>
              <p className="font-medium">Failed to load settings</p>
              <p className="text-sm text-danger-500">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const tabs: Tab[] = [
    {
      id: 'school-info',
      label: 'School Information',
      icon: <Icon name="Building2" size={18} />,
      content: (
        <Card>
          <form onSubmit={handleSchoolInfoSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  label="School Name"
                  name="schoolName"
                  value={formState.schoolInfo.schoolName}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: { ...prev.schoolInfo, schoolName: value },
                    }))
                  }
                  error={formErrors.schoolName}
                  required
                  placeholder="Enter school name"
                />

                <FormField
                  label="School Code"
                  name="schoolCode"
                  value={formState.schoolInfo.schoolCode}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: { ...prev.schoolInfo, schoolCode: value },
                    }))
                  }
                  error={formErrors.schoolCode}
                  required
                  placeholder="Enter school code"
                />

                <FormField
                  label="Principal Name"
                  name="principalName"
                  value={formState.schoolInfo.principalName}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: { ...prev.schoolInfo, principalName: value },
                    }))
                  }
                  placeholder="Enter principal name"
                />

                <FormField
                  label="Establishment Year"
                  name="establishmentYear"
                  type="number"
                  value={formState.schoolInfo.establishmentYear?.toString() || ''}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: {
                        ...prev.schoolInfo,
                        establishmentYear: value ? parseInt(value) : null,
                      },
                    }))
                  }
                  placeholder="e.g., 2000"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Address</h3>
              <div className="space-y-4">
                <FormField
                  label="Street Address"
                  name="street"
                  value={formState.schoolInfo.schoolAddress.street}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: {
                        ...prev.schoolInfo,
                        schoolAddress: { ...prev.schoolInfo.schoolAddress, street: value },
                      },
                    }))
                  }
                  placeholder="Enter street address"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="City"
                    name="city"
                    value={formState.schoolInfo.schoolAddress.city}
                    onChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        schoolInfo: {
                          ...prev.schoolInfo,
                          schoolAddress: { ...prev.schoolInfo.schoolAddress, city: value },
                        },
                      }))
                    }
                    placeholder="Enter city"
                  />

                  <FormField
                    label="State"
                    name="state"
                    value={formState.schoolInfo.schoolAddress.state}
                    onChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        schoolInfo: {
                          ...prev.schoolInfo,
                          schoolAddress: { ...prev.schoolInfo.schoolAddress, state: value },
                        },
                      }))
                    }
                    placeholder="Enter state"
                  />

                  <FormField
                    label="Postal Code"
                    name="postalCode"
                    value={formState.schoolInfo.schoolAddress.postalCode}
                    onChange={(value) =>
                      setFormState((prev) => ({
                        ...prev,
                        schoolInfo: {
                          ...prev.schoolInfo,
                          schoolAddress: { ...prev.schoolInfo.schoolAddress, postalCode: value },
                        },
                      }))
                    }
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formState.schoolInfo.contactInformation.phone}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: {
                        ...prev.schoolInfo,
                        contactInformation: { ...prev.schoolInfo.contactInformation, phone: value },
                      },
                    }))
                  }
                  error={formErrors.phone}
                  placeholder="Enter phone number"
                />

                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formState.schoolInfo.contactInformation.email}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: {
                        ...prev.schoolInfo,
                        contactInformation: { ...prev.schoolInfo.contactInformation, email: value },
                      },
                    }))
                  }
                  error={formErrors.email}
                  placeholder="Enter email address"
                />

                <FormField
                  label="Website"
                  name="website"
                  type="url"
                  value={formState.schoolInfo.contactInformation.website}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      schoolInfo: {
                        ...prev.schoolInfo,
                        contactInformation: {
                          ...prev.schoolInfo.contactInformation,
                          website: value,
                        },
                      },
                    }))
                  }
                  error={formErrors.website}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* School Logo */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">School Logo</h3>
              <ImageUpload
                label="Upload School Logo"
                value={formState.schoolInfo.schoolLogo}
                onChange={(file) =>
                  setFormState((prev) => ({
                    ...prev,
                    schoolInfo: { ...prev.schoolInfo, schoolLogo: file },
                  }))
                }
                error={formErrors.schoolLogo}
                maxSize={5 * 1024 * 1024}
                acceptedFormats={['image/png', 'image/jpeg']}
                preview
                helperText="Upload a PNG or JPG image (max 5MB)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" loading={updateSettingsMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: 'academic-calendar',
      label: 'Academic Calendar',
      icon: <Icon name="Calendar" size={18} />,
      content: (
        <Card>
          <form onSubmit={handleAcademicCalendarSubmit} className="space-y-6">
            {/* Basic Academic Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Academic Year</h3>
              <div className="space-y-4">
                <FormField
                  label="Academic Year"
                  name="academicYear"
                  value={formState.academicCalendar.academicYear}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      academicCalendar: { ...prev.academicCalendar, academicYear: value },
                    }))
                  }
                  error={formErrors.academicYear}
                  required
                  placeholder="e.g., 2024-2025"
                />

                <FormField
                  label="Term Start Date"
                  name="termStartDate"
                  type="date"
                  value={formState.academicCalendar.termStartDate}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      academicCalendar: { ...prev.academicCalendar, termStartDate: value },
                    }))
                  }
                  error={formErrors.termStartDate}
                  required
                />

                <FormField
                  label="Term End Date"
                  name="termEndDate"
                  type="date"
                  value={formState.academicCalendar.termEndDate}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      academicCalendar: { ...prev.academicCalendar, termEndDate: value },
                    }))
                  }
                  error={formErrors.termEndDate}
                  required
                />
              </div>
            </div>

            {/* Multiple Terms */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Terms</h3>
              <div className="space-y-4">
                {formState.academicCalendar.terms.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No terms added yet</p>
                ) : (
                  <div className="space-y-3">
                    {formState.academicCalendar.terms.map((term, index) => (
                      <div
                        key={index}
                        className="p-4 border border-neutral-200 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral-900">Term {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTerm(index)}
                            className="text-danger-600 hover:text-danger-700 transition-colors"
                            aria-label="Remove term"
                          >
                            <Icon name="Trash2" size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={term.name}
                            onChange={(e) => handleTermChange(index, 'name', e.target.value)}
                            placeholder="e.g., Term 1"
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="date"
                            value={term.startDate}
                            onChange={(e) => handleTermChange(index, 'startDate', e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="date"
                            value={term.endDate}
                            onChange={(e) => handleTermChange(index, 'endDate', e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button type="button" variant="secondary" onClick={addTerm} className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Add Term
                </Button>
              </div>
            </div>

            {/* Holidays Management */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Holidays</h3>
              <div className="space-y-4">
                {formState.academicCalendar.holidays.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No holidays added yet</p>
                ) : (
                  <div className="space-y-3">
                    {formState.academicCalendar.holidays.map((holiday, index) => (
                      <div
                        key={index}
                        className="p-4 border border-neutral-200 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral-900">
                            {holiday.name || `Holiday ${index + 1}`}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeHoliday(index)}
                            className="text-danger-600 hover:text-danger-700 transition-colors"
                            aria-label="Remove holiday"
                          >
                            <Icon name="Trash2" size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={holiday.name}
                            onChange={(e) => handleHolidayChange(index, 'name', e.target.value)}
                            placeholder="Holiday name"
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="date"
                            value={holiday.startDate}
                            onChange={(e) =>
                              handleHolidayChange(index, 'startDate', e.target.value)
                            }
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="date"
                            value={holiday.endDate}
                            onChange={(e) => handleHolidayChange(index, 'endDate', e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button type="button" variant="secondary" onClick={addHoliday} className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Add Holiday
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" loading={updateSettingsMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: 'grading-scale',
      label: 'Grading Scale',
      icon: <Icon name="BarChart3" size={18} />,
      content: (
        <Card>
          <form onSubmit={handleGradingScaleSubmit} className="space-y-6">
            {/* Grading Scale Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Define grade ranges for your school. Grades must have unique names and
                non-overlapping ranges.
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">Grade</th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">
                      Min Marks
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">
                      Max Marks
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">
                      Description
                    </th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formState.gradingScale.map((grade, index) => {
                    const percentage =
                      grade.maxMarks > 0
                        ? (((grade.minMarks + grade.maxMarks) / 2 / 100) * 100).toFixed(1)
                        : '0';
                    const hasOverlap = formState.gradingScale.some((g, i) => {
                      if (i === index) return false;
                      return grade.minMarks <= g.maxMarks && grade.maxMarks >= g.minMarks;
                    });
                    const isDuplicate = formState.gradingScale.some((g, i) => {
                      if (i === index) return false;
                      return g.grade.toUpperCase() === grade.grade.toUpperCase();
                    });
                    const isInvalid = grade.minMarks > grade.maxMarks;

                    return (
                      <tr
                        key={index}
                        className={`border-b border-neutral-100 ${
                          hasOverlap || isDuplicate || isInvalid ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={grade.grade}
                            onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                            placeholder="e.g., A"
                            className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 ${
                              isDuplicate
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-neutral-200 focus:ring-primary-500'
                            }`}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={grade.minMarks}
                            onChange={(e) => handleGradeChange(index, 'minMarks', e.target.value)}
                            placeholder="0"
                            min="0"
                            max="100"
                            className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 ${
                              isInvalid || hasOverlap
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-neutral-200 focus:ring-primary-500'
                            }`}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={grade.maxMarks}
                            onChange={(e) => handleGradeChange(index, 'maxMarks', e.target.value)}
                            placeholder="100"
                            min="0"
                            max="100"
                            className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 ${
                              isInvalid || hasOverlap
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-neutral-200 focus:ring-primary-500'
                            }`}
                          />
                        </td>
                        <td className="py-3 px-3 text-neutral-600">{percentage}%</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={grade.description || ''}
                            onChange={(e) =>
                              handleGradeChange(index, 'description', e.target.value)
                            }
                            placeholder="Optional remarks"
                            className="w-full px-2 py-1 border border-neutral-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => removeGradeRow(index)}
                            className="text-danger-600 hover:text-danger-700 transition-colors"
                            aria-label="Remove grade"
                          >
                            <Icon name="Trash2" size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {formState.gradingScale.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-4">No grades added yet</p>
              ) : (
                formState.gradingScale.map((grade, index) => {
                  const percentage =
                    grade.maxMarks > 0
                      ? (((grade.minMarks + grade.maxMarks) / 2 / 100) * 100).toFixed(1)
                      : '0';
                  const hasOverlap = formState.gradingScale.some((g, i) => {
                    if (i === index) return false;
                    return grade.minMarks <= g.maxMarks && grade.maxMarks >= g.minMarks;
                  });
                  const isDuplicate = formState.gradingScale.some((g, i) => {
                    if (i === index) return false;
                    return g.grade.toUpperCase() === grade.grade.toUpperCase();
                  });
                  const isInvalid = grade.minMarks > grade.maxMarks;

                  return (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg space-y-3 ${
                        hasOverlap || isDuplicate || isInvalid
                          ? 'border-red-300 bg-red-50'
                          : 'border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-neutral-900">Grade {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeGradeRow(index)}
                          className="text-danger-600 hover:text-danger-700 transition-colors"
                          aria-label="Remove grade"
                        >
                          <Icon name="Trash2" size={18} />
                        </button>
                      </div>

                      {/* Error Messages */}
                      {isDuplicate && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <Icon name="AlertCircle" size={16} />
                          <span>Duplicate grade name</span>
                        </div>
                      )}
                      {isInvalid && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <Icon name="AlertCircle" size={16} />
                          <span>Min marks must be ≤ max marks</span>
                        </div>
                      )}
                      {hasOverlap && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <Icon name="AlertCircle" size={16} />
                          <span>Overlapping range detected</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Grade Name
                          </label>
                          <input
                            type="text"
                            value={grade.grade}
                            onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                            placeholder="e.g., A"
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                              isDuplicate
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-neutral-200 focus:ring-primary-500'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Min Marks
                            </label>
                            <input
                              type="number"
                              value={grade.minMarks}
                              onChange={(e) => handleGradeChange(index, 'minMarks', e.target.value)}
                              placeholder="0"
                              min="0"
                              max="100"
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                                isInvalid || hasOverlap
                                  ? 'border-red-300 focus:ring-red-500'
                                  : 'border-neutral-200 focus:ring-primary-500'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Max Marks
                            </label>
                            <input
                              type="number"
                              value={grade.maxMarks}
                              onChange={(e) => handleGradeChange(index, 'maxMarks', e.target.value)}
                              placeholder="100"
                              min="0"
                              max="100"
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                                isInvalid || hasOverlap
                                  ? 'border-red-300 focus:ring-red-500'
                                  : 'border-neutral-200 focus:ring-primary-500'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Percentage Range
                          </label>
                          <div className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
                            {percentage}%
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={grade.description || ''}
                            onChange={(e) =>
                              handleGradeChange(index, 'description', e.target.value)
                            }
                            placeholder="e.g., Excellent performance"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Grade Coverage Summary */}
            {formState.gradingScale.length > 0 && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-3">Grade Coverage</h4>
                <div className="space-y-2">
                  {formState.gradingScale
                    .sort((a, b) => b.maxMarks - a.maxMarks)
                    .map((grade, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">
                          {grade.grade}: {grade.minMarks}-{grade.maxMarks}
                        </span>
                        <div className="flex-1 mx-3 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500"
                            style={{
                              width: `${((grade.maxMarks - grade.minMarks + 1) / 101) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-neutral-600 w-12 text-right">
                          {(((grade.maxMarks - grade.minMarks + 1) / 101) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Add Grade Button */}
            <Button type="button" variant="secondary" onClick={addGradeRow} className="w-full">
              <Icon name="Plus" size={18} className="mr-2" />
              Add Grade
            </Button>

            {/* Form Errors */}
            {formErrors.gradingScale && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <Icon name="AlertCircle" size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{formErrors.gradingScale}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" loading={updateSettingsMutation.isPending}>
                Save Changes
              </Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ),
    },
    {
      id: 'notifications',
      label: 'Notification Settings',
      icon: <Icon name="Bell" size={18} />,
      content: (
        <Card>
          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Channels</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.emailNotifications}
                    onChange={(e) =>
                      handleNotificationChange('emailNotifications', e.target.checked)
                    }
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">Email Notifications</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.pushNotifications}
                    onChange={(e) =>
                      handleNotificationChange('pushNotifications', e.target.checked)
                    }
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">Push Notifications</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.smsNotifications}
                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">SMS Notifications</span>
                </label>
              </div>
            </div>

            {/* Event Types */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Event Types to Notify</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.eventTypes.userRegistration}
                    onChange={(e) => handleEventTypeChange('userRegistration', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">User Registration</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.eventTypes.gradeSubmission}
                    onChange={(e) => handleEventTypeChange('gradeSubmission', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">Grade Submission</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.eventTypes.attendanceAlert}
                    onChange={(e) => handleEventTypeChange('attendanceAlert', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">Attendance Alert</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.notificationSettings.eventTypes.feeReminder}
                    onChange={(e) => handleEventTypeChange('feeReminder', e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-neutral-700">Fee Reminder</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="primary">Save Changes</Button>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Settings"
      description="Configure school information, academic calendar, and system settings."
    >
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationToast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
    </DashboardLayout>
  );
};

export default SettingsPage;
