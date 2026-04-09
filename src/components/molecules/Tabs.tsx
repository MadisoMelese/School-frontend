import React, { useState } from 'react'

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'line' | 'pill'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string, index: number) => {
    let newIndex = index

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        newIndex = index - 1
        if (newIndex < 0) newIndex = tabs.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        newIndex = index + 1
        if (newIndex >= tabs.length) newIndex = 0
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = tabs.length - 1
        break
      default:
        return
    }

    const nextTab = tabs[newIndex]
    if (!nextTab.disabled) {
      onChange(nextTab.id)
    }
  }

  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        className={`flex gap-1 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto ${
          variant === 'pill' ? 'bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border-0' : ''
        }`}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
              tab.id === activeTab
                ? variant === 'pill'
                  ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 rounded-lg shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : variant === 'pill'
                  ? 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border-b-2 border-transparent'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTabContent && (
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={activeTab}
          className="mt-4 animate-fade-in"
        >
          {activeTabContent.content}
        </div>
      )}
    </div>
  )
}
