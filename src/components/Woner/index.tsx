'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { VariableSizeList } from 'react-window';
import debounce from 'lodash/debounce';

interface Woner {
  _id: string;
  owner_name: string;
  cms_certification_number_ccn: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface WonerSearchProps {
  state?: string;
  onSelect?: (woner: Woner) => void;
  className?: string;
  placeholder?: string;
}

const LISTBOX_PADDING = 8;
const ITEM_SIZE = 40;

const WonerSearch: React.FC<WonerSearchProps> = ({
  state,
  onSelect,
  className = '',
  placeholder = 'Search owners...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [woners, setWoners] = useState<Woner[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<VariableSizeList>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchWoners = async (page: number, search: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        search
      });
      
      if (state) {
        params.append('state', state);
      } 
      
      const response = await axios.get(`/api/woner?${params.toString()}`);
      setWoners(prev => [...prev, ...response.data.data]);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching woners:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = debounce((search: string) => {
    setWoners([]);
    fetchWoners(1, search);
  }, 300);

  useEffect(() => {
    if (searchTerm) {
      debouncedFetch(searchTerm);
    } else {
      setWoners([]);
    }
  }, [searchTerm, state]);

  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: any) => {
    if (
      !scrollUpdateWasRequested &&
      scrollOffset > (woners.length - 10) * ITEM_SIZE &&
      pagination?.hasNextPage &&
      !loading
    ) {
      fetchWoners(pagination.currentPage + 1, searchTerm);
    }
  };

  const renderRow = ({ index, style }: any) => {
    const woner = woners[index];
    if (!woner) return null;

    return (
      <div
        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        style={{
          ...style,
          top: (style.top as number) + LISTBOX_PADDING,
        }}
        onClick={() => {
          onSelect?.(woner);
          setIsOpen(false);
        }}
      >
        <div className="text-sm text-gray-900 dark:text-gray-100">{woner.owner_name}</div>
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
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {loading && woners.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>
          ) : woners.length > 0 ? (
            <VariableSizeList
              height={Math.min(400, woners.length * ITEM_SIZE + 2 * LISTBOX_PADDING)}
              width="100%"
              itemCount={woners.length}
              itemSize={() => ITEM_SIZE}
              onScroll={handleScroll}
              ref={listRef}
              className="dark:bg-gray-800"
            >
              {renderRow}
            </VariableSizeList>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default WonerSearch;
