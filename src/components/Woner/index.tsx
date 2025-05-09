'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { VariableSizeList } from 'react-window';
import debounce from 'lodash/debounce';

interface Woner {
  _id: string;
  owner_name: string;
  cms_certification_number_ccn: string[];
  owner_type: string;
  ownership_percentage: string;
  association_date: string;
}

interface WonerSearchProps {
  state?: string;
  onSelect?: (woner: Woner | null) => void;
  className?: string;
  placeholder?: string;
  selectedWonerId?: string | null;
}

const LISTBOX_PADDING = 8;
const ITEM_SIZE = 40;

const WonerSearch: React.FC<WonerSearchProps> = ({
  state,
  onSelect,
  className = '',
  placeholder = 'Search owners...',
  selectedWonerId = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWoner, setSelectedWoner] = useState<Woner | null>(null);
  const [woners, setWoners] = useState<Woner[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<VariableSizeList>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch selected woner details when selectedWonerId changes
  useEffect(() => {
    const fetchSelectedWoner = async () => {
      if (selectedWonerId) {
        try {
          const params = new URLSearchParams();
          if (selectedWonerId) {
            params.append('search', selectedWonerId);
          }
          if (state) {
            params.append('state', state);
          }
          const response = await axios.get(`/api/woner?${params.toString()}`);
          const selectedWoner = response.data.data.find((w: Woner) => w._id === selectedWonerId);
          if (selectedWoner) {
            setSelectedWoner(selectedWoner);
            setSearchTerm(selectedWoner.owner_name);
          }
        } catch (error) {
          console.error('Error fetching selected woner:', error);
        }
      } else {
        setSelectedWoner(null);
        setSearchTerm('');
      }
    };

    fetchSelectedWoner();
  }, [selectedWonerId, state]);

  const fetchWoners = async (search: string, isInitial = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsSearching(true);
      }

      const params = new URLSearchParams();
      
      if (search) {
        params.append('search', search);
      }
      
      if (state) {
        params.append('state', state);
      } 
      
      const response = await axios.get(`/api/woner?${params.toString()}`);
      setWoners(response.data.data);
    } catch (error) {
      console.error('Error fetching woners:', error);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  const debouncedFetch = debounce((search: string) => {
    fetchWoners(search);
  }, 300);

  // Initial load of all woners
  useEffect(() => {
    fetchWoners('', true);
  }, [state]);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm && !selectedWoner) {
      debouncedFetch(searchTerm);
    }
  }, [searchTerm]);

  const handleSelectWoner = (woner: Woner) => {
    setSelectedWoner(woner);
    setSearchTerm(woner.owner_name);
    setIsOpen(false);
    onSelect?.(woner);
  };

  const handleClear = () => {
    setSelectedWoner(null);
    setSearchTerm('');
    fetchWoners('', true);
    onSelect?.(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value) {
      handleClear();
    }
    setIsOpen(true);
    if (selectedWoner && value !== selectedWoner.owner_name) {
      setSelectedWoner(null);
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-2 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const renderRow = ({ index, style }: any) => {
    const woner = woners[index];
    if (!woner) return null;

    const isSelected = selectedWoner?._id === woner._id || selectedWonerId === woner._id;
    const ccnCount = woner.cms_certification_number_ccn.length;

    return (
      <div
        className={`px-4 py-2 cursor-pointer ${
          isSelected 
            ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        style={{
          ...style,
          top: (style.top as number) + LISTBOX_PADDING,
        }}
        onClick={() => handleSelectWoner(woner)}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{woner.owner_name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {woner.owner_type && (
                <span className="mr-2">Type: {woner.owner_type}</span>
              )}
              {woner.ownership_percentage && (
                <span>Ownership: {woner.ownership_percentage}%</span>
              )}
            </div>
          </div>
          <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
            {ccnCount} {ccnCount === 1 ? 'Facility' : 'Facilities'}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {woner.cms_certification_number_ccn.length > 0 && (
            <div className="truncate">
              CCNs: {woner.cms_certification_number_ccn.slice(0, 3).join(', ')}
              {woner.cms_certification_number_ccn.length > 3 && ' ...'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {(selectedWoner || searchTerm) && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={handleClear}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div ref={dropdownRef} className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {isInitialLoading ? (
            <SkeletonLoader />
          ) : isSearching ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
          ) : woners.length > 0 ? (
            <VariableSizeList
              height={Math.min(400, woners.length * ITEM_SIZE + 2 * LISTBOX_PADDING)}
              width="100%"
              itemCount={woners.length}
              itemSize={() => ITEM_SIZE * 1.5}
              ref={listRef}
              className="dark:bg-gray-800"
            >
              {renderRow}
            </VariableSizeList>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default WonerSearch;
