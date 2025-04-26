import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import connectToDB from "@/db";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDB();

    const response = await axios.get(
      "https://data.cms.gov/provider-data/api/1/datastore/query/y2hd-n93e/0"
    );

    if (!response.data || !response.data.results) {
      throw new Error("Invalid data format from CMS API");
    }

    const data = response.data.results;

    // Prepare bulk operations
    const operations = [];
    const existingWonerKeys = new Map();

    // Get all existing CCNs and owner names to avoid duplicates
    const existingWoners = await Woner.find({}).lean();

    existingWoners.forEach((woner) => {
      const key = `${woner.cms_certification_number_ccn}-${woner.owner_name}`;
      existingWonerKeys.set(key, woner._id);
    });

    // Create operations for new records and updates
    for (const record of data) {
      if (!record.cms_certification_number_ccn || !record.owner_name) {
        console.warn("Skipping record with missing required fields:", record);
        continue;
      }

      const key = `${record.cms_certification_number_ccn}-${record.owner_name}`;
      const existingId = existingWonerKeys.get(key);

      const wonerData = {
        cms_certification_number_ccn: record.cms_certification_number_ccn,
        provider_name: record.provider_name || "",
        provider_address: record.provider_address || "",
        citytown: record.citytown || "",
        state: record.state || "",
        zip_code: record.zip_code || "",
        role_played_by_owner_or_manager_in_facility:
          record.role_played_by_owner_or_manager_in_facility || "",
        owner_type: record.owner_type || "",
        owner_name: record.owner_name,
        ownership_percentage: record.ownership_percentage || "",
        association_date: record.association_date || "",
        location: record.location || "",
        processing_date: record.processing_date || new Date().toISOString(),
      };

      if (existingId) {
        // Update existing record
        operations.push({
          updateOne: {
            filter: { _id: existingId },
            update: { $set: wonerData },
            upsert: false,
          },
        });
      } else {
        // Insert new record
        operations.push({
          insertOne: {
            document: wonerData,
          },
        });
      }
    }

    // Execute bulk operations if there are any
    if (operations.length > 0) {
      try {
        const bulkResult = await Woner.bulkWrite(operations, { ordered: false });
        return NextResponse.json(
          {
            message: "Data fetched and processed successfully",
            result: {
              inserted: bulkResult.insertedCount || 0,
              updated: bulkResult.modifiedCount || 0,
              total: operations.length,
            },
          },
          { status: 200 }
        );
      } catch (bulkError: any) {
        console.error("Bulk write error:", bulkError);
        return NextResponse.json(
          {
            message: "Partial success in data update",
            error: bulkError.message,
            result: bulkError.result,
          },
          { status: 207 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "No new data to process",
        result: {
          inserted: 0,
          updated: 0,
          total: 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching or storing data:", error);
    return NextResponse.json(
      {
        message: "An error occurred while fetching or storing data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
