import React from 'react'
import { Label } from '../atoms/Label'
import { Input } from '../atoms/Input'

interface FormFieldProps {
  label: string
  name?: string
  type?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  id?: string
  children?: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  placeholder,
  id,
  children,
}) => {
  const fieldId = id || `field-${name}`

  return (
    <div className="w-full">
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      {children ? (
        children
      ) : (
        <Input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          error={error}
          helperText={helperText}
          disabled={disabled}
          placeholder={placeholder}
          aria-required={required}
          aria-invalid={!!error}
        />
      )}
      {error && (
        <span id={`${fieldId}-error`} className="text-danger-600 text-sm mt-1 block">
          {error}
        </span>
      )}
    </div>
  )
}
