import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GradeCard } from './GradeCard'

describe('GradeCard Component', () => {
  it('renders grade information', () => {
    render(
      <GradeCard
        subject="Mathematics"
        marksObtained={85}
        totalMarks={100}
        grade="A"
        examDate={new Date('2024-01-15')}
      />
    )

    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('85/100')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('displays remarks when provided', () => {
    const remarks = 'Excellent performance'
    render(
      <GradeCard
        subject="English"
        marksObtained={90}
        totalMarks={100}
        grade="A+"
        remarks={remarks}
      />
    )

    expect(screen.getByText(remarks)).toBeInTheDocument()
  })

  it('displays exam date when provided', () => {
    const examDate = new Date('2024-01-15')
    render(
      <GradeCard
        subject="Science"
        marksObtained={75}
        totalMarks={100}
        grade="B"
        examDate={examDate}
      />
    )

    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument()
  })

  it('displays performance indicator', () => {
    render(
      <GradeCard
        subject="History"
        marksObtained={80}
        totalMarks={100}
        grade="A"
      />
    )

    expect(screen.getByText('Good performance')).toBeInTheDocument()
  })

  it('displays improvement needed indicator for low grades', () => {
    render(
      <GradeCard
        subject="Physics"
        marksObtained={60}
        totalMarks={100}
        grade="C"
      />
    )

    expect(screen.getByText('Needs improvement')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(
      <GradeCard
        subject="Chemistry"
        marksObtained={88}
        totalMarks={100}
        grade="A"
        onClick={onClick}
      />
    )

    const card = screen.getByText('Chemistry').closest('article')
    fireEvent.click(card!)

    expect(onClick).toHaveBeenCalled()
  })

  it('displays correct grade badge color for A grade', () => {
    render(
      <GradeCard
        subject="Math"
        marksObtained={95}
        totalMarks={100}
        grade="A"
      />
    )

    const badge = screen.getByText('A').closest('span')
    expect(badge).toHaveClass('bg-success-100')
  })

  it('displays correct grade badge color for B grade', () => {
    render(
      <GradeCard
        subject="Math"
        marksObtained={85}
        totalMarks={100}
        grade="B"
      />
    )

    const badge = screen.getByText('B').closest('span')
    expect(badge).toHaveClass('bg-primary-100')
  })

  it('displays correct grade badge color for C grade', () => {
    render(
      <GradeCard
        subject="Math"
        marksObtained={75}
        totalMarks={100}
        grade="C"
      />
    )

    const badge = screen.getByText('C').closest('span')
    expect(badge).toHaveClass('bg-warning-100')
  })

  it('displays correct percentage color for high score', () => {
    render(
      <GradeCard
        subject="Math"
        marksObtained={95}
        totalMarks={100}
        grade="A"
      />
    )

    const percentage = screen.getByText('95%')
    expect(percentage).toHaveClass('text-success-600')
  })

  it('has proper accessibility attributes', () => {
    render(
      <GradeCard
        subject="Math"
        marksObtained={85}
        totalMarks={100}
        grade="A"
      />
    )

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '85')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })
})
