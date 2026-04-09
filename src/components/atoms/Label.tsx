import React from 'react'

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label: React.FC<LabelProps> = ({ required, children, className, ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-neutral-700 ${className || ''}`}
      {...props}
    >
      {children}
      {required && <span className="text-danger-500 ml-1" aria-label="required">*</span>}
    </label>
  )
}
