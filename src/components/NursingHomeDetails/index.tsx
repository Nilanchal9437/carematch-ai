import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface NursingHomeDetailsProps {
  nursingHomeId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Owner {
  _id: string;
  owner_name: string;
  cms_certification_number_ccn: string;
  owner_type: string;
  owner_ein: string;
  owner_npi: string;
  association_date: string;
  ownership_percentage: string;
  role_played_by_owner_or_manager_in_facility: string;
  is_primary_owner: boolean;
}

interface OwnerStats {
  totalFacilities: number;
  totalBeds: number;
  averageOccupancy: number;
  averageRating: number;
  statePresence: { [key: string]: number };
}

interface OwnerProfileData {
  owner: Owner;
  facilities: any[];
  stats: OwnerStats;
}

const RatingBadge: React.FC<{ value: number; type: 'buy' | 'sell' | 'refinance' }> = ({ value, type }) => {
  let colorClass = '';
  
  if (type === 'buy' || type === 'refinance') {
    colorClass = value >= 4 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                value >= 2.5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  } else {
    colorClass = value >= 4 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                value >= 2.5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }

  return (
    <div className={`px-2 py-1 rounded text-sm font-medium ${colorClass}`}>
      {value.toFixed(1)}/5
    </div>
  );
};

const OwnerProfilePopup: React.FC<{ owner: Owner | null; onClose: () => void }> = ({ owner, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<OwnerProfileData | null>(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!owner?._id) return;
      
      try {
        setLoading(true);
        const response = await axios.put('/api/woner', { id: owner._id });
        const { owner: ownerData, facilities } = response.data;
        
        // Calculate stats
        const totalFacilities = facilities.length;
        let totalBeds = 0;
        let totalOccupancy = 0;
        let totalRating = 0;
        const statePresence: { [key: string]: number } = {};
        
        facilities.forEach((facility: any) => {
          const beds = parseInt(facility.number_of_certified_beds) || 0;
          const occupancy = parseInt(facility.average_number_of_residents_per_day) || 0;
          totalBeds += beds;
          totalOccupancy += occupancy;
          
          const rating = parseInt(facility.overall_rating) || 0;
          if (rating > 0) totalRating += rating;
          
          if (facility.state) {
            statePresence[facility.state] = (statePresence[facility.state] || 0) + 1;
          }
        });

        setProfileData({
          owner: ownerData,
          facilities,
          stats: {
            totalFacilities,
            totalBeds,
            averageOccupancy: totalFacilities ? (totalOccupancy / totalFacilities) : 0,
            averageRating: totalFacilities ? (totalRating / totalFacilities) : 0,
            statePresence
          }
        });
      } catch (error) {
        console.error('Error fetching owner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [owner?._id]);

  if (!owner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-[80vw] max-h-[80vh] overflow-hidden shadow-xl">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Owner Profile: {owner.owner_name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : profileData ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Facilities</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profileData.stats.totalFacilities}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Beds</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profileData.stats.totalBeds}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Occupancy</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profileData.stats.averageOccupancy.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profileData.stats.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* State Presence */}
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">State Presence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(profileData.stats.statePresence).map(([state, count]) => (
                    <div key={state} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{state}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities Table */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Facilities</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Facility Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          State
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Beds
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Occupancy
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {profileData.facilities.map((facility: any) => (
                        <tr key={facility._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {facility.provider_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {facility.state}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {facility.number_of_certified_beds}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {facility.average_number_of_residents_per_day}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {facility.overall_rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No owner data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NursingHomeDetails: React.FC<NursingHomeDetailsProps> = ({
  nursingHomeId,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!nursingHomeId || !isOpen) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/nursing-home/${nursingHomeId}`);
        setDetails(response.data.data);
      } catch (error) {
        console.error('Error fetching nursing home details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [nursingHomeId, isOpen]);

  const handleOwnerClick = (owner: Owner) => {
    setSelectedOwner(owner);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-[90vw] max-h-[90vh] overflow-hidden shadow-xl transform transition-all">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Nursing Home Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : details ? (
              <div className="space-y-8">
                {/* Investment Ratings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Investment Ratings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Buy Rating</p>
                        <RatingBadge value={details.buy} type="buy" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Based on overall rating, occupancy rate, fines, and ownership type
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sell Rating</p>
                        <RatingBadge value={details.sell} type="sell" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Based on turnover rate, health inspection, occupancy rate, and fines
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Refinance Rating</p>
                        <RatingBadge value={details.refinance} type="refinance" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Based on overall rating, occupancy rate, and inspection history
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider Name</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.provider_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CCN</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.cms_certification_number_ccn}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Legal Business Name</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.legal_business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.provider_address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {details.citytown}, {details.state} {details.zip_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.telephone_number}</p>
                    </div>
                  </div>
                </div>

                {/* Facility Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Facility Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ownership Type</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.ownership_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Certified Beds</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.number_of_certified_beds}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider Type</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.provider_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Residents/Day</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.average_number_of_residents_per_day}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">First Approved Date</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {details.date_first_approved_to_provide_medicare_and_medicaid_services}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Hospital</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.provider_resides_in_hospital}</p>
                    </div>
                  </div>
                </div>

                {/* Ratings & Quality Measures */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ratings & Quality Measures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Rating</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.overall_rating}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Inspection Rating</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.health_inspection_rating}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">QM Rating</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.qm_rating}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Staffing Rating</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.staffing_rating}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Health Deficiencies</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {details.rating_cycle_1_total_number_of_health_deficiencies}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Penalties</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.total_number_of_penalties}</p>
                    </div>
                  </div>
                </div>

                {/* Staffing Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Staffing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">RN Hours/Day</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {details.reported_rn_staffing_hours_per_resident_per_day}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff Hours/Day</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {details.reported_total_nurse_staffing_hours_per_resident_per_day}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Staff Turnover</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{details.total_nursing_staff_turnover}</p>
                    </div>
                  </div>
                </div>

                {/* Owners Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Owners Information</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Owner Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            EIN
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            NPI
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Association Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ownership %
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Primary
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {details.woner_ids.map((owner: Owner) => (
                          <tr key={owner._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                onClick={() => handleOwnerClick(owner)}>
                              {owner.owner_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.owner_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.owner_ein}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.owner_npi}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.association_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.ownership_percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.role_played_by_owner_or_manager_in_facility}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {owner.is_primary_owner ? 'Yes' : 'No'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No details available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedOwner && (
        <OwnerProfilePopup
          owner={selectedOwner}
          onClose={() => setSelectedOwner(null)}
        />
      )}
    </>
  );
};

export default NursingHomeDetails; 