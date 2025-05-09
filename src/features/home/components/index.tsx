"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import StateDropdown from "@/components/State";
import WonerSearch from "@/components/Woner";
import Pagination from "@/components/Pagination";
import NumberOfBed from "@/components/NumberOfBed";
import NursingHomeDetails from "@/components/NursingHomeDetails";

interface NursingHome {
  _id: string;
  cms_certification_number_ccn: string;
  provider_name: string;
  provider_address: string;
  citytown: string;
  state: string;
  zip_code: string;
  telephone_number: string;
  provider_ssa_county_code: string;
  countyparish: string;
  ownership_type: string;
  number_of_certified_beds: string;
  average_number_of_residents_per_day: string;
  average_number_of_residents_per_day_footnote: string;
  provider_type: string;
  provider_resides_in_hospital: string;
  legal_business_name: string;
  date_first_approved_to_provide_medicare_and_medicaid_services: string;
  affiliated_entity_name: string;
  affiliated_entity_id: string;
  continuing_care_retirement_community: string;
  special_focus_status: string;
  abuse_icon: string;
  most_recent_health_inspection_more_than_2_years_ago: string;
  provider_changed_ownership_in_last_12_months: string;
  with_a_resident_and_family_council: string;
  automatic_sprinkler_systems_in_all_required_areas: string;
  overall_rating: string;
  overall_rating_footnote: string;
  health_inspection_rating: string;
  health_inspection_rating_footnote: string;
  qm_rating: string;
  qm_rating_footnote: string;
  longstay_qm_rating: string;
  longstay_qm_rating_footnote: string;
  shortstay_qm_rating: string;
  shortstay_qm_rating_footnote: string;
  staffing_rating: string;
  staffing_rating_footnote: string;
  reported_staffing_footnote: string;
  physical_therapist_staffing_footnote: string;
  reported_nurse_aide_staffing_hours_per_resident_per_day: string;
  reported_lpn_staffing_hours_per_resident_per_day: string;
  reported_rn_staffing_hours_per_resident_per_day: string;
  reported_licensed_staffing_hours_per_resident_per_day: string;
  reported_total_nurse_staffing_hours_per_resident_per_day: string;
  total_number_of_nurse_staff_hours_per_resident_per_day_on_t_4a14: string;
  registered_nurse_hours_per_resident_per_day_on_the_weekend: string;
  reported_physical_therapist_staffing_hours_per_resident_per_day: string;
  total_nursing_staff_turnover: string;
  total_nursing_staff_turnover_footnote: string;
  registered_nurse_turnover: string;
  registered_nurse_turnover_footnote: string;
  number_of_administrators_who_have_left_the_nursing_home: string;
  administrator_turnover_footnote: string;
  nursing_casemix_index: string;
  nursing_casemix_index_ratio: string;
  casemix_nurse_aide_staffing_hours_per_resident_per_day: string;
  casemix_lpn_staffing_hours_per_resident_per_day: string;
  casemix_rn_staffing_hours_per_resident_per_day: string;
  casemix_total_nurse_staffing_hours_per_resident_per_day: string;
  casemix_weekend_total_nurse_staffing_hours_per_resident_per_day: string;
  adjusted_nurse_aide_staffing_hours_per_resident_per_day: string;
  adjusted_lpn_staffing_hours_per_resident_per_day: string;
  adjusted_rn_staffing_hours_per_resident_per_day: string;
  adjusted_total_nurse_staffing_hours_per_resident_per_day: string;
  adjusted_weekend_total_nurse_staffing_hours_per_resident_per_day: string;
  rating_cycle_1_standard_survey_health_date: string;
  rating_cycle_1_total_number_of_health_deficiencies: string;
  rating_cycle_1_number_of_standard_health_deficiencies: string;
  rating_cycle_1_number_of_complaint_health_deficiencies: string;
  rating_cycle_1_health_deficiency_score: string;
  rating_cycle_1_number_of_health_revisits: string;
  rating_cycle_1_health_revisit_score: string;
  rating_cycle_1_total_health_score: string;
  rating_cycle_2_standard_health_survey_date: string;
  rating_cycle_2_total_number_of_health_deficiencies: string;
  rating_cycle_2_number_of_standard_health_deficiencies: string;
  rating_cycle_2_number_of_complaint_health_deficiencies: string;
  rating_cycle_2_health_deficiency_score: string;
  rating_cycle_2_number_of_health_revisits: string;
  rating_cycle_2_health_revisit_score: string;
  rating_cycle_2_total_health_score: string;
  rating_cycle_3_standard_health_survey_date: string;
  rating_cycle_3_total_number_of_health_deficiencies: string;
  rating_cycle_3_number_of_standard_health_deficiencies: string;
  rating_cycle_3_number_of_complaint_health_deficiencies: string;
  rating_cycle_3_health_deficiency_score: string;
  rating_cycle_3_number_of_health_revisits: string;
  rating_cycle_3_health_revisit_score: string;
  rating_cycle_3_total_health_score: string;
  total_weighted_health_survey_score: string;
  number_of_facility_reported_incidents: string;
  number_of_substantiated_complaints: string;
  number_of_citations_from_infection_control_inspections: string;
  number_of_fines: string;
  total_amount_of_fines_in_dollars: string;
  number_of_payment_denials: string;
  total_number_of_penalties: string;
  location: string;
  latitude: string;
  longitude: string;
  geocoding_footnote: string;
  processing_date: string;
  woner_ids: {
    _id: string;
    owner_name: string;
  }[];
  buy: number;
  sell: number;
  refinance: number;
  rating_metrics?: {
    occupancy_rate: number;
    turnover_rate: number;
    overall_rating: number;
    health_inspection_rating: number;
    number_of_fines: number;
    has_recent_inspection: boolean;
  };
}

interface Filters {
  state?: string;
  wonerId?: string | null;
  minBeds?: string;
  search?: string;
  page: number;
  sortBy?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Home: React.FC = () => {
  const [nursingHomes, setNursingHomes] = useState<NursingHome[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 100,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    wonerId: null,
    sortBy: "",
  });
  const [selectedNursingHomeId, setSelectedNursingHomeId] = useState<
    string | null
  >(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchNursingHomes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
      });

      if (filters.state) {
        params.append("state", filters.state);
      }

      if (filters.wonerId) {
        params.append("wonerId", filters.wonerId);
      }

      if (filters.minBeds) {
        params.append("minBeds", filters.minBeds);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }

      const response = await axios.get(
        `/api/nursing-home?${params.toString()}`
      );
      setNursingHomes(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching nursing homes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNursingHomes();
  }, [JSON.stringify(filters)]);

  const handleStateChange = (state: { code: string }) => {
    setFilters((prev) => ({
      ...prev,
      state: state.code,
      page: 1,
      wonerId: undefined,
      minBeds: undefined,
    }));
  };

  const handleWonerChange = (woner: { _id: string } | null) => {
    setFilters((prev) => ({
      ...prev,
      wonerId: woner?._id || null,
      page: 1,
      minBeds: undefined,
    }));
  };

  const handleBedCountChange = (minBeds: string) => {
    setFilters((prev) => ({ ...prev, minBeds, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      state: undefined,
      wonerId: null,
      minBeds: undefined,
      search: undefined,
      sortBy: "",
    });
    window.location.reload();
    fetchNursingHomes();
  };

  const handleViewDetails = (id: string) => {
    setSelectedNursingHomeId(id);
    setIsDetailsModalOpen(true);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus({
        success: false,
        message: "",
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/woner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus({
        success: true,
        message: response.data.message,
      });

      setTimeout(() => {
        setUploadStatus({
          success: false,
          message: "",
        });
      }, 2000);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh the data after successful upload
      await fetchNursingHomes();
    } catch (error: any) {
      setUploadStatus({
        success: false,
        message: error.response?.data?.error || "Failed to upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-64">
            <StateDropdown
              onStateChange={handleStateChange}
              selectedState={filters.state}
            />
          </div>
          <div className="w-96">
            <WonerSearch
              state={filters.state}
              onSelect={handleWonerChange}
              selectedWonerId={filters.wonerId}
              placeholder="Search for owners..."
            />
          </div>
          <div className="w-64">
            <NumberOfBed
              state={filters.state}
              wonerId={filters.wonerId}
              onSelect={handleBedCountChange}
              selectedBeds={filters.minBeds}
            />
          </div>
          <div className="w-48">
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Sort by...</option>
              <option value="beds_high_to_low">Beds (High to Low)</option>
              <option value="beds_low_to_high">Beds (Low to High)</option>
              <option value="buy">Buy Rating</option>
              <option value="sell">Sell Rating</option>
              <option value="refinance">Refinance Rating</option>
              <option value="rating">Overall Rating</option>
            </select>
          </div>
          {/* <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="csvUpload"
            />
            <label
              htmlFor="csvUpload"
              className={`px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer transition-colors ${
                uploading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Owners CSV"}
            </label>
            {uploadStatus.message && (
              <span
                className={`text-sm ${
                  uploadStatus.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {uploadStatus.message}
              </span>
            )}
          </div> */}
          {(filters.state ||
            filters.wonerId ||
            filters.minBeds ||
            filters.search ||
            filters.sortBy) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="max-h-[calc(100vh-30vh)] overflow-auto relative">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 relative">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
                    <tr>
                      {/* Basic Information */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Provider Name
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 right-0 z-30 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 shadow-l min-w-[120px] backdrop-blur-sm bg-opacity-90"
                        style={{
                          boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        Actions
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        CCN
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        City
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        State
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        ZIP
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        County
                      </th>

                      {/* Facility Details */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Ownership Type
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Certified Beds
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Avg Residents/Day
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Provider Type
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        In Hospital
                      </th>

                      {/* Ratings */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Overall Rating
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Buy Rating
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Sell Rating
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Refinance Rating
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Health Inspection
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        QM Rating
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Staffing Rating
                      </th>

                      {/* Staffing Details */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        RN Hours/Day
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Total Staff Hours/Day
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Staff Turnover
                      </th>

                      {/* Health Metrics */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Health Deficiencies
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Complaints
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Fines ($)
                      </th>

                      {/* Location */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Coordinates
                      </th>

                      {/* Ownership */}
                      <th
                        scope="col"
                        className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
                      >
                        Total Owners
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading
                      ? // Skeleton Loading - 6 rows
                        Array(6)
                          .fill(null)
                          .map((_, index) => (
                            <tr
                              key={`skeleton-${index}`}
                              className="animate-pulse"
                            >
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                              </td>
                              {/* Action column skeleton */}
                              <td className="sticky right-0 px-6 py-4 bg-white dark:bg-gray-900">
                                <div className="flex justify-center">
                                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                </div>
                              </td>
                            </tr>
                          ))
                      : nursingHomes.length === 0
                      ? // No Data - 6 rows with empty state message
                        Array(6)
                          .fill(null)
                          .map((_, index) => (
                            <tr
                              key={`empty-${index}`}
                              className={index === 2 ? "relative" : ""}
                            >
                              {index === 2 ? (
                                <td
                                  colSpan={27}
                                  className="px-6 py-4 text-center"
                                >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                      No nursing homes found
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                Array(27)
                                  .fill(null)
                                  .map((_, colIndex) => (
                                    <td
                                      key={`empty-${index}-${colIndex}`}
                                      className="px-6 py-4"
                                    >
                                      <div className="h-4 bg-gray-50 dark:bg-gray-800/50 rounded"></div>
                                    </td>
                                  ))
                              )}
                            </tr>
                          ))
                      : nursingHomes.map((home) => (
                          <tr
                            key={home._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {/* Basic Information */}
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {home.provider_name}
                            </td>
                            <td
                              className="sticky right-0 px-6 py-4 text-sm bg-white dark:bg-gray-900 z-10"
                              style={{
                                boxShadow: "-4px 0 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <div className="flex justify-center">
                                <button
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                  onClick={() => handleViewDetails(home._id)}
                                  title="View Details"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.cms_certification_number_ccn}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.provider_address}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.citytown}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.state}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.zip_code}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.telephone_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.countyparish}
                            </td>

                            {/* Facility Details */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.ownership_type}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.number_of_certified_beds}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.average_number_of_residents_per_day}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.provider_type}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.provider_resides_in_hospital}
                            </td>

                            {/* Ratings */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.overall_rating}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    home.buy >= 4
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : home.buy >= 2.5
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {home.buy.toFixed(1)}/5
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    home.sell >= 4
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : home.sell >= 2.5
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  }`}
                                >
                                  {home.sell.toFixed(1)}/5
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div
                                  className={`px-2 py-1 rounded text-sm font-medium ${
                                    home.refinance >= 4
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : home.refinance >= 2.5
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  }`}
                                >
                                  {home.refinance.toFixed(1)}/5
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.health_inspection_rating}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.qm_rating}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.staffing_rating}
                            </td>

                            {/* Staffing Details */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {
                                home.reported_rn_staffing_hours_per_resident_per_day
                              }
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {
                                home.reported_total_nurse_staffing_hours_per_resident_per_day
                              }
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.total_nursing_staff_turnover}
                            </td>

                            {/* Health Metrics */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {
                                home.rating_cycle_1_total_number_of_health_deficiencies
                              }
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.number_of_substantiated_complaints}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.total_amount_of_fines_in_dollars}
                            </td>

                            {/* Location */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.location}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {`${home.latitude}, ${home.longitude}`}
                            </td>

                            {/* Ownership */}
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {home.woner_ids.length}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!loading && nursingHomes.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
        />
      )}

      {/* Details Modal */}
      <NursingHomeDetails
        nursingHomeId={selectedNursingHomeId || ""}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNursingHomeId(null);
        }}
      />
    </div>
  );
};

export default Home;
