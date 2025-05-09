import { NextRequest, NextResponse } from "next/server";
import Woner from "@/models/Woner";
import NursingHome from "@/models/NursingHome";
import mongoose from "mongoose";
import connectToDB from "@/db";
import { parse } from "csv-parse/sync";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDB();

    // Get search keyword and state from query params
    const { searchParams } = new URL(req.url);
    const searchKeyword = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for search and state filters
    const matchStage: any = {};
    if (searchKeyword) {
      matchStage.owner_name = { $regex: searchKeyword, $options: "i" };
    }
    if (state) {
      matchStage.state = state;
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Project stage to select only required fields
    pipeline.push({
      $project: {
        _id: 1,
        owner_name: 1, 
        cms_certification_number_ccn: 1
      }
    });

    // Execute aggregation
    const woners = await Woner.aggregate(pipeline);

    return NextResponse.json(
      {
        data: woners,
        filters: {
          searchKeyword,
          state,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching woner data:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching woner data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString();

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`Total CSV records: ${records.length}`);

    // Connect to database first to check existing woners
    await connectToDB();

    // Get all existing woners
    const existingWoners = await Woner.find({});
    console.log(`Found ${existingWoners.length} existing woners`);

    // Create a map of existing woners by owner name
    const existingWonerMap = new Map(
      existingWoners.map(woner => [woner.owner_name.toLowerCase().trim(), woner])
    );

    // Process records and group by owner name (case-insensitive)
    const wonerMap = new Map();
    let totalCCNs = 0;
    let skippedRecords = 0;

    // First pass: Group all records by owner name
    records.forEach((record: any) => {
      const ownerName = record["Owner Name"]?.trim() || "";
      const ccn = record["CMS Certification Number (CCN)"]?.trim() || "";
      
      if (!ownerName || !ccn) {
        skippedRecords++;
        console.log(`Skipping record - Missing owner name or CCN:`, { ownerName, ccn });
        return;
      }

      const lowerOwnerName = ownerName.toLowerCase();
      
      if (!wonerMap.has(lowerOwnerName)) {
        wonerMap.set(lowerOwnerName, {
          owner_name: ownerName, // Keep original case for display
          cms_certification_number_ccn: [], // Initialize as array instead of Set
          provider_name: record["Provider Name"]?.trim() || "",
          provider_address: record["Provider Address"]?.trim() || "",
          citytown: record["City/Town"]?.trim() || "",
          state: record["State"]?.trim() || "",
          zip_code: record["ZIP Code"]?.trim() || "",
          role_played_by_owner_or_manager_in_facility:
            record["Role played by Owner or Manager in Facility"]?.trim() || "",
          owner_type: record["Owner Type"]?.trim() || "",
          ownership_percentage: record["Ownership Percentage"]?.trim() || "",
          association_date: record["Association Date"]?.trim() || "",
          location: record["Location"]?.trim() || "",
          processing_date: record["Processing Date"]?.trim() || new Date().toISOString(),
        });
      }

      // Add CCN to the array if it doesn't exist
      const currentCCNs = wonerMap.get(lowerOwnerName).cms_certification_number_ccn;
      if (!currentCCNs.includes(ccn)) {
        currentCCNs.push(ccn);
        totalCCNs++;
      }
    });

    console.log(`Total CCNs processed: ${totalCCNs}`);
    console.log(`Skipped records: ${skippedRecords}`);
    console.log(`Unique owners in wonerMap: ${wonerMap.size}`);

    // Convert Sets to Arrays and prepare for database operations
    const operations = [];
    let stats = {
      totalProcessed: 0,
      updated: 0,
      inserted: 0,
      duplicatesResolved: 0
    };

    // Process each unique owner
    for (const [lowerOwnerName, wonerData] of wonerMap.entries()) {
      const existingWoner = existingWonerMap.get(lowerOwnerName);
      
      console.log(`Processing owner "${wonerData.owner_name}" with ${wonerData.cms_certification_number_ccn.length} CCNs:`, wonerData.cms_certification_number_ccn);

      if (existingWoner) {
        // Merge with existing woner - combine CCNs and remove duplicates
        const combinedCCNs = [...new Set([
          ...existingWoner.cms_certification_number_ccn,
          ...wonerData.cms_certification_number_ccn
        ])];

        console.log(`Updating existing owner "${wonerData.owner_name}":`, {
          previousCCNs: existingWoner.cms_certification_number_ccn.length,
          newCCNs: wonerData.cms_certification_number_ccn.length,
          combinedCCNs: combinedCCNs.length
        });

        operations.push({
          updateOne: {
            filter: { _id: existingWoner._id },
            update: {
              $set: {
                ...wonerData,
                cms_certification_number_ccn: combinedCCNs
              }
            }
          }
        });
        stats.updated++;
      } else {
        // Create new woner
        operations.push({
          insertOne: {
            document: wonerData
          }
        });
        stats.inserted++;
      }
      stats.totalProcessed++;
    }

    // Clean up any duplicate documents that might exist
    const duplicateCount = await Woner.aggregate([
      {
        $group: {
          _id: { owner_name: { $toLower: "$owner_name" } },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Remove duplicate documents if found
    for (const duplicate of duplicateCount) {
      // Keep the first document and remove others
      const [keepId, ...removeIds] = duplicate.docs;
      if (removeIds.length > 0) {
        operations.push({
          deleteMany: {
            filter: { _id: { $in: removeIds } }
          }
        });
        stats.duplicatesResolved += removeIds.length;
      }
    }

    // Execute all operations
    const result = await Woner.bulkWrite(operations, {
      ordered: false // Continue processing even if some operations fail
    });

    // Update nursing homes
    await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/nursing-home/update`
    );

    return NextResponse.json({
      success: true,
      message: "Successfully processed woners",
      stats: {
        ...stats,
        bulkWriteResult: {
          modified: result.modifiedCount,
          inserted: result.insertedCount,
          deleted: result.deletedCount
        }
      }
    });

  } catch (error: any) {
    console.error("Error processing CSV:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CSV file" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    
    const body = await req.json();
    const ownerId = body.id;

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    try {
      const objectId = new mongoose.Types.ObjectId(ownerId);
    } catch (err) {
      return NextResponse.json({ error: "Invalid Owner ID format" }, { status: 400 });
    }

    // Get owner details
    const owner = await Woner.findById(ownerId).lean();

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get all facilities for this owner using aggregation with lookup
    const facilities = await NursingHome.aggregate([
      {
        $match: {
          woner_ids: new mongoose.Types.ObjectId(ownerId)
        }
      },
      {
        $lookup: {
          from: "woners",
          localField: "woner_ids",
          foreignField: "_id",
          as: "owners"
        }
      },
      {
        $project: {
          _id: 1,
          provider_name: 1,
          state: 1,
          number_of_certified_beds: 1,
          average_number_of_residents_per_day: 1,
          overall_rating: 1,
          health_inspection_rating: 1,
          citytown: 1,
          zip_code: 1,
          owners: 1
        }
      }
    ]);

    console.log('Owner found:', owner);
    console.log('Facilities found:', facilities);

    return NextResponse.json({
      owner,
      facilities,
    });
  } catch (error: any) {
    console.error("Error in PUT route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}