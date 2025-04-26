import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import NursingHome from "@/models/NursingHome";
import Woner from "@/models/Woner";
import connectToDB from "@/db"; 

export const dynamic = "force-dynamic";
interface FacilityDocument {
  overall_rating: string;
  health_inspection_rating: string;
  average_number_of_residents_per_day: string;
  number_of_certified_beds: string;
  total_nursing_staff_turnover: string;
  number_of_fines: string;
  most_recent_health_inspection_more_than_2_years_ago: string;
  ownership_type?: string;
  [key: string]: any; // allow other unknown fields
}

interface RatedFacilityDocument extends FacilityDocument {
  buy: number;
  sell: number;
  refinance: number;
}

function calculateRatings(document: FacilityDocument): RatedFacilityDocument {
  // Safely parse numeric values with validation
  const overallRating = Math.min(
    Math.max(parseFloat(document.overall_rating) || 0, 0),
    5
  );
  const healthInspectionRating = Math.min(
    Math.max(parseFloat(document.health_inspection_rating) || 0, 0),
    5
  );

  // Calculate occupancy rate with validation
  const residents =
    parseFloat(document.average_number_of_residents_per_day) || 0;
  const beds = parseFloat(document.number_of_certified_beds) || 1; // prevent division by zero
  const occupancyRate = Math.min(Math.max((residents / beds) * 100, 0), 100);

  // Parse other metrics with validation
  const turnoverRate = Math.max(
    parseFloat(document.total_nursing_staff_turnover) || 0,
    0
  );
  const numberOfFines = Math.max(
    parseInt(document.number_of_fines, 10) || 0,
    0
  );
  const hasRecentInspection =
    document.most_recent_health_inspection_more_than_2_years_ago === "N";

  let buyPoints = 0;
  let sellPoints = 0;
  let refinancePoints = 0;

  // --- Buy Criteria (max 10 points) ---
  if (overallRating >= 4) buyPoints += 4;
  else if (overallRating >= 3) buyPoints += 2;
  if (occupancyRate >= 85) buyPoints += 3;
  else if (occupancyRate >= 75) buyPoints += 2;
  if (numberOfFines === 0) buyPoints += 2;
  if (document.ownership_type?.toLowerCase().includes("for profit"))
    buyPoints += 1;

  // --- Sell Criteria (max 10 points) ---
  if (turnoverRate > 50) sellPoints += 3;
  else if (turnoverRate > 35) sellPoints += 2;
  if (healthInspectionRating <= 2) sellPoints += 3;
  else if (healthInspectionRating <= 3) sellPoints += 2;
  if (occupancyRate < 50) sellPoints += 2;
  else if (occupancyRate < 60) sellPoints += 1;
  if (numberOfFines > 2) sellPoints += 2;
  else if (numberOfFines > 0) sellPoints += 1;

  // --- Refinance Criteria (max 10 points) ---
  if (overallRating >= 4) refinancePoints += 4;
  else if (overallRating >= 3.5) refinancePoints += 3;
  if (occupancyRate >= 80) refinancePoints += 4;
  else if (occupancyRate >= 70) refinancePoints += 2;
  if (!hasRecentInspection) refinancePoints += 2;

  // Normalize all ratings to 5-point scale
  const buy = (buyPoints / 10) * 5;
  const sell = (sellPoints / 10) * 5;
  const refinance = (refinancePoints / 10) * 5;

  // Round to one decimal place
  const normalizedBuy = Math.round(buy * 10) / 10;
  const normalizedSell = Math.round(sell * 10) / 10;
  const normalizedRefinance = Math.round(refinance * 10) / 10;

  return {
    ...document,
    buy: normalizedBuy,
    sell: normalizedSell,
    refinance: normalizedRefinance,
    rating_metrics: {
      occupancy_rate: Math.round(occupancyRate * 10) / 10,
      turnover_rate: Math.round(turnoverRate * 10) / 10,
      overall_rating: overallRating,
      health_inspection_rating: healthInspectionRating,
      number_of_fines: numberOfFines,
      has_recent_inspection: hasRecentInspection,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    console.log("Update API called - Connecting to DB...");
    // Connect to database
    await connectToDB();
    console.log("DB connection established");

    console.log("Fetching data from CMS API...");
    // Fetch data from CMS API
    const response = await axios.get(
      "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0"
    );

    if (!response.data || !response.data.results) {
      console.error("Invalid data format from CMS API:", response.data);
      throw new Error("Invalid data format from CMS API");
    }

    const nursingHomes = response.data.results;
    console.log(`Fetched ${nursingHomes.length} nursing homes from CMS API`);

    console.log("Fetching existing nursing homes from DB...");
    // Get existing nursing homes with their IDs
    const existingHomes = await NursingHome.find({}).lean();
    console.log(`Found ${existingHomes.length} existing nursing homes in DB`);

    const existingHomesMap = new Map(
      existingHomes.map((home) => [home.cms_certification_number_ccn, home._id])
    );

    // Prepare bulk operations
    const operations = [];
    let processedCount = 0;
    let updatedCount = 0;
    let newCount = 0;

    console.log("Processing nursing homes...");
    // Process each nursing home
    for (const home of nursingHomes) {
      try {
        if (!home.cms_certification_number_ccn) {
          console.warn("Skipping record with missing CCN:", home);
          continue;
        }

        console.log(
          `Processing nursing home with CCN: ${home.cms_certification_number_ccn}`
        );
        // Find associated woner IDs
        const woners = await Woner.find(
          { cms_certification_number_ccn: home.cms_certification_number_ccn },
          "_id owner_name"
        ).lean();

        console.log(`Found ${woners.length} associated owners`);

        // Map woner IDs to ObjectIds
        const wonerIds = woners.map((woner) => woner._id);

        // Remove _id if it exists to prevent MongoDB errors
        const { _id, woner_ids, ...homeData } = home;

        const nursingHomeData = calculateRatings({
          ...homeData,
          woner_ids: wonerIds,
          last_updated: new Date(),
        });

        const existingId = existingHomesMap.get(
          home.cms_certification_number_ccn
        );

        if (existingId) {
          // Update existing record
          operations.push({
            updateOne: {
              filter: { _id: existingId },
              update: { $set: nursingHomeData },
              upsert: false,
            },
          });
          updatedCount++;
          console.log(
            `Added update operation for existing home: ${home.cms_certification_number_ccn}`
          );
        } else {
          // Insert new record
          operations.push({
            insertOne: {
              document: nursingHomeData,
            },
          });
          newCount++;
          console.log(
            `Added insert operation for new home: ${home.cms_certification_number_ccn}`
          );
        }

        processedCount++;

        // Execute bulk operations in batches of 100 (reduced from 500 for testing)
        if (operations.length >= 100) {
          console.log(`Executing batch of ${operations.length} operations...`);
          try {
            const batchResult = await NursingHome.bulkWrite(operations, {
              ordered: false,
              writeConcern: { w: 1 },
            });
            console.log("Batch execution result:", batchResult);
          } catch (batchError) {
            console.error("Error executing batch:", batchError);
          }
          operations.length = 0; // Clear the array
        }
      } catch (recordError) {
        console.error(`Error processing nursing home record:`, recordError);
        continue;
      }
    }

    // Execute remaining bulk operations
    let finalResult = { insertedCount: 0, modifiedCount: 0 };
    if (operations.length > 0) {
      console.log(
        `Executing final batch of ${operations.length} operations...`
      );
      try {
        finalResult = await NursingHome.bulkWrite(operations, {
          ordered: false,
          writeConcern: { w: 1 },
        });
        console.log("Final batch execution result:", finalResult);
      } catch (bulkError: any) {
        console.error("Bulk write error:", bulkError);
        return NextResponse.json(
          {
            message: "Partial success in nursing homes update",
            error: bulkError.message,
            stats: {
              totalProcessed: processedCount,
              newRecords: newCount,
              updatedRecords: updatedCount,
              result: bulkError.result,
            },
          },
          { status: 207 }
        );
      }
    }

    console.log("Update completed successfully");
    return NextResponse.json(
      {
        message: "Nursing homes data updated successfully",
        stats: {
          totalProcessed: processedCount,
          newRecords: newCount,
          updatedRecords: updatedCount,
          inserted: finalResult.insertedCount || 0,
          modified: finalResult.modifiedCount || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in GET /api/nursing-home/update:", error);
    return NextResponse.json(
      {
        message: "An error occurred while updating nursing homes data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
