import React, { useState, useRef, useEffect } from 'react'
import { Icon } from '../atoms/Icon'

export interface DropdownOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
  multiple?: boolean
  className?: string
  id?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  disabled = false,
  multiple = false,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value)
          setIsOpen(false)
          setSearchTerm('')
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className || ''}`}>
      <button
        id={dropdownId}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2.5 text-base rounded-lg border-2 border-neutral-300 bg-white text-left flex items-center justify-between transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${dropdownId}-listbox`}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-500'}>
          {selectedOption?.label || placeholder}
        </span>
        <Icon
          name="ChevronDown"
          size="md"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
          {searchable && (
            <div className="p-2 border-b border-neutral-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          <ul
            id={`${dropdownId}-listbox`}
            role="listbox"
            className="max-h-60 overflow-y-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500 text-center">No options</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li key={option.value} role="presentation">
                  <button
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    disabled={option.disabled}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors min-h-[44px] flex items-center ${
                      index === highlightedIndex ? 'bg-primary-50' : ''
                    } ${
                      option.value === value
                        ? 'bg-primary-100 text-primary-900 font-medium'
                        : 'text-neutral-900 hover:bg-neutral-50'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
