import mongoose, { Schema, Document } from "mongoose";

interface IWoner extends Document {
  cms_certification_number_ccn: string;
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

const WonerSchema: Schema = new Schema({
  cms_certification_number_ccn: { type: String, required: true },
  provider_name: { type: String, required: true },
  provider_address: { type: String, required: true },
  citytown: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  role_played_by_owner_or_manager_in_facility: { type: String, required: true },
  owner_type: { type: String, required: true },
  owner_name: { type: String, required: true },
  ownership_percentage: { type: String, required: true },
  association_date: { type: String, required: true },
  location: { type: String, required: true },
  processing_date: { type: String, required: true },
});

const Woner =
  mongoose.models.Woner || mongoose.model<IWoner>("Woner", WonerSchema);

export default Woner;
