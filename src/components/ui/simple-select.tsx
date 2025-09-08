import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export const SimpleSelect = React.forwardRef<HTMLDivElement, SimpleSelectProps>(
  ({ value, onValueChange, placeholder, children, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const [selectedLabel, setSelectedLabel] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (value: string, label: string) => {
      setSelectedValue(value);
      setSelectedLabel(label);
      onValueChange?.(value);
      setIsOpen(false);
    };

    return (
      <div ref={selectRef} className={cn("relative", className)} {...props}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-2 ring-ring"
          )}
        >
          <span className={selectedValue ? "text-foreground" : "text-muted-foreground"}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-1">
              {React.Children.map(children, (child) => {
                if (React.isValidElement<SimpleSelectItemProps>(child)) {
                  return React.cloneElement(child, {
                    onSelect: (value: string) => {
                      const label = child.props.children?.toString() || '';
                      handleSelect(value, label);
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SimpleSelect.displayName = 'SimpleSelect';

export const SimpleSelectItem = React.forwardRef<HTMLDivElement, SimpleSelectItemProps>(
  ({ value, children, onSelect, disabled, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none ${
          disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'cursor-default hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
        }`}
        onClick={() => !disabled && onSelect?.(value)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SimpleSelectItem.displayName = 'SimpleSelectItem';