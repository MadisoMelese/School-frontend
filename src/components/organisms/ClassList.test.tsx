import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassList } from './ClassList';
import { Class } from '../../types';

describe('ClassList Component', () => {
  const mockClasses: Class[] = [
    {
      id: '1',
      name: 'Class 10-A',
      gradeLevel: '10',
      section: 'A',
      studentCount: 45,
    },
    {
      id: '2',
      name: 'Class 10-B',
      gradeLevel: '10',
      section: 'B',
      studentCount: 42,
    },
    {
      id: '3',
      name: 'Class 9-A',
      gradeLevel: '9',
      section: 'A',
      studentCount: 48,
    },
  ];

  it('renders class list', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    expect(screen.getByText('Class 10-A')).toBeInTheDocument();
    expect(screen.getByText('Class 10-B')).toBeInTheDocument();
    expect(screen.getByText('Class 9-A')).toBeInTheDocument();
  });

  it('displays class information', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('calls onClassClick when class is clicked', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    const classButton = screen.getByText('Class 10-A');
    fireEvent.click(classButton);

    expect(onClassClick).toHaveBeenCalledWith('1');
  });

  it('calls onAction with attendance action', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    const attendanceButtons = screen.getAllByLabelText(/Mark attendance/i);
    fireEvent.click(attendanceButtons[0]);

    expect(onAction).toHaveBeenCalledWith('1', 'attendance');
  });

  it('calls onAction with grades action', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    const gradeButtons = screen.getAllByLabelText(/Enter grades/i);
    fireEvent.click(gradeButtons[0]);

    expect(onAction).toHaveBeenCalledWith('1', 'grades');
  });

  it('displays loading state', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(
      <ClassList classes={[]} onClassClick={onClassClick} onAction={onAction} loading={true} />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays empty state when no classes', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={[]} onClassClick={onClassClick} onAction={onAction} />);

    expect(screen.getByText('No classes available')).toBeInTheDocument();
  });

  it('displays student count badge', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const onClassClick = vi.fn();
    const onAction = vi.fn();

    render(<ClassList classes={mockClasses} onClassClick={onClassClick} onAction={onAction} />);

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-label', 'Classes list');
  });
});
