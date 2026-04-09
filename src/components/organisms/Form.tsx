import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../atoms/Button'
import { FormField } from '../molecules/FormField'
import { Input } from '../atoms/Input'
import { Label } from '../atoms/Label'

export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: z.ZodSchema
  rows?: number
}

export interface FormProps {
  fields: FormFieldConfig[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  loading?: boolean
  error?: string
  submitText?: string
  cancelText?: string
  onCancel?: () => void
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  loading = false,
  error,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(error || null)

  // Build Zod schema dynamically
  const schemaObject: Record<string, z.ZodSchema> = {}
  fields.forEach((field) => {
    if (field.validation) {
      schemaObject[field.name] = field.validation
    } else if (field.required) {
      if (field.type === 'email') {
        schemaObject[field.name] = z.string().email('Invalid email address')
      } else if (field.type === 'number') {
        schemaObject[field.name] = z.coerce.number()
      } else if (field.type === 'checkbox') {
        schemaObject[field.name] = z.boolean()
      } else {
        schemaObject[field.name] = z.string().min(1, `${field.label} is required`)
      }
    } else {
      schemaObject[field.name] = z.string().optional()
    }
  })

  const schema = z.object(schemaObject)
  type FormData = z.infer<typeof schema>

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const handleFormSubmit = async (data: FormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
      reset()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {/* Global Error */}
      {submitError && (
        <div
          className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => {
              const fieldError = errors[field.name]?.message as string | undefined

              if (field.type === 'select') {
                return (
                  <FormField
                    label={field.label}
                    error={fieldError}
                    required={field.required}
                  >
                    <select
                      {...fieldProps}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100"
                      disabled={loading}
                      aria-invalid={!!fieldError}
                      aria-describedby={fieldError ? `${field.name}-error` : undefined}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                )
              }

              if (field.type === 'textarea') {
                return (
                  <FormField
                    label={field.label}
                    error={fieldError}
                    required={field.required}
                  >
                    <textarea
                      {...fieldProps}
                      placeholder={field.placeholder}
                      rows={field.rows || 4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 resize-none"
                      disabled={loading}
                      aria-invalid={!!fieldError}
                      aria-describedby={fieldError ? `${field.name}-error` : undefined}
                    />
                  </FormField>
                )
              }

              if (field.type === 'checkbox') {
                return (
                  <div className="flex items-center gap-2">
                    <input
                      {...fieldProps}
                      type="checkbox"
                      checked={fieldProps.value as boolean}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      disabled={loading}
                      aria-invalid={!!fieldError}
                      aria-describedby={fieldError ? `${field.name}-error` : undefined}
                    />
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {fieldError && (
                      <span id={`${field.name}-error`} className="text-danger-600 text-sm">
                        {fieldError}
                      </span>
                    )}
                  </div>
                )
              }

              return (
                <FormField
                  label={field.label}
                  error={fieldError}
                  required={field.required}
                >
                  <Input
                    {...fieldProps}
                    type={field.type}
                    placeholder={field.placeholder}
                    disabled={loading}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? `${field.name}-error` : undefined}
                  />
                </FormField>
              )
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  )
}
