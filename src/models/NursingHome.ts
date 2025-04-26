import mongoose, { Schema, Document } from "mongoose";

interface INursingHome extends Document {
  cms_certification_number_ccn?: string;
  provider_name?: string;
  provider_address?: string;
  citytown?: string;
  state?: string;
  zip_code?: string;
  telephone_number?: string;
  provider_ssa_county_code?: string;
  countyparish?: string;
  ownership_type?: string;
  number_of_certified_beds?: string;
  average_number_of_residents_per_day?: string;
  average_number_of_residents_per_day_footnote?: string;
  provider_type?: string;
  provider_resides_in_hospital?: string;
  legal_business_name?: string;
  date_first_approved_to_provide_medicare_and_medicaid_services?: string;
  affiliated_entity_name?: string;
  affiliated_entity_id?: string;
  continuing_care_retirement_community?: string;
  special_focus_status?: string;
  abuse_icon?: string;
  most_recent_health_inspection_more_than_2_years_ago?: string;
  provider_changed_ownership_in_last_12_months?: string;
  with_a_resident_and_family_council?: string;
  automatic_sprinkler_systems_in_all_required_areas?: string;
  overall_rating?: string;
  overall_rating_footnote?: string;
  health_inspection_rating?: string;
  health_inspection_rating_footnote?: string;
  qm_rating?: string;
  qm_rating_footnote?: string;
  longstay_qm_rating?: string;
  longstay_qm_rating_footnote?: string;
  shortstay_qm_rating?: string;
  shortstay_qm_rating_footnote?: string;
  staffing_rating?: string;
  staffing_rating_footnote?: string;
  reported_staffing_footnote?: string;
  physical_therapist_staffing_footnote?: string;
  reported_nurse_aide_staffing_hours_per_resident_per_day?: string;
  reported_lpn_staffing_hours_per_resident_per_day?: string;
  reported_rn_staffing_hours_per_resident_per_day?: string;
  reported_licensed_staffing_hours_per_resident_per_day?: string;
  reported_total_nurse_staffing_hours_per_resident_per_day?: string;
  total_number_of_nurse_staff_hours_per_resident_per_day_on_t_4a14?: string;
  registered_nurse_hours_per_resident_per_day_on_the_weekend?: string;
  reported_physical_therapist_staffing_hours_per_resident_per_day?: string;
  total_nursing_staff_turnover?: string;
  total_nursing_staff_turnover_footnote?: string;
  registered_nurse_turnover?: string;
  registered_nurse_turnover_footnote?: string;
  number_of_administrators_who_have_left_the_nursing_home?: string;
  administrator_turnover_footnote?: string;
  nursing_casemix_index?: string;
  nursing_casemix_index_ratio?: string;
  casemix_nurse_aide_staffing_hours_per_resident_per_day?: string;
  casemix_lpn_staffing_hours_per_resident_per_day?: string;
  casemix_rn_staffing_hours_per_resident_per_day?: string;
  casemix_total_nurse_staffing_hours_per_resident_per_day?: string;
  casemix_weekend_total_nurse_staffing_hours_per_resident_per_day?: string;
  adjusted_nurse_aide_staffing_hours_per_resident_per_day?: string;
  adjusted_lpn_staffing_hours_per_resident_per_day?: string;
  adjusted_rn_staffing_hours_per_resident_per_day?: string;
  adjusted_total_nurse_staffing_hours_per_resident_per_day?: string;
  adjusted_weekend_total_nurse_staffing_hours_per_resident_per_day?: string;
  rating_cycle_1_standard_survey_health_date?: string;
  rating_cycle_1_total_number_of_health_deficiencies?: string;
  rating_cycle_1_number_of_standard_health_deficiencies?: string;
  rating_cycle_1_number_of_complaint_health_deficiencies?: string;
  rating_cycle_1_health_deficiency_score?: string;
  rating_cycle_1_number_of_health_revisits?: string;
  rating_cycle_1_health_revisit_score?: string;
  rating_cycle_1_total_health_score?: string;
  rating_cycle_2_standard_health_survey_date?: string;
  rating_cycle_2_total_number_of_health_deficiencies?: string;
  rating_cycle_2_number_of_standard_health_deficiencies?: string;
  rating_cycle_2_number_of_complaint_health_deficiencies?: string;
  rating_cycle_2_health_deficiency_score?: string;
  rating_cycle_2_number_of_health_revisits?: string;
  rating_cycle_2_health_revisit_score?: string;
  rating_cycle_2_total_health_score?: string;
  rating_cycle_3_standard_health_survey_date?: string;
  rating_cycle_3_total_number_of_health_deficiencies?: string;
  rating_cycle_3_number_of_standard_health_deficiencies?: string;
  rating_cycle_3_number_of_complaint_health_deficiencies?: string;
  rating_cycle_3_health_deficiency_score?: string;
  rating_cycle_3_number_of_health_revisits?: string;
  rating_cycle_3_health_revisit_score?: string;
  rating_cycle_3_total_health_score?: string;
  total_weighted_health_survey_score?: string;
  number_of_facility_reported_incidents?: string;
  number_of_substantiated_complaints?: string;
  number_of_citations_from_infection_control_inspections?: string;
  number_of_fines?: string;
  total_amount_of_fines_in_dollars?: string;
  number_of_payment_denials?: string;
  total_number_of_penalties?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  geocoding_footnote?: string;
  processing_date?: string;
  woner_ids?: Schema.Types.ObjectId[];
  buy?: number;
  sell?: number;
  refinance?: number;
}

const NursingHomeSchema: Schema = new Schema({
  cms_certification_number_ccn: { type: String },
  provider_name: { type: String },
  provider_address: { type: String },
  citytown: { type: String },
  state: { type: String },
  zip_code: { type: String },
  telephone_number: { type: String },
  provider_ssa_county_code: { type: String },
  countyparish: { type: String },
  ownership_type: { type: String },
  number_of_certified_beds: { type: String },
  average_number_of_residents_per_day: { type: String },
  average_number_of_residents_per_day_footnote: { type: String },
  provider_type: { type: String },
  provider_resides_in_hospital: { type: String },
  legal_business_name: { type: String },
  date_first_approved_to_provide_medicare_and_medicaid_services: { type: String },
  affiliated_entity_name: { type: String },
  affiliated_entity_id: { type: String },
  continuing_care_retirement_community: { type: String },
  special_focus_status: { type: String },
  abuse_icon: { type: String },
  most_recent_health_inspection_more_than_2_years_ago: { type: String },
  provider_changed_ownership_in_last_12_months: { type: String },
  with_a_resident_and_family_council: { type: String },
  automatic_sprinkler_systems_in_all_required_areas: { type: String },
  overall_rating: { type: String },
  overall_rating_footnote: { type: String },
  health_inspection_rating: { type: String },
  health_inspection_rating_footnote: { type: String },
  qm_rating: { type: String },
  qm_rating_footnote: { type: String },
  longstay_qm_rating: { type: String },
  longstay_qm_rating_footnote: { type: String },
  shortstay_qm_rating: { type: String },
  shortstay_qm_rating_footnote: { type: String },
  staffing_rating: { type: String },
  staffing_rating_footnote: { type: String },
  reported_staffing_footnote: { type: String },
  physical_therapist_staffing_footnote: { type: String },
  reported_nurse_aide_staffing_hours_per_resident_per_day: { type: String },
  reported_lpn_staffing_hours_per_resident_per_day: { type: String },
  reported_rn_staffing_hours_per_resident_per_day: { type: String },
  reported_licensed_staffing_hours_per_resident_per_day: { type: String },
  reported_total_nurse_staffing_hours_per_resident_per_day: { type: String },
  total_number_of_nurse_staff_hours_per_resident_per_day_on_t_4a14: { type: String },
  registered_nurse_hours_per_resident_per_day_on_the_weekend: { type: String },
  reported_physical_therapist_staffing_hours_per_resident_per_day: { type: String },
  total_nursing_staff_turnover: { type: String },
  total_nursing_staff_turnover_footnote: { type: String },
  registered_nurse_turnover: { type: String },
  registered_nurse_turnover_footnote: { type: String },
  number_of_administrators_who_have_left_the_nursing_home: { type: String },
  administrator_turnover_footnote: { type: String },
  nursing_casemix_index: { type: String },
  nursing_casemix_index_ratio: { type: String },
  casemix_nurse_aide_staffing_hours_per_resident_per_day: { type: String },
  casemix_lpn_staffing_hours_per_resident_per_day: { type: String },
  casemix_rn_staffing_hours_per_resident_per_day: { type: String },
  casemix_total_nurse_staffing_hours_per_resident_per_day: { type: String },
  casemix_weekend_total_nurse_staffing_hours_per_resident_per_day: { type: String },
  adjusted_nurse_aide_staffing_hours_per_resident_per_day: { type: String },
  adjusted_lpn_staffing_hours_per_resident_per_day: { type: String },
  adjusted_rn_staffing_hours_per_resident_per_day: { type: String },
  adjusted_total_nurse_staffing_hours_per_resident_per_day: { type: String },
  adjusted_weekend_total_nurse_staffing_hours_per_resident_per_day: { type: String },
  rating_cycle_1_standard_survey_health_date: { type: String },
  rating_cycle_1_total_number_of_health_deficiencies: { type: String },
  rating_cycle_1_number_of_standard_health_deficiencies: { type: String },
  rating_cycle_1_number_of_complaint_health_deficiencies: { type: String },
  rating_cycle_1_health_deficiency_score: { type: String },
  rating_cycle_1_number_of_health_revisits: { type: String },
  rating_cycle_1_health_revisit_score: { type: String },
  rating_cycle_1_total_health_score: { type: String },
  rating_cycle_2_standard_health_survey_date: { type: String },
  rating_cycle_2_total_number_of_health_deficiencies: { type: String },
  rating_cycle_2_number_of_standard_health_deficiencies: { type: String },
  rating_cycle_2_number_of_complaint_health_deficiencies: { type: String },
  rating_cycle_2_health_deficiency_score: { type: String },
  rating_cycle_2_number_of_health_revisits: { type: String },
  rating_cycle_2_health_revisit_score: { type: String },
  rating_cycle_2_total_health_score: { type: String },
  rating_cycle_3_standard_health_survey_date: { type: String },
  rating_cycle_3_total_number_of_health_deficiencies: { type: String },
  rating_cycle_3_number_of_standard_health_deficiencies: { type: String },
  rating_cycle_3_number_of_complaint_health_deficiencies: { type: String },
  rating_cycle_3_health_deficiency_score: { type: String },
  rating_cycle_3_number_of_health_revisits: { type: String },
  rating_cycle_3_health_revisit_score: { type: String },
  rating_cycle_3_total_health_score: { type: String },
  total_weighted_health_survey_score: { type: String },
  number_of_facility_reported_incidents: { type: String },
  number_of_substantiated_complaints: { type: String },
  number_of_citations_from_infection_control_inspections: { type: String },
  number_of_fines: { type: String },
  total_amount_of_fines_in_dollars: { type: String },
  number_of_payment_denials: { type: String },
  total_number_of_penalties: { type: String },
  location: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  geocoding_footnote: { type: String },
  processing_date: { type: String },
  woner_ids: [{ type: Schema.Types.ObjectId, ref: "Woner" }],
  buy: { type: Number, default: 0 },
  sell: { type: Number, default: 0 },
  refinance: { type: Number, default: 0 }
});

const NursingHome =
  mongoose.models.NursingHome ||
  mongoose.model<INursingHome>("NursingHome", NursingHomeSchema);

export default NursingHome;
