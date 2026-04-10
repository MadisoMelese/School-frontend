import React from 'react';
import { Dropdown, DropdownOption } from './Dropdown';
import { DatePicker } from './DatePicker';
import { SearchBar } from './SearchBar';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

export interface Filter {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text';
  value?: string | string[] | Date;
  options?: DropdownOption[];
}

interface FilterBarProps {
  filters: Filter[];
  onChange: (filterId: string, value: any) => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  showReset = true,
  className,
}) => {
  const hasActiveFilters = filters.some((f) => f.value !== undefined && f.value !== '');

  const renderFilter = (filter: Filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <Dropdown
            key={filter.id}
            options={filter.options || []}
            value={filter.value as string | number}
            onChange={(value) => onChange(filter.id, value)}
            placeholder={filter.label}
            searchable
          />
        );
      case 'date':
        return (
          <DatePicker
            key={filter.id}
            value={filter.value as Date}
            onChange={(date) => onChange(filter.id, date)}
            placeholder={filter.label}
          />
        );
      case 'text':
        return (
          <SearchBar
            key={filter.id}
            value={(filter.value as string) || ''}
            onChange={(value) => onChange(filter.id, value)}
            placeholder={filter.label}
            debounceDelay={300}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      {/* Filters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filters.map((filter) => renderFilter(filter))}
      </div>

      {/* Reset button */}
      {showReset && hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset} className="flex items-center gap-2">
            <Icon name="RotateCcw" size="sm" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};
