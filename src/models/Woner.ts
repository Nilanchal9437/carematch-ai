import mongoose, { Schema, Model, Document } from "mongoose";

interface IWoner extends Document {
  cms_certification_number_ccn: string[];
  provider_name: string;
  provider_address: string;
  citytown: string;
  state: string;
  zip_code: string;
  role_played_by_owner_or_manager_in_facility: string;
  owner_type: string;
  owner_name: string;
  ownership_percentage: string;
  association_date: string;
  location: string;
  processing_date: string;
}

const WonerSchema = new Schema(
  {
    cms_certification_number_ccn: [{ type: String }],
    provider_name: { type: String },
    provider_address: { type: String },
    citytown: { type: String },
    state: { type: String },
    zip_code: { type: String },
    role_played_by_owner_or_manager_in_facility: { type: String },
    owner_type: { type: String },
    owner_name: { type: String, required: true },
    ownership_percentage: { type: String },
    association_date: { type: String },
    location: { type: String },
    processing_date: { type: String },
  },
  {
    timestamps: true,
  }
);

// Check if the model exists before creating a new one
const Woner =
  mongoose.models.Woner || mongoose.model<IWoner>("Woner", WonerSchema);

export default Woner;
