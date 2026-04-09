import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '../atoms/Icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  debounceDelay?: number
  clearable?: boolean
  disabled?: boolean
  className?: string
  id?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceDelay = 300,
  clearable = true,
  disabled = false,
  className,
  id,
}) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const searchBarId = id || `searchbar-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedValue(value)
      if (onSearch) {
        onSearch(value)
      }
    }, debounceDelay)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value, debounceDelay, onSearch])

  const handleClear = () => {
    onChange('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={`relative w-full ${className || ''}`}>
      <div className="relative flex items-center">
        <Icon
          name="Search"
          size="md"
          className="absolute left-3 text-neutral-500 pointer-events-none"
        />
        <input
          id={searchBarId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2.5 text-base rounded-lg border-2 border-neutral-300 transition-colors duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed min-h-[44px]"
          aria-label="Search"
          role="search"
        />
        {clearable && value && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <Icon name="X" size="md" />
          </button>
        )}
      </div>
    </div>
  )
}
