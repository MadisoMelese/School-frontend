/**
 * Grade Calculator Utilities
 * Calculate grades from marks, GPA, performance metrics
 */

/**
 * Grade scale definition
 */
export interface GradeScale {
  grade: string;
  minMarks: number;
  maxMarks: number;
  gpa: number;
}

/**
 * Default grading scale
 */
export const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { grade: 'A', minMarks: 90, maxMarks: 100, gpa: 4.0 },
  { grade: 'B', minMarks: 80, maxMarks: 89, gpa: 3.0 },
  { grade: 'C', minMarks: 70, maxMarks: 79, gpa: 2.0 },
  { grade: 'D', minMarks: 60, maxMarks: 69, gpa: 1.0 },
  { grade: 'F', minMarks: 0, maxMarks: 59, gpa: 0.0 },
];

/**
 * Calculate percentage from marks
 */
export const calculatePercentage = (marksObtained: number, totalMarks: number): number => {
  if (totalMarks === 0) return 0;
  return (marksObtained / totalMarks) * 100;
};

/**
 * Calculate grade from marks
 */
export const calculateGrade = (
  marksObtained: number,
  totalMarks: number,
  gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE
): string => {
  const percentage = calculatePercentage(marksObtained, totalMarks);

  const gradeEntry = gradeScale.find(
    (scale) => percentage >= scale.minMarks && percentage <= scale.maxMarks
  );

  return gradeEntry?.grade || 'F';
};

/**
 * Calculate GPA from marks
 */
export const calculateGPA = (
  marksObtained: number,
  totalMarks: number,
  gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE
): number => {
  const percentage = calculatePercentage(marksObtained, totalMarks);

  const gradeEntry = gradeScale.find(
    (scale) => percentage >= scale.minMarks && percentage <= scale.maxMarks
  );

  return gradeEntry?.gpa || 0.0;
};

/**
 * Calculate average grade from multiple marks
 */
export const calculateAverageGrade = (
  grades: Array<{ marksObtained: number; totalMarks: number }>,
  _gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE
): number => {
  if (grades.length === 0) return 0;

  const totalPercentage = grades.reduce((sum, grade) => {
    return sum + calculatePercentage(grade.marksObtained, grade.totalMarks);
  }, 0);

  return totalPercentage / grades.length;
};

/**
 * Calculate cumulative GPA from multiple grades
 */
export const calculateCumulativeGPA = (
  grades: Array<{ marksObtained: number; totalMarks: number }>,
  gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE
): number => {
  if (grades.length === 0) return 0;

  const totalGPA = grades.reduce((sum, grade) => {
    return sum + calculateGPA(grade.marksObtained, grade.totalMarks, gradeScale);
  }, 0);

  return totalGPA / grades.length;
};

/**
 * Calculate highest score from grades
 */
export const calculateHighestScore = (
  grades: Array<{ marksObtained: number; totalMarks: number }>
): number => {
  if (grades.length === 0) return 0;

  return Math.max(
    ...grades.map((grade) => calculatePercentage(grade.marksObtained, grade.totalMarks))
  );
};

/**
 * Calculate lowest score from grades
 */
export const calculateLowestScore = (
  grades: Array<{ marksObtained: number; totalMarks: number }>
): number => {
  if (grades.length === 0) return 0;

  return Math.min(
    ...grades.map((grade) => calculatePercentage(grade.marksObtained, grade.totalMarks))
  );
};

/**
 * Calculate grade distribution
 */
export const calculateGradeDistribution = (
  grades: Array<{ marksObtained: number; totalMarks: number }>,
  gradeScale: GradeScale[] = DEFAULT_GRADE_SCALE
): Record<string, number> => {
  const distribution: Record<string, number> = {};

  // Initialize distribution
  gradeScale.forEach((scale) => {
    distribution[scale.grade] = 0;
  });

  // Count grades
  grades.forEach((grade) => {
    const gradeValue = calculateGrade(grade.marksObtained, grade.totalMarks, gradeScale);
    distribution[gradeValue]++;
  });

  return distribution;
};

/**
 * Calculate performance trend
 */
export const calculatePerformanceTrend = (
  grades: Array<{ marksObtained: number; totalMarks: number; date: Date }>
): Array<{ month: string; average: number }> => {
  const monthlyAverages: Record<string, number[]> = {};

  grades.forEach((grade) => {
    const monthKey = `${grade.date.getFullYear()}-${String(grade.date.getMonth() + 1).padStart(2, '0')}`;
    const percentage = calculatePercentage(grade.marksObtained, grade.totalMarks);

    if (!monthlyAverages[monthKey]) {
      monthlyAverages[monthKey] = [];
    }

    monthlyAverages[monthKey].push(percentage);
  });

  return Object.entries(monthlyAverages)
    .map(([month, percentages]) => ({
      month,
      average: percentages.reduce((a, b) => a + b, 0) / percentages.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Get grade color
 */
export const getGradeColor = (grade: string): string => {
  const colorMap: Record<string, string> = {
    A: '#10b981', // green
    B: '#3b82f6', // blue
    C: '#f59e0b', // yellow
    D: '#ef4444', // red
    F: '#6b7280', // gray
  };

  return colorMap[grade] || '#6b7280';
};

/**
 * Get performance level
 */
export const getPerformanceLevel = (percentage: number): string => {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Very Good';
  if (percentage >= 70) return 'Good';
  if (percentage >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

/**
 * Calculate weighted average
 */
export const calculateWeightedAverage = (
  grades: Array<{ marksObtained: number; totalMarks: number; weight: number }>
): number => {
  if (grades.length === 0) return 0;

  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);

  if (totalWeight === 0) return 0;

  const weightedSum = grades.reduce((sum, grade) => {
    const percentage = calculatePercentage(grade.marksObtained, grade.totalMarks);
    return sum + percentage * grade.weight;
  }, 0);

  return weightedSum / totalWeight;
};
