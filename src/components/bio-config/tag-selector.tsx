import * as React from "react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useBioStore } from "@/lib/store/bioStore";

interface TagSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export function TagSelector({
  value,
  onValueChange,
  onKeyDown,
  placeholder,
  className,
}: TagSelectorProps) {
  const { tags } = useBioStore();
  const [open, setOpen] = useState(false);

  const filteredTags = useMemo(() => {
    if (!value) return tags;
    const search = value.toLowerCase();
    return tags.filter((t) => t.id.toLowerCase().includes(search));
  }, [tags, value]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Popover open={open && filteredTags.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay blur to allow click on command item
              setTimeout(() => setOpen(false), 200);
            }}
            placeholder={placeholder}
            className={className}
          />
        </PopoverAnchor>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.id}
                    onSelect={() => handleSelect(tag.id)}
                  >
                    {tag.id}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
