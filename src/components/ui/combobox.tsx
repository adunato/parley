"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps<T> {
  items: T[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  filterFn?: (item: T, query: string) => boolean
  itemToString?: (item: T) => string
}

export function Combobox<T extends { id: string }> ({
  items,
  value,
  onValueChange,
  placeholder = "Select item...",
  filterFn,
  itemToString,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(() => {
    const foundItem = items.find(item => item.id === value);
    return value && foundItem ? (itemToString ? itemToString(foundItem) : foundItem.id) : "";
  });

  React.useEffect(() => {
    const foundItem = items.find(item => item.id === value);
    if (value && foundItem) {
      setInputValue(itemToString ? itemToString(foundItem) : foundItem.id);
    } else {
      setInputValue("");
    }
  }, [value, items, itemToString]);

  const defaultFilterFn = (item: T, query: string) =>
    item.id.toLowerCase().includes(query.toLowerCase())

  const currentFilterFn = filterFn || defaultFilterFn;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? (items.find((item) => item.id === value)
                ? (itemToString ? itemToString(items.find((item) => item.id === value)!) : items.find((item) => item.id === value)?.id)
                : value)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {items.filter(item => currentFilterFn(item, inputValue)).map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {itemToString ? itemToString(item) : item.id}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
