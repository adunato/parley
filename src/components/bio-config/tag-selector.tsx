import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState, useMemo } from 'react'
import { useBioStore } from "@/lib/store/bioStore"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TagSelector({
  value,
  onValueChange,
  placeholder,
  className,
}: TagSelectorProps) {
  const { tags } = useBioStore()
  const [query, setQuery] = useState('')

  const filteredTags = useMemo(() => {
    const search = query.toLowerCase()
    return query === ''
      ? tags
      : tags.filter((tag) => tag.id.toLowerCase().includes(search))
  }, [tags, query])

  // Check if the current typed query exactly matches an existing tag
  // If NOT, we will show the "Create" option
  const exactMatch = tags.some((tag) => tag.id.toLowerCase() === query.toLowerCase())
  const showCreateOption = query.length > 0 && !exactMatch

  return (
    <div className={cn("relative w-full", className)}>
      <Combobox
        value={value}
        // 'immediate' prop ensures the dropdown opens on focus/click
        immediate
        onChange={(newValue) => {
          // If newValue is null (cleared), handle gracefully
          if (newValue) {
            onValueChange(newValue)
            setQuery(newValue) 
          }
        }}
        onClose={() => setQuery(value || '')}
      >
        <div className="relative">
          <ComboboxInput
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            placeholder={placeholder}
            // Update query as user types
            onChange={(event) => setQuery(event.target.value)}
            // Display the current value or the query if typing
            displayValue={(val: string) => val}
          />
        </div>

        {/* Render dropdown if we have matches OR if we need to show the "Create" option */}
        {(filteredTags.length > 0 || showCreateOption) && (
          <ComboboxOptions
            className={cn(
              "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
              "data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95",
              "data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95"
            )}
          >
            {filteredTags.map((tag) => (
              <ComboboxOption
                key={tag.id}
                value={tag.id}
                className={({ focus }) =>
                  cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
                    focus ? "bg-accent text-accent-foreground" : "",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className={cn("block truncate", selected && "font-medium")}>
                      {tag.id}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}

            {/* The "Create New" Option */}
            {showCreateOption && (
              <ComboboxOption
                value={query}
                className={({ focus }) =>
                  cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none border-t mt-1",
                    focus ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create "{query}"
              </ComboboxOption>
            )}
          </ComboboxOptions>
        )}
      </Combobox>
    </div>
  )
}