import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';

interface SearchableFlatSelectorProps {
  flats: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableFlatSelector({ flats, value, onChange, placeholder = 'Search flat...', className }: SearchableFlatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFlats = useMemo(() => {
    return flats.filter(flat => flat.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [flats, searchTerm]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchTerm(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          className="pr-10"
        />
        <ChevronDown 
          className={cn("absolute right-3 top-3 h-4 w-4 text-gray-500 cursor-pointer transition-transform", isOpen ? "rotate-180" : "")} 
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredFlats.length > 0 ? (
            filteredFlats.map(flat => (
              <li
                key={flat}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => {
                  onChange(flat);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
              >
                {flat}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No flats found</li>
          )}
        </ul>
      )}
    </div>
  );
}
