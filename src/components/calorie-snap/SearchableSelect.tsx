
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label'; // Import Label

export interface SearchableSelectItem {
  id: string;
  name: string;
  details?: string;
}

interface SearchableSelectProps {
  id?: string;
  items: SearchableSelectItem[];
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  label?: string; // New label prop
  placeholder?: string;
  searchPlaceholder?: string;
  notFoundText?: string | ((searchTerm: string) => string);
  onNotFoundClick?: (searchTerm: string) => void;
  notFoundIcon?: React.ElementType;
  disabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchableSelect({
  id,
  items,
  value,
  onValueChange,
  label, // Destructure new label prop
  placeholder = "Select an item...",
  searchPlaceholder = "Search...",
  notFoundText = "No item found.",
  onNotFoundClick,
  notFoundIcon: NotFoundIcon,
  disabled = false,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
}: SearchableSelectProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSearchTerm('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItem = items.find(item => item.id === value);

  const handleSelect = (itemId: string) => {
    onValueChange(itemId);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleNotFoundClick = () => {
    if (onNotFoundClick) {
      onNotFoundClick(searchTerm);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const getNotFoundMessage = () => {
    if (typeof notFoundText === 'function') {
      return notFoundText(searchTerm);
    }
    return notFoundText;
  };

  return (
    <div className="space-y-2">
      {label && id && <Label htmlFor={id}>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            id={id} // Use the passed id for the button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between bg-card text-foreground hover:bg-primary/10 focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="truncate">
              {selectedItem ? selectedItem.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="p-2 border-b border-border">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border-input focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Search items"
            />
          </div>
          <ScrollArea className="max-h-[250px]">
            <div className="py-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-primary hover:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      item.id === value && "bg-primary/50 font-medium"
                    )}
                    role="option"
                    aria-selected={item.id === value}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(item.id);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex-1 truncate" title={item.name}>{item.name}</span>
                    {item.details && <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">{item.details}</span>}
                  </div>
                ))
              ) : searchTerm.trim() !== '' && onNotFoundClick ? (
                <div
                  onClick={handleNotFoundClick}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-primary hover:text-primary-foreground"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotFoundClick();
                    }
                  }}
                >
                  {NotFoundIcon && <NotFoundIcon className="mr-2 h-4 w-4 shrink-0" />}
                  <span>{getNotFoundMessage()}</span>
                </div>
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {searchTerm.trim() === '' ? 'Type to search for an item.' : getNotFoundMessage()}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

