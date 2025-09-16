"use client"

import * as React from "react"

type CategoryFilterProps = {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
  rightContent?: React.ReactNode
}

export function CategoryFilter({ categories, selected, onSelect, rightContent }: CategoryFilterProps) {
  return (
    <div className="mb-8 border-b" style={{ borderBottomWidth: '0.5px' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex gap-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`pb-4 px-1 font-light text-base transition-all whitespace-nowrap ${
                  category === selected
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onSelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {rightContent && (
          <div className="flex-shrink-0 pb-4">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}


