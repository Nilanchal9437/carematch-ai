import mongoose, { Model } from 'mongoose';

interface IUpdateTracker {
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const updateTrackerSchema = new mongoose.Schema({
  lastUpdate: {
    type: Date,
    required: true,
    default: new Date(0) // Initialize with old date to ensure first update
  }
}, {
  timestamps: true
});

// Check if the model exists before creating a new one
const UpdateTracker: Model<IUpdateTracker> = 
  mongoose.models.UpdateTracker || mongoose.model<IUpdateTracker>('UpdateTracker', updateTrackerSchema);

export default UpdateTracker; 