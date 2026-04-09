import React from 'react'
import { Icon } from '../atoms/Icon'
import { Badge } from '../atoms/Badge'
import { useHeaderVisibility } from '../../hooks/useHeaderVisibility'

export interface BottomTabItem {
  id: string
  label: string
  icon: string
  href: string
  roles?: string[]
  badge?: number
}

export interface BottomTabNavigationProps {
  items: BottomTabItem[]
  activeItem?: string
  onItemClick: (itemId: string) => void
  userRole?: string
  enableScrollHiding?: boolean
  scrollHideThreshold?: number
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  userRole,
  enableScrollHiding = true,
  scrollHideThreshold = 50,
}) => {
  const { isHeaderVisible } = useHeaderVisibility(scrollHideThreshold)
  // Filter items based on user role
  const visibleItems = items.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true
    }
    return userRole && item.roles.includes(userRole)
  })

  // Limit to 5 items for bottom tab navigation
  const displayItems = visibleItems.slice(0, 5)

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId)
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-around z-40 safe-bottom transition-transform duration-300 ease-in-out ${
        enableScrollHiding && !isHeaderVisible ? 'translate-y-full' : 'translate-y-0'
      }`}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {displayItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item.id)}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-16 transition-colors relative ${
            activeItem === item.id
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          aria-current={activeItem === item.id ? 'page' : undefined}
          aria-label={item.label}
          title={item.label}
        >
          <Icon
            name={item.icon as keyof typeof import('lucide-react')}
            size={24}
            className={activeItem === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-400'}
          />
          <span className="text-xs font-medium">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <Badge
              variant="danger"
              className="text-xs absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {(item.badge as number) > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </button>
      ))}
    </nav>
  )
}
