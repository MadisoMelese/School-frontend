import React from 'react'

interface CardProps {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const Card: React.FC<CardProps> = ({
  header,
  footer,
  children,
  className,
  onClick,
  hoverable = false,
}) => {
  const baseStyles =
    'bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden transition-all duration-200'
  const hoverStyles = hoverable ? 'hover:shadow-md hover:border-neutral-300 cursor-pointer' : ''
  const clickableStyles = onClick ? 'cursor-pointer' : ''

  return (
    <article
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </article>
  )
}

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
    <h3 className="text-sm font-semibold text-neutral-900">{children}</h3>
  </div>
)

export const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-4">{children}</div>
)

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">{children}</div>
)
