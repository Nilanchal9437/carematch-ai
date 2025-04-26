import UpdateTracker from "@/models/UpdateTracker";
import connectToDB from "@/db";

export const shouldUpdateData = async (): Promise<boolean> => {
  try {
    // Ensure database connection
    await connectToDB();

    // Get the update tracker document
    const tracker = await UpdateTracker.findOne()
      .sort({ createdAt: -1 })
      .exec();

    // If no tracker exists, we should update
    if (!tracker) {
      return true;
    }

    const now = new Date();
    const lastUpdate = new Date(tracker.lastUpdate);

    // Check if the last update was on a different day
    return (
      lastUpdate.getDate() !== now.getDate() ||
      lastUpdate.getMonth() !== now.getMonth() ||
      lastUpdate.getFullYear() !== now.getFullYear()
    );
  } catch (error) {
    console.error("Error checking update status:", error);
    // In case of error, return true to ensure data gets updated
    return true;
  }
};

export const updateLastUpdateTime = async (): Promise<void> => {
  try {
    // Ensure database connection
    await connectToDB();

    // Find the existing tracker or create a new one
    await UpdateTracker.findOneAndUpdate(
      {}, // empty filter to match any document
      { lastUpdate: new Date() },
      {
        upsert: true, // create if doesn't exist
        new: true, // return the updated document
        setDefaultsOnInsert: true, // apply schema defaults if creating new document
      }
    );
  } catch (error) {
    console.error("Error updating last update time:", error);
    throw error; // Propagate the error to handle it in the component
  }
};
