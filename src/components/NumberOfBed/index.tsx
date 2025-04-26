import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface BedCount {
  bedCount: string;
  numberOfHomes: number;
}

interface NumberOfBedProps {
  state?: string;
  wonerId?: string;
  onSelect: (minBeds: string) => void;
  selectedBeds?: string;
}

const NumberOfBed: React.FC<NumberOfBedProps> = ({
  state,
  wonerId,
  onSelect,
  selectedBeds
}) => {
  const [loading, setLoading] = useState(false);
  const [bedCounts, setBedCounts] = useState<BedCount[]>([]);

  useEffect(() => {
    const fetchBedCounts = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/nursing-home', {
          state,
          wonerId
        });
        setBedCounts(response.data.data);
      } catch (error) {
        console.error('Error fetching bed counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBedCounts();
  }, [state, wonerId]);

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="animate-pulse flex flex-col">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <select
        value={selectedBeds || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="">All Bed Counts</option>
        {bedCounts.map((item) => (
          <option key={item.bedCount} value={item.bedCount}>
            {item.bedCount} Beds 
          </option>
        ))}
      </select>
    </div>
  );
};

export default NumberOfBed;
